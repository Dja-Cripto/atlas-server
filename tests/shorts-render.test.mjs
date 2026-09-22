import test from 'node:test';
import assert from 'node:assert/strict';
import {automaticShorts,renderShortMP4,renderAllShortsMP4} from '../lib/shorts.mjs';
import {partialMp4Path} from '../lib/automatic.mjs';
import {mkdtemp,mkdir,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';

test('shorts module exports automaticShorts, renderShortMP4 and renderAllShortsMP4 functions', () => {
 assert.equal(typeof automaticShorts, 'function');
 assert.equal(typeof renderShortMP4, 'function');
 assert.equal(typeof renderAllShortsMP4, 'function');
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