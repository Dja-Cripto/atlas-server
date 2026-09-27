import test from 'node:test';
import assert from 'node:assert/strict';
import {eligibleForVideoUpgrade,photoStreaks,repairVideoCoverage} from '../lib/video-coverage-repair.mjs';
import {mediaSearchVariants} from '../lib/auto-media.mjs';

const photo={kind:'image',representationRole:'contextual'};
const video={kind:'video',representationRole:'contextual',duration:6};

test('generic real photos can become video; archival and illustrated scenes stay intact',()=>{
 assert.equal(eligibleForVideoUpgrade({heading:'A Dutch canal',narration:'Water moves through the city.',query:'Netherlands canal',asset:photo},'The Netherlands'),true);
 assert.equal(eligibleForVideoUpgrade({kind:'photo',heading:'The barrier',narration:'The barrier holds the sea.',query:'Oosterscheldekering',asset:{...photo,representationRole:'exact-location'}},'The Netherlands'),false);
 assert.equal(eligibleForVideoUpgrade({heading:'The 1953 flood photograph',narration:'The 1953 flood was devastating.',query:'1953 archival flood',asset:photo},'The Netherlands'),false);
 assert.equal(eligibleForVideoUpgrade({heading:'A canal',asset:{...photo,representationRole:'illustrative'}},'The Netherlands'),false);
});

test('generic country scene searches broad relevant footage after country-specific queries',()=>{
 const generic=mediaSearchVariants({topicCountry:'Netherlands',identityRequired:false,query:'Netherlands coast',heading:'The coast',narration:'Waves strike the coast.'});
 assert.ok(generic.some(query=>query==='coast documentary footage'));
 const specific=mediaSearchVariants({topicCountry:'Netherlands',identityRequired:true,query:'Oosterscheldekering barrier',heading:'The barrier',narration:'The barrier protects Zeeland.'});
 assert.ok(!specific.some(query=>query==='coast documentary footage'));
});

test('recovery upgrades longest eligible photos, persists progress and respects locked scenes',async()=>{
 const scenes=[
  {id:'shot-1',start:0,end:6,heading:'A Dutch canal',query:'Netherlands canal',narration:'Water moves.',asset:photo},
  {id:'shot-2',start:6,end:12,heading:'The 1953 flood photograph',query:'1953 flood',narration:'The flood happened.',asset:photo},
  {id:'shot-3',start:12,end:20,heading:'Dutch streets',query:'Netherlands streets',narration:'People walk.',asset:photo},
  {id:'shot-4',start:20,end:26,heading:'Dutch coast',query:'Netherlands coast',narration:'The coast stretches.',asset:photo}
 ];
 const queried=[],saved=[];
 const result=await repairVideoCoverage(scenes,{title:'The Netherlands',duration:26,target:.3,locked:2,
  findVideo:async scene=>{queried.push(scene.id);assert.equal(scene.videoOnly,true);return video;},
  onProgress:async output=>saved.push(output.map(scene=>scene.asset.kind))
 });
 assert.deepEqual(queried,['shot-3']);
 assert.equal(result.upgraded,1);
 assert.equal(result.scenes[0].asset.kind,'image');
 assert.equal(result.scenes[2].asset.kind,'video');
 assert.equal(saved.length,1);
});

test('a relevant photo sequence is kept when video coverage already meets the target',async()=>{
 const scenes=[
  {id:'v',start:0,end:6,asset:video},
  ...[0,1,2,3,4].map(i=>({id:'p'+i,start:6+i*2,end:8+i*2,heading:'Coast',query:'coast',narration:'Waves on the coast.',asset:photo}))
 ];
 assert.equal(photoStreaks(scenes)[0].length,5);
 const calls=[];
 const result=await repairVideoCoverage(scenes,{title:'A coast',duration:16,target:.3,findVideo:async scene=>{calls.push(scene.id);return video;}});
 assert.deepEqual(calls,[]);
 assert.equal(result.maxPhotoStreak,5);
 assert.equal(result.upgraded,0);
});
