import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,rm} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {materializeMap} from '../lib/geography.mjs';
import {validateDirection,diversifyVisualPlan,enforceVisualBreathing} from '../lib/auto-plan.mjs';
import {repairVisuals} from '../lib/visual-repair.mjs';
import {generateFallbackSceneCode,validateMotionCode} from '../lib/motion-author.mjs';
import {recoverScene} from '../lib/scene-recovery.mjs';
import {sceneSampleFrames} from '../lib/preview-sampling.mjs';
import {stageTracker} from '../lib/production-metrics.mjs';

test('missing media recovers into a materialized map; connections require explicit evidenced endpoints',async()=>{
 const root=await mkdtemp(path.join(os.tmpdir(),'atlas-map-v2-'));
 try{
  const world={type:'FeatureCollection',features:['Italy','Austria'].map((name,i)=>({type:'Feature',properties:{ADMIN:name},geometry:{type:'Polygon',coordinates:[[[10+i,40],[10+i,41],[11+i,41],[11+i,40],[10+i,40]]]}}))};
  const dir=path.join(root,'renderer/public/auto');await mkdir(dir,{recursive:true});
  for(const file of ['world.json','world-background.json'])await writeFile(path.join(dir,file),JSON.stringify(world));
  const slot={id:'scene',start:0,end:6,narration:'Goods move from Italy to Austria.',kind:'title',heading:'A closer look',missingVisual:true};
  const candidate={id:'scene',kind:'map',heading:'Trade',countries:['Italy','Austria'],routes:true};
  const review=await repairVisuals([slot],{research:{},propose:async()=>candidate,materialize:scene=>materializeMap(scene,root)});
  assert.equal(review.pending.length,0);assert.equal(review.scenes[0].map.features.length,2);
  assert.equal(review.scenes[0].map.atlasRoute,null);
  const directed=validateDirection(slot,{...candidate,routeFrom:'Italy',routeTo:'Austria',routeEvidence:slot.narration},{});
  assert.deepEqual((await materializeMap(directed,root)).map.atlasRoute,{from:0,to:1,schematic:true});
  const unproven=validateDirection(slot,{...candidate,routeFrom:'Italy',routeTo:'Austria',routeEvidence:'Invented journey'},{});
  assert.equal((await materializeMap(unproven,root)).map.atlasRoute,null);
 }finally{await rm(root,{recursive:true,force:true});}
});

test('creative intent allows consecutive explanations and clean intentional holds',()=>{
 const plan=['Locate the border','Explain movement across that border'].map((mapIntent,i)=>validateDirection({id:'s'+i,start:i*5,end:i*5+5,narration:'Italy and Austria.'},{kind:'map',heading:'Border',countries:['Italy','Austria'],mapIntent},{}));
 assert.deepEqual(diversifyVisualPlan(plan,90).map(s=>s.kind),['map','map']);
 const clean=Array.from({length:5},(_,i)=>({id:'s'+i,kind:'footage',treatment:'clean',motionStyle:'hold',editorialReason:'Observe the real subject',start:i*5,end:i*5+5,asset:{kind:'video'}}));
 assert.ok(enforceVisualBreathing(clean,30).slice(1).every(scene=>scene.treatment==='clean'));
 assert.equal(validateMotionCode("import {AbsoluteFill} from 'remotion';export default function Still(){return <AbsoluteFill><div>Observation</div></AbsoluteFill>}" ).includes('Observation'),true);
});

test('scientific recovery cannot turn ocean temperature into an iron explanation and persists safe single-scene recovery',async()=>{
 assert.throws(()=>generateFallbackSceneCode({kind:'diagram',title:'Summer',narration:'Warm ocean water flows above cold ocean water.'}),/alternativa factual/);
 assert.throws(()=>generateFallbackSceneCode({kind:'diagram',narration:'Two currents run in opposite directions.'}),/alternativa factual/);
 const scene={id:'iron',index:2,kind:'diagram',narration:'Heating iron makes the metal expand.',durationInFrames:120};
 const folder=await mkdtemp(path.join(os.tmpdir(),'atlas-recover-v2-'));
 try{
  const code=await recoverScene({}, {auto:{}},scene,{folder,error:Error('runtime'),log:()=>{}});
  assert.match(code,/Heating expands metal/);assert.match(code,/useVideoConfig/);
  assert.equal(await readFile(path.join(folder,'Scene2.tsx'),'utf8'),code);
  assert.equal(JSON.parse(await readFile(path.join(folder,'scene-2.json'),'utf8')).code,code);
 }finally{await rm(folder,{recursive:true,force:true});}
});

test('validation samples both boundaries and records elapsed stage times without requiring motion',()=>{
 assert.deepEqual(sceneSampleFrames({from:150,durationInFrames:90},299),[150,195,239]);
 assert.deepEqual(sceneSampleFrames({from:0,durationInFrames:1},0),[0]);
 let state={},now=0;const messages=[];const stage=stageTracker(()=>state,message=>messages.push(message),()=>now);
 stage('media');now=1500;state={};stage('motion');now=3500;stage(null);
 assert.deepEqual(state.stageTimings,{media:1.5,motion:2});assert.equal(messages.length,2);
});

test('descriptive video breathes but photos and consecutive narrated facts retain effects beyond decorative quotas',()=>{
 const narration=['The Eiffel Tower looks beautiful at sunset.','The tower is 330 meters tall.','It was built in 1889.','The tower is 137 years old.','This is one of the most beautiful views.'];
 const plan=narration.map((line,i)=>validateDirection({id:'v'+i,start:i*5,end:i*5+5,narration:line},{kind:'footage',treatment:'clean',motionStyle:'hold',heading:'Eiffel Tower'},{}));
 plan.push({...validateDirection({id:'photo',start:25,end:30,narration:'A view of the Eiffel Tower.'},{kind:'photo',treatment:'clean',motionStyle:'hold',heading:'Eiffel Tower'},{}),asset:{kind:'image'}});
 const scenes=enforceVisualBreathing(plan,30);
 assert.deepEqual(scenes.slice(1,4).map(scene=>scene.treatment),['composed','composed','composed']);
 assert.equal(scenes[4].treatment,'clean');
 assert.equal(scenes[5].treatment,'composed');assert.equal(scenes[5].motionStyle,'auto');
 assert.throws(()=>validateMotionCode("import {Img} from 'remotion';export default function Still(){return <Img src='a.jpg'/>}",{asset:{kind:'image'}}),/Fotografias precisam/);
});
