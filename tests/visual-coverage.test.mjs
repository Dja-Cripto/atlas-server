import {test} from 'node:test';
import assert from 'node:assert/strict';
import {assessVisualCoverage} from '../lib/visual-coverage.mjs';

test('Mongolia-style mix of real video, animated photos and maps is ready despite video advisory',()=>{
 const scenes=[
  {id:'video',start:0,end:67,asset:{kind:'video'}},
  {id:'photo',start:67,end:95,asset:{kind:'image'},treatment:'composed'},
  {id:'map',start:95,end:100,map:{features:[{}]}}
 ];
 const result=assessVisualCoverage(scenes,100);
 assert.equal(result.ratio,.95);
 assert.equal(result.videoRatio,.67);
 assert.deepEqual(result.missing,[]);
 assert.match(result.advisory,/meta editorial/);
});

test('an unfilled scene remains a hard production blocker',()=>{
 const result=assessVisualCoverage([
  {id:'video',start:0,end:5,asset:{kind:'video'}},
  {id:'unfilled',start:5,end:10,kind:'title'}
 ],10);
 assert.deepEqual(result.missing,['unfilled']);
 assert.equal(result.advisory,null);
});
