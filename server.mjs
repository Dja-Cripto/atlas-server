import http from 'node:http';
import {createReadStream,existsSync,readFileSync} from 'node:fs';
import {readFile,writeFile,mkdir,stat,rm} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {randomUUID,createHmac,timingSafeEqual} from 'node:crypto';
import {spawn} from 'node:child_process';
import {createStore} from './lib/store.mjs';
import * as providers from './lib/providers.mjs';
import {validateServiceAccount} from './lib/vertex.mjs';
import {parseFile} from 'music-metadata';
import {createEditPlan} from './lib/storyboard.mjs';
import {mergeMedia,recordThumbnail,selectThumbnail,assignClip} from './lib/editing.mjs';
import {automatic,preflight,renderFinalMP4,exportCapCut,finalizeMainPackage} from './lib/automatic.mjs';
import {automaticShorts,renderAllShortsMP4} from './lib/shorts.mjs';
import {launchCapCut} from './lib/capcut.mjs';
import {getScheduleSettings,saveScheduleSettings,listScheduleQueue,listHistory,calculateNextAvailableDate,scheduleJob,unscheduleJob} from './lib/schedule.mjs';
import {getPublishingSettings,savePublishingSettings,dispatchPublicationQueue} from './lib/publishing.mjs';
import {transcriptToVtt} from './lib/captions.mjs';
import {loadTopicsData,saveTopicsData,addTopic,addBulkTopics,parseBulkText,updateTopic,deleteTopic,dismissAlert,addAlert,processNextTopicInQueue} from './lib/topics.mjs';

const root=path.dirname(fileURLToPath(import.meta.url));
const dir=process.env.ATLAS_DATA_DIR||path.join(root,'data');
const port=Number(process.env.PORT||4310), origin=`http://127.0.0.1:${port}`;
const store=createStore(dir),active=new Set();
const previewStudios=new Map();
const steps=['research','script','scenes','media','voice','thumbnail','editing','automatic','shorts','render','capcut'];
const labels={research:'Pesquisa',script:'Roteiro',scenes:'Plano de cenas',media:'Busca de filmagens',voice:'Narração',thumbnail:'Capa',editing:'Plano de edição detalhado',automatic:'Produção automática',shorts:'Geração de 5 Shorts',render:'Renderização MP4',capcut:'Exportação CapCut'};

function getAuthPassword(){
 if(process.env.ATLAS_PASSWORD) return process.env.ATLAS_PASSWORD.trim();
 if(process.env.PANEL_PASSWORD) return process.env.PANEL_PASSWORD.trim();
 const secretPath='/srv/robo/portal-bot/secrets/panel/password';
 if(existsSync(secretPath)){
  try{return readFileSync(secretPath,'utf8').trim();}catch{}
 }
 return null;
}

function getSessionSecret(){
 if(process.env.SESSION_SECRET) return process.env.SESSION_SECRET.trim();
 const secretPath='/srv/robo/portal-bot/secrets/panel/session-secret';
 if(existsSync(secretPath)){
  try{return readFileSync(secretPath,'utf8').trim();}catch{}
 }
 return 'atlas-studio-auth-session-key-2026';
}

function signSession(userId){
 const exp=Date.now()+30*24*60*60*1000;
 const payload=`${userId}:${exp}`;
 const sig=createHmac('sha256',getSessionSecret()).update(payload).digest('hex');
 return `${payload}:${sig}`;
}

function verifySession(token){
 if(!token||typeof token!=='string')return false;
 const parts=token.split(':');
 if(parts.length!==3)return false;
 const [userId,expStr,sig]=parts;
 const exp=Number(expStr);
 if(!exp||exp<Date.now())return false;
 const expectedSig=createHmac('sha256',getSessionSecret()).update(`${userId}:${expStr}`).digest('hex');
 if(sig.length!==expectedSig.length)return false;
 try{
  return timingSafeEqual(Buffer.from(sig),Buffer.from(expectedSig));
 }catch{
  return false;
 }
}

function parseCookies(req){
 const list={};
 const rc=req.headers.cookie;
 if(!rc)return list;
 rc.split(';').forEach(c=>{
  const parts=c.split('=');
  if(parts.length>=2)list[parts[0].trim()]=decodeURIComponent(parts.slice(1).join('=').trim());
 });
 return list;
}

for(const j of store.list()){if(j.status==='running'){j.status='interrupted';j.error='Execução interrompida. Retome a etapa pelo painel.';store.put(j);}}

