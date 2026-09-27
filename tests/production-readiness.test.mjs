import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {runRequestedShorts} from '../lib/short-sequence.mjs';
import {dailyTopicTick,loadTopicsData,saveTopicsData,localProductionClock} from '../lib/topics.mjs';
import {normalizeBgmFile} from '../lib/audio-mix.mjs';

test('checked Shorts continue sequentially; a single manual Short stops after one',async()=>{
 let count=0,saved=0;
 const produce=async()=>({finished:++count===3,nextIndex:count,total:3});
 const result=await runRequestedShorts(produce,{all:true,persist:()=>saved++});
 assert.equal(result.finished,true);assert.equal(count,3);assert.equal(saved,3);
 count=0;
 await runRequestedShorts(produce,{all:false});
 assert.equal(count,1);
});

test('daily topic tick catches a missed minute and waits for a running production',async()=>{
 const dir=await mkdtemp(path.join(tmpdir(),'atlas-daily-'));
 try{
  const data=loadTopicsData(dir);
  data.settings.autoRunTime='09:00';
  saveTopicsData(dir,data);
  const now=new Date('2026-09-27T12:05:00.000Z');
  assert.deepEqual(localProductionClock(now),{date:'2026-09-27',time:'09:05'});
  const store={dir,list:()=>[{status:'running'}]};
  const options={store,dir,now,geminiKey:'',runProductionFn:async()=>{throw Error('Should wait');}};
  assert.equal((await dailyTopicTick(options)).status,'busy');
  assert.equal(loadTopicsData(dir).settings.lastAutoRunDate,'');
  store.list=()=>[];
  assert.equal((await dailyTopicTick(options)).status,'empty');
  assert.equal(loadTopicsData(dir).settings.lastAutoRunDate,'');
  assert.equal((await dailyTopicTick(options)).status,'empty');
 }finally{await rm(dir,{recursive:true,force:true});}
});

test('failed music normalization discards the unbalanced copy',async()=>{
 const dir=await mkdtemp(path.join(tmpdir(),'atlas-bgm-'));
 const file=path.join(dir,'bgm.mp3');
 try{
  await writeFile(file,'not audio');
  await assert.rejects(()=>normalizeBgmFile(file,{ffmpeg:'nonexistent-atlas-ffmpeg'}));
  await assert.rejects(()=>readFile(file));
 }finally{await rm(dir,{recursive:true,force:true});}
});
