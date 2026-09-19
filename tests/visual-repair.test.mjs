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
