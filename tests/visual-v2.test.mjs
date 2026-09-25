import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,rm} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {materializeMap,buildGeographicMap} from '../lib/geography.mjs';
import {validateDirection,diversifyVisualPlan,enforceExplanatoryScenes,enforceVisualBreathing} from '../lib/auto-plan.mjs';
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

test('consecutive map intentions use film for the second explanation while clean video can hold',()=>{
 const plan=['Locate the border','Explain movement across that border'].map((mapIntent,i)=>validateDirection({id:'s'+i,start:i*5,end:i*5+5,narration:'Italy and Austria.'},{kind:'map',heading:'Border',countries:['Italy','Austria'],mapIntent},{}));
 assert.deepEqual(diversifyVisualPlan(plan,90).map(s=>s.kind),['map','footage']);
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

test('geography recognizes French Guiana and France as valid map territories',async()=>{
 const scene=await materializeMap({id:'test',kind:'map',countries:['French Guiana','Brazil']},path.resolve('.'));
 assert.equal(scene.map.features.length,2);
 assert.equal(scene.map.features[0].properties.name,'French Guiana');
 assert.equal(scene.map.features[1].properties.name,'Brazil');
});


test('one-minute geography story uses one map and keeps data diagrams on real media',()=>{
 const kinds=['map','map','footage','footage','diagram','map','diagram','footage','footage'];
 const narrations=['Europe and Africa are 13 kilometers apart.','The Strait of Gibraltar is narrow.','Engineers propose a tunnel.','The reason lies beneath the waves.','The seabed reaches 900 meters.','The route detours west.','The underwater ridge is 300 meters deep.','The track extends to 28 kilometers.','The shortest route is unbuildable.'];
 const plan=kinds.map((kind,index)=>({id:`shot-${index+1}`,kind,start:index*5,end:(index+1)*5,narration:narrations[index],countries:['Spain','Morocco'],mapIntent:kind==='map'?`Distinct proposal ${index}`:'',query:kind==='diagram'?'ocean bathymetry diagram':'Gibraltar coast'}));
 const result=enforceExplanatoryScenes(diversifyVisualPlan(plan,52),'Gibraltar tunnel',52);
 assert.deepEqual(result.map(scene=>scene.kind),['map','footage','footage','footage','footage','footage','footage','footage','footage']);
 assert.equal(result[4].treatment,'composed');
 assert.match(result[4].query,/documentary footage/);
 assert.equal(result[6].treatment,'composed');
 const editorial=enforceVisualBreathing(result,52);
 assert.equal(editorial[1].treatment,'composed');
 assert.equal(editorial[4].treatment,'composed');
 assert.equal(editorial[5].treatment,'composed');
 assert.equal(editorial[6].treatment,'composed');
});

test('map labels appear only when the country is spoken in that scene',()=>{
 const feature=name=>({type:'Feature',properties:{ADMIN:name},geometry:{type:'Polygon',coordinates:[[[0,0],[0,1],[1,1],[1,0],[0,0]]]}});
 const world={type:'FeatureCollection',features:[feature('Spain'),feature('Morocco')]};
 const broad=buildGeographicMap({countries:['Spain','Morocco'],narration:'Europe and Africa are close.'},world);
 assert.deepEqual(broad.features.map(x=>x.properties.spokenLabel),[false,false]);
 const named=buildGeographicMap({countries:['Spain','Morocco'],narration:'Spain and Morocco face each other.'},world);
 assert.deepEqual(named.features.map(x=>x.properties.spokenLabel),[true,true]);
});

test('motion code must show selected footage and cannot label an unspoken country',()=>{
 const noFilm="import {AbsoluteFill} from 'remotion';export default function Scene(){return <AbsoluteFill>Graphic</AbsoluteFill>}";
 assert.throws(()=>validateMotionCode(noFilm,{asset:{kind:'video'}}),/não o mostra/);
 const unspoken="import {AbsoluteFill} from 'remotion';export default function Scene(){return <AbsoluteFill><div>SPAIN</div></AbsoluteFill>}";
 assert.throws(()=>validateMotionCode(unspoken,{countries:['Spain','Morocco'],narration:'Europe and Africa are 13 kilometers apart.'}),/ainda não narrado/);
 const chapter="import {AbsoluteFill} from 'remotion';export default function Scene(){return <AbsoluteFill><div>CHAPTER ONE</div></AbsoluteFill>}";
 assert.throws(()=>validateMotionCode(chapter,{narration:'Europe and Africa are close.'}),/capítulo não narrado/);
});
