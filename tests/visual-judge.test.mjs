import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {parseJudgeVerdicts,selectByScore,finalRole,judgeBatch,judgePool,clearJudgeCache} from '../lib/visual-judge.mjs';
import {visualPool} from '../lib/auto-media.mjs';
import {preSearchTopic} from '../lib/topic-presearch.mjs';

const img={type:'image/jpeg',bytes:Buffer.from('x')};
const fetchImage=async()=>img;
const fake=verdicts=>async()=>({text:JSON.stringify({verdicts}),usage:{promptTokenCount:1000,candidatesTokenCount:100}});

test('parseJudgeVerdicts clamps scores and downgrades weak non-exact candidates', () => {
  const m=parseJudgeVerdicts('```json\n{"verdicts":[{"id":"a","score":12,"role":"exact"},{"id":"b","score":3,"role":"contextual"},{"id":"c","score":"x"}]}\n```');
  assert.equal(m.get('a').score,10);
  assert.equal(m.get('b').role,'unrelated');
  assert.equal(m.has('c'),false);
});

test('selection follows what is seen, not the tag: untagged but visually perfect wins', () => {
  const scored=[
    {candidate:{id:'tagged',metadataExact:true},verdict:{score:5,role:'contextual'}},
    {candidate:{id:'untagged',metadataExact:false},verdict:{score:8,role:'contextual'}}
  ];
  assert.equal(selectByScore(scored,{}).candidate.id,'untagged');
});

test('a tagged candidate that looks wrong is rejected', () => {
  const scored=[{candidate:{id:'t',metadataExact:true},verdict:{score:9,role:'unrelated'}}];
  assert.equal(selectByScore(scored,{}),null);
});

test('identity/event scenes still require textual evidence plus a strong visual match', () => {
  const scene={identityRequired:true};
  assert.equal(selectByScore([{candidate:{id:'a',metadataExact:false},verdict:{score:9,role:'exact'}}],scene),null);
  assert.equal(selectByScore([{candidate:{id:'b',metadataExact:true},verdict:{score:6,role:'exact'}}],scene),null);
  assert.equal(selectByScore([{candidate:{id:'c',metadataExact:true},verdict:{score:8,role:'exact'}}],scene).candidate.id,'c');
});

test('exact role is not granted to untagged stock without very high confidence', () => {
  assert.equal(finalRole({metadataExact:false},{role:'exact',score:7}),'contextual');
  assert.equal(finalRole({metadataExact:false},{role:'exact',score:9}),'exact');
  assert.equal(finalRole({metadataExact:true},{role:'exact',score:6}),'exact');
});

test('judgeBatch scores candidates, caches verdicts and reports failures separately', async () => {
  clearJudgeCache();
  const cands=[{id:1,source:'Pexels',image:'u1'},{id:2,source:'Pexels',image:'u2'}];
  let calls=0;
  const call=async(...a)=>{calls++;return fake([{id:'1',score:8,role:'contextual',sees:'canal',coveredSubjects:['canal']},{id:'2',score:2,role:'unrelated'}])(...a);};
  const scene={id:'s1',query:'canal'};
  const r=await judgeBatch({},scene,cands,{fetchImage,call});
  assert.equal(r.judged,true);assert.equal(r.items.find(i=>i.candidate.id===1).verdict.score,8);
  await judgeBatch({},scene,cands,{fetchImage,call});
  assert.equal(calls,1,'second pass served from cache');
  clearJudgeCache();
  const broken=await judgeBatch({},scene,cands,{fetchImage,call:async()=>{throw new Error('HTTP 503');}});
  assert.equal(broken.judged,false);assert.equal(broken.failed,true);
});

test('judgePool stops early on an excellent match', async () => {
  clearJudgeCache();
  const pool=Array.from({length:20},(_,i)=>({id:i,source:'Pexels',image:'u'+i}));
  let calls=0;
  const call=async()=>{calls++;return {text:JSON.stringify({verdicts:pool.map(c=>({id:String(c.id),score:c.id===1?10:4,role:'contextual'}))}),usage:{}};};
  const r=await judgePool({},{id:'s',query:'q'},pool,{fetchImage,call,batchSize:8});
  assert.equal(calls,1);assert.equal(selectByScore(r.items.filter(i=>i.verdict),{}).candidate.id,1);
});

test('visualPool ranks by tags but never hides untagged HD candidates, and drops sub-HD media', () => {
  const hd={width:1920,height:1080};
  const pool=visualPool({query:'panama canal locks',location:'Panama Canal',topicCountry:'Panama'},[
    {id:'a',source:'Pexels',title:'Mountain',...hd},
    {id:'b',source:'Pexels',title:'Panama canal locks ship',locationEvidence:'Panama Canal',...hd},
    {id:'c',source:'Pexels',title:'Panama canal',width:640,height:360}
  ]);
  assert.deepEqual(pool.map(c=>c.id),['b','a']);
});

const topic={id:'t-x',title:'How Ships Cross the Panama Canal',description:''};
const plan=JSON.stringify({blocks:[1,2,3,4].map(n=>({id:'block-'+n,purpose:'Part '+n,requiredSubjects:['canal'],searchQueries:['canal q'+n]})),broadQueries:['panama canal']});
const mk=(n,video)=>({id:n,source:video?'Pexels':'Wikimedia Commons',title:'canal '+n,url:'https://x/'+n,image:'https://x/'+n+'.jpg',width:1920,height:1080,...(video?{duration:20,files:[{url:'v'+n,width:1920,height:1080}]}:{})});
const settings={pexelsKey:'k'};
const sandbox=async(fn)=>{const dir=await mkdtemp(path.join(tmpdir(),'ps-'));try{return await fn(dir);}finally{await rm(dir,{recursive:true,force:true});}};

