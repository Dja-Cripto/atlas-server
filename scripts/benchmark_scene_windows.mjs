import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {readFile,rm,mkdir} from 'node:fs/promises';
import {createStore} from '../lib/store.mjs';
import {browserOptions,renderConcurrency} from '../lib/render-runtime.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dir=process.env.ATLAS_DATA_DIR||path.join(root,'data');
const jobId=process.argv[2];
if(!/^[0-9a-f-]{36}$/.test(jobId||''))throw Error('Informe um ID de produção válido.');
const framesPerScene=Math.max(6,Math.min(90,Number(process.argv[3])||24));
const selected=new Set((process.argv[4]||'').split(',').map(x=>Number(x)).filter(Number.isInteger));
const store=createStore(dir);
const job=store.get(jobId);
store.close();
if(!job?.auto?.runId)throw Error('Produção sem composição gerada.');
const runId=job.auto.runId;
const manifest=JSON.parse(await readFile(path.join(root,'renderer/public/auto',runId,'manifest.json'),'utf8'));
const entryPoint=path.join(root,'renderer/src/generated',runId,'index.tsx');
const temporary=path.join(root,'.temp',`scene-benchmark-${runId}-${Date.now()}`);
await mkdir(temporary,{recursive:true});
try{
 const {bundle}=await import('../renderer/node_modules/@remotion/bundler/dist/index.js');
 const {selectComposition,renderMedia}=await import('../renderer/node_modules/@remotion/renderer/dist/index.js');
 const bundleStart=Date.now();
 const serveUrl=await bundle({entryPoint,publicDir:path.join(root,'renderer/public'),outDir:path.join(temporary,'bundle'),symlinkPublicDir:true});
 const composition=await selectComposition({serveUrl,id:'AutomaticVideo',...browserOptions()});
 console.log(JSON.stringify({event:'bundle',seconds:(Date.now()-bundleStart)/1000,totalFrames:composition.durationInFrames,scenes:manifest.scenes.length}));
 for(let index=0;index<manifest.scenes.length;index++){
  if(selected.size && !selected.has(index+1))continue;
  const scene=manifest.scenes[index];
  const first=Math.max(0,Math.round(Number(scene.start||0)*composition.fps));
  const last=Math.min(composition.durationInFrames-1,Math.ceil(Number(scene.end||0)*composition.fps)-1);
  if(last<first)continue;
  const count=Math.min(framesPerScene,last-first+1);
  const from=first+Math.floor((last-first+1-count)/2);
  const start=Date.now();
  const result=await renderMedia({...browserOptions(),composition,serveUrl,codec:'h264',pixelFormat:'yuv420p',x264Preset:'ultrafast',crf:24,outputLocation:path.join(temporary,`scene-${index}.mp4`),frameRange:[from,from+count-1],concurrency:renderConcurrency(),offthreadVideoCacheSizeInBytes:2147483648,muted:true});
  const seconds=(Date.now()-start)/1000;
  console.log(JSON.stringify({event:'scene',index:index+1,kind:scene.kind,assetKind:scene.asset?.kind||null,frames:count,seconds,fps:Number((count/seconds).toFixed(2)),slowestFrames:result.slowestFrames}));
 }
}finally{await rm(temporary,{recursive:true,force:true});}