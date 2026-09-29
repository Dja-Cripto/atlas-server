import test from 'node:test';
import assert from 'node:assert/strict';
import {automaticShorts,renderShortMP4,renderAllShortsMP4,borrowMatchingAsset} from '../lib/shorts.mjs';
import {partialMp4Path} from '../lib/automatic.mjs';
import {mkdtemp,mkdir,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';

test('shorts module exports automaticShorts, renderShortMP4 and renderAllShortsMP4 functions', () => {
 assert.equal(typeof automaticShorts, 'function');
 assert.equal(typeof renderShortMP4, 'function');
 assert.equal(typeof renderAllShortsMP4, 'function');
 assert.equal(typeof borrowMatchingAsset, 'function');
});

test('borrowMatchingAsset matches relevant long documentary assets and handles usedSrcs', () => {
 const longAssets = [
  {src: 'auto/run1/seismometer.mp4', kind: 'video', width: 1920, height: 1080, sceneQuery: 'Tokyo seismometer sensor', sceneNarration: 'Sensors measure ground acceleration', credit: {author: 'test', reason: 'Real sensor'}},
  {src: 'auto/run1/skytree.mp4', kind: 'video', width: 1920, height: 1080, sceneQuery: 'Tokyo Skytree damper', sceneNarration: 'Mass damper sways inside tower', credit: {author: 'test', reason: 'Skytree damper'}}
 ];

 const scene = {id: 'shot-5', query: 'ground motion sensors', narration: 'Sensors measure shaking', kind: 'footage'};
 const borrowed = borrowMatchingAsset(scene, longAssets, new Set());
 assert.ok(borrowed);
 assert.equal(borrowed.src, 'auto/run1/seismometer.mp4');
 assert.ok(borrowed.credit.reason.includes('Acervo validado do documentário'));

 const used = new Set(['auto/run1/seismometer.mp4']);
 const secondBorrowed = borrowMatchingAsset(scene, longAssets, used);
 assert.ok(secondBorrowed);
 assert.equal(secondBorrowed.src, 'auto/run1/skytree.mp4');

 assert.equal(borrowMatchingAsset(scene, [], new Set()), null);
});

test('temporary render files retain the mp4 extension required by Remotion',()=>{
 assert.equal(partialMp4Path('/tmp/video.mp4'),'/tmp/video.partial.mp4');
 assert.throws(()=>partialMp4Path('/tmp/video.partial'));
});

test('an existing completed Short returns without requiring a temporary file',async()=>{
 const root=await mkdtemp(path.join(tmpdir(),'atlas-short-render-'));
 const id='test-job';
 const folder=path.join(root,'data','shorts',id,'short_1');
 try{
  await mkdir(folder,{recursive:true});
  await writeFile(path.join(folder,'short_1.mp4'),Buffer.alloc(51*1024));
  const result=await renderShortMP4({}, {id,auto:{runId:'test-run'},shorts:{items:[]}},0,{root,dir:path.join(root,'data'),log:()=>{}});
  assert.equal(result.videoPath,path.join(folder,'short_1.mp4'));
 }finally{
  assert.equal(path.dirname(root),tmpdir());
  await rm(root,{recursive:true,force:true});
 }
});