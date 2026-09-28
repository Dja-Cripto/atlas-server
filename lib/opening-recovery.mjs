import {hasLocation} from './auto-plan.mjs';

// Keep the factual subject and timing; broaden the query, not the identity.
export function requireOpeningVideo(scene){
 if(!scene)return scene;
 return {...scene,kind:'footage',treatment:'composed',openingVideoRequired:true,videoOnly:true};
}
export function openingSearchQueries(scene,title){
 const subject=String(scene.location||scene.requiredSubject||title||'').split(',')[0].trim();
 const plain=subject.replace(/Ø/g,'O').replace(/ø/g,'o').replace(/Æ/g,'Ae').replace(/æ/g,'ae').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
 const properName=plain.split(/\s+/).find(w=>w.length>=5&&!/^(strait|bridge|island|tunnel|highway|crossing)$/i.test(w))||'';
 const origProperName=subject.split(/\s+/).find(w=>w.length>=5&&!/^(strait|bridge|island|tunnel|highway|crossing)$/i.test(w))||'';
 const bridgeVariant=properName?`${properName} Bridge`:plain;
 const origBridge=origProperName?`${origProperName} Bridge`:subject;
 return [...new Set([scene.query,origBridge,bridgeVariant,subject,plain,properName].filter(Boolean))].slice(0,5);
}
export async function recoverOpeningVideo(scene,{title,findVideo,onAttempt=async()=>{}}){
 const opening=requireOpeningVideo(scene);
 if(!opening||(opening.asset?.kind==='video'&&opening.asset.representationRole!=='contextual'))return opening;
 for(const [index,query] of openingSearchQueries(opening,title).entries()){
  await onAttempt(index+1,query);
  // Avoid inheriting a still or generated illustration into the video search.
  const candidate={...opening,query,asset:undefined,reuseExistingMedia:true};
  let asset;try{asset=await findVideo(candidate);}catch{continue;}
  if(asset?.kind!=='video'||!asset.src||!Number.isFinite(Number(asset.duration))||Number(asset.duration)<opening.end-opening.start)continue;
  if(opening.openingVideoRequired&&asset.representationRole==='contextual'&&!hasLocation(asset.credit||asset,opening.location))continue;
  if(hasLocation(asset.credit||asset,opening.location))asset.representationRole='exact-location';
  const ready={...opening,asset};
  delete ready.missingVisual;delete ready.map;delete ready.chart;delete ready.mapIntent;
  return ready;
 }
 return opening;
}
