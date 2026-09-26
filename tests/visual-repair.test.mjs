import {test} from 'node:test';
import assert from 'node:assert/strict';
import {repairVisuals,needsVisualRepair} from '../lib/visual-repair.mjs';
const scene={id:'shot-1',start:0,end:5,kind:'title',heading:'A closer look',missingVisual:true,chart:{values:[{value:999}]} };
test('failed text is repaired automatically without carrying an unsupported statistic',async()=>{
 const result=await repairVisuals([scene],{research:{},propose:async s=>({id:s.id,kind:'map',heading:'Iceland',countries:['Iceland']}),materialize:async s=>({...s,kind:'explain',map:{features:[]}})});
 assert.equal(result.pending.length,0);assert.equal(result.scenes[0].kind,'explain');assert.equal(result.scenes[0].chart,undefined);assert.equal(result.scenes[0].missingVisual,undefined);assert.equal(scene.kind,'title');
});
test('invalid evidence remains pending rather than bypassing the safety check',async()=>{
 const result=await repairVisuals([scene],{research:{},propose:async s=>({id:s.id,kind:'chart',heading:'Fake',chart:{quote:'999',source:'https://example.org',values:[{label:'x',value:999}]}}),materialize:async s=>s});
 assert.equal(result.pending[0].id,'shot-1');assert.equal(result.scenes[0],scene);
});
test('brief intentional headings are distinct from missing-media fallback',()=>{
 assert.equal(needsVisualRepair({kind:'title',heading:'A new perspective',start:0,end:2}),false);
 assert.equal(needsVisualRepair({kind:'title',heading:'A new perspective',start:0,end:2,missingVisual:true}),true);
});

test('video alias from a cached repair is accepted and still requires a real asset',async()=>{
 const result=await repairVisuals([scene],{research:{},propose:async s=>({id:s.id,kind:'video',heading:'Iceland coast',query:'Iceland coast'}),materialize:async s=>({...s,asset:{kind:'video',src:'auto/example/coast.mp4'}})});
 assert.equal(result.pending.length,0);
 assert.equal(result.scenes[0].kind,'footage');
 assert.equal(result.scenes[0].asset.kind,'video');
});

test('one missing scene becomes an animated illustration without discarding other scenes',async()=>{
 const normal={id:'shot-78',kind:'footage',heading:'Volcanic coast',asset:{kind:'video',src:'coast.mp4'}};
 const result=await repairVisuals([normal,scene],{
  research:{},propose:async()=>({id:scene.id,kind:'video',query:'Surtsey aerial'}),
  materialize:async()=>null,
  illustrate:async()=>({kind:'image',representationRole:'illustrative',src:'illustration.jpg',width:1920,height:1080})
 });
 assert.deepEqual(result.pending,[]);
 assert.equal(result.scenes[0],normal);
 assert.equal(result.scenes[1].kind,'photo');
 assert.equal(result.scenes[1].treatment,'composed');
 assert.equal(result.scenes[1].asset.representationRole,'illustrative');
 assert.equal(result.scenes[1].missingVisual,undefined);
});