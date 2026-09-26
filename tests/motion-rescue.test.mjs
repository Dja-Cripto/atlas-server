import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,access,rm} from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {authorMotion,normalizeVisualBible,sceneUnits,normalizeMotionCode,normalizeMotionResult,validateMotionCode} from '../lib/motion-author.mjs';
import {motionModelForAttempt,compactRescueAssignment} from '../lib/motion-rescue.mjs';
import {generateJSON} from '../lib/providers.mjs';
import {transform} from '../renderer/node_modules/esbuild/lib/main.js';
test('a timeout is retried, one failed photo uses animated reserve, repeated failures pause',async()=>{
 const root=await mkdtemp(path.join(os.tmpdir(),'atlas-motion-rescue-'));
 const originalFetch=globalThis.fetch;
 const scene={id:'forest',kind:'photo',treatment:'composed',start:0,end:5,heading:'Rainforest',narration:'The rainforest stretches across the region.',asset:{kind:'image',src:'auto/fake/forest.jpg'}};
 const manifest={title:'Synthetic forest test',duration:5,fps:30,voice:'auto/fake/voice.mp3',scenes:[scene]};
 const code="import {AbsoluteFill,Img,interpolate,staticFile,useCurrentFrame} from 'remotion';export default function MotionScene({scene}: {scene:any}){const f=useCurrentFrame();const p=interpolate(f,[0,149],[0,100],{extrapolateRight:'clamp'});return <AbsoluteFill><Img src={staticFile(scene.asset.src)} style={{width:'100%',height:'100%',objectFit:'cover',clipPath:'inset(0 '+(100-p)+'% 0 0)'}}/></AbsoluteFill>}";
 const result={intent:'Reveal the rainforest photograph across the frame',beats:[{start:0,end:5,action:'The subject is revealed by a moving mask'}],handoff:{opening:'photo',persistentElements:[],endState:'photo visible',motionVector:'cut',nextOpportunity:'continue'},code};
 const calls=[];
 const setup=async(runId,doc=manifest)=>{const folder=path.join(root,'renderer/src/generated',runId);await mkdir(folder,{recursive:true});await writeFile(path.join(folder,'visual-bible.json'),JSON.stringify(normalizeVisualBible({},sceneUnits(doc))));return folder;};
 try{
  globalThis.fetch=async(_url,options)=>{const request=JSON.parse(options.body),model=request.model;assert.equal(request.reasoning_effort,'low');calls.push(model);if(calls.length===1)throw Error('synthetic timeout');return new Response('data: '+JSON.stringify({choices:[{delta:{content:JSON.stringify(result)}}]})+'\n\ndata: [DONE]\n\n',{status:200,headers:{'content-type':'text/event-stream'}});};
  const runId='success',folder=await setup(runId),j={id:'synthetic',title:manifest.title,auto:{runId},events:[]};
  await authorMotion({goKey:'fixture',motionModel:'glm-5.3-flash'},j,manifest,{root,log:()=>{}});
  const saved=JSON.parse(await readFile(path.join(folder,'scene-0.json'),'utf8'));
  assert.match(saved.code,/clipPath/);assert.deepEqual(calls,['glm-5.3-flash','glm-5.3-flash']);
  assert.equal((j.auto.visualFallbacks||[]).length,0);
  calls.length=0;globalThis.fetch=async(_url,options)=>{const request=JSON.parse(options.body);assert.equal(request.reasoning_effort,'low');calls.push(request.model);throw Error('synthetic unavailable');};
  const blockedId='blocked',blockedFolder=await setup(blockedId),blocked={id:'synthetic-blocked',title:manifest.title,auto:{runId:blockedId},events:[]};
  const outcome=await authorMotion({goKey:'fixture',motionModel:'glm-5.3-flash'},blocked,manifest,{root,log:()=>{}}).then(value=>({ok:true,value}),error=>({ok:false,error:error.message}));

  assert.equal(outcome.ok,true);
  assert.deepEqual(calls,['glm-5.3-flash','glm-5.3-flash','glm-5.3-flash']);
  const reserve=JSON.parse(await readFile(path.join(blockedFolder,'scene-0.json'),'utf8'));
  assert.equal(reserve.fallback,true);assert.match(reserve.code,/clipPath/);await transform(reserve.code,{loader:'tsx'});
  await access(path.join(blockedFolder,'index.tsx'));
  assert.deepEqual(blocked.auto.visualFallbacks,['shot-1']);
  calls.length=0;globalThis.fetch=async(_url,options)=>{const request=JSON.parse(options.body);assert.equal(request.reasoning_effort,'low');calls.push(request.model);return new Response('data: '+JSON.stringify({choices:[{delta:{content:JSON.stringify(result)}}]})+'\n\ndata: [DONE]\n\n',{status:200,headers:{'content-type':'text/event-stream'}});};
  await authorMotion({goKey:'fixture',motionModel:'glm-5.3-flash'},blocked,manifest,{root,log:()=>{}});
  const replaced=JSON.parse(await readFile(path.join(blockedFolder,'scene-0.json'),'utf8'));
  assert.equal(replaced.fallback,true);assert.deepEqual(blocked.auto.visualFallbacks,['shot-1']);assert.deepEqual(calls,[]);
  calls.length=0;globalThis.fetch=async(_url,options)=>{const request=JSON.parse(options.body);assert.equal(request.reasoning_effort,'low');calls.push(request.model);throw Error('synthetic unavailable');};
  const two={...manifest,duration:10,scenes:[scene,{...scene,id:'forest-2',start:5,end:10}]};
  const repeatId='repeat',repeatFolder=await setup(repeatId,two),repeat={id:'synthetic-repeat',title:two.title,auto:{runId:repeatId},events:[]};
  const repeated=await authorMotion({goKey:'fixture',motionModel:'glm-5.3-flash'},repeat,two,{root,log:()=>{}}).then(value=>({ok:true,value}),error=>({ok:false,error:error.message}));
  assert.equal(repeated.ok,true);
  assert.equal((repeat.auto.visualFallbacks||[]).length,2);
  await access(path.join(repeatFolder,'index.tsx'));
 }finally{globalThis.fetch=originalFetch;await rm(root,{recursive:true,force:true});}
});
test('rescue schedule keeps the selected model first and strips irrelevant timeline context',()=>{
 assert.equal(motionModelForAttempt('glm-5.3-flash',0),'glm-5.3-flash');
 assert.equal(motionModelForAttempt('glm-5.3-flash',1),'glm-5.3-flash');
 const input=compactRescueAssignment({artDirection:{intent:'show forest'},currentScene:{id:'forest'},context:{visualBible:{vision:'documentary',sceneDirectives:[{secret:'irrelevant'}]},previousScene:{id:'a'},nextScene:{id:'c'}},feedback:'invalid code'});
 assert.equal(input.context.vision,'documentary');assert.equal(input.context.visualBible,undefined);
});

