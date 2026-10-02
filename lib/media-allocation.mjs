import {composeContinuity,detectConsecutiveMedia,detectExhaustedSegments,sourceIdentifier} from './visual-continuity.mjs';

export function staleMediaSceneIndexes(code,scenes){
 let saved;try{saved=JSON.parse(String(code).match(/(?:const|export const) scenes\s*=\s*(\[[\s\S]*?\]);/)[1]);}catch{return scenes.map((s,i)=>s.index??i);}
 const signature=s=>JSON.stringify([s?.id,s?.asset?.src,s?.asset?.kind,s?.asset?.trimStart||0,s?.asset?.trimEnd]);
 return scenes.flatMap((scene,i)=>signature(scene)!==signature(saved[i])?[scene.index??i]:[]);
}

export function allocationIssues(scenes,{isShort=false}={}){
 const issues=new Map();
 for(const issue of detectConsecutiveMedia(scenes))issues.set(issue.sceneId,'mídia consecutiva repetida');
 for(const scene of detectExhaustedSegments(scenes))issues.set(scene.id,'recorte esgotado');
 const duration=scenes.reduce((n,s)=>n+Math.max(0,s.end-s.start),0);
 const usage=new Map();
 for(const scene of scenes){
  if(scene.asset?.kind!=='video')continue;
  const id=sourceIdentifier(scene.asset),seconds=Math.max(0,scene.end-scene.start);
  const consumed=(usage.get(id)||0)+seconds;usage.set(id,consumed);
  const budget=isShort?duration*.35:Math.min(120,Math.max(30,duration*.15));
  if(consumed>budget+.05)issues.set(scene.id,'concentração excessiva numa fonte');
 }
 return issues;
}

// Repair first; never silently replay a source tail to fill the timeline.
export async function allocateMedia(scenes,{isShort=false,findReplacement,onProgress=async()=>{}}={}){
 let output=scenes.map(s=>({...s,asset:s.asset?{...s.asset}:undefined}));
 for(let round=0;round<2;round++){
  const composed=composeContinuity(output),issues=allocationIssues(composed,{isShort});
  if(!issues.size)return composed;
  for(const [id,reason] of issues){
   const index=output.findIndex(s=>s.id===id),scene=output[index];
   const excluded=new Set([scene.asset,output[index-1]?.asset,output[index+1]?.asset].flatMap(a=>a?[a.src,a.sourceId,a.credit?.url]:[]).filter(Boolean));
   const replacement=await findReplacement?.({...scene,asset:undefined,forceRealRecovery:true,isShort},excluded,reason);
   if(replacement?.src&&!excluded.has(replacement.src)&&!excluded.has(sourceIdentifier(replacement))&&!excluded.has(replacement.credit?.url)){
    output[index]={...scene,asset:replacement,kind:replacement.kind==='video'?'footage':'photo'};
    await onProgress(output,id,reason);
   }
  }
 }
 const composed=composeContinuity(output),issues=allocationIssues(composed,{isShort});
 if(issues.size)throw Error('Plano de mídia não aprovado antes das animações: '+[...issues].map(([id,reason])=>id+' ('+reason+')').join(', ')+'. Trabalho preservado; recuperação não comprovou alternativas suficientes.');
 return composed;
}
