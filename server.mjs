import http from 'node:http';
import {createReadStream,existsSync} from 'node:fs';
import {readFile,writeFile,mkdir,stat,rm} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {randomUUID} from 'node:crypto';
import {spawn} from 'node:child_process';
import {createStore} from './lib/store.mjs';
import * as providers from './lib/providers.mjs';
import {validateServiceAccount} from './lib/vertex.mjs';
import {parseFile} from 'music-metadata';
import {createEditPlan} from './lib/storyboard.mjs';
import {mergeMedia,recordThumbnail,selectThumbnail,assignClip} from './lib/editing.mjs';
import {automatic,preflight,renderFinalMP4,exportCapCut} from './lib/automatic.mjs';
import {automaticShorts,renderAllShortsMP4} from './lib/shorts.mjs';
import {launchCapCut} from './lib/capcut.mjs';
import {getScheduleSettings,saveScheduleSettings,listScheduleQueue,listHistory,calculateNextAvailableDate,scheduleJob,unscheduleJob} from './lib/schedule.mjs';

const root=path.dirname(fileURLToPath(import.meta.url));
const dir=process.env.ATLAS_DATA_DIR||path.join(root,'data');
const port=Number(process.env.PORT||4310), origin=`http://127.0.0.1:${port}`;
const store=createStore(dir),active=new Set();
const previewStudios=new Map();
const steps=['research','script','scenes','media','voice','thumbnail','editing','automatic','shorts','render','capcut'];
const labels={research:'Pesquisa',script:'Roteiro',scenes:'Plano de cenas',media:'Busca de filmagens',voice:'Narração',thumbnail:'Capa',editing:'Plano de edição detalhado',automatic:'Produção automática',shorts:'Geração de 5 Shorts',render:'Renderização MP4',capcut:'Exportação CapCut'};

for(const j of store.list()){if(j.status==='running'){j.status='interrupted';j.error='Execução interrompida. Retome a etapa pelo painel.';store.put(j);}}

function log(j,message){j.events.push({at:new Date().toISOString(),message});j.updatedAt=new Date().toISOString();store.put(j);}
function safeError(e,s){let m=String(e.message||'Erro inesperado');for(const k of providers.secretFields)if(s[k])m=m.split(s[k]).join('[oculto]');return m.slice(0,500);}

