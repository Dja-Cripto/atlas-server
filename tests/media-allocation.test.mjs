import {test} from 'node:test';
import assert from 'node:assert/strict';
import {allocateMedia,staleMediaSceneIndexes} from '../lib/media-allocation.mjs';
import {shortMediaQuery,verifiedMediaCapacity} from '../lib/topic-presearch.mjs';
const clip=(id,source,start,end,duration=30)=>({id,start,end,asset:{kind:'video',sourceId:source,src:source+'.mp4',duration}});

test('archive queries keep the complete place name and remove editorial filler',()=>{
 assert.equal(shortMediaQuery('Panama Canal aerial footage timelapse'),'Panama Canal');
 assert.equal(shortMediaQuery('Pheasant Island historical photograph'),'Pheasant Island');
});
test('verified capacity counts each source once and excludes projected footage',()=>{
 const a={url:'https://x/a',duration:100,files:[{}]},b={url:'https://x/b',duration:7,files:[{}]};
 assert.deepEqual(verifiedMediaCapacity([a,a,b,{url:'https://x/photo'}]),{assets:3,videoSeconds:22});
});
test('exhausted take is replaced before rendering rather than replayed',async()=>{
 const scenes=[clip('a','one',0,5,7),{id:'map',kind:'map',start:5,end:10},clip('b','one',10,15,7)];
 const result=await allocateMedia(scenes,{findReplacement:async()=>({kind:'video',sourceId:'two',src:'two.mp4',duration:20})});
 assert.equal(result[2].asset.sourceId,'two');assert.equal(result[2].asset.trimStart,0);
});
test('unresolved exhausted footage cannot reach motion authoring',async()=>{
 await assert.rejects(allocateMedia([clip('a','one',0,5,7),{id:'map',kind:'map',start:5,end:10},clip('b','one',10,15,7)],{findReplacement:async()=>null}),/recorte esgotado/);
});
test('distinct nonadjacent takes of the same source remain legal',async()=>{
 const result=await allocateMedia([clip('a','one',0,5),{id:'map',kind:'map',start:5,end:10},clip('b','one',10,15)]);
 assert.deepEqual([result[0].asset.trimStart,result[2].asset.trimStart],[0,5]);
});
test('short dominated by a single source is not approved',async()=>{
 const scenes=Array.from({length:8},(_,i)=>clip('s'+i,i%2?'other'+i:'one',i*5,(i+1)*5,100));
 await assert.rejects(allocateMedia(scenes,{isShort:true,findReplacement:async()=>null}),/concentração excessiva/);
});
test('resumed authored code is invalidated only where a source or trim changed',()=>{
 const old=[clip('a','one',0,5),clip('b','two',5,10)];
 const code='const scenes='+JSON.stringify(old)+';';
 assert.deepEqual(staleMediaSceneIndexes(code,old),[]);
 const revised=[old[0],{...old[1],asset:{...old[1].asset,trimStart:7}}];
 assert.deepEqual(staleMediaSceneIndexes(code,revised),[1]);
});
