import {test} from 'node:test';
import assert from 'node:assert/strict';
import {composeContinuity} from '../lib/visual-continuity.mjs';
test('photo keeps adjacent relevant composition, but never an unrelated country',()=>{
 const scenes=[{id:'map',kind:'map',countries:['China'],start:0,end:5},{id:'photo',countries:['China'],start:5,end:10,asset:{kind:'image',src:'a'}},{id:'other',countries:['Italy'],start:10,end:15,asset:{kind:'image',src:'b'}}];
 const result=composeContinuity(scenes);assert.equal(result[1].backgroundId,'map');assert.equal(result[2].backgroundId,undefined);assert.equal(scenes[1].backgroundId,undefined);
});
test('reused footage advances the source trim within available media',()=>{
 const asset={kind:'video',src:'a',duration:12,trimStart:0};
 const result=composeContinuity([{id:'1',start:0,end:5,asset},{id:'2',start:5,end:10,asset}]);
 assert.deepEqual(result.map(x=>x.asset.trimStart),[0,5]);assert.equal(asset.trimStart,0);
});