async function run(j,action,options={}){
 active.add(j.id);
 const s={...providers.defaults,...store.settings()};
 j.status='running';
 j.error=null;
 j.current=action;
 log(j,labels[action]+' iniciada.');
 try{
  if(action==='automatic'){
   await automatic(s,j,{root,dir,log});
   j.completed=[...new Set([...j.completed,'automatic'])];
   j.auto={...j.auto,finished:true,stage:'preview-ready',progress:100};
   store.put(j);
   log(j,'Vídeo principal concluído. Renderizando MP4 final em 1080p...');
   await renderFinalMP4(s,j,{root,dir,log});
   store.put(j);
   if(options.generateShorts||j.generateShorts!==false){
    j.current='shorts';
    store.put(j);
    log(j,'Iniciando geração do Short vertical derivado...');
    await automaticShorts(s,j,{root,dir,log});
    j.completed=[...new Set([...j.completed,'shorts'])];
    store.put(j);
    log(j,'Renderizando MP4 do Short...');
    if(existsSync(path.join(dir,'shorts',j.id))){
     await renderAllShortsMP4(s,j,{root,dir,log});
    }
   }
   j.completed=[...new Set([...j.completed,'render'])];
   j.status='review';
   store.put(j);
  }
  if(action==='shorts'){
   await automaticShorts(s,j,{root,dir,log});
   j.completed=[...new Set([...j.completed,'shorts'])];
   store.put(j);
   log(j,'Renderizando MP4 dos 5 Shorts gerados...');
   await renderAllShortsMP4(s,j,{root,dir,log});
  }
  if(action==='render'){
   await renderFinalMP4(s,j,{root,dir,log});
   if(existsSync(path.join(dir,'shorts',j.id))){
    await renderAllShortsMP4(s,j,{root,dir,log});
   }
   j.completed=[...new Set([...j.completed,'render'])];
   j.status='review';
   store.put(j);
  }
  if(action==='capcut'){await exportCapCut(s,j,{root,dir,log});}
  if(action==='research'){j.research=await providers.research(s,j);}
  if(action==='script'){if(!j.research)throw new Error('Conclua a pesquisa primeiro.');j.script=await providers.script(s,j);}
  if(action==='scenes'){if(!j.script)throw new Error('Conclua o roteiro primeiro.');j.scenes=await providers.scenePlan(s,j);}
  if(action==='editing'){
   if(!j.script)throw new Error('Conclua o roteiro primeiro.');
   if(j.voice){const metadata=await parseFile(path.join(dir,j.id,'voice.mp3'),{duration:true});j.voiceDuration=metadata.format.duration;}
   const plan=await createEditPlan(s,j);
   if(j.editPlan)j.editPlanHistory=[...(j.editPlanHistory||[]),{plan:j.editPlan,assignments:j.clipAssignments||{}}];
   j.editPlan=plan;j.clipAssignments={};log(j,`${plan.shots.length} planos planejados para ${Math.round(plan.duration)}s.`);
  }
  if(action==='media'){
   if(!j.editPlan)throw new Error('Gere o plano de edição detalhado antes de buscar filmagens.');
   const queries=[...new Set(j.editPlan.shots.filter(x=>x.visual==='footage').map(x=>x.query).filter(Boolean))];
   if(!queries.length)throw new Error('O plano não contém consultas de filmagens.');
   if(j.media?.length)j.mediaHistory=[...(j.mediaHistory||[]),{at:new Date().toISOString(),items:j.media}];
   const assigned=Object.values(j.clipAssignments||{});
   j.media=(j.media||[]).filter(m=>assigned.some(a=>a.id===m.id&&a.source===m.source));
   j.mediaSearch={total:queries.length,completed:0,errors:[],unsearched:queries.slice(0)};
   for(const query of queries){
    try{
     const shotIds=j.editPlan.shots.filter(x=>x.query===query&&x.visual==='footage').map(x=>x.id);
     const results=(await providers.footage(s,query)).map(x=>({...x,shotIds,queries:[query],reviewStatus:'pending'}));
     j.media=mergeMedia(j.media,results);
    }catch(e){j.mediaSearch.errors.push({query,message:safeError(e,s)});}
    j.mediaSearch.completed++;j.mediaSearch.unsearched=queries.slice(j.mediaSearch.completed);
    log(j,`Busca ${j.mediaSearch.completed}/${queries.length}: ${query}.`);
   }
   if(j.mediaSearch.errors.length)throw new Error(`Busca parcial: ${j.mediaSearch.errors.length} consulta(s) falharam.`);
  }
  if(action==='voice'){
   if(!j.script)throw new Error('Conclua o roteiro primeiro.');
   await mkdir(path.join(dir,j.id),{recursive:true});
   await writeFile(path.join(dir,j.id,'voice.mp3'),await providers.voice(s,j));
   j.voice=`/outputs/${j.id}/voice.mp3`;
  }
  if(action==='thumbnail'){
   await mkdir(path.join(dir,j.id),{recursive:true});
   const img=await providers.thumbnail(s,{...j,thumbnailDirection:options.direction||''});
   const filename='thumbnail-'+randomUUID()+'.'+img.extension;
   await writeFile(path.join(dir,j.id,filename),img.buffer);
   recordThumbnail(j,`/outputs/${j.id}/${filename}`,options.direction||'');
  }
  j.completed=[...new Set([...j.completed,action])];
  j.status='review';
  log(j,labels[action]+' concluída.');
 }catch(e){
  j.status='error';
  j.error=safeError(e,s);
  log(j,j.error);
 }finally{
  active.delete(j.id);
  store.put(j);
 }
}

async function body(req){let data='';for await(const c of req){data+=c;if(data.length>1000000)throw new Error('Solicitação muito grande.');}try{return JSON.parse(data||'{}');}catch{throw new Error('JSON inválido.');}}

