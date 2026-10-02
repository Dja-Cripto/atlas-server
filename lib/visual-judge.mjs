import {vertexRequest} from './vertex.mjs';

// Visual-first judgement of stock/archive candidates. Metadata (tags, titles)
// is only a weak hint; the verdict is decided by what the model SEES in the
// image or in several frames of a video.

export const MIN_SCORE=6;            // contextual / generic support footage
export const MIN_SCORE_IDENTITY=7;   // named person, place event, document
export const EXCELLENT_SCORE=9;      // stop searching more batches
export const JUDGE_BATCH_SIZE=8;
const clean=s=>String(s||'').replace(/<[^>]*>/g,'').replace(/\s+/g,' ').trim();

export const candidateKey=c=>String(c?.source||'')+':'+String(c?.id??c?.url??'');

export function judgeSceneSummary(scene){
 const pick=(v,n)=>clean(v).slice(0,n);
 return {
  id:scene.id,heading:pick(scene.heading,160),narration:pick(scene.narration,500),
  location:pick(scene.location,120),country:pick(scene.topicCountry,60),query:pick(scene.query,160),
  role:scene.narrativeRole||'',requiredSubject:pick(scene.requiredSubject,160),
  allowedSubstitution:pick(scene.allowedSubstitution,260),visualPurpose:pick(scene.visualPurpose,260),
  identityRequired:Boolean(scene.identityRequired||scene.eventRequired),
  wantsVideo:Boolean(scene.openingVideoRequired||scene.videoOnly||scene.kind==='footage'),
  essentialSubjects:scene.essentialSubjects||[],topic:pick(scene.topic,180)
 };
}

export function buildJudgePrompt(scene,items){
 const list=items.map(c=>({id:String(c.id),type:c.files?.length?'video':'photo',frames:Math.max(1,c.frameCount||1),hintTitle:clean(c.title||c.url).slice(0,120),hintTags:clean(c.locationEvidence).slice(0,160)}));
 return `You are the visual editor of an English documentary channel. Judge candidate stock/archive media for ONE scene by LOOKING at the attached images. Videos are shown as 1-3 frames from different moments.
Rules:
- Decide from what is VISIBLE. Titles and tags are weak, untrusted hints: a candidate with no matching tag is still good if it visibly fits the narration, place, mechanism or mood; a candidate with a matching tag is bad if the picture does not fit.
- Score 0-10: 9-10 shows exactly what is narrated; 7-8 clearly fits the topic/place/mechanism; 6 acceptable context B-roll; below 6 weak or off-topic.
- role "exact": the specific named place/subject of the scene is visibly recognisable or clearly confirmed. role "contextual": plausible regional/generic support (landscape, water, city, work, transport, atmosphere) that does not prove the exact place. role "unrelated": wrong place or subject, wildlife or beach used for geography/treaty/engineering narration, AI-generated look, heavy watermark/text overlay, collage, low-quality or misleading.
- Never call something exact merely because the tag says so.
- When essentialSubjects are supplied, report coveredSubjects using their EXACT strings, only for subjects visibly demonstrated. Generic trains do not demonstrate canal mule locomotives; other locks do not demonstrate Panama's locks; a ship's Panama registry does not locate its footage in Panama. Context about global trade may use other ports, but it does not cover a specific local mechanism. Leave coveredSubjects empty when uncertain. An illustrative diagram can be planned separately; do not count an unrelated photo as evidence.
- Prefer clear, cinematic, steady footage with a visible subject; penalise tiny, dark, shaky or cluttered shots.
Return JSON only: {"verdicts":[{"id":"candidate id","score":0-10,"role":"exact|contextual|unrelated","sees":"max 12 words","reason":"max 15 words","coveredSubjects":["exact essential subject visibly shown"]}]} with one verdict per candidate.
Scene: ${JSON.stringify(judgeSceneSummary(scene))}
Candidates: ${JSON.stringify(list)}`;
}

export function parseJudgeVerdicts(text){
 const out=new Map();
 let data;
 try{data=JSON.parse(String(text||'').replace(/^```(?:json)?/m,'').replace(/```\s*$/m,'').trim());}catch{return out;}
 for(const v of Array.isArray(data?.verdicts)?data.verdicts:Array.isArray(data)?data:[]){
  const id=String(v?.id??'');if(!id)continue;
  const score=Math.max(0,Math.min(10,Number(v.score)));
  const role=['exact','contextual','unrelated'].includes(v.role)?v.role:'contextual';
  if(!Number.isFinite(score))continue;
  out.set(id,{id,score,role:score<MIN_SCORE&&role!=='exact'?'unrelated':role,sees:clean(v.sees).slice(0,120),reason:clean(v.reason).slice(0,200),coveredSubjects:Array.isArray(v.coveredSubjects)?v.coveredSubjects.map(clean):[]});
 }
 return out;
}

