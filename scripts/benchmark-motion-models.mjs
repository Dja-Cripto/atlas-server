import {mkdir,readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import {createStore} from '../lib/store.mjs';
import {generateJSON} from '../lib/providers.mjs';
import {cleanPromptScene,normalizeBeats,normalizeMotionCode,sceneContract,validateMotionCode} from '../lib/motion-author.mjs';

const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const runCommand=(exe,args,cwd)=>new Promise((resolve,reject)=>{const child=spawn(exe,args,{cwd,windowsHide:true,stdio:'ignore'});child.on('error',reject);child.on('exit',code=>code===0?resolve():reject(Error(`Render terminou com código ${code}.`)));});
const runId=process.argv[2];
if(!runId)throw Error('Use: node scripts/benchmark-motion-models.mjs <runId>');
const store=createStore(path.join(root,'data'));
if(store.list().some(job=>job.status==='running'))throw Error('Benchmark aguardando: existe uma produção principal em andamento.');
const settings=store.settings();store.close();
const manifest=JSON.parse(await readFile(path.join(root,'renderer/public/auto',runId,'manifest.json'),'utf8'));
const bible=JSON.parse(await readFile(path.join(root,'renderer/src/generated',runId,'visual-bible.json'),'utf8'));
const indices=[0,2,5];
const labels=['mapa-real','video-real','foto-historica'];
const models=[
 {id:'mimo-v2.5',provider:'go',input:0,output:0},
 {id:'gpt-5.6-luna',provider:'go',input:.20,output:1.20},
 {id:'deepseek-v4-flash',provider:'go',input:.14,output:.28},
 {id:'glm-5.3-flash',provider:'go',input:.15,output:.50},
 {id:'kimi-k2.7-code',provider:'go',input:.95,output:4.00},
 {id:'gemini-3.6-flash',provider:'gemini',input:1.50,output:7.50},
];
const stamp=new Date().toISOString().replace(/[:.]/g,'-');
const out=path.join(root,'benchmarks','motion-models',stamp);await mkdir(out,{recursive:true});
const timeline=manifest.scenes.map((scene,index)=>({...scene,index,durationInFrames:Math.max(1,Math.round((scene.end-scene.start)*30)),fps:30,map:scene.map?{type:scene.map.type,countries:scene.countries,features:scene.map.features?.map(f=>({properties:f.properties}))}:undefined}));
const report={createdAt:new Date().toISOString(),sourceRunId:runId,note:'Custos estimados por caracteres/4; confirme no painel do provedor.',models:[],scenes:indices.map((index,i)=>({index,label:labels[i],id:timeline[index].id,heading:timeline[index].heading}))};
await writeFile(path.join(out,'README.txt'),'Benchmark isolado. Pode excluir esta pasta inteira sem afetar o Atlas Studio.\n');
await writeFile(path.join(out,'inputs.json'),JSON.stringify({scenes:indices.map(i=>timeline[i]),visualBible:bible},null,2));
for(const model of models){
 const modelDir=path.join(out,model.id);await mkdir(modelDir,{recursive:true});
 const row={model:model.id,provider:model.provider,results:[],estimatedUsd:0};
 for(let n=0;n<indices.length;n++){
  const index=indices[n],scene=timeline[index],directive=bible.sceneDirectives.find(x=>x.id===scene.id);
  const assignment={artDirection:directive,currentScene:cleanPromptScene(scene),context:{visualBible:bible,timeline:timeline.map(({map,...x})=>x),previousScene:timeline[index-1]||null,nextScene:timeline[index+1]||null,previousHandoff:null},feedback:'',previousCode:null};
  const prompt=sceneContract+'\nSCENE_ASSIGNMENT: '+JSON.stringify(assignment);const started=Date.now();
  const item={scene:scene.id,label:labels[n],valid:false,elapsedSeconds:0,error:null,estimatedInputTokens:Math.ceil(prompt.length/4),estimatedOutputTokens:0,estimatedUsd:0};
  try{
   const config=model.provider==='gemini'?{...settings,sceneProvider:'gemini',geminiModel:model.id}:{...settings,sceneProvider:'go',goModel:model.id,timeoutMs:420000};
   const result=await generateJSON(config,{id:`benchmark-${stamp}-${model.id}`},prompt);
   result.code=normalizeMotionCode(result.code);result.beats=normalizeBeats(result.beats,scene.durationInFrames/30,30);validateMotionCode(result.code,scene);
   item.estimatedOutputTokens=Math.ceil(JSON.stringify(result).length/4);item.valid=true;
   await writeFile(path.join(modelDir,`${labels[n]}.json`),JSON.stringify(result,null,2));await writeFile(path.join(modelDir,`${labels[n]}.tsx`),result.code);
   await writeFile(path.join(modelDir,'motion-kit.ts'),`export {ContextMap} from '../../../../renderer/src/ContextMap';\nexport {SceneBackdrop} from '../../../../renderer/src/SceneBackdrop';\n`);
   const entry=`import React from 'react';import {AbsoluteFill,Composition,registerRoot} from 'remotion';import Scene from './${labels[n]}';import {SceneBackdrop} from './motion-kit';const scene=${JSON.stringify(scene)};const App=()=> <AbsoluteFill style={{background:'#173d39'}}><SceneBackdrop scene={scene} duration={scene.durationInFrames}/><Scene scene={scene} context={{}}/></AbsoluteFill>;registerRoot(()=> <Composition id="Benchmark" component={App} durationInFrames={scene.durationInFrames} fps={30} width={1920} height={1080}/>);`;
   const entryFile=path.join(modelDir,`${labels[n]}-entry.tsx`),previewFile=path.join(modelDir,`${labels[n]}.mp4`);await writeFile(entryFile,entry);
   try{await runCommand(process.execPath,[path.join(root,'renderer/node_modules/@remotion/cli/remotion-cli.js'),'render',entryFile,'Benchmark',previewFile,'--public-dir',path.join(root,'renderer/public'),'--log','error'],path.join(root,'renderer'));item.preview=previewFile;}catch(error){item.previewError=error.message;}
  }catch(error){item.error=String(error.message||error);}
  item.elapsedSeconds=Math.round((Date.now()-started)/100)/10;
  item.estimatedUsd=(item.estimatedInputTokens*model.input+item.estimatedOutputTokens*model.output)/1_000_000;row.estimatedUsd+=item.estimatedUsd;row.results.push(item);
  await writeFile(path.join(out,'report.json'),JSON.stringify(report,null,2));
 }
 row.estimatedUsd=Number(row.estimatedUsd.toFixed(6));report.models.push(row);await writeFile(path.join(out,'report.json'),JSON.stringify(report,null,2));
}
console.log(out);