async function previewStudio(j,shortIndex=null){
 const runId=j.auto?.preview?.runId||j.auto?.runId;
 if(!runId)throw new Error('A composição ainda não está pronta para abrir no Remotion Studio.');
 const studioKey=shortIndex!==null?`${runId}-short-${shortIndex}`:runId;
 const existing=previewStudios.get(studioKey);if(existing?.url&&!existing.process.killed)return existing.url;
 let entry=path.join(root,'renderer/src/generated',runId,'index.tsx');
 if(shortIndex!==null){
  entry=path.join(root,'renderer/src/generated',runId,'shorts',`short-${shortIndex}`,'index.tsx');
 }
 await stat(entry);
 const cli=path.join(root,'renderer/node_modules/@remotion/cli/remotion-cli.js');
 return await new Promise((resolve,reject)=>{
  const child=spawn(process.execPath,[cli,'studio',entry,'--no-open'],{cwd:path.join(root,'renderer'),windowsHide:true,stdio:['ignore','pipe','pipe']});
  const record={process:child,url:null};previewStudios.set(studioKey,record);let output='',settled=false;
  const finish=(error,url)=>{if(settled)return;settled=true;clearTimeout(timer);if(error){previewStudios.delete(studioKey);reject(error);}else{record.url=url;resolve(url);}};
  const inspect=chunk=>{output=(output+chunk).slice(-5000);const match=output.match(/https?:\/\/(?:localhost|127\.0\.0\.1):\d+(?:\/[^\s]*)?/i);if(match)finish(null,match[0]);};
  child.stdout.on('data',inspect);child.stderr.on('data',inspect);
  child.on('error',error=>finish(error));child.on('exit',code=>{if(!settled)finish(new Error('Remotion Studio encerrou antes de abrir. Código '+code+'.'));else if(record.process===child)previewStudios.delete(studioKey);});
  const timer=setTimeout(()=>{child.kill();finish(new Error('O Remotion Studio demorou mais de 30 segundos para iniciar.'));},30000);
 });
}

function json(res,code,data){res.writeHead(code,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(data));}