function log(j,message){j.events.push({at:new Date().toISOString(),message});j.updatedAt=new Date().toISOString();store.put(j);}
function safeError(e,s){let m=String(e.message||'Erro inesperado');for(const k of providers.secretFields)if(s[k])m=m.split(s[k]).join('[oculto]');return m.slice(0,500);}
async function captionForPublication(j,publication){
 const runId=j.auto?.preview?.runId||j.auto?.runId;
 if(!runId)return null;
 const transcriptPath=publication.kind==='long'
  ?path.join(root,'renderer/public/auto',runId,'transcript.json')
  :path.join(root,'renderer/public/auto',runId,'shorts',`short-${publication.index-1}`,'transcript.json');
 try{return transcriptToVtt(JSON.parse(await readFile(transcriptPath,'utf8')));}catch{return null;}
}

async function run(j,action,options={}){
 active.add(j.id);
 const s={...providers.defaults,...store.settings()};
 j.status='running';
 j.error=null;
 j.current=action;
 log(j,labels[action]+' iniciada.');
 try{
  if(action==='automatic'){
   await automatic(s,j,{root,dir,log,store});
   await finalizeMainPackage(s,j,{root,dir,log,store});
   j.completed=[...new Set([...j.completed,'automatic','render'])];
   j.auto={...j.auto,finished:true,stage:'done',progress:100};
   store.put(j);
   if(j.productionVersion==='v3'&&j.generateShorts){
    j.status='running';j.current='shorts';store.put(j);
    log(j,'Vídeo principal pronto. Iniciando automaticamente os Shorts solicitados.');
    while(!j.shorts?.finished){
     const result=await automaticShorts(s,j,{root,dir,log,store});
     store.put(j);
     if(result.finished)break;
    }
    j.completed=[...new Set([...j.completed,'shorts'])];
   }
   j.status='review';
   store.put(j);
   log(j,j.generateShorts&&j.productionVersion==='v3'?'Vídeo principal e Shorts finalizados.':'Vídeo principal completo e disponível para revisão.');
  }
  if(action==='shorts'){
   await finalizeMainPackage(s,j,{root,dir,log});
   const result=await automaticShorts(s,j,{root,dir,log,store});
   if(result.finished)j.completed=[...new Set([...j.completed,'shorts'])];
   j.status='review';
   store.put(j);
   log(j,result.finished?'Todos os Shorts finalizados e renderizados com sucesso!':`Short ${result.nextIndex}/${result.total} pronto para assistir. Inicie o próximo após revisar este.`);
  }  if(action==='render'){
   await renderFinalMP4(s,j,{root,dir,log,store});
   await finalizeMainPackage(s,j,{root,dir,log});
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
  if(action!=='shorts'||j.shorts?.finished)j.completed=[...new Set([...j.completed,action])];
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

async function runAutomaticForJob(jobId,topic=null){
 const j=store.get(jobId);
 if(!j)return;
 try{
  await run(j,'automatic',{generateShorts:true});
  if(j.status==='error')throw new Error(j.error||'Produção interrompida; cenas prontas preservadas.');
  try{ scheduleJob(store,j.id); }catch{}
  try{
   const tempJobDir=path.join(root,'.temp',j.id);
   if(existsSync(tempJobDir))await rm(tempJobDir,{recursive:true,force:true});
  }catch{}
  if(topic){
   updateTopic(dir,topic.id,{status:'completed',processedAt:new Date().toISOString()});
  }
  addAlert(dir,{
   type:'production_ready',
   title:`Produção Concluída: "${j.title}"`,
   message:`Vídeo principal de ${j.minutes}min e Shorts verticais foram renderizados e colocados na fila. A publicação depende da chave Publicação automática.`,
   jobId:j.id
  });
 }catch(err){
  if(topic){
   updateTopic(dir,topic.id,{status:'error'});
  }
  addAlert(dir,{
   type:'error',
   title:`Falha na Produção: "${j.title}"`,
   message:err.message||'Erro durante a geração automática.',
   jobId:j.id
  });
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

const allowedHosts=new Set([
 `127.0.0.1:${port}`,
 `localhost:${port}`,
 '127.0.0.1:3000',
 'localhost:3000',
 '127.0.0.1:4310',
 'localhost:4310',
 'portal-panel:3000',
 'portal-panel',
 'painel.setupdja.website',
 'setupdja.website'
]);

function isHostAllowed(hostHeader){
 if(!hostHeader)return false;
 const clean=hostHeader.toLowerCase().trim();
 if(allowedHosts.has(clean)||allowedHosts.has(clean.split(':')[0]))return true;
 if(clean.endsWith('.setupdja.website')||clean==='setupdja.website')return true;
 if(process.env.ALLOWED_HOSTS){
  const custom=process.env.ALLOWED_HOSTS.split(',').map(h=>h.trim().toLowerCase());
  if(custom.includes(clean)||custom.includes(clean.split(':')[0]))return true;
 }
 return false;
}

function isOriginAllowed(originHeader){
 if(!originHeader)return true;
 try{
  const u=new URL(originHeader);
  if(u.hostname==='127.0.0.1'||u.hostname==='localhost')return true;
  if(u.hostname.endsWith('setupdja.website')||u.hostname==='setupdja.website')return true;
 }catch{}
 return false;
}

const server=http.createServer(async(req,res)=>{
 try{
  if(!isHostAllowed(req.headers.host)){json(res,403,{error:'Host não autorizado.'});return;}
  if(req.headers.origin&&!isOriginAllowed(req.headers.origin)){json(res,403,{error:'Origem não autorizada.'});return;}
  res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');
  const u=new URL(req.url,origin),p=u.pathname;

  const cookies=parseCookies(req);
  const authRequired=Boolean(getAuthPassword());
  const isAuthenticated=!authRequired||verifySession(cookies.atlas_session);

  if(p==='/api/auth/me'&&req.method==='GET'){
   json(res,200,{authenticated:isAuthenticated,authRequired,user:isAuthenticated?{name:'Sr. Daniel',role:'admin'}:null});
   return;
  }

  if(p==='/api/auth/login'&&req.method==='POST'){
   const expectedPw=getAuthPassword();
   if(!expectedPw){
    const token=signSession('daniel');
    res.setHeader('Set-Cookie',`atlas_session=${token}; Path=/; Max-Age=${30*24*3600}; HttpOnly; SameSite=Lax`);
    json(res,200,{authenticated:true,user:{name:'Sr. Daniel',role:'admin'}});
    return;
   }
   const b=await body(req);
   const given=Buffer.from(String(b.password||''));
   const expected=Buffer.from(expectedPw);
   const ok=given.length===expected.length&&timingSafeEqual(given,expected);
   if(!ok){
    json(res,401,{error:'Chave de acesso incorreta.'});
    return;
   }
   const token=signSession('daniel');
   res.setHeader('Set-Cookie',`atlas_session=${token}; Path=/; Max-Age=${30*24*3600}; HttpOnly; SameSite=Lax`);
   json(res,200,{authenticated:true,user:{name:'Sr. Daniel',role:'admin'}});
   return;
  }

  if(p==='/api/auth/logout'&&req.method==='POST'){
   res.setHeader('Set-Cookie',`atlas_session=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`);
   json(res,200,{authenticated:false});
   return;
  }

  if(!['GET','HEAD','DELETE'].includes(req.method)&&req.headers['content-type']!=='application/json'){json(res,415,{error:'Use application/json.'});return;}

  if(p.startsWith('/api/')&&!isAuthenticated){
   json(res,401,{error:'Não autorizado. Efetue login para continuar.'});
   return;
  }
  
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
   if(b.notes!==undefined&&(typeof b.notes!=='string'||b.notes.length>400))throw new Error('A direção do vídeo deve ter até 400 caracteres.');
   const j={
    id:randomUUID(),
    title:b.title.trim(),
    notes:String(b.notes||'').trim(),
    minutes:Number(b.minutes),
    productionVersion:'v3',editorialVersion:'observant-dry-v1',
    generateShorts:Boolean(b.generateShorts),
    shortsCount:b.generateShorts?5:0,
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
  
  if(p==='/api/publishing/settings'&&req.method==='GET'){
   json(res,200,{settings:getPublishingSettings(store)});
   return;
  }

  if(p==='/api/publishing/settings'&&req.method==='POST'){
   const incoming=await body(req);
   const updated=savePublishingSettings(store,incoming);
   json(res,200,{settings:updated,queued:updated.enabled});
   return;
  }

  if(p==='/api/publishing/dispatch'&&req.method==='POST'){
   if(!getPublishingSettings(store).enabled){json(res,409,{error:'Publicação automática está desligada.'});return;}
   const result=await dispatchPublicationQueue({store,scheduleSettings:getScheduleSettings(store),captionResolver:captionForPublication});
   json(res,200,result);
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
  
    if(p==='/api/hub'&&req.method==='GET'){
    const topicsData=loadTopicsData(dir);
    const scheduleSlots=calculateNextAvailableDate(store);
    const jobs=store.list();
    const todayJob=jobs.find(j=>j.scheduled?.targetDate===scheduleSlots.targetDate)||jobs[0]||null;
    json(res,200,{
     todayJob,
     alerts:(topicsData.alerts||[]).filter(a=>!a.dismissed).slice(0,10),
     queue:topicsData.queue||[],
     settings:topicsData.settings||{autoRunTime:'00:00',enabled:true},
     nextSlot:scheduleSlots,
     channels:[
      {id:'youtube',name:'YouTube',status:'pending_creds',label:'Aguardando Credenciais (OAuth2)'},
      {id:'facebook',name:'Facebook',status:'pending_creds',label:'Aguardando Credenciais (Graph API)'},
      {id:'tiktok',name:'TikTok',status:'pending_creds',label:'Aguardando Credenciais (Posting API)'}
     ]
    });
    return;
   }

   if(p==='/api/topics'&&req.method==='GET'){
    json(res,200,loadTopicsData(dir));
    return;
   }

   if(p==='/api/topics'&&req.method==='POST'){
    const b=await body(req);
    if(b.bulkText){
     const list=parseBulkText(b.bulkText);
     const added=addBulkTopics(dir,list);
     json(res,201,{added,count:added.length});
     return;
    }
    if(Array.isArray(b.topics)){
     const added=addBulkTopics(dir,b.topics);
     json(res,201,{added,count:added.length});
     return;
    }
    const item=addTopic(dir,b);
    json(res,201,item);
    return;
   }

   const topicPatchMatch=p.match(/^\/api\/topics\/([a-zA-Z0-9_-]+)$/);
   if(topicPatchMatch&&req.method==='PATCH'){
    const b=await body(req);
    const updated=updateTopic(dir,topicPatchMatch[1],b);
    json(res,200,updated);
    return;
   }

   const topicDelMatch=p.match(/^\/api\/topics\/([a-zA-Z0-9_-]+)$/);
   if(topicDelMatch&&req.method==='DELETE'){
    deleteTopic(dir,topicDelMatch[1]);
    json(res,200,{deleted:true});
    return;
   }

   if(p==='/api/topics/run-next'&&req.method==='POST'){
    const b=await body(req).catch(()=>({}));
    const s={...providers.defaults,...store.settings()};
    const result=await processNextTopicInQueue(store,s.geminiKey,runAutomaticForJob,b.topicId||null);
    json(res,200,result);
    return;
   }

   const alertDismissMatch=p.match(/^\/api\/hub\/alerts\/([a-zA-Z0-9_-]+)\/dismiss$/);
   if(alertDismissMatch&&req.method==='POST'){
    dismissAlert(dir,alertDismissMatch[1]);
    json(res,200,{success:true});
    return;
   }

   if(p==='/api/hub/settings'&&req.method==='POST'){
    const b=await body(req);
    const data=loadTopicsData(dir);
    data.settings={...data.settings,...b};
    saveTopicsData(dir,data);
    json(res,200,data.settings);
    return;
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

const bindHost=process.env.HOST||'0.0.0.0';
server.listen(port,bindHost,()=>console.log(`Atlas Studio: http://${bindHost}:${port}`));

let lastAutoRunDate='';
setInterval(async()=>{
 try{
  const data=loadTopicsData(dir);
  if(!data.settings?.enabled)return;
  const now=new Date();
  const todayYMD=now.toISOString().slice(0,10);
  const curTime=now.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit',timeZone:'America/Bahia'});
  const targetTime=data.settings.autoRunTime||'00:00';
  if(curTime===targetTime&&lastAutoRunDate!==todayYMD){
   lastAutoRunDate=todayYMD;
   console.log(`[Agendador Autônomo] Horário ${curTime} atingido. Processando próxima pauta da fila para Daniel...`);
   const s={...providers.defaults,...store.settings()};
   await processNextTopicInQueue(store,s.geminiKey,runAutomaticForJob);
  }
 }catch(e){
  console.error('[Agendador Autônomo Erro]',e);
 }
},40000);


let publicationTickRunning=false;
setInterval(async()=>{
 if(publicationTickRunning||!getPublishingSettings(store).enabled)return;
 publicationTickRunning=true;
 try{await dispatchPublicationQueue({store,scheduleSettings:getScheduleSettings(store),captionResolver:captionForPublication});}
 catch(e){console.error('[Publicador Automático Erro]',safeError(e,store.settings()));}
 finally{publicationTickRunning=false;}
},60000);
