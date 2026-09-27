import test from 'node:test';
import assert from 'node:assert/strict';
import {eligibleForVideoUpgrade,photoStreaks,unfilmedRuns,repairVideoCoverage} from '../lib/video-coverage-repair.mjs';
import {candidatePool,commonsVideoCandidates,mediaSearchVariants} from '../lib/auto-media.mjs';

const photo={kind:'image',representationRole:'contextual'};
const video={kind:'video',representationRole:'contextual',duration:6};

test('generic photos and illustrations can become video; specific historical photos stay intact',()=>{
 assert.equal(eligibleForVideoUpgrade({heading:'A Dutch canal',narration:'Water moves through the city.',query:'Netherlands canal',asset:photo},'The Netherlands'),true);
 assert.equal(eligibleForVideoUpgrade({kind:'photo',heading:'The barrier',narration:'The barrier holds the sea.',query:'Oosterscheldekering',asset:{...photo,representationRole:'exact-location'}},'The Netherlands'),false);
 assert.equal(eligibleForVideoUpgrade({heading:'The 1953 flood photograph',narration:'The 1953 flood was devastating.',query:'1953 archival flood',asset:photo},'The Netherlands'),false);
 assert.equal(eligibleForVideoUpgrade({heading:'A canal',asset:{...photo,representationRole:'illustrative'}},'The Netherlands'),true);
 assert.equal(eligibleForVideoUpgrade({heading:'A 1953 flood photograph',asset:{...photo,representationRole:'illustrative'}},'The Netherlands'),false);
});

test('generic country scene searches broad relevant footage after country-specific queries',()=>{
 const generic=mediaSearchVariants({topicCountry:'Netherlands',identityRequired:false,query:'Netherlands coast',heading:'The coast',narration:'Waves strike the coast.'});
 assert.ok(generic.some(query=>query==='coast documentary footage'));
 const specific=mediaSearchVariants({topicCountry:'Netherlands',identityRequired:true,query:'Oosterscheldekering barrier',heading:'The barrier',narration:'The barrier protects Zeeland.'});
 assert.ok(!specific.some(query=>query==='coast documentary footage'));
});

test('Commons video search accepts licensed Full HD film and rejects low resolution or unclear rights',()=>{
 const page=(id,width,license)=>({pageid:id,title:'File:Maeslantkering film.webm',videoinfo:[{url:'https://upload.wikimedia.org/example.webm',descriptionurl:'https://commons.wikimedia.org/wiki/File:Example.webm',thumburl:'https://thumb.wikimedia.org/example.jpg',width,height:1080,mime:'video/webm',metadata:[{name:'playtime_seconds',value:72}],extmetadata:{LicenseShortName:{value:license},ImageDescription:{value:'Maeslantkering in Rotterdam, Netherlands'}}}]});
 const result=commonsVideoCandidates({a:page(1,1920,'CC BY 3.0'),b:page(2,640,'CC BY 3.0'),c:page(3,1920,'All rights reserved')});
 assert.equal(result.length,1);
 assert.equal(result[0].duration,72);
 assert.equal(result[0].files[0].width,1920);
 assert.equal(candidatePool({topicCountry:'Netherlands',identityRequired:true,namedPlace:'Maeslantkering',narration:'The Maeslantkering protects Rotterdam.'},result).length,1);
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

test('a long interval without film is repaired by screen time, preserving specific photos',async()=>{
 const scenes=[...Array.from({length:5},(_,i)=>({id:'p'+i,start:i*20,end:(i+1)*20,kind:'photo',heading:'Coastal history',query:'coast',narration:'The coast changes.',asset:i===2?{...photo,representationRole:'exact-location'}:photo})),
  {id:'v',start:100,end:120,asset:video}];
 assert.equal(unfilmedRuns(scenes)[0].seconds,100);
 const queried=[];
 const result=await repairVideoCoverage(scenes,{title:'A coast',duration:120,target:.1,findVideo:async scene=>{queried.push(scene.id);return video;}});
 assert.equal(result.maxUnfilmedSeconds,60);
 assert.equal(result.upgraded,1);
 assert.ok(!queried.includes('p2'));
 assert.equal(result.scenes[2].asset.kind,'image');
});
