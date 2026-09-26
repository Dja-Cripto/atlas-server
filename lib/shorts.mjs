import {recoverScene} from './scene-recovery.mjs';
import {browserOptions,renderConcurrency} from './render-runtime.mjs';
import {readFile,writeFile,mkdir,copyFile,rm,stat,rename} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {parseFile} from 'music-metadata';
import * as providers from './providers.mjs';
import {audioSlots,safeDirection,diversifyVisualPlan,enforceVisualBreathing} from './auto-plan.mjs';
import {sourceScene,generateIllustrativeScene} from './auto-media.mjs';
import {composeContinuity} from './visual-continuity.mjs';
import {authorShortsMotion,sceneUnits} from './motion-author.mjs';
import {pythonPath,validationSceneIndexes,partialMp4Path} from './automatic.mjs';
import {materializeMap} from './geography.mjs';
import {sceneSampleFrames} from './preview-sampling.mjs';
import {stageTracker} from './production-metrics.mjs';
import {repairVisuals} from './visual-repair.mjs';
import {selectBestMusic} from './music-catalog.mjs';

async function openBrowserForPreview(){const {openBrowser}=await import('../renderer/node_modules/@remotion/renderer/dist/index.js');return openBrowser('chrome',browserOptions());}
const readJSON=async p=>{try{return JSON.parse(await readFile(p,'utf8'));}catch{return null;}};
async function verifyShortMP4(videoPath){
 const details=await new Promise((resolve,reject)=>{
  const child=spawn(process.env.FFPROBE_BIN||'ffprobe',['-v','error','-show_entries','format=duration:stream=codec_type,width,height','-of','json',videoPath],{windowsHide:true,stdio:['ignore','pipe','pipe']});
  let output='',error='';child.stdout.on('data',chunk=>output=(output+chunk).slice(-20000));child.stderr.on('data',chunk=>error=(error+chunk).slice(-2000));child.on('error',reject);child.on('close',code=>{if(code!==0)return reject(Error('Short MP4 inválido: '+error.slice(-300)));try{resolve(JSON.parse(output));}catch(cause){reject(cause);}});
 });
 const video=details.streams?.find(stream=>stream.codec_type==='video');
 if(Number(video?.width)<1080||Number(video?.height)<1920||Number(details.format?.duration)<1)throw Error('Short MP4 sem vídeo vertical 1080x1920 reproduzível.');
 return details;
}

