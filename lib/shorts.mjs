import {browserOptions,renderConcurrency} from './render-runtime.mjs';
import {readFile,writeFile,mkdir,copyFile,rm} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {parseFile} from 'music-metadata';
import * as providers from './providers.mjs';
import {audioSlots,safeDirection,diversifyVisualPlan} from './auto-plan.mjs';
import {sourceScene} from './auto-media.mjs';
import {composeContinuity} from './visual-continuity.mjs';
import {authorShortsMotion,sceneUnits,generateFallbackSceneCode} from './motion-author.mjs';
import {pythonPath,validationSceneIndexes} from './automatic.mjs';
import {selectBestMusic} from './music-catalog.mjs';

const readJSON=async p=>{try{return JSON.parse(await readFile(p,'utf8'));}catch{return null;}};

export async function automaticShorts(s,j,{root,dir,log}){
 if(!j.auto?.finished)throw Error('Gere o vídeo principal primeiro.');
 if(!j.research||!j.script)throw Error('Pesquisa e roteiro do vídeo principal são necessários.');
 const longRunId=j.auto.runId;
 const longFolder=path.join(root,'renderer/public/auto',longRunId);
 
 const shortsBaseDir=path.join(dir,'shorts',j.id);
 await mkdir(shortsBaseDir,{recursive:true});
 
 const stage=(name,msg)=>{j.shorts={...j.shorts,stage:name};log(j,msg);};
 j.shorts={stage:'curiosities',progress:0,finished:false,items:[]};

 // Stage 1: Extract 5 curiosities from the long video
 stage('curiosities','Shorts: extraindo 5 curiosidades do vídeo principal.');
 let curiosities=j.shorts.curiosities;
 if(!curiosities){
  curiosities=await providers.extractCuriosities(s,j);
  j.shorts.curiosities=curiosities;
  log(j,`Shorts: ${curiosities.length} curiosidades extraídas com sucesso.`);
 }

 const longCache=await readJSON(path.join(longFolder,'media-cache.json'))||{};

  // Process Shorts sequentially (defaults to 1 unless shortsCount is explicitly set higher)
  const maxShorts = Math.min(5, Math.max(1, Number(j.shortsCount) || 1));
  for(let i=0;i<maxShorts;i++){
   const curiosity=curiosities[i];
  const shortId=`short-${i}`;
  const shortNum=i+1;
  const shortPublicFolder=path.join(root,'renderer/public/auto',longRunId,'shorts',shortId);
  const shortDataFolder=path.join(shortsBaseDir,`short_${shortNum}`);
  
  await mkdir(shortPublicFolder,{recursive:true});
  await mkdir(shortDataFolder,{recursive:true});
  
  j.shorts.progress=Math.round((i/5)*100);

  const existingShortIndex=path.join(root,'renderer/src/generated',longRunId,'shorts',shortId,'index.tsx');
  const existingManifestPath=path.join(shortPublicFolder,'manifest.json');
  if(j.shorts.items[i]?.finished || (existsSync(existingShortIndex) && existsSync(existingManifestPath))){
   const savedManifest=await readJSON(existingManifestPath);
   const dur=savedManifest?.duration||60;
   j.shorts.items[i]={index:i,title:curiosity.title,duration:dur,finished:true,entryPoint:existingShortIndex,runId:longRunId,folder:`/shorts/${j.id}/short_${shortNum}`};
   log(j,`Short ${shortNum}: já concluído anteriormente.`);
   continue;
  }

  // 2a. Generate script for this Short
  stage('script',`Short ${shortNum}/5: gerando roteiro — "${curiosity.title}".`);
  let shortScriptText=await readJSON(path.join(shortPublicFolder,'script.json'));
  if(!shortScriptText){
   shortScriptText=await providers.shortScript(s,curiosity);
   await writeFile(path.join(shortPublicFolder,'script.json'),JSON.stringify(shortScriptText));
   await writeFile(path.join(shortDataFolder,'script.json'),JSON.stringify({title:curiosity.title,script:shortScriptText},null,2));
   log(j,`Short ${shortNum}: roteiro gerado (${shortScriptText.split(/\s+/).length} palavras).`);
  }

  // 2b. Generate voice and select BGM for this Short
  stage('voice',`Short ${shortNum}/5: gerando narração.`);
  const voicePath=path.join(shortPublicFolder,'voice.mp3');
  let voiceExists=false;try{await readFile(voicePath);voiceExists=true;}catch{}
  if(!voiceExists){
   const voiceBuffer=await providers.shortVoice(s,{script:shortScriptText});
   await writeFile(voicePath,voiceBuffer);
   await writeFile(path.join(shortDataFolder,'voice.mp3'),voiceBuffer);
   log(j,`Short ${shortNum}: narração salva.`);
  }

  const shortMusic=selectBestMusic({title:curiosity.title,script:shortScriptText,isShort:true,root});
  const shortMusicSource=path.join(root,shortMusic.path);
  if(existsSync(shortMusicSource)){
   try{
    await copyFile(shortMusicSource,path.join(shortPublicFolder,'bgm.mp3'));
    await copyFile(shortMusicSource,path.join(shortDataFolder,'bgm.mp3'));
   }catch{}
  }

  // 2c. Transcribe voice for word-level sync
  stage('align',`Short ${shortNum}/5: alinhando legendas.`);
  const transcriptPath=path.join(shortPublicFolder,'transcript.json');
  let transcript=await readJSON(transcriptPath);
  if(!transcript){
   await new Promise((resolve,reject)=>{
    const child=spawn(pythonPath(),[path.join(root,'scripts/transcribe-local.py'),voicePath,transcriptPath],{cwd:root,windowsHide:true,stdio:['ignore','pipe','pipe']});
    let errors='';child.stderr.on('data',x=>{errors=(errors+x).slice(-1500);});child.on('error',reject);child.on('exit',code=>code===0?resolve():reject(Error('Transcrição do Short falhou: '+errors)));
   });
   transcript=await readJSON(transcriptPath);
   if(transcript)await writeFile(path.join(shortDataFolder,'transcript.json'),JSON.stringify(transcript,null,2));
  }

  const duration=(await parseFile(voicePath,{duration:true})).format.duration;
  const slots=audioSlots(transcript,duration,{isShort:true});

  // 2d. Direction
  stage('direction',`Short ${shortNum}/5: dirigindo ${slots.length} cenas.`);
  let plan=await readJSON(path.join(shortPublicFolder,'directions.json'));
  if(!plan){
   plan=[];
   const prompt=`Act as a YouTube Shorts director for US English vertical 9:16 content. Return JSON {"shots":[...]}. Each shot: {id,kind:"footage|photo|map|title",heading:"max 4 words",caption:"max 6 words",query:"2-4 search words",countries:["country names"],layout:"full"}. VISUAL DISCIPLINE: Prefer high-impact footage or aerial/satellite photos over abstract maps. Use at most ONE map in the entire Short only when strictly necessary to pinpoint a geographic chokepoint. Never use consecutive maps. Only ${slots.length} shots, one per supplied id. Topic: ${curiosity.title}. Countries: ${(curiosity.countries||[]).join(', ')}. Narration: ${shortScriptText}. Timed slots: ${JSON.stringify(slots)}`;
   let response;
   for(let attempt=0;attempt<3;attempt++){
    try{
     let rawResponse=await providers.generateJSON(s,j,prompt);
     if(Array.isArray(rawResponse))rawResponse={shots:rawResponse};
     else if(rawResponse&&Array.isArray(rawResponse.scenes))rawResponse={shots:rawResponse.scenes};
     if(Array.isArray(rawResponse?.shots)&&rawResponse.shots.length){response=rawResponse;break;}
    }catch(err){
     if(attempt===2)throw err;
     log(j,`Short ${shortNum}: direção retentando (${attempt+1}/3)...`);
    }
   }
   if(!response)throw Error(`Short ${shortNum}: direção não gerada.`);
   const shotsList=Array.isArray(response?.shots)?response.shots:[];
   for(let bIdx=0;bIdx<slots.length;bIdx++){
    const slot=slots[bIdx];
    const candidate=shotsList.find(x=>x?.id===slot.id)||shotsList[bIdx]||{id:slot.id,kind:'footage',heading:slot.narration.slice(0,30),caption:'',query:curiosity.title.slice(0,30)};
    const {scene}=safeDirection(slot,{...candidate,id:slot.id},{text:shortScriptText});
    plan.push(scene);
   }
   plan=diversifyVisualPlan(plan,duration);
   await writeFile(path.join(shortPublicFolder,'directions.json'),JSON.stringify(plan,null,2));
  }

  // 2e. Source media
  stage('assets',`Short ${shortNum}/5: selecionando mídia.`);
  const cache={...longCache,...(await readJSON(path.join(shortPublicFolder,'media-cache.json'))||{})};
  const resolved=await readJSON(path.join(shortPublicFolder,'resolved.json'))||[];
  for(const direction of plan){
   if(resolved.some(x=>x.id===direction.id))continue;
   const scene={...direction};
   if(scene.kind==='footage'||scene.kind==='photo'){
    try{scene.asset=await sourceScene(s,j,scene,shortPublicFolder,cache);await writeFile(path.join(shortPublicFolder,'media-cache.json'),JSON.stringify(cache,null,2));}
    catch{scene.asset=null;}
    if(!scene.asset){scene.kind='title';scene.missingVisual=true;}
   }
   resolved.push(scene);
   await writeFile(path.join(shortPublicFolder,'resolved.json'),JSON.stringify(resolved,null,2));
  }

  // Compose continuity and manifest
  const composed=composeContinuity(resolved);
  const manifest={title:curiosity.title,duration,fps:30,voice:`auto/${longRunId}/shorts/${shortId}/voice.mp3`,scenes:composed};
  await writeFile(path.join(shortPublicFolder,'manifest.json'),JSON.stringify(manifest,null,2));
  await writeFile(path.join(shortDataFolder,'manifest.json'),JSON.stringify(manifest,null,2));

  // 2f. Motion code generation
  stage('motion-code',`Short ${shortNum}/5: GLM programando cenas verticais.`);
  const entryPoint=await authorShortsMotion(s,j,manifest,{root,log,shortIndex:i});

  // 2g. Validate preview
  stage('preview-validation',`Short ${shortNum}/5: validando composição.`);
  const tempValidationDir=path.join(root,'.temp',`bundle-validate-${longRunId}-short-${i}`);
  await rm(tempValidationDir,{recursive:true,force:true}).catch(()=>{});
  try{
   await mkdir(path.dirname(tempValidationDir),{recursive:true});
   const {bundle}=await import('../renderer/node_modules/@remotion/bundler/dist/index.js');
   const {selectComposition,renderStill}=await import('../renderer/node_modules/@remotion/renderer/dist/index.js');
   let serveUrl=await bundle({entryPoint,publicDir:path.join(root,'renderer/public'),outDir:tempValidationDir});
   let composition=await selectComposition({serveUrl,id:'AutomaticShort',...browserOptions()});
   const maxCompFrames=Number.isFinite(Number(composition?.durationInFrames))&&Number(composition.durationInFrames)>0?Number(composition.durationInFrames):30;
   const maxFrame=Math.max(0,maxCompFrames-1);
   const scenes=sceneUnits(manifest);
   const indexes=validationSceneIndexes(scenes.length,10);
   for(const index of indexes){
    const scene=scenes[index];
    const sceneFrom=Number.isFinite(Number(scene?.from))?Number(scene.from):Math.round((Number(scene?.start)||0)*30);
    const sceneDur=Number.isFinite(Number(scene?.durationInFrames))?Number(scene.durationInFrames):30;
    const rawFrame=sceneFrom+Math.max(0,Math.floor(sceneDur/2));
    const frame=Number.isFinite(rawFrame)?Math.max(0,Math.min(maxFrame,Math.round(rawFrame))):0;
    try{
     await renderStill({composition,serveUrl,frame,output:null,imageFormat:'jpeg',scale:.25,...browserOptions()});
    }catch(error){
     log(j,`Short ${shortNum} cena ${scene.index+1}: falha na validação (${String(error.message).slice(0,100)}). Aplicando composição vertical de contingência...`);
     const fallbackCode=generateFallbackSceneCode(scene,true);
     const shortFolder=path.join(root,'renderer/src/generated',longRunId,'shorts',shortId);
     await writeFile(path.join(shortFolder,`Scene${scene.index}.tsx`),fallbackCode);
     serveUrl=await bundle({entryPoint,publicDir:path.join(root,'renderer/public'),outDir:tempValidationDir});
     composition=await selectComposition({serveUrl,id:'AutomaticShort',...browserOptions()});
    }
   }
   log(j,`Short ${shortNum}: composição validada.`);
  }catch(error){
   log(j,`Short ${shortNum}: aviso na validação — ${String(error.message).slice(0,200)}.`);
  }finally{
   await rm(tempValidationDir,{recursive:true,force:true}).catch(()=>{});
  }

  const shortItem={index:i,title:curiosity.title,duration,finished:true,entryPoint,runId:longRunId,folder:`/shorts/${j.id}/short_${shortNum}`};
  j.shorts.items[i]=shortItem;
  log(j,`Short ${shortNum}/5 concluído: "${curiosity.title}" (${Math.round(duration)}s).`);
 }

 j.shorts.finished=true;j.shorts.stage='done';j.shorts.progress=100;
 log(j,`${maxShorts} Short(s) gerado(s) com sucesso na pasta data/shorts/${j.id}/.`);
}

