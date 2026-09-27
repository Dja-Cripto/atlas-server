import test from 'node:test';
import assert from 'node:assert/strict';
import {eligibleForVideoUpgrade,repairVideoCoverage} from '../lib/video-coverage-repair.mjs';

const photo={kind:'image',representationRole:'contextual'};
const video={kind:'video',representationRole:'contextual',duration:6};

test('generic real photos can become video; archival and illustrated scenes stay intact',()=>{
 assert.equal(eligibleForVideoUpgrade({heading:'A Dutch canal',narration:'Water moves through the city.',query:'Netherlands canal',asset:photo},'The Netherlands'),true);
 assert.equal(eligibleForVideoUpgrade({heading:'The 1953 flood photograph',narration:'The 1953 flood was devastating.',query:'1953 archival flood',asset:photo},'The Netherlands'),false);
 assert.equal(eligibleForVideoUpgrade({heading:'A canal',asset:{...photo,representationRole:'illustrative'}},'The Netherlands'),false);
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