export async function automaticShorts(s,j,{root,dir,log,store}){
 if(!j.auto?.finished||!j.finalization?.ready)throw Error('Finalize e confira o MP4, a capa, o título e a descrição do vídeo principal antes de iniciar Shorts.');
 if(!j.research||!j.script)throw Error('Pesquisa e roteiro do vídeo principal são necessários.');
 const longRunId=j.auto.runId;
 const longFolder=path.join(root,'renderer/public/auto',longRunId);
 const longVideoPath=path.join(dir,'long_videos',j.id,`video-${longRunId}.mp4`);
 const longVideoStats=await stat(longVideoPath).catch(()=>null);
 if(!longVideoStats||longVideoStats.size<=1024*1024)throw Error('O vídeo principal precisa estar renderizado e íntegro antes de iniciar qualquer Short.');
 
 const shortsBaseDir=path.join(dir,'shorts',j.id);
 await mkdir(shortsBaseDir,{recursive:true});
 
 const trackStage=stageTracker(()=>j.shorts,message=>log(j,message));
 const stage=(name,msg)=>{trackStage(name);j.shorts={...j.shorts,stage:name};log(j,msg);};
 j.shorts={...j.shorts,stage:'curiosities',progress:0,finished:false,items:Array.isArray(j.shorts?.items)?j.shorts.items:[]};

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
  const completedCount=j.shorts.items.reduce((count,item)=>count+(item?.finished&&item?.renderedMp4&&item?.mp4Url?1:0),0);
  const nextIndex=Math.min(maxShorts,Math.max(0,Number.isInteger(j.shorts.nextIndex)?j.shorts.nextIndex:completedCount));
  if(nextIndex>=maxShorts){j.shorts.finished=true;j.shorts.stage='done';j.shorts.progress=100;return {finished:true,total:maxShorts};}
  for(let i=nextIndex;i<nextIndex+1;i++){
   const curiosity=curiosities[i];
   const shortId=`short-${i}`;
   const shortNum=i+1;
   const shortPublicFolder=path.join(root,'renderer/public/auto',longRunId,'shorts',shortId);
   const shortDataFolder=path.join(shortsBaseDir,`short_${shortNum}`);
   const videoPath=path.join(shortDataFolder,`short_${shortNum}.mp4`);
   
   await mkdir(shortPublicFolder,{recursive:true});
   await mkdir(shortDataFolder,{recursive:true});
   
   j.shorts.progress=Math.round((i/maxShorts)*100);

   // Check if this Short is ALREADY 100% rendered to MP4 on disk
   if(existsSync(videoPath)){
    const stats=await stat(videoPath).catch(()=>null);
    if(stats&&stats.size>50*1024){
     await verifyShortMP4(videoPath);
     const savedManifest=await readJSON(path.join(shortPublicFolder,'manifest.json'));
     const dur=savedManifest?.duration||60;
     const existingShortIndex=path.join(root,'renderer/src/generated',longRunId,'shorts',shortId,'index.tsx');
     j.shorts.items[i]={index:i,title:curiosity.title,duration:dur,finished:true,renderedMp4:true,entryPoint:existingShortIndex,runId:longRunId,folder:`/shorts/${j.id}/short_${shortNum}`,mp4Path:videoPath,mp4Url:`/shorts/${j.id}/short_${shortNum}/short_${shortNum}.mp4`};
     log(j,`Short ${shortNum}/${maxShorts}: MP4 já está 100% finalizado e renderizado em disco (${(stats.size/1024/1024).toFixed(1)} MB).`);
     j.shorts.nextIndex=i+1;
     j.shorts.finished=j.shorts.nextIndex>=maxShorts;
     j.shorts.stage=j.shorts.finished?'done':'review';
     j.shorts.progress=Math.round(j.shorts.nextIndex/maxShorts*100);
     log(j,j.shorts.finished?'Todos os Shorts estão prontos.':`Short ${shortNum} pronto para revisão. O próximo só começará por ação do usuário.`);
     return {finished:j.shorts.finished,total:maxShorts,nextIndex:j.shorts.nextIndex};
    }
   }

   // 2a. Generate script for this Short
   stage('script',`Short ${shortNum}/${maxShorts}: gerando roteiro — "${curiosity.title}".`);
   let shortScriptText=await readJSON(path.join(shortPublicFolder,'script.json'));
   if(!shortScriptText){
    shortScriptText=await providers.shortScript(s,curiosity);
    await writeFile(path.join(shortPublicFolder,'script.json'),JSON.stringify(shortScriptText));
    await writeFile(path.join(shortDataFolder,'script.json'),JSON.stringify({title:curiosity.title,script:shortScriptText},null,2));
    log(j,`Short ${shortNum}: roteiro gerado (${shortScriptText.split(/\s+/).length} palavras).`);
   }

   // 2b. Generate voice and select BGM for this Short
   stage('voice',`Short ${shortNum}/${maxShorts}: gerando narração.`);
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
   stage('align',`Short ${shortNum}/${maxShorts}: alinhando legendas.`);
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
   stage('direction',`Short ${shortNum}/${maxShorts}: dirigindo ${slots.length} cenas.`);
   let plan=await readJSON(path.join(shortPublicFolder,'directions.json'));
   if(!plan){
    plan=[];
    const prompt=`Act as a YouTube Shorts director for US English vertical 9:16 content. Return JSON {"shots":[...]}. Each shot: {id,kind:"footage|photo|map|title",heading:"max 4 words",caption:"max 6 words",query:"2-4 search words",countries:["country names"],layout:"full"}. VISUAL DISCIPLINE: Prefer high-impact footage or aerial/satellite photos over abstract maps. Use at most ONE map in the entire Short only when strictly necessary to pinpoint a geographic chokepoint. Consecutive maps are allowed with distinct mapIntent explaining a new narrative purpose. Use clean or label only for descriptive video; photographs ALWAYS need visible movement or effects. Narrated numbers, dates, age, dimensions or important explanatory facts require an animation. Include explanationEvidence with the exact spoken fact. motionStyle hold permits no added camera motion only for descriptive video. Include routes:false unless routeFrom, routeTo and routeEvidence give an exact narration quote supporting the movement. Country links are schematic, never real travel routes. Prefer one map, but this is not a hard quota. Only ${slots.length} shots, one per supplied id. Topic: ${curiosity.title}. Countries: ${(curiosity.countries||[]).join(', ')}. Narration: ${shortScriptText}. Timed slots: ${JSON.stringify(slots)}`;
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
   stage('assets',`Short ${shortNum}/${maxShorts}: selecionando mídia.`);
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
    if(scene.kind==='map')Object.assign(scene,await materializeMap(scene,root));
    resolved.push(scene);
    await writeFile(path.join(shortPublicFolder,'resolved.json'),JSON.stringify(resolved,null,2));
   }

   // Compose continuity and manifest
   const review=await repairVisuals(resolved,{research:{text:shortScriptText},propose:scene=>providers.generateJSON(s,j,'Replace missing media with a relevant footage, photo or country map. Return a shot JSON. Data: '+JSON.stringify(scene)),materialize:async scene=>scene.kind==='map'?materializeMap(scene,root):{...scene,asset:await sourceScene(s,j,{...scene,reuseExistingMedia:true},shortPublicFolder,cache)},illustrate:scene=>generateIllustrativeScene(s,j,scene,shortPublicFolder)});
   j.shorts.visualReview={pending:review.pending};
   for(const item of review.pending)log(j,'Revisão visual pendente '+item.id+': '+item.reason);
   if(review.pending.length)throw Error('Short sem mídia ou ilustração em '+review.pending.map(item=>item.id).join(', ')+'.');
   await writeFile(path.join(shortPublicFolder,'resolved.json'),JSON.stringify(review.scenes,null,2));
   await writeFile(path.join(shortPublicFolder,'media-cache.json'),JSON.stringify(cache,null,2));
   const composed=composeContinuity(enforceVisualBreathing(review.scenes,duration));
   const manifest={title:curiosity.title,duration,fps:30,voice:`auto/${longRunId}/shorts/${shortId}/voice.mp3`,scenes:composed};
   await writeFile(path.join(shortPublicFolder,'manifest.json'),JSON.stringify(manifest,null,2));
   await writeFile(path.join(shortDataFolder,'manifest.json'),JSON.stringify(manifest,null,2));

   // 2f. Motion code generation
   stage('motion-code',`Short ${shortNum}/${maxShorts}: GLM programando cenas verticais.`);
   const entryPoint=await authorShortsMotion(s,j,manifest,{root,log,shortIndex:i});

   // 2g. Validate preview
   stage('preview-validation',`Short ${shortNum}/${maxShorts}: validando composição.`);
   const tempValidationDir=path.join(root,'.temp',`bundle-validate-${longRunId}-short-${i}`);
   await rm(tempValidationDir,{recursive:true,force:true}).catch(()=>{});
   let puppeteerInstance;
   try{
    puppeteerInstance=await openBrowserForPreview();
    await mkdir(path.dirname(tempValidationDir),{recursive:true});
    const {bundle}=await import('../renderer/node_modules/@remotion/bundler/dist/index.js');
    const {selectComposition,renderStill}=await import('../renderer/node_modules/@remotion/renderer/dist/index.js');
    let serveUrl=await bundle({entryPoint,publicDir:path.join(root,'renderer/public'),outDir:tempValidationDir,symlinkPublicDir:true});
    let composition=await selectComposition({serveUrl,id:'AutomaticShort',puppeteerInstance,...browserOptions()});
    const maxCompFrames=Number.isFinite(Number(composition?.durationInFrames))&&Number(composition.durationInFrames)>0?Number(composition.durationInFrames):30;
    const maxFrame=Math.max(0,maxCompFrames-1);
    const scenes=sceneUnits(manifest);
    const indexes=validationSceneIndexes(scenes.length,scenes.length);
    for(const index of indexes){
     const scene=scenes[index];
     const frames=sceneSampleFrames(scene,maxFrame);
     try{
      for(const frame of frames)await renderStill({composition,serveUrl,puppeteerInstance,frame,output:null,imageFormat:'jpeg',scale:.25,...browserOptions()});
     }catch(error){
      log(j,`Short ${shortNum} cena ${scene.index+1}: falha na validação (${String(error.message).slice(0,100)}). Aplicando composição vertical de contingência...`);
      const shortFolder=path.join(root,'renderer/src/generated',longRunId,'shorts',shortId);
      const fallbackCode=await recoverScene(s,j,scene,{folder:shortFolder,error,isShort:true,log});
      await writeFile(path.join(shortFolder,`Scene${scene.index}.tsx`),fallbackCode);
      const savedScenePath=path.join(shortFolder,`scene-${scene.index}.json`);
      const savedScene=await readJSON(savedScenePath);
      if(savedScene&&typeof savedScene==='object')await writeFile(savedScenePath,JSON.stringify({...savedScene,code:fallbackCode},null,2));
      await rm(tempValidationDir,{recursive:true,force:true});
      serveUrl=await bundle({entryPoint,publicDir:path.join(root,'renderer/public'),outDir:tempValidationDir,symlinkPublicDir:true});
      composition=await selectComposition({serveUrl,id:'AutomaticShort',puppeteerInstance,...browserOptions()});
      for(const frame of frames)await renderStill({composition,serveUrl,puppeteerInstance,frame,output:null,imageFormat:'jpeg',scale:.25,...browserOptions()});
     }
    }
    log(j,`Short ${shortNum}: composição validada.`);
   }catch(error){
    throw Error(`Validação obrigatória do Short ${shortNum} falhou: ${String(error.message).slice(0,300)}`);
   }finally{
    await puppeteerInstance?.close({silent:true});
    await rm(tempValidationDir,{recursive:true,force:true}).catch(()=>{});
   }

   // 2h. Render MP4 IMMEDIATELY for this Short before moving to the next!
   log(j,`Short ${shortNum}/${maxShorts}: renderizando MP4 vertical 1080x1920 imediatamente...`);
   trackStage('rendering');
   const rendered=await renderShortMP4(s,j,i,{root,dir,log,store});
   if((await stat(rendered.videoPath)).size<=50*1024)throw Error(`MP4 do Short ${shortNum} inválido.`);
   await verifyShortMP4(rendered.videoPath);

   trackStage(null);
   const shortItem={
    index:i,
    title:curiosity.title,
    duration,
    finished:true,
    renderedMp4:true,
    entryPoint,
    runId:longRunId,
    folder:`/shorts/${j.id}/short_${shortNum}`,
    mp4Path:videoPath,
    mp4Url:`/shorts/${j.id}/short_${shortNum}/short_${shortNum}.mp4`
   };
   j.shorts.items[i]=shortItem;
   log(j,`Short ${shortNum}/${maxShorts} 100% CONCLUÍDO e renderizado em MP4: "${curiosity.title}" (${Math.round(duration)}s).`);
   j.shorts.nextIndex=i+1;
   j.shorts.finished=j.shorts.nextIndex>=maxShorts;
   j.shorts.stage=j.shorts.finished?'done':'review';
   j.shorts.progress=Math.round(j.shorts.nextIndex/maxShorts*100);
   log(j,j.shorts.finished?'Todos os Shorts estão prontos.':`Short ${shortNum} pronto para revisão. O próximo só começará por ação do usuário.`);
   return {finished:j.shorts.finished,total:maxShorts,nextIndex:j.shorts.nextIndex};
  }


 }

 export async function renderShortMP4(s,j,shortIndex,{root,dir,log,store}){
  const longRunId=j.auto?.preview?.runId||j.auto?.runId;
  if(!longRunId)throw new Error('Produção automática necessária para renderizar o Short.');
  const shortsBaseDir=path.join(dir,'shorts',j.id);
  const shortNum=shortIndex+1;
  const shortId=`short-${shortIndex}`;
  const shortDataFolder=path.join(shortsBaseDir,`short_${shortNum}`);
  await mkdir(shortDataFolder,{recursive:true});

  const entryPoint=path.join(root,'renderer/src/generated',longRunId,'shorts',shortId,'index.tsx');
  const videoPath=path.join(shortDataFolder,`short_${shortNum}.mp4`);
  const partialPath=partialMp4Path(videoPath);
  
  if(existsSync(videoPath)){
   const stats=await stat(videoPath).catch(()=>null);
   if(stats&&stats.size>50*1024){
    log(j,`Short ${shortNum}: arquivo MP4 já existe e está íntegro em disco (${(stats.size/1024/1024).toFixed(1)} MB).`);
    return {videoPath,url:`/shorts/${j.id}/short_${shortNum}/short_${shortNum}.mp4`};
   }
  }

  if(!existsSync(entryPoint))throw new Error(`Composição do Short ${shortNum} não encontrada em ${entryPoint}.`);

  const totalShorts=j.shorts?.items?.length||j.shortsCount||1;
  log(j,`Renderizando Short ${shortNum}${totalShorts>1?'/'+totalShorts:''} em MP4 vertical 1080x1920...`);
  const {bundle}=await import('../renderer/node_modules/@remotion/bundler/dist/index.js');
  const {selectComposition,renderMedia}=await import('../renderer/node_modules/@remotion/renderer/dist/index.js');

  const tempBundleDir=path.join(root,'.temp',`bundle-${longRunId}-short-${shortIndex}`);
  await rm(tempBundleDir,{recursive:true,force:true});
  try{
   await mkdir(path.dirname(tempBundleDir),{recursive:true});
   const serveUrl=await bundle({entryPoint,publicDir:path.join(root,'renderer/public'),outDir:tempBundleDir,symlinkPublicDir:true});
   const composition=await selectComposition({serveUrl,id:'AutomaticShort',...browserOptions()});

   let last=0;
   let lastSave=0;
   const renderStart=Date.now();
   await renderMedia({
    ...browserOptions(),
   composition,
   serveUrl,
   codec:'h264',
   pixelFormat:'yuv420p',
   x264Preset:'ultrafast',
   outputLocation:partialPath,
   concurrency:renderConcurrency(),
   offthreadVideoCacheSizeInBytes:2147483648,
   crf:24,
   onProgress:({progress,renderedFrames})=>{
    const totalFrames=composition.durationInFrames||0;
    const rendered=renderedFrames||0;
    const pct=totalFrames>0?Number((rendered/totalFrames*100).toFixed(1)):Math.round(progress*100);
    const elapsedSec=(Date.now()-renderStart)/1000;
    const fps=rendered>0&&elapsedSec>0?rendered/elapsedSec:0;
    const remainingFrames=Math.max(0,totalFrames-rendered);
    const etaSec=fps>0?remainingFrames/fps:0;
    const etaMin=Math.ceil(etaSec/60);
    const etaStr=etaMin>60?`${Math.floor(etaMin/60)}h ${etaMin%60}m`:`${etaMin} min`;
    
    j.auto.liveStatus=`Short ${shortNum}${totalShorts>1?'/'+totalShorts:''}: quadro ${rendered}/${totalFrames} (${pct}%) · ${fps>0?fps.toFixed(1)+' quadros/s · ':''}restam ~${etaStr}`;
    j.auto.renderProgress=Math.floor(pct);
    j.auto.renderProgressExact=pct;
    j.auto.renderedFrames=rendered;
    j.auto.totalFrames=totalFrames;
    j.auto.renderFps=fps>0?Number(fps.toFixed(1)):null;
    j.auto.renderEta=fps>0?etaStr:null;
    
    const now=Date.now();
    if(now-lastSave>1500){
     lastSave=now;
     if(typeof store?.put==='function')store.put(j);
    }
    if(Math.floor(pct)>=last+10||Math.floor(pct)===100){
     last=Math.floor(pct);
     log(j,`Short ${shortNum}${totalShorts>1?'/'+totalShorts:''}: renderização ${Math.floor(pct)}% (${rendered}/${totalFrames} quadros).`);
    }
   }
   });

   const completedStats=await stat(partialPath).catch(()=>null);
   if(!completedStats||completedStats.size<=50*1024)throw Error(`MP4 do Short ${shortNum} inválido.`);
   await rm(videoPath,{force:true});
   await rename(partialPath,videoPath);
   if(j.shorts&&j.shorts.items&&j.shorts.items[shortIndex]){
    j.shorts.items[shortIndex].renderedMp4=true;
    j.shorts.items[shortIndex].mp4Path=videoPath;
    j.shorts.items[shortIndex].mp4Url=`/shorts/${j.id}/short_${shortNum}/short_${shortNum}.mp4`;
   }
   log(j,`Short ${shortNum}${totalShorts>1?'/'+totalShorts:''} MP4 finalizado com sucesso!`);
   return {videoPath,url:`/shorts/${j.id}/short_${shortNum}/short_${shortNum}.mp4`};
  }catch(error){
    delete j.auto?.liveStatus;
    if(typeof store?.put==='function')store.put(j);
    await rm(partialPath,{force:true}).catch(()=>{});throw error;
  }finally{
   await rm(tempBundleDir,{recursive:true,force:true}).catch(()=>{});
  }
 }

export async function renderAllShortsMP4(s,j,{root,dir,log,store}){
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
