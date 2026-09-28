export function sourceIdentifier(asset){
 if(!asset)return '';
 return asset.sourceId||asset.credit?.url||asset.src||'';
}

export function composeContinuity(scenes){
 const usage=new Map();
 return scenes.map((original,index)=>{
  const scene={...original,asset:original.asset?{...original.asset}:undefined};
  delete scene.backgroundId;
  const previous=scenes[index-1];
  const samePlace=previous&&(scene.countries||[]).some(c=>(previous.countries||[]).includes(c));
  const sameLocation=previous&&scene.location&&scene.location===previous.location;
  // Only an adjacent, relevant composition may persist; never imply a new photo belongs to an unrelated map.
  if(scene.asset?.kind==='image'&&previous&&(samePlace||sameLocation)&&!previous.asset?.kind?.includes('video'))scene.backgroundId=previous.id;
  if(scene.asset?.kind==='video'){
   const sourceId=sourceIdentifier(scene.asset);
   scene.asset.sourceId=sourceId;
   const sceneDur=Math.max(0,Number(scene.end)-Number(scene.start));
   const totalDur=Number(scene.asset.duration)||0;
   const prevSourceId=previous?.asset?.kind==='video'?sourceIdentifier(previous.asset):'';
   if(prevSourceId&&prevSourceId===sourceId){
    scene.asset.consecutiveReuse=true;
   }
   const state=usage.get(sourceId)||{usedSec:0,lastEndSec:0,count:0};
   const gap=scene.start-state.lastEndSec;
   scene.asset.reuseGapSeconds=state.count>0?gap:null;
   if(state.count>0&&gap<120){
    scene.asset.frequentReuse=true;
   }
   if(state.usedSec+sceneDur<=totalDur+0.01){
    scene.asset.trimStart=state.usedSec;
    scene.asset.trimEnd=state.usedSec+sceneDur;
    usage.set(sourceId,{usedSec:scene.asset.trimEnd,lastEndSec:scene.end,count:state.count+1});
   }else{
    // Do not silently clamp and replay the exact same tail. Flag segment exhaustion.
    scene.asset.segmentExhausted=true;
    scene.asset.trimStart=state.count===0?0:Math.min(state.usedSec,Math.max(0,totalDur-sceneDur));
    scene.asset.trimEnd=Math.min(totalDur,scene.asset.trimStart+sceneDur);
    usage.set(sourceId,{usedSec:totalDur,lastEndSec:scene.end,count:state.count+1});
   }
  }
  return scene;
 });
}

export function detectConsecutiveFootage(scenes){
 const violations=[];
 for(let i=1;i<scenes.length;i++){
  const prev=scenes[i-1],curr=scenes[i];
  if(prev.asset?.kind==='video'&&curr.asset?.kind==='video'){
   const pId=sourceIdentifier(prev.asset),cId=sourceIdentifier(curr.asset);
   if(pId&&pId===cId)violations.push({index:i,prevIndex:i-1,sourceId:cId,sceneId:curr.id,prevSceneId:prev.id});
  }
 }
 return violations;
}

export function detectExhaustedSegments(scenes){
 return scenes.filter(s=>s.asset?.kind==='video'&&(s.asset.segmentExhausted||(Number(s.asset.duration)>0&&Number(s.asset.trimStart||0)+Math.max(0,Number(s.end)-Number(s.start))>Number(s.asset.duration)+0.05)));
}


