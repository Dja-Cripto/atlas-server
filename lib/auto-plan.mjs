// Untrusted model output is data; it never becomes executable code.
export function audioSlots(segments,duration,{isShort=false}={}){
 if(!Number.isFinite(duration)||duration<=0||duration>1800)throw Error('Duração de áudio inválida (máximo 30 minutos).');
 const words=segments.flatMap(s=>s.words||[]).filter(w=>typeof w.word==='string'&&Number.isFinite(w.start)&&Number.isFinite(w.end)&&w.start>=0&&w.end>=w.start&&w.end<=duration+.5).sort((a,b)=>a.start-b.start);
 if(!words.length||words.at(-1).end<duration*.85)throw Error('Transcrição incompleta. Não é seguro sincronizar o vídeo.');
 const slots=[];let start=0,group=[];
 const minSentenceCut=isShort?3.0:4.5;
 const minClauseCut=isShort?4.2:6.0;
 const hardCapCut=isShort?5.5:8.5;
 for(let i=0;i<words.length;i++){
  const w=words[i];group.push(w.word);
  const elapsed=w.end-start,trimmed=w.word.trim();
  const isSentenceEnd=/[.?!]$/.test(trimmed),isClauseEnd=/[,;:\u2014\-]$/.test(trimmed);
  const nextWord=words[i+1],hasPause=nextWord?nextWord.start-w.end>=0.30:true;
  const shouldCut=nextWord&&((elapsed>=minSentenceCut&&(isSentenceEnd||hasPause))||(elapsed>=minClauseCut&&isClauseEnd)||(elapsed>=hardCapCut));
  if(shouldCut){
   slots.push({id:`shot-${slots.length+1}`,start,end:nextWord.start,narration:group.join('').trim()});
   start=nextWord.start;group=[];
  }
 }
 if(group.length)slots.push({id:`shot-${slots.length+1}`,start,end:duration,narration:group.join('').trim()});
 return slots;
}
const text=(v,n)=>typeof v==='string'&&v.length<=n?v:'';
const strings=v=>typeof v==='string'?[v]:v&&typeof v==='object'?Object.values(v).flatMap(strings):[];
const normalize=v=>v.normalize('NFKC').replace(/\s+/g,' ').trim();
export function normalizeDirectionKind(kind){
 if(!kind||typeof kind!=='string')return 'footage';
 const k=kind.toLowerCase().trim();
 if(k==='video'||k==='clip'||k==='b-roll'||k==='footage')return 'footage';
 if(k==='image'||k==='picture'||k==='photo'||k==='photograph')return 'photo';
 if(k==='map'||k==='cartography')return 'map';
 if(k==='chart'||k==='graph'||k==='infographic'||k==='data')return 'chart';
 if(k==='title'||k==='text')return 'title';
 return 'footage';
}
export function normalizeVisualTreatment(treatment,kind){
 const normalized=typeof treatment==='string'?treatment.toLowerCase().trim():'';
 if(['map','chart','title'].includes(kind))return 'composed';
 if(['label','identified','location'].includes(normalized))return 'label';
 if(['composed','motion','graphic'].includes(normalized))return 'composed';
 if(kind==='photo')return 'label';
 return 'clean';
}
export function validateDirection(slot,d,research){
 if(!d||typeof d!=='object'||(d.id&&d.id!==slot.id))throw Error('Direção de cena inválida: '+slot.id);
 const kind=normalizeDirectionKind(d.kind);
 const heading=text(d.heading,80)||(slot.narration?text(slot.narration.slice(0,80),80):'')||'Scene Overview';
 const treatment=normalizeVisualTreatment(d.treatment,kind);
 const label=treatment==='label'?(text(d.label,60)||text(d.location,60)||heading):'';
 const result={...slot,kind,treatment,label,heading,caption:treatment==='composed'?text(d.caption,130):'',query:text(d.query,100),location:text(d.location,80),countries:Array.isArray(d.countries)?d.countries.filter(x=>typeof x==='string'&&x.length<60).slice(0,5):[],routes:d.routes===true,layout:['full','split','overlay'].includes(d.layout)?d.layout:'full'};
 if(!result.heading)throw Error('Cena sem título: '+slot.id);
 if(result.kind==='chart'){
  const chart=d.chart;const passages=strings(research).map(normalize);
  const quote=text(chart?.quote,1200),source=text(chart?.source,500),unit=text(chart?.unit,25);
  let validURL=false;try{validURL=new URL(source).protocol==='https:';}catch{}
  if(!quote||!passages.some(p=>p.includes(normalize(quote)))||!validURL||!passages.some(p=>p.includes(source)))throw Error('Gráfico sem evidência verificável: '+slot.id);
  if(!Array.isArray(chart.values)||!chart.values.length||chart.values.length>5)throw Error('Gráfico inválido.');
  const values=chart.values.map(v=>{if(!text(v.label,35)||!Number.isFinite(v.value)||v.value<0||!String(quote).includes(String(v.value))||unit==='%'&&v.value>100)throw Error('Valor sem respaldo na citação: '+slot.id);return {label:v.label,value:v.value};});
  result.chart={unit,source,quote,values};
 }
 if(result.kind==='map'&&!result.countries.length){
  result.kind='footage';
 }
 return result;
}
export function safeDirection(slot,d,research){
 try{return {scene:validateDirection(slot,d,research),warning:null};}catch(e){
  if(d?.kind!=='chart'||!/Gráfico|Valor sem respaldo/.test(e.message))throw e;
  // Discard all numerical labels, rather than carrying an unsupported claim into an overlay.
  const scene=validateDirection(slot,{...d,kind:'footage',heading:text(d.location,80)||'A closer look',caption:'',chart:undefined,layout:'full',query:text(d.location,80)||text(d.query,100)||'city daily life'},research);
  return {scene,warning:`${slot.id}: gráfico descartado por falta de evidência; será buscada mídia real de contexto. ${e.message}`};
 }
}