export async function renderShortMP4(s,j,shortIndex,{root,dir,log}){
 const longRunId=j.auto?.preview?.runId||j.auto?.runId;
 if(!longRunId)throw new Error('Produção automática necessária para renderizar o Short.');
 const shortsBaseDir=path.join(dir,'shorts',j.id);
 const shortNum=shortIndex+1;
 const shortId=`short-${shortIndex}`;
 const shortDataFolder=path.join(shortsBaseDir,`short_${shortNum}`);
 await mkdir(shortDataFolder,{recursive:true});

 const entryPoint=path.join(root,'renderer/src/generated',longRunId,'shorts',shortId,'index.tsx');
 const videoPath=path.join(shortDataFolder,`short_${shortNum}.mp4`);
 if(!existsSync(entryPoint))throw new Error(`Composição do Short ${shortNum} não encontrada em ${entryPoint}.`);

 const totalShorts=j.shorts?.items?.length||j.shortsCount||1;
 log(j,`Renderizando Short ${shortNum}${totalShorts>1?'/'+totalShorts:''} em MP4 vertical 1080x1920...`);
 const {bundle}=await import('../renderer/node_modules/@remotion/bundler/dist/index.js');
 const {selectComposition,renderMedia}=await import('../renderer/node_modules/@remotion/renderer/dist/index.js');

 const tempBundleDir=path.join(root,'.temp',`bundle-${longRunId}-short-${shortIndex}`);
 await rm(tempBundleDir,{recursive:true,force:true});
 try{
  await mkdir(path.dirname(tempBundleDir),{recursive:true});
  const serveUrl=await bundle({entryPoint,publicDir:path.join(root,'renderer/public'),outDir:tempBundleDir});
  const composition=await selectComposition({serveUrl,id:'AutomaticShort',...browserOptions()});

  let last=0;
  await renderMedia({
   ...browserOptions(),
  composition,
  serveUrl,
  codec:'h264',
  pixelFormat:'yuv420p',
  x264Preset:'fast',
  outputLocation:videoPath,
  concurrency:renderConcurrency(),
  crf:26,
  onProgress:({progress})=>{
   const pct=Math.round(progress*100);
   if(pct>=last+10||pct===100){last=pct;log(j,`Short ${shortNum}${totalShorts>1?'/'+totalShorts:''}: renderização ${pct}%.`);}
  }
  });

  if(j.shorts&&j.shorts.items&&j.shorts.items[shortIndex]){
   j.shorts.items[shortIndex].renderedMp4=true;
   j.shorts.items[shortIndex].mp4Path=videoPath;
   j.shorts.items[shortIndex].mp4Url=`/shorts/${j.id}/short_${shortNum}/short_${shortNum}.mp4`;
  }
  log(j,`Short ${shortNum}${totalShorts>1?'/'+totalShorts:''} MP4 finalizado com sucesso!`);
  return {videoPath,url:`/shorts/${j.id}/short_${shortNum}/short_${shortNum}.mp4`};
 }finally{
  await rm(tempBundleDir,{recursive:true,force:true}).catch(()=>{});
 }
}

export async function renderAllShortsMP4(s,j,{root,dir,log}){
 const longRunId=j.auto?.preview?.runId||j.auto?.runId;
 if(!longRunId)throw new Error('Produção automática necessária para renderizar os Shorts.');
 log(j,'Iniciando renderização de todos os 5 Shorts verticais em MP4...');
 for(let i=0;i<5;i++){
  const shortNum=i+1;
  const shortId=`short-${i}`;
  const entryPoint=path.join(root,'renderer/src/generated',longRunId,'shorts',shortId,'index.tsx');
  if(!existsSync(entryPoint))continue;
  try{
   await renderShortMP4(s,j,i,{root,dir,log});
  }catch(err){
   log(j,`Erro ao renderizar Short ${shortNum}: ${err.message}`);
  }
 }
 log(j,'Renderização dos Shorts verticais concluída!');
}
