import {test} from 'node:test';
import assert from 'node:assert/strict';
import {enforceVisualBreathing,enforceExplanatoryScenes} from '../lib/auto-plan.mjs';
import {buildGeographicMap} from '../lib/geography.mjs';
import {usesCleanMediaFastPath,generateCleanMediaSceneCode,validateMotionCode,v3MusicLevels} from '../lib/motion-author.mjs';
import {v3DirectionPrompt} from '../lib/v3-direction.mjs';
import {goResponseText} from '../lib/providers.mjs';

test('V3 routes photos and meaningful explanations to authored motion while clean footage breathes',()=>{
 const plan=[
  {id:'a',kind:'footage',start:0,end:6,narration:'The canal begins here.',asset:{kind:'video'},treatment:'clean'},
  {id:'b',kind:'footage',start:36,end:42,narration:'Ships cross the water.',asset:{kind:'video'},treatment:'clean'},
  {id:'c',kind:'photo',start:42,end:48,narration:'An old view of the lock.',asset:{kind:'image'},treatment:'clean'},
  {id:'d',kind:'footage',start:48,end:54,narration:'The lock raises the water level.',asset:{kind:'video'},treatment:'clean'},
  {id:'e',kind:'footage',start:54,end:60,narration:'The ships leave.',asset:{kind:'video'},treatment:'clean'}
 ];
 const result=enforceVisualBreathing(plan,60,{version:'v3'});
 assert.deepEqual(result.map(s=>s.treatment),['composed','clean','composed','composed','composed']);
 assert.equal(usesCleanMediaFastPath({...result[1],editorialRole:'body',originalStart:36},false,{version:'v3'}),true);
 assert.equal(usesCleanMediaFastPath({...result[1],editorialRole:'body',originalStart:12},false,{version:'v3'}),false);
});
test('V3 direction gives image and explanatory footage distinct jobs without fixed effect quotas',()=>{
 const prompt=v3DirectionPrompt({title:'Canal',script:'Locks raise ships.',research:{text:'Locks change water level.'},previous:[],batch:[{id:'s1',narration:'Locks raise ships.'}]});
 assert.match(prompt,/PHOTO goes to bespoke Luna-authored presentation/);
 assert.match(prompt,/VIDEO with a newly narrated number, date, comparison/);
 assert.match(prompt,/no fixed animation quotas/);
});
test('vertical reusable labels stay inside the mobile-safe area and remain valid Remotion',()=>{
 const scene={index:1,isShort:true,kind:'footage',asset:{kind:'video',src:'clip.mp4'},treatment:'label',label:'Panama Canal',labelStyle:'documentary',labelRole:'identity',durationInFrames:150,fps:30};
 const code=generateCleanMediaSceneCode(scene);
 assert.match(code,/top:260|bottom:310|top:360|bottom:380/);
 assert.equal(validateMotionCode(code,scene),code);
});
test('Luna uses Go Responses and records tokens without persisting prompt text',async()=>{
 const original=globalThis.fetch;
 let requested;
 globalThis.fetch=async(url,options)=>{requested={url,options};return new Response(JSON.stringify({output:[{content:[{type:'output_text',text:'READY'}]}],usage:{input_tokens:12,output_tokens:5}}),{status:200,headers:{'Content-Type':'application/json'}});};
 try{
  const job={id:'job-v3'};
  const result=await goResponseText({goKey:'test-key'},job,'Return READY');
  assert.equal(result,'READY');
  assert.match(requested.url,/\/zen\/go\/v1\/responses$/);
  assert.equal(JSON.parse(requested.options.body).model,'gpt-6-luna');
  assert.equal(requested.options.headers['x-opencode-session'],'job-v3');
  assert.equal(job.modelUsage[0].outputTokens,5);
  assert.equal(JSON.stringify(job.modelUsage).includes('Return READY'),false);
 }finally{globalThis.fetch=original;}
});
test('V3 pinpoints a verified island and avoids a country-only map for unknown small places',()=>{
 const island={id:'map',kind:'map',narration:'Ilha da Queimada Grande lies off the coast.',heading:'The forbidden island',countries:['Brazil'],location:'São Paulo, Brazil',start:5,end:10};
 const [located]=enforceExplanatoryScenes([island],'The Forbidden Brazilian Island Where No Human Can Step');
 assert.equal(located.kind,'map');
 assert.equal(located.mapFocus.label,'ILHA DA QUEIMADA GRANDE');
 const world={features:[{type:'Feature',geometry:{type:'Polygon',coordinates:[[[-48,-26],[-44,-26],[-44,-22],[-48,-22],[-48,-26]]]},properties:{ADMIN:'Brazil'}}]};
 const materialized=buildGeographicMap(located,world);
 assert.ok(Math.abs(materialized.atlasPoint.lat+24.4611)<0.001);
 assert.ok(Math.abs(materialized.atlasPoint.lon+46.6868)<0.001);
 const [unknown]=enforceExplanatoryScenes([{...island,narration:'A different island lies off the coast.'}], 'A different Brazilian island');
 assert.equal(unknown.kind,'footage');
 assert.equal(unknown.mapUnlocated,true);
});

test('V3 normalized music stays clearly behind narration after a short opening taper',()=>{
 assert.equal(v3MusicLevels.normalized.voice,0.025);
 assert.ok(v3MusicLevels.normalized.voice+v3MusicLevels.normalized.openingLift<=0.060001);
 assert.ok(v3MusicLevels.normalized.data<v3MusicLevels.normalized.voice);
 assert.ok(v3MusicLevels.normalized.short<=v3MusicLevels.normalized.voice);
});