// Maps explain geography; they are not a generic fallback for missing media.
// Run this before downloads and motion authoring so repeated geography is sent
// through the normal footage/photo search instead.
export function enforceVisualBreathing(plan,duration){
 const media=plan.filter(scene=>['footage','photo'].includes(scene.kind));
 const mediaSeconds=media.reduce((sum,scene)=>sum+Math.max(0,scene.end-scene.start),0);
 const composedBudget=mediaSeconds*(duration<=65?.35:.30);
 let composedSeconds=0,previousWasComposed=false,cleanStreak=0;
 return plan.map((scene,index)=>{
  if(!['footage','photo'].includes(scene.kind)){previousWasComposed=true;cleanStreak=0;return {...scene,treatment:'composed',label:''};}
  const seconds=Math.max(0,scene.end-scene.start);
  const isStill=scene.kind==='photo'||scene.asset?.kind==='image';
  const contextual=scene.asset?.representationRole==='contextual';
  let treatment=normalizeVisualTreatment(scene.treatment,isStill?'photo':scene.kind);
  if(index===0&&treatment==='clean')treatment='label';
  if(isStill&&treatment==='clean')treatment='label';
  if(treatment==='composed'&&(previousWasComposed||composedSeconds+seconds>composedBudget))treatment=isStill?'label':'clean';
  if(treatment==='clean'&&cleanStreak>=2)treatment='label';
  if(treatment==='composed')composedSeconds+=seconds;
  previousWasComposed=treatment==='composed';
  cleanStreak=treatment==='clean'?cleanStreak+1:0;
  const identity=contextual?(scene.heading||scene.label||''):(scene.label||scene.heading||scene.location||'');
  const label=treatment==='label'?identity:'';
  return {...scene,treatment,label:String(label).slice(0,60),caption:treatment==='composed'?scene.caption:'',layout:treatment==='composed'?scene.layout:'full'};
 });
}
export function diversifyVisualPlan(plan,duration){
 const isShort=duration<=65;
 const mapBudget=isShort?1:Math.max(1,Math.ceil(duration/45));
 const seenMaps=new Set();let acceptedMaps=0,mapSeconds=0;
 const diversified=plan.map((source,index)=>{
  if(source.kind!=='map')return source;
  const seconds=Math.max(0,source.end-source.start);
  const signature=(source.countries||[]).map(value=>String(value).trim().toLowerCase()).sort().join('|');
  const repeatsMap=Boolean(signature&&seenMaps.has(signature));
  const consecutive=plan[index-1]?.kind==='map';
  const exceedsCount=acceptedMaps>=mapBudget;
  const exceedsRuntime=isShort?acceptedMaps>=1:(mapSeconds+seconds>duration*.18&&acceptedMaps>0);
  if(repeatsMap||consecutive||exceedsCount||exceedsRuntime){
   const place=source.location||source.countries?.[0]||'';
   return {...source,kind:'footage',routes:false,layout:'full',query:[place,source.heading,'documentary footage'].filter(Boolean).join(' ').slice(0,100),mapDiversified:true};
  }
  if(signature)seenMaps.add(signature);acceptedMaps++;mapSeconds+=seconds;
  return source;
 });
 return enforceVisualBreathing(diversified,duration);
}
export function hasLocation(candidate,location){
 if(!location)return true;
 const normalized=v=>decodeURIComponent(String(v)).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ');
 return normalized([candidate.title,candidate.url,candidate.locationEvidence].filter(Boolean).join(' ')).includes(normalized(location).trim());
}
