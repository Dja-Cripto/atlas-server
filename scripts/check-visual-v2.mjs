// Real browser rendering through both authoring entry points, without paid APIs.
// Outputs and synthetic generated code remain in ignored directories.
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
import {authorMotion,authorShortsMotion,normalizeVisualBible,sceneUnits,generateFallbackSceneCode} from '../lib/motion-author.mjs';
import {materializeMap} from '../lib/geography.mjs';
import {validateDirection} from '../lib/auto-plan.mjs';
import {bundle} from '../renderer/node_modules/@remotion/bundler/dist/index.js';
import {openBrowser,selectComposition,renderStill,renderMedia} from '../renderer/node_modules/@remotion/renderer/dist/index.js';
import ffmpeg from '../renderer/node_modules/ffmpeg-static/index.js';
import {browserOptions} from '../lib/render-runtime.mjs';

const root=process.cwd(),runId='visual-v2-check-'+randomUUID();
const output=path.join(root,'.temp',runId),publicFolder=path.join(root,'renderer/public/auto',runId);
await mkdir(output,{recursive:true});await mkdir(publicFolder,{recursive:true});
const audio=spawnSync(ffmpeg,['-y','-f','lavfi','-i','anullsrc=r=44100:cl=mono','-t','9','-q:a','9',path.join(publicFolder,'voice.mp3')],{windowsHide:true});
assert.equal(audio.status,0,'Synthetic silence must be created');
const countries=['Italy','Austria'];
const location=await materializeMap(validateDirection({id:'locate',start:0,end:3,narration:'Italy and Austria.'},{kind:'map',countries,heading:'Neighbors',mapIntent:'Compare neighboring countries'},{}),root);
const route=await materializeMap(validateDirection({id:'route',start:3,end:6,narration:'Goods move from Italy to Austria.'},{kind:'map',countries,heading:'Trade',routes:true,routeFrom:'Italy',routeTo:'Austria',routeEvidence:'Goods move from Italy to Austria.'},{}),root);
const thermal={id:'thermal',start:6,end:9,kind:'diagram',heading:'Metal expands',narration:'Heating iron makes the metal expand.',durationInFrames:90};
const manifest={title:'Visual V2 technical check',duration:9,fps:30,voice:`auto/${runId}/voice.mp3`,scenes:[location,route,thermal]};
const j={id:runId,title:manifest.title,auto:{runId},shorts:{},events:[]};
const browser=await openBrowser('chrome',browserOptions());
try{
 for(const vertical of [false,true]){
  const folder=path.join(root,'renderer/src/generated',runId,...(vertical?['shorts','short-0']:[]));
  await mkdir(folder,{recursive:true});
  const scenes=sceneUnits(manifest);
  await writeFile(path.join(folder,'visual-bible.json'),JSON.stringify(normalizeVisualBible({},scenes)));
  for(const scene of scenes){
   const code=scene.kind==='diagram'?generateFallbackSceneCode(scene,vertical):"import {AbsoluteFill} from 'remotion';export default function Scene(){return <AbsoluteFill style={{background:'transparent'}}/>;}";
   await writeFile(path.join(folder,`scene-${scene.index}.json`),JSON.stringify({intent:'Technical integration fixture',beats:[{start:0,end:3,action:'Observe the real map or explanatory diagram'}],handoff:{opening:'cut',persistentElements:[],endState:'hold',motionVector:'none',nextOpportunity:'Continue'},code}));
  }
  const entry=vertical?await authorShortsMotion({},j,manifest,{root,log:()=>{},shortIndex:0}):await authorMotion({},j,manifest,{root,log:()=>{}});
  const serveUrl=await bundle({entryPoint:entry,publicDir:path.join(root,'renderer/public'),outDir:path.join(output,vertical?'bundle-short':'bundle-long'),symlinkPublicDir:true});
  const composition=await selectComposition({serveUrl,id:vertical?'AutomaticShort':'AutomaticVideo',puppeteerInstance:browser,...browserOptions()});
  assert.equal(composition.width,vertical?1080:1920);assert.equal(composition.height,vertical?1920:1080);
  for(const frame of [0,45,89,90,135,179,180,225,269]){
   await renderStill({serveUrl,composition,puppeteerInstance:browser,frame,output:path.join(output,`${vertical?'short':'long'}-${frame}.png`),scale:.5,...browserOptions()});
  }
  console.log('Rendering '+(vertical?'portrait':'landscape')+' route sample');
  await renderMedia({frameRange:[90,119],onProgress:({progress})=>{if(progress===1)console.log('Sample encoded');},serveUrl,composition,puppeteerInstance:browser,codec:'h264',outputLocation:path.join(output,vertical?'short.mp4':'long.mp4'),scale:.5,concurrency:2,crf:25,x264Preset:'ultrafast',...browserOptions()});
 }
 await writeFile(path.join(output,'result.json'),JSON.stringify({ok:true,runId,frames:18,videos:2,output},null,2));
 console.log(JSON.stringify({ok:true,output}));
}finally{await browser.close({silent:true});}
