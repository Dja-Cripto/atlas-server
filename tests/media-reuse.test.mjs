import {test} from 'node:test';
import assert from 'node:assert/strict';
import {reusableMediaCandidates} from '../lib/auto-media.mjs';

test('failed late shot can consider already reviewed media from the same place',()=>{
 const scene={id:'shot-79',query:'surtsey island aerial coastline',location:'Surtsey',start:483,end:490};
 const media=[
  {url:'https://example.org/old',title:'Surtsey island coastline',queries:['Surtsey island']},
  {url:'https://example.org/other',title:'Australian desert',queries:['desert']},
  {url:'https://example.org/unused',title:'Surtsey island',queries:['Surtsey']},
  {url:'https://example.org/short',title:'Surtsey island',queries:['Surtsey'],files:[{width:1920,height:1080}],duration:3}
 ];
 const cache={
  'shot-78|Surtsey eruption|Surtsey|photo':{credit:{url:media[0].url}},
  'shot-12|desert|Australia|photo':{credit:{url:media[1].url}},
  'shot-77|Surtsey island|Surtsey|footage':{credit:{url:media[3].url}}
 };
 assert.deepEqual(reusableMediaCandidates(scene,media,cache).map(x=>x.url),[media[0].url]);
 assert.deepEqual(reusableMediaCandidates(scene,media,cache,new Set([media[0].url])),[]);
});