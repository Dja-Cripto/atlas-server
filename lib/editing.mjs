import {randomUUID} from 'node:crypto';

// Timing is proportional to word count, never presented as word-aligned audio.
export function timingSlots(script,audioSeconds){
 const words=script.trim().split(/\s+/).filter(Boolean);
 if(!words.length)throw new Error('Roteiro vazio.');
 const seconds=Number.isFinite(audioSeconds)&&audioSeconds>0?audioSeconds:words.length/150*60;
 const count=Math.min(150,Math.max(1,Math.ceil(seconds/5)));
 const actualCount=Math.min(count,words.length),slots=[];
 for(let i=0;i<actualCount;i++){const a=Math.round(i*words.length/actualCount),b=Math.round((i+1)*words.length/actualCount);slots.push({id:`shot-${i+1}`,narration:words.slice(a,b).join(' '),start:Number((a/words.length*seconds).toFixed(3)),end:Number((b/words.length*seconds).toFixed(3))});}
 return {duration:seconds,timingBasis:audioSeconds?'audio-duration-proportional':'150-words-per-minute',slots};
}
export function attachShotDescriptions(timing,descriptions){
 if(!Array.isArray(descriptions)||descriptions.length!==timing.slots.length)throw new Error('O modelo não descreveu todos os planos de edição.');
 const ids=new Set();
 for(const d of descriptions){if(ids.has(d.id)||!timing.slots.some(x=>x.id===d.id)||typeof d.query!=='string'||d.query.length>120||typeof d.heading!=='string'||!['footage','chart','map','title'].includes(d.visual)||typeof d.location!=='string')throw new Error('Plano de edição inválido.');ids.add(d.id);}
 return {version:2,createdAt:new Date().toISOString(),duration:timing.duration,timingBasis:timing.timingBasis,shots:timing.slots.map(slot=>({...slot,...Object.fromEntries(['heading','query','location','visual'].map(k=>[k,descriptions.find(d=>d.id===slot.id)[k]])),duration:Number((slot.end-slot.start).toFixed(3))}))};
}
export function mergeMedia(existing,incoming){
 const map=new Map(existing.map(x=>[x.source+':'+x.id,x]));
 for(const item of incoming){const key=item.source+':'+item.id,old=map.get(key);map.set(key,{...old,...item,shotIds:[...new Set([...(old?.shotIds||[]),...(item.shotIds||[])])],queries:[...new Set([...(old?.queries||[]),...(item.queries||[])])]});}
 return [...map.values()];
}
export function thumbnailVersions(j){return j.thumbnails?.length?j.thumbnails:(j.thumbnail?[{id:'original',url:j.thumbnail,createdAt:j.createdAt,direction:'Capa original'}]:[]);}
export function recordThumbnail(j,url,direction=''){
 const versions=thumbnailVersions(j);const version={id:randomUUID(),url,createdAt:new Date().toISOString(),direction};j.thumbnails=[...versions,version];if(!j.thumbnail)j.thumbnail=url;return version;
}
export function selectThumbnail(j,id){const v=thumbnailVersions(j).find(v=>v.id===id);if(!v)throw new Error('Versão de capa não encontrada.');j.thumbnail=v.url;return v;}
export function assignClip(j,{shotId,id,source,trimStart,trimEnd,reviewed}){
 const shot=j.editPlan?.shots.find(x=>x.id===shotId),item=j.media?.find(x=>String(x.id)===String(id)&&x.source===source);
 if(!shot||!item)throw new Error('Plano ou filmagem não encontrado.');
 if(!['Pexels','Pixabay'].includes(item.source))throw new Error('Esta referência ainda não possui arquivo autorizado para montagem.');
 const start=Number(trimStart),end=Number(trimEnd);
 if(!Number.isFinite(start)||!Number.isFinite(end)||start<0||end<=start||end>item.duration+.01)throw new Error('O trecho precisa estar dentro da duração do arquivo.');
 if(Math.abs(end-start-shot.duration)>.12)throw new Error('A duração do trecho precisa corresponder à duração planejada.');
 if(reviewed!==true)throw new Error('Revise conteúdo, origem e adequação antes de atribuir.');
 j.clipAssignments={...j.clipAssignments,[shotId]:{id:item.id,source,trimStart:start,trimEnd:end,reviewed:true,assignedAt:new Date().toISOString()}};
}