test('provider inference_failed event is reported directly instead of retried as invalid JSON',async()=>{
 const originalFetch=globalThis.fetch;let calls=0;
 try{
  globalThis.fetch=async()=>{calls++;return new Response('data: {"error":{"code":"inference_failed"}}\n\n',{status:200,headers:{'content-type':'text/event-stream'}});};
  await assert.rejects(generateJSON({sceneProvider:'go',goKey:'fixture',goModel:'glm-5.3-flash',timeoutMs:1000},{id:'synthetic'},'synthetic prompt'),/inference_failed/);
  assert.equal(calls,1);
 }finally{globalThis.fetch=originalFetch;}
});

test('timeout after HTTP 200 is identified as a stream timeout',async()=>{
 const originalFetch=globalThis.fetch;
 try{
  globalThis.fetch=async()=>new Response(new ReadableStream({start(){}}),{status:200,headers:{'content-type':'text/event-stream'}});
  await assert.rejects(generateJSON({sceneProvider:'go',goKey:'fixture',goModel:'glm-5.3-flash',timeoutMs:20},{id:'synthetic'},'synthetic prompt'),/durante o stream após HTTP 200/);
 }finally{globalThis.fetch=originalFetch;}
});

test('common broken quoted CSS border color is repaired without another model call',()=>{
 const malformed="import {AbsoluteFill,useCurrentFrame} from 'remotion';export default function MotionScene(){const f=useCurrentFrame();return <AbsoluteFill style={{borderLeft: '4px solid '#D8842A',opacity:f>=0?1:0}}/>;}";
 const repaired=normalizeMotionCode(malformed);
 assert.match(repaired,/borderLeft: '4px solid #D8842A'/);
 assert.doesNotThrow(()=>validateMotionCode(repaired));
});

test('invalid beat timing is rebuilt from a valid scene intent without another model call',()=>{
 const result={intent:'Reveal the glacial valley',beats:[{start:0,end:1,action:'Opening'}],code:'valid-code'};
 normalizeMotionResult(result,6,30);
 assert.deepEqual(result.beats,[{start:0,end:6,action:'Reveal the glacial valley'}]);
});