// Pure decision: best verdict wins; ties prefer exact evidence, then input order.
export function selectByScore(scored,scene){
 const strict=Boolean(scene.identityRequired||scene.eventRequired);
 const eligible=scored.map((item,index)=>({...item,index})).filter(({candidate,verdict})=>{
  if(!verdict||verdict.role==='unrelated')return false;
  if(strict)return Boolean(candidate.metadataExact)&&verdict.score>=MIN_SCORE_IDENTITY;
  return verdict.score>=MIN_SCORE;
 });
 eligible.sort((a,b)=>b.verdict.score-a.verdict.score||Number(b.verdict.role==='exact')-Number(a.verdict.role==='exact')||a.index-b.index);
 return eligible[0]||null;
}

// Exact is only claimed with textual evidence or a very confident visual match.
export function finalRole(candidate,verdict){
 return verdict.role==='exact'&&(candidate.metadataExact||verdict.score>=8)?'exact':'contextual';
}

async function callModel(s,parts){
 const body={contents:[{role:'user',parts}],generationConfig:{responseMimeType:'application/json',temperature:0.1}};
 let d;
 if(s.geminiBackend==='vertex')d=await vertexRequest(s,s.geminiModel,body,{timeoutMs:90000});
 else{
  const r=await fetch('https://generativelanguage.googleapis.com/v1beta/models/'+encodeURIComponent(s.geminiModel)+':generateContent',{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':s.geminiKey},body:JSON.stringify(body),signal:AbortSignal.timeout(90000)});
  if(!r.ok)throw Error('Revisão visual HTTP '+r.status);d=await r.json();
 }
 return {text:(d.candidates?.[0]?.content?.parts||[]).filter(p=>!p.thought).map(p=>p.text||'').join(''),usage:d.usageMetadata||{}};
}

const cache=new Map();
export function clearJudgeCache(){cache.clear();}
const cacheId=(scene,c)=>candidateKey(c)+'|'+JSON.stringify(judgeSceneSummary(scene));

// Judges candidates in one model call. Returns {items,judged,usage,failed}.
export async function judgeBatch(s,scene,candidates,{fetchImage,call=callModel,maxFrames=3}={}){
 const items=[],pending=[];
 for(const c of candidates){
  const hit=cache.get(cacheId(scene,c));
  if(hit)items.push({candidate:c,verdict:hit,shown:true,cached:true});else pending.push(c);
 }
 if(!pending.length)return {items,judged:items.length>0,usage:{},failed:false};
 const parts=[],shown=[];
 const probe=pending.map(c=>({...c}));
 for(const c of probe){
  const urls=[...new Set((Array.isArray(c.frames)&&c.frames.length?c.frames:[c.image]).filter(Boolean))].slice(0,maxFrames);
  const images=[];
  for(const url of urls){try{const img=await fetchImage(url);if(/^image\/(jpeg|png|webp)/.test(img.type))images.push(img);}catch{}}
  if(!images.length)continue;
  c.frameCount=images.length;shown.push(c);
  parts.push({text:`Candidate ${c.id} (${c.files?.length?'video, '+images.length+' frames':'photo'})`},...images.map(img=>({inlineData:{mimeType:img.type.split(';')[0],data:Buffer.from(img.bytes).toString('base64')}})));
 }
 for(const c of pending)if(!shown.find(x=>x.id===c.id))items.push({candidate:c,verdict:null,shown:false});
 if(!shown.length)return {items,judged:items.some(i=>i.verdict),usage:{},failed:true};
 parts.unshift({text:buildJudgePrompt(scene,shown)});
 let result;
 try{result=await call(s,parts);}catch(error){
  for(const c of shown)items.push({candidate:c,verdict:null,shown:true});
  return {items,judged:items.some(i=>i.verdict),usage:{},failed:true,error:clean(error.message)};
 }
 const verdicts=parseJudgeVerdicts(result.text);
 for(const c of shown){
  const verdict=verdicts.get(String(c.id))||null;
  if(verdict)cache.set(cacheId(scene,c),verdict);
  items.push({candidate:candidates.find(x=>String(x.id)===String(c.id)&&x.source===c.source)||c,verdict,shown:true});
 }
 return {items,judged:verdicts.size>0||items.some(i=>i.verdict),usage:result.usage||{},failed:verdicts.size===0};
}

// Full pass over a ranked pool: batches until an excellent match appears.
export async function judgePool(s,scene,pool,{fetchImage,call,batchSize=JUDGE_BATCH_SIZE,stopScore=EXCELLENT_SCORE,onBatch=()=>{}}={}){
 const all=[];let judged=false,failedBatches=0,promptTokens=0,candidateTokens=0;
 for(let i=0;i<pool.length;i+=batchSize){
  const result=await judgeBatch(s,scene,pool.slice(i,i+batchSize),{fetchImage,call});
  all.push(...result.items);judged=judged||result.judged;if(result.failed)failedBatches++;
  promptTokens+=Number(result.usage?.promptTokenCount||0);candidateTokens+=Number(result.usage?.candidatesTokenCount||0);
  await onBatch(result,i);
  const best=selectByScore(all.filter(x=>x.verdict),scene);
  if(best&&best.verdict.score>=stopScore)break;
 }
 return {items:all,judged,failedBatches,usage:{promptTokens,candidateTokens}};
}
