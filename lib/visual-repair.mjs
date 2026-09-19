import {validateDirection} from './auto-plan.mjs';

export function needsVisualRepair(scene){
 return scene.kind==='title'&&(scene.missingVisual===true||scene.end-scene.start>2.5||scene.heading.trim().split(/\s+/).length>5||/^(a closer look|visual explanation)$/i.test(scene.heading.trim()));
}
// A second editorial pass, not a percentage exemption. No model code is executed.
export async function repairVisuals(scenes,{propose,materialize,research,onRepair=()=>{}}){
 const output=[];const pending=[];
 for(const scene of scenes){
  if(!needsVisualRepair(scene)){output.push(scene);continue;}
  try{
   const candidate=await propose(scene);
   if(!candidate||!['map','chart','footage','photo'].includes(candidate.kind))throw Error('A alternativa precisa ter conteúdo visual.');
   const replacement=validateDirection(scene,candidate,research);
   // Never inherit unsupported numbers or a previous chart when changing representation.
   delete replacement.chart;delete replacement.map;delete replacement.asset;delete replacement.callout;
   if(candidate.kind==='chart')replacement.chart=validateDirection(scene,candidate,research).chart;
   const ready=await materialize(replacement);
   if(!ready||!ready.asset&&!ready.map&&!ready.chart)throw Error('Não foi possível obter o material da alternativa.');
   ready.visualRepair={reason:'Texto sem desenvolvimento visual',originalHeading:scene.heading};
   delete ready.missingVisual;output.push(ready);onRepair(ready);
  }catch(e){pending.push({id:scene.id,reason:e.message});output.push(scene);}
 }
 return {scenes:output,pending};
}
