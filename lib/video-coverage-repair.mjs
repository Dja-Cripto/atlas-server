import {mediaIdentity} from './media-identity.mjs';
import {assessVisualCoverage} from './visual-coverage.mjs';

const seconds=scene=>Math.max(0,Number(scene.end)-Number(scene.start));
const isPhoto=scene=>scene.asset?.kind==='image';

export function photoStreaks(scenes){
 const runs=[];
 for(let i=0;i<scenes.length;){
  if(!isPhoto(scenes[i])){i++;continue;}
  const start=i;while(i<scenes.length&&isPhoto(scenes[i]))i++;
  runs.push({start,end:i,length:i-start});
 }
 return runs;
}

// Historical photographs and named events should not be replaced by generic B-roll.
export function eligibleForVideoUpgrade(scene,title){
 if(scene.asset?.kind!=='image'||scene.asset.representationRole==='illustrative')return false;
 const identity=mediaIdentity(scene,title);
 const words=[scene.heading,scene.narration,scene.query].join(' ');
 return !identity.eventRequired&&!identity.eventYear&&!/\b(?:archiv(?:al|e)|historic(?:al)? photo|photograph|portrait|newspaper|document|painting|blueprint|19\d{2})\b/i.test(words);
}

export async function repairVideoCoverage(scenes,{title,duration,target=.5,locked=0,findVideo,onProgress=async()=>{},onAttempt=async()=>{}}){
 const output=[...scenes];
 let coverage=assessVisualCoverage(output,duration);
 const tried=new Set();
 let attempted=0,upgraded=0;
 while(coverage.videoRatio<target||photoStreaks(output).some(run=>run.length>=3)){
  const runs=photoStreaks(output);
  const candidates=output.map((scene,index)=>({scene,index,run:runs.find(run=>index>=run.start&&index<run.end)}))
   .filter(({scene,index})=>index>=locked&&!tried.has(index)&&eligibleForVideoUpgrade(scene,title));
  if(!candidates.length)break;
  // Break a long run near its middle, then spend searches on longer shots.
  candidates.sort((a,b)=>{
   const aLong=a.run?.length>=3,bLong=b.run?.length>=3;
   if(aLong!==bLong)return bLong-aLong;
   if(aLong&&a.run.length!==b.run.length)return b.run.length-a.run.length;
   if(aLong){const am=Math.abs(a.index-(a.run.start+a.run.end-1)/2),bm=Math.abs(b.index-(b.run.start+b.run.end-1)/2);if(am!==bm)return am-bm;}
   return seconds(b.scene)-seconds(a.scene);
  });
  const {scene,index}=candidates[0];tried.add(index);
  attempted++;
  await onAttempt({attempted,total:output.length,id:scene.id,videoRatio:coverage.videoRatio});
  let video=null;
  try{video=await findVideo({...scene,kind:'footage',videoOnly:true,reuseExistingMedia:true});}catch{}
  if(video?.kind!=='video')continue;
  output[index]={...scene,kind:'footage',asset:video};
  upgraded++;
  coverage=assessVisualCoverage(output,duration);
  await onProgress(output,coverage,scene.id);
 }
 return {scenes:output,coverage,attempted,upgraded,maxPhotoStreak:Math.max(0,...photoStreaks(output).map(run=>run.length))};
}
