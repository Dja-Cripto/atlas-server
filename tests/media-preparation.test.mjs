import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import ffmpeg from '../renderer/node_modules/ffmpeg-static/index.js';
import {transcodeVideo} from '../lib/auto-media.mjs';
test('media preparation exports a short playable segment instead of the full source',async()=>{
 const folder=await mkdtemp(path.join(os.tmpdir(),'atlas-segment-'));
 const previous=process.env.FFMPEG_BIN;process.env.FFMPEG_BIN=ffmpeg;
 try{
  const source=path.join(folder,'source.mp4'),output=path.join(folder,'segment.mp4');
  const generated=spawnSync(ffmpeg,['-y','-f','lavfi','-i','color=c=blue:s=1920x1080:r=30','-t','4','-c:v','libx264','-preset','ultrafast',source],{windowsHide:true});
  assert.equal(generated.status,0);
  await transcodeVideo(source,output,{duration:1});
  const decoded=spawnSync(ffmpeg,['-hide_banner','-i',output,'-f','null','-'],{windowsHide:true,encoding:'utf8'});
  assert.equal(decoded.status,0);assert.match(decoded.stderr,/1920x1080/);assert.ok(decoded.stderr.includes('Duration: 00:00:01.00'));
 }finally{
  if(previous===undefined)delete process.env.FFMPEG_BIN;else process.env.FFMPEG_BIN=previous;
  await rm(folder,{recursive:true,force:true});
 }
});