const server=http.createServer(async(req,res)=>{
 try{
  if(![`127.0.0.1:${port}`,`localhost:${port}`].includes(req.headers.host)){json(res,403,{error:'Host não autorizado.'});return;}
  if(req.headers.origin&&![origin,`http://localhost:${port}`].includes(req.headers.origin)){json(res,403,{error:'Origem não autorizada.'});return;}
  res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');
  const u=new URL(req.url,origin),p=u.pathname;
  if(!['GET','HEAD','DELETE'].includes(req.method)&&req.headers['content-type']!=='application/json'){json(res,415,{error:'Use application/json.'});return;}
  
  if(p==='/api/state'&&req.method==='GET'){json(res,200,{jobs:store.list(),settings:providers.publicSettings(store.settings()),version:'0.2 • Atlas Studio'});return;}
  
  if(p==='/api/settings'&&req.method==='POST'){
   const incoming=await body(req),s=store.settings();
   for(const k of [...Object.keys(providers.defaults),...providers.secretFields.filter(k=>k!=='vertexCredentials')]){if(typeof incoming[k]==='string'&&incoming[k].length<1000&&incoming[k].trim())s[k]=incoming[k].trim();}
   for(const k of incoming.clear||[])if(providers.secretFields.includes(k))delete s[k];
   if(!['gemini','go'].includes(s.sceneProvider||'gemini'))throw new Error('Provedor inválido.');
   if(!['vertex','api'].includes(s.geminiBackend||'vertex'))throw new Error('Backend Gemini inválido.');
   store.saveSettings(s);
   json(res,200,{settings:providers.publicSettings(s)});
   return;
  }
  
  if(p==='/api/settings/vertex'&&req.method==='POST'){
   const incoming=await body(req);
   if(typeof incoming.credentials!=='string'||incoming.credentials.length>20000)throw new Error('Arquivo de credenciais inválido.');
   const credentials=validateServiceAccount(incoming.credentials),s=store.settings();
   s.vertexCredentials=JSON.stringify(credentials);s.vertexProject=credentials.project_id;s.vertexLocation=s.vertexLocation||'global';s.geminiBackend='vertex';
   store.saveSettings(s);
   json(res,200,{settings:providers.publicSettings(s)});
   return;
  }
  
  if(p==='/api/jobs'&&req.method==='POST'){
   const b=await body(req);
   if(typeof b.title!=='string'||b.title.trim().length<5||b.title.length>180)throw new Error('Informe um título de 5 a 180 caracteres.');
   if(!Number.isFinite(Number(b.minutes))||Number(b.minutes)<0.1||Number(b.minutes)>30)throw new Error('Informe uma duração entre 0,1 e 30 minutos.');
   const j={
    id:randomUUID(),
    title:b.title.trim(),
    minutes:Number(b.minutes),
    generateShorts:Boolean(b.generateShorts),
    status:'draft',
    createdAt:new Date().toISOString(),
    updatedAt:new Date().toISOString(),
    completed:[],
    events:[],
    current:null,
    approvedMedia:[]
   };
   log(j,'Projeto criado. Pronto para iniciar a produção.');
   json(res,201,j);
   return;
  }
  
  const studioMatch=p.match(/^\/api\/jobs\/([a-f0-9-]+)\/studio$/);
  if(studioMatch&&req.method==='GET'){
   const j=store.get(studioMatch[1]);
   if(!j){json(res,404,{error:'Projeto não encontrado.'});return;}
   const url=await previewStudio(j);
   res.writeHead(302,{Location:url,'Cache-Control':'no-store'});
   res.end();
   return;
  }

  const shortStudioMatch=p.match(/^\/api\/jobs\/([a-f0-9-]+)\/shorts\/(\d+)\/studio$/);
  if(shortStudioMatch&&req.method==='GET'){
   const j=store.get(shortStudioMatch[1]);
   if(!j){json(res,404,{error:'Projeto não encontrado.'});return;}
   const shortIdx=parseInt(shortStudioMatch[2],10)-1;
   const url=await previewStudio(j,shortIdx);
   res.writeHead(302,{Location:url,'Cache-Control':'no-store'});
   res.end();
   return;
  }

  const capcutMatch=p.match(/^\/api\/jobs\/([a-f0-9-]+)\/capcut$/);
  if(capcutMatch&&['POST','GET'].includes(req.method)){
   const j=store.get(capcutMatch[1]);
   if(!j){json(res,404,{error:'Projeto não encontrado.'});return;}
   try{
    const s={...providers.defaults,...store.settings()};
    log(j,'Exportando projeto e abrindo no CapCut Desktop...');
    await exportCapCut(s,j,{root,dir,log:(job,msg)=>log(job,msg)});
    json(res,200,{success:true});
   }catch(err){
    json(res,500,{error:safeError(err,store.settings())});
   }
   return;
  }

  const renderMatch=p.match(/^\/api\/jobs\/([a-f0-9-]+)\/render$/);
  if(renderMatch&&['POST','GET'].includes(req.method)){
   const j=store.get(renderMatch[1]);
   if(!j){json(res,404,{error:'Projeto não encontrado.'});return;}
   void run(j,'render');
   json(res,202,{accepted:true});
   return;
  }
  
  const deleteMatch=p.match(/^\/api\/jobs\/([a-f0-9-]+)(\/delete)?$/);
  if(deleteMatch&&(req.method==='DELETE'||(req.method==='POST'&&deleteMatch[2]==='/delete'))){
   const j=store.get(deleteMatch[1]);
   if(!j){json(res,404,{error:'Projeto não encontrado.'});return;}
   if(active.has(j.id)){json(res,409,{error:'Não é possível excluir um projeto com etapa em execução.'});return;}
   store.delete(j.id);
   const targets=[
    path.join(dir,j.id),
    path.join(dir,'long_videos',j.id),
    path.join(dir,'shorts',j.id),
    path.join(root,'renderer/public/auto',j.id)
   ];
   const runId=j.auto?.preview?.runId||j.auto?.runId;
   if(runId){
    targets.push(path.join(root,'renderer/public/auto',runId));
    targets.push(path.join(root,'renderer/src/generated',runId));
   }
   for(const target of targets){
    try{await rm(target,{recursive:true,force:true});}catch{}
   }
   json(res,200,{deleted:true,id:j.id});
   return;
  }
  
  if(p==='/api/music'&&req.method==='GET'){
   const {getAllTracks,MUSIC_CATEGORIES}=await import('./lib/music-catalog.mjs');
   json(res,200,{categories:MUSIC_CATEGORIES,tracks:getAllTracks(root)});
   return;
  }

  const musicChangeMatch=p.match(/^\/api\/jobs\/([a-f0-9-]+)\/music$/);
  if(musicChangeMatch&&req.method==='POST'){
   const j=store.get(musicChangeMatch[1]);
   if(!j){json(res,404,{error:'Projeto não encontrado.'});return;}
   const b=await body(req);
   if(!b.path){json(res,400,{error:'Caminho da música não informado.'});return;}
   const sourcePath=path.join(root,b.path);
   if(!existsSync(sourcePath)){json(res,400,{error:'Arquivo de áudio não encontrado na pasta Musicas.'});return;}
   j.selectedMusic={
    path:b.path,
    name:b.name||path.basename(b.path).replace(/\.mp3$/i,''),
    category:b.category||'custom',
    categoryName:b.categoryName||'Personalizada',
    mood:b.mood||'Selecionada pelo usuário',
    energy:b.energy||'medium',
    defaultVolume:Number(b.defaultVolume)||0.20,
    reason:'Trilha sonora selecionada manualmente no painel.'
   };
   const targetBgmPath=path.join(root,'renderer/public/audio/bgm-ambient.mp3');
   await mkdir(path.dirname(targetBgmPath),{recursive:true});
   await copyFile(sourcePath,targetBgmPath);
   const runId=j.auto?.preview?.runId||j.auto?.runId;
   if(runId){
    await copyFile(sourcePath,path.join(root,'renderer/public/auto',runId,'bgm.mp3'));
   }
   log(j,`Trilha de fundo alterada para "${j.selectedMusic.name}".`);
   store.put(j);
   json(res,200,{selectedMusic:j.selectedMusic,job:j});
   return;
  }

   if(p==='/api/schedule'&&req.method==='GET'){
   json(res,200,{
    queue:listScheduleQueue(store),
    history:listHistory(store),
    settings:getScheduleSettings(store),
    nextSlot:calculateNextAvailableDate(store)
   });
   return;
  }
  
  if(p==='/api/schedule/settings'&&req.method==='POST'){
   const incoming=await body(req);
   const updated=saveScheduleSettings(store,incoming);
   json(res,200,{settings:updated});
   return;
  }
  
  const scheduleMatch=p.match(/^\/api\/jobs\/([a-f0-9-]+)\/schedule$/);
  if(scheduleMatch&&req.method==='POST'){
   const j=store.get(scheduleMatch[1]);
   if(!j){json(res,404,{error:'Projeto não encontrado.'});return;}
   const b=await body(req);
   const record=scheduleJob(store,j.id,b);
   j.scheduled=record;
   j.status='scheduled';
   log(j,`Projeto agendado com sucesso para ${record.targetDate} às ${record.longVideo.time}.`);
   json(res,200,{scheduled:record,job:j});
   return;
  }

  const unscheduleMatch=p.match(/^\/api\/jobs\/([a-f0-9-]+)\/unschedule$/);
  if(unscheduleMatch&&req.method==='POST'){
   const j=store.get(unscheduleMatch[1]);
   if(!j){json(res,404,{error:'Projeto não encontrado.'});return;}
   unscheduleJob(store,j.id);
   log(j,'Projeto removido da fila de agendamento.');
   json(res,200,{job:store.get(j.id)});
   return;
  }

  const metadataMatch=p.match(/^\/api\/jobs\/([a-f0-9-]+)\/metadata$/);
  if(metadataMatch&&req.method==='POST'){
   const j=store.get(metadataMatch[1]);
   if(!j){json(res,404,{error:'Projeto não encontrado.'});return;}
   const s={...providers.defaults,...store.settings()};
   const meta=await providers.generatePublishingMetadata(s,j);
   j.publishingMetadata=meta;
   store.put(j);
   log(j,'Metadados de publicação (títulos de alto CTR e SEO) gerados.');
   json(res,200,{publishingMetadata:meta,job:j});
   return;
  }

  const uploadFinalMatch=p.match(/^\/api\/jobs\/([a-f0-9-]+)\/upload-final$/);
  if(uploadFinalMatch&&req.method==='POST'){
   const j=store.get(uploadFinalMatch[1]);
   if(!j){json(res,404,{error:'Projeto não encontrado.'});return;}
   const b=await body(req);
   if(!b.data)throw new Error('Arquivo de vídeo não enviado.');
   const buf=Buffer.from(b.data.replace(/^data:video\/[^;]+;base64,/,''),'base64');
   if(buf.length<1000)throw new Error('Arquivo de vídeo inválido ou vazio.');
   const longVideosDir=path.join(dir,'long_videos',j.id);
   const legacyOutput=path.join(dir,j.id);
   await mkdir(longVideosDir,{recursive:true});
   await mkdir(legacyOutput,{recursive:true});
   const filename='video_final.mp4';
   await writeFile(path.join(longVideosDir,filename),buf);
   await writeFile(path.join(legacyOutput,filename),buf);
   let dur=j.voiceDuration||60;
   try{const m=await parseFile(path.join(longVideosDir,filename),{duration:true});if(m?.format?.duration)dur=m.format.duration;}catch{}
   j.finalVideo={path:`/outputs/${j.id}/${filename}`,source:'upload-capcut',name:b.filename||filename,uploadedAt:new Date().toISOString(),duration:dur};
   j.renders=[...(j.renders||[]).filter(r=>r.id!=='uploaded-final'),{id:'uploaded-final',url:`/outputs/${j.id}/${filename}`,duration:dur,createdAt:new Date().toISOString()}];
   log(j,'Vídeo final exportado do CapCut importado com sucesso.');
   store.put(j);
   json(res,200,{finalVideo:j.finalVideo,job:j});
   return;
  }

  const packageMatch=p.match(/^\/api\/jobs\/([a-f0-9-]+)\/package$/);
  if(packageMatch&&req.method==='GET'){
   const j=store.get(packageMatch[1]);
   if(!j){json(res,404,{error:'Projeto não encontrado.'});return;}
   const pkg={
    id:j.id,
    title:j.publishingMetadata?.titles?.[0]||j.title,
    titles:j.publishingMetadata?.titles||[j.title],
    description:j.publishingMetadata?.description||'',
    tags:j.publishingMetadata?.tags||[],
    longVideo:{
     path:j.finalVideo?.path||j.renders?.[0]?.url||null,
     duration:j.voiceDuration||60,
     thumbnail:j.thumbnail||null
    },
    shorts:(j.shorts?.items||[]).filter(x=>x?.finished).map(s=>({
     index:s.index+1,
     title:s.title,
     duration:s.duration,
     path:`/shorts/${j.id}/short_${s.index+1}/voice.mp3`
    })),
    scheduled:j.scheduled||null
   };
   res.setHeader('Content-Disposition',`attachment; filename="${j.id}-package.json"`);
   json(res,200,pkg);
   return;
  }
  
  const match=p.match(/^\/api\/jobs\/([a-f0-9-]+)\/(run|search|approve-media|script|export|select-thumbnail|assign-clip|toggle-shorts)$/);
  if(match){
   const j=store.get(match[1]);
   if(!j){json(res,404,{error:'Projeto não encontrado.'});return;}
   const action=match[2];
   if(action==='export'&&req.method==='GET'){res.setHeader('Content-Disposition',`attachment; filename="${j.id}-production.json"`);json(res,200,j);return;}
   if(req.method!=='POST'){json(res,405,{error:'Método não permitido.'});return;}
   const b=await body(req);
   if(active.has(j.id)){json(res,409,{error:'Aguarde a etapa em andamento.'});return;}
   if(action==='toggle-shorts'){
    j.generateShorts=Boolean(b.enabled!==undefined?b.enabled:!j.generateShorts);
    log(j,`Geração de 5 Shorts ${j.generateShorts?'ativada':'desativada'}.`);
    json(res,200,j);
    return;
   }
   if(action==='run'){
    if(!steps.includes(b.step))throw new Error('Etapa inválida.');
    if(b.step==='automatic'){
     if(active.size)throw new Error('Aguarde a produção em andamento.');
     if(b.generateShorts!==undefined)j.generateShorts=Boolean(b.generateShorts);
     await preflight(root,{...providers.defaults,...store.settings()});
    }
    if(b.step==='shorts'){
     if(!j.auto?.finished)throw new Error('Gere o vídeo principal primeiro.');
     if(active.size)throw new Error('Aguarde a etapa em andamento.');
     await preflight(root,{...providers.defaults,...store.settings()});
    }
    void run(j,b.step,{direction:b.direction,generateShorts:Boolean(b.generateShorts||j.generateShorts)});
    json(res,202,{accepted:true});
    return;
   }
   if(action==='select-thumbnail'){selectThumbnail(j,b.id);log(j,'Capa alterada.');json(res,200,j);return;}
   if(action==='assign-clip'){assignClip(j,b);log(j,'Trecho atribuído ao plano '+b.shotId+'.');json(res,200,j);return;}
   if(action==='script'){if(typeof b.text!=='string'||b.text.length<20)throw new Error('Roteiro inválido.');j.script=b.text;j.completed=[...new Set([...j.completed,'script'])];log(j,'Roteiro atualizado.');json(res,200,j);return;}
   if(action==='approve-media'){const item=j.media?.find(x=>String(x.id)===String(b.id)&&x.source===b.source);if(!item)throw new Error('Mídia não encontrada.');if(!j.approvedMedia.some(x=>x.id===item.id&&x.source===item.source))j.approvedMedia.push(item);json(res,200,j);return;}
   if(action==='search'){if(typeof b.query!=='string')throw new Error('Busca inválida.');active.add(j.id);try{const s={...providers.defaults,...store.settings()};const search=b.source==='youtube'?providers.youtube:b.source==='pixabay'?providers.pixabay:providers.footage;const results=(await search(s,b.query)).map(x=>({...x,queries:[b.query],shotIds:b.shotId?[b.shotId]:[],reviewStatus:'pending'}));j.media=mergeMedia(j.media||[],results);json(res,200,j);}finally{active.delete(j.id);}return;}
  }
  
  if(p.startsWith('/api/')){json(res,404,{error:'Rota não encontrada.'});return;}
    let target;
   if(/^\/outputs\/[a-f0-9-]+\/(voice\.mp3|pilot\.mp4|video-[a-f0-9-]+\.mp4|video_final\.mp4|credits-[a-f0-9-]+\.json|thumbnail(?:-[a-f0-9-]+)?\.(png|jpg))$/.test(p)){
    const rel=p.slice(9);
    const cand1=path.join(dir,rel);
    const cand2=path.join(dir,'long_videos',rel);
    target=existsSync(cand1)?cand1:(existsSync(cand2)?cand2:cand1);
   }else if(p.startsWith('/Musicas/')){
    const rel=decodeURIComponent(p.slice(1));
    const cand=path.join(root,rel);
    if(existsSync(cand)&&!path.relative(root,cand).startsWith('..'))target=cand;
    else{res.writeHead(404);res.end('Áudio não encontrado');return;}
   }else if(p.startsWith('/shorts/')){
    const rel=decodeURIComponent(p.slice(1));
    const cand=path.join(dir,rel);
    if(existsSync(cand)&&!path.relative(dir,cand).startsWith('..'))target=cand;
    else{res.writeHead(404);res.end('Short não encontrado');return;}
   }else if(['/','/app.js','/editing-ui.js','/editing.css','/style.css'].includes(p)){
    target=path.join(root,'public',p==='/'?'index.html':p.slice(1));
   }else{
    res.writeHead(404);res.end('Não encontrado');return;
   }
  
  const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.mp3':'audio/mpeg','.mp4':'video/mp4','.json':'application/json','.png':'image/png','.jpg':'image/jpeg'};
  if(['.mp4','.mp3'].includes(path.extname(target))){
   const {size}=await stat(target);const headers={'Content-Type':types[path.extname(target)],'Accept-Ranges':'bytes','Cache-Control':'no-store'};let start=0,end=size-1,status=200;
   if(req.headers.range){const r=/^bytes=(\d+)-(\d*)$/.exec(req.headers.range);if(!r||Number(r[1])>=size||r[2]&&Number(r[2])<Number(r[1])){res.writeHead(416,{'Content-Range':`bytes */${size}`});res.end();return;}start=Number(r[1]);end=r[2]?Math.min(Number(r[2]),size-1):size-1;status=206;headers['Content-Range']=`bytes ${start}-${end}/${size}`;}
   headers['Content-Length']=end-start+1;res.writeHead(status,headers);if(req.method==='HEAD'){res.end();return;}const stream=createReadStream(target,{start,end});stream.on('error',()=>res.destroy());res.on('close',()=>stream.destroy());stream.pipe(res);return;
  }
  const data=await readFile(target);
  res.writeHead(200,{'Content-Type':types[path.extname(target)],'Cache-Control':'no-store'});
  res.end(data);
 }catch(e){json(res,e.code==='ENOENT'?404:400,{error:safeError(e,store.settings())});}
});

server.listen(port,'127.0.0.1',()=>console.log(`Atlas Studio: ${origin}`));
