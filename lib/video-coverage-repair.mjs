import {mediaIdentity} from './media-identity.mjs';
import {assessVisualCoverage} from './visual-coverage.mjs';

const seconds=scene=>Math.max(0,Number(scene.end)-Number(scene.start));
const isPhoto=scene=>scene.asset?.kind==='image';
export const MAX_UNFILMED_RUN_SECONDS=60;

export function unfilmedRuns(scenes){
 const runs=[];
 for(let i=0;i<scenes.length;){
  if(scenes[i].asset?.kind==='video'){i++;continue;}
  const start=i;while(i<scenes.length&&scenes[i].asset?.kind!=='video')i++;
  runs.push({start,end:i,seconds:scenes.slice(start,i).reduce((sum,scene)=>sum+seconds(scene),0)});
 }
 return runs;
}

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
 if(scene.asset?.kind!=='image')return false;
 // A deliberate, location-verified photo may carry the story more faithfully
 // than a replacement clip. Only a photo used as contextual B-roll is eligible.
 if(scene.kind==='photo'&&scene.asset.representationRole==='exact-location')return false;
 const identity=mediaIdentity(scene,title);
 const words=[scene.heading,scene.narration,scene.query].join(' ');
 return !identity.eventRequired&&!identity.eventYear&&!/\b(?:archiv(?:al|e)|historic(?:al)? photo|photograph|portrait|newspaper|document|painting|blueprint|19\d{2})\b/i.test(words);
}

export async function repairVideoCoverage(scenes,{title,duration,target=.5,locked=0,findVideo,onProgress=async()=>{},onAttempt=async()=>{}}){
 const output=[...scenes];
 let coverage=assessVisualCoverage(output,duration);
 const tried=new Set();
 let attempted=0,upgraded=0;
 while(coverage.videoRatio<target||unfilmedRuns(output).some(run=>run.seconds>MAX_UNFILMED_RUN_SECONDS)){
  const longRuns=unfilmedRuns(output).filter(run=>run.seconds>MAX_UNFILMED_RUN_SECONDS);
  const redundantIndices=new Set();
  for(let i=0;i<output.length-1;i++){
   if(output[i].asset?.src&&output[i+1].asset?.src&&output[i].asset.src===output[i+1].asset.src)redundantIndices.add(i+1);
  }
  const candidates=output.map((scene,index)=>({scene,index,isRedundant:redundantIndices.has(index),run:longRuns.find(run=>index>=run.start&&index<run.end)}))
   .filter(({scene,index})=>index>=locked&&!tried.has(index)&&eligibleForVideoUpgrade(scene,title));
  if(!candidates.length)break;
  candidates.sort((a,b)=>{
   if(a.isRedundant!==b.isRedundant)return a.isRedundant?-1:1;
   if(Boolean(a.run)!==Boolean(b.run))return Number(Boolean(b.run))-Number(Boolean(a.run));
   if(a.run&&b.run){
    if(a.run.seconds!==b.run.seconds)return b.run.seconds-a.run.seconds;
    const mid=run=>(run.start+run.end-1)/2;
    const distance=Math.abs(a.index-mid(a.run))-Math.abs(b.index-mid(b.run));
    if(distance)return distance;
   }
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
 return {scenes:output,coverage,attempted,upgraded,maxPhotoStreak:Math.max(0,...photoStreaks(output).map(run=>run.length)),maxUnfilmedSeconds:Math.max(0,...unfilmedRuns(output).map(run=>run.seconds))};
}
