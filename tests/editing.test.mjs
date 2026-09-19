import {test} from 'node:test';
import assert from 'node:assert/strict';
import {timingSlots,attachShotDescriptions,mergeMedia,recordThumbnail,selectThumbnail,assignClip} from '../lib/editing.mjs';
test('shot plan covers full narration without gaps or rewriting and uses real audio length',()=>{
 const text=Array.from({length:480},(_,i)=>'word'+i).join(' '),timing=timingSlots(text,210.782);
 assert.equal(timing.slots.length,43);assert.equal(timing.slots[0].start,0);assert.equal(timing.slots.at(-1).end,210.782);assert.equal(timing.slots.map(s=>s.narration).join(' '),text);
 timing.slots.slice(1).forEach((s,i)=>assert.equal(s.start,timing.slots[i].end));
 const descriptions=timing.slots.map(s=>({id:s.id,heading:'Shipping',visual:'footage',query:'Singapore cargo port',location:'Singapore'}));
 assert.equal(attachShotDescriptions(timing,descriptions).shots.length,43);
 assert.throws(()=>attachShotDescriptions(timing,descriptions.slice(1)));
 assert.throws(()=>attachShotDescriptions(timing,descriptions.map(()=>descriptions[0])));
});
test('new covers preserve original and require explicit principal selection',()=>{
 const j={thumbnail:'/original.png',createdAt:'today'};const v=recordThumbnail(j,'/new.png','More contrast');assert.equal(j.thumbnail,'/original.png');assert.equal(j.thumbnails.length,2);assert.equal(j.thumbnails[0].url,'/original.png');selectThumbnail(j,v.id);assert.equal(j.thumbnail,'/new.png');selectThumbnail(j,'original');assert.equal(j.thumbnail,'/original.png');assert.throws(()=>selectThumbnail(j,'missing'));
});
test('media queries accumulate and deduplicate without losing shot associations',()=>{
 const media=mergeMedia([{id:1,source:'Pexels',shotIds:['shot-1'],queries:['port']}],[{id:1,source:'Pexels',shotIds:['shot-2'],queries:['cargo port']},{id:2,source:'Pexels',shotIds:['shot-2']}]);assert.equal(media.length,2);assert.deepEqual(media[0].shotIds,['shot-1','shot-2']);assert.deepEqual(media[0].queries,['port','cargo port']);
});
test('clip assignment requires review and rejects overflow and reference-only YouTube',()=>{
 const j={editPlan:{shots:[{id:'shot-1',duration:5}]},media:[{id:1,source:'Pexels',duration:30},{id:2,source:'YouTube',duration:30}]};
 const input={shotId:'shot-1',id:1,source:'Pexels',trimStart:8,trimEnd:13,reviewed:true};assignClip(j,input);assert.equal(j.clipAssignments['shot-1'].trimStart,8);
 assert.throws(()=>assignClip(j,{...input,trimEnd:31}));assert.throws(()=>assignClip(j,{...input,trimEnd:14}));assert.throws(()=>assignClip(j,{...input,reviewed:false}));assert.throws(()=>assignClip(j,{...input,id:2,source:'YouTube'}));
});
