import {test} from 'node:test';
import assert from 'node:assert/strict';
import {requireOpeningVideo,recoverOpeningVideo} from '../lib/opening-recovery.mjs';
import {repairVisuals} from '../lib/visual-repair.mjs';
const scene={id:'shot-1',kind:'footage',start:0,end:6,narration:'The Øresund crossing',location:'Øresund Bridge, Sweden',query:'Øresund bridge aerial cars train official operator',requiredSubject:'Øresund Bridge'};
test('already planned footage still gets the opening requirement',()=>{
 assert.equal(requireOpeningVideo(scene).openingVideoRequired,true);
 assert.equal(scene.openingVideoRequired,undefined);
});
test('recovery tries simpler and ASCII queries without changing subject or timing',async()=>{
 const calls=[];
 const repaired=await recoverOpeningVideo({...scene,kind:'title',missingVisual:true,asset:{kind:'image'}},{title:'The bridge',findVideo:async s=>{
  calls.push(s);return calls.length===3?{kind:'video',src:'bridge.mp4',duration:12}:null;
 }});
 assert.deepEqual(calls.map(s=>s.query),[scene.query,'Øresund Bridge','Oresund Bridge']);
 assert.ok(calls.every(s=>s.videoOnly&&s.openingVideoRequired&&s.requiredSubject===scene.requiredSubject));
 assert.equal(repaired.asset.kind,'video');assert.equal(repaired.end,6);assert.equal(repaired.missingVisual,undefined);
});
test('missing opening never triggers a photo or generated illustration fallback',async()=>{
 const opening=await recoverOpeningVideo(scene,{findVideo:async()=>({kind:'image',src:'photo.jpg'})});
 let calls=0;
 const result=await repairVisuals([opening],{propose:async()=>{calls++;},materialize:async()=>{calls++;},illustrate:async()=>{calls++;}});
 assert.equal(calls,0);assert.equal(result.pending.length,1);
});
test('valid opening is reused without searching or losing completed scenes',async()=>{
 const original={...scene,asset:{kind:'video',src:'bridge.mp4',duration:9}};
 const repaired=await recoverOpeningVideo(original,{findVideo:async()=>assert.fail('unexpected search')});
 assert.equal(repaired.asset,original.asset);
});
