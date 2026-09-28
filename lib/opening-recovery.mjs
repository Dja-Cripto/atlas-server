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
 const secondary=String(scene.location||'').split(',')[1]?.trim()||'';
 const country=scene.countries?.[0]||'';
 const regionalContext=secondary?`${secondary} aerial`:country?`${country} river aerial landscape`:'river landscape aerial';
 return [...new Set([scene.query,origBridge,bridgeVariant,subject,plain,properName,regionalContext].filter(Boolean))].slice(0,5);
}
export async function recoverOpeningVideo(scene,{title,findVideo,onAttempt=async()=>{}}){
 const opening=requireOpeningVideo(scene);
 if(!opening||(opening.asset?.kind==='video'&&opening.asset.src&&opening.asset.representationRole!=='contextual'))return opening;
 const queries=openingSearchQueries(opening,title);
 for(const [index,query] of queries.entries()){
  await onAttempt(index+1,query);
  const isRegionalContext=index>=3||(query.includes('aerial')&&!query.includes(String(opening.requiredSubject||'').split(' ')[0]));
  // Avoid inheriting a still or generated illustration into the video search.
  const candidate={...opening,query,asset:undefined,reuseExistingMedia:true};
  if(isRegionalContext){
   candidate.narrativeRole='context';
   candidate.requiredSubject='';
   candidate.identityRequired=false;
   candidate.location=scene.countries?.length?scene.countries[0]:'';
   candidate.allowedSubstitution='Authentic regional scenery, waterways, or border landscape of the relevant region.';
   candidate.contextIntent='Geographical setting contextualizing the subject';
  }
  let asset;try{asset=await findVideo(candidate);}catch{continue;}
  if(asset?.kind!=='video'||!asset.src||!Number.isFinite(Number(asset.duration))||Number(asset.duration)<opening.end-opening.start)continue;
  const isContextual=asset.representationRole==='contextual';
  const ready={...opening,asset};
  if(isContextual){
   ready.narrativeRole='context';
   ready.requiredSubject='';
  }
  delete ready.missingVisual;delete ready.map;delete ready.chart;delete ready.mapIntent;
  return ready;
 }
 return opening;
}