test('presearch approves only when media passes visual review, and records why', async () => {
  clearJudgeCache();
  await sandbox(async dir=>{
    const items=q=>[...Array.from({length:15},(_,i)=>mk(q+'v'+i,true)),...Array.from({length:10},(_,i)=>mk(q+'p'+i,false))];
    const r=await preSearchTopic(topic,settings,{dir,planner:async prompt=>{
      assert.match(prompt,/Do not invent mandatory named vehicles/);
      const outline=JSON.parse(plan);
      for(const block of outline.blocks){block.essentialSubjects=['canal'];block.optionalSubjects=['particular vessel'];}
      return {text:JSON.stringify(outline)};
    },fetchImage,
      searchers:{commonsPhotos:async q=>items(q).filter(x=>!x.files),commonsClips:async()=>[],stockVideos:async(s,q)=>items(q).filter(x=>x.files),stockPhotos:async()=>[],archive:async()=>[]},
      judgeCall:async(s,parts)=>{const ids=[...parts[0].text.matchAll(/"id":"([^"]+)"/g)].map(m=>m[1]).filter(id=>!id.startsWith('block'));return {text:JSON.stringify({verdicts:ids.map(id=>({id,score:8,role:'contextual',sees:'canal',coveredSubjects:['canal']}))}),usage:{promptTokenCount:500,candidatesTokenCount:50}};}});
    assert.equal(r.status,'approved',r.reason+JSON.stringify(r.mediaSummary));
    assert.ok(r.mediaSummary.reviewedVisually>0);assert.ok(r.mediaSummary.estimatedVideoSeconds>=300);
    assert.ok(r.inventory.length>0);assert.ok(r.inventory.every(c=>c.presearchReview.score>=6));
    assert.ok(r.mediaPlan.narrativeBlocks.every(b=>b.optionalSubjects.includes('particular vessel')));
    assert.ok(r.blocks.every(b=>b.missingSubjects.length===0));
  });
});

test('presearch is NOT insufficient when the reviewer is down: it is inconclusive', async () => {
  clearJudgeCache();
  await sandbox(async dir=>{
    const items=q=>Array.from({length:40},(_,i)=>mk('same-'+i,i%2===0));
    const r=await preSearchTopic(topic,settings,{dir,planner:async()=>({text:plan}),fetchImage,
      searchers:{commonsPhotos:async q=>items(q),commonsClips:async()=>[],stockVideos:async()=>[],stockPhotos:async()=>[],archive:async()=>[]},
      judgeCall:async()=>{throw new Error('HTTP 503');}});
    assert.equal(r.status,'inconclusive');
  });
});

test('presearch reports insufficient with real gaps when review rejects an irrelevant pool', async () => {
  clearJudgeCache();
  await sandbox(async dir=>{
    const items=q=>Array.from({length:40},(_,i)=>mk('same-'+i,i%2===0));
    const r=await preSearchTopic(topic,{pexelsKey:'k'},{dir,planner:async()=>({text:plan}),fetchImage,
      searchers:{commonsPhotos:async q=>items(q).filter(x=>!x.files),commonsClips:async()=>[],stockVideos:async(s,q)=>items(q).filter(x=>x.files),stockPhotos:async()=>[],archive:async()=>[]},
      judgeCall:async(s,parts)=>{const ids=[...parts[0].text.matchAll(/"id":"([^"]+)"/g)].map(m=>m[1]).filter(id=>!id.startsWith('block'));return {text:JSON.stringify({verdicts:ids.map(id=>({id,score:1,role:'unrelated'}))}),usage:{}};}});
    assert.equal(r.status,'insufficient');
    assert.ok(r.gaps.some(g=>/Pixabay/.test(g)));
  });
});


test('large unreviewed inventory cannot approve duration when only photos pass',async()=>{
 clearJudgeCache();await sandbox(async dir=>{
  const items=q=>Array.from({length:25},(_,i)=>mk(q+'p'+i,false));
  const r=await preSearchTopic(topic,{},{dir,planner:async()=>({text:plan}),fetchImage,
   searchers:{commonsPhotos:async q=>items(q),commonsClips:async()=>[],archive:async()=>[]},
   judgeCall:async(s,parts)=>{const ids=[...parts[0].text.matchAll(/"id":"([^"]+)"/g)].map(m=>m[1]).filter(id=>!id.startsWith('block'));return {text:JSON.stringify({verdicts:ids.map(id=>({id,score:9,role:'exact',coveredSubjects:['canal']}))}),usage:{}};}});
  assert.notEqual(r.status,'approved');assert.equal(r.mediaSummary.verifiedVideoSeconds,0);
 });
});
test('generic relevant footage does not satisfy an unshown essential mechanism',async()=>{
 clearJudgeCache();await sandbox(async dir=>{
  const items=q=>Array.from({length:25},(_,i)=>mk(q+'v'+i,true));
  const r=await preSearchTopic(topic,{pexelsKey:'k'},{dir,planner:async()=>({text:plan}),fetchImage,
   searchers:{commonsPhotos:async()=>[],commonsClips:async()=>[],stockVideos:async(s,q)=>items(q),stockPhotos:async()=>[],archive:async()=>[]},
   judgeCall:async(s,parts)=>{const ids=[...parts[0].text.matchAll(/"id":"([^"]+)"/g)].map(m=>m[1]).filter(id=>!id.startsWith('block'));return {text:JSON.stringify({verdicts:ids.map(id=>({id,score:8,role:'contextual',coveredSubjects:[]}))}),usage:{}};}});
  assert.notEqual(r.status,'approved');assert.equal(r.mediaSummary.coveredBlocksCount,0);
  assert.ok(r.gaps.some(g=>g.includes('assuntos sem evidência')));
 });
});
