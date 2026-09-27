import {mediaIdentity} from './media-identity.mjs';
import {assessVisualCoverage} from './visual-coverage.mjs';

const seconds=scene=>Math.max(0,Number(scene.end)-Number(scene.start));

// Historical photographs and named events should not be replaced by generic B-roll.
export function eligibleForVideoUpgrade(scene,title){
 if(scene.asset?.kind!=='image'||scene.asset.representationRole==='illustrative')return false;
 const identity=mediaIdentity(scene,title);
 const words=[scene.heading,scene.narration,scene.query].join(' ');
 return !identity.eventRequired&&!identity.eventYear&&!/\b(?:archiv(?:al|e)|historic(?:al)? photo|photograph|portrait|newspaper|document|painting|blueprint|19\d{2})\b/i.test(words);
}

export async function repairVideoCoverage(scenes,{title,duration,target=.5,locked=0,findVideo,onProgress=async()=>{}}){
 const output=[...scenes];
 let coverage=assessVisualCoverage(output,duration);
 const candidates=output.map((scene,index)=>({scene,index})).filter(({scene,index})=>index>=locked&&eligibleForVideoUpgrade(scene,title));
 // A longer shot gives the largest coverage gain for the same search effort.
 candidates.sort((a,b)=>seconds(b.scene)-seconds(a.scene));
 let attempted=0,upgraded=0;
 for(const {scene,index} of candidates){
  if(coverage.videoRatio>=target)break;
  attempted++;
  let video=null;
  try{video=await findVideo({...scene,kind:'footage',videoOnly:true,reuseExistingMedia:true});}catch{}
  if(video?.kind!=='video')continue;
  output[index]={...scene,kind:'footage',asset:video};
  upgraded++;
  coverage=assessVisualCoverage(output,duration);
  await onProgress(output,coverage,scene.id);
 }
 return {scenes:output,coverage,attempted,upgraded};
}
