export function composeContinuity(scenes){
 const counts=new Map();
 return scenes.map((original,index)=>{
  const scene={...original,asset:original.asset?{...original.asset}:undefined};
  delete scene.backgroundId;
  const previous=scenes[index-1];
  const samePlace=previous&&(scene.countries||[]).some(c=>(previous.countries||[]).includes(c));
  const sameLocation=previous&&scene.location&&scene.location===previous.location;
  // Only an adjacent, relevant composition may persist; never imply a new photo belongs to an unrelated map.
  if(scene.asset?.kind==='image'&&previous&&(samePlace||sameLocation)&&!previous.asset?.kind?.includes('video'))scene.backgroundId=previous.id;
  if(scene.asset?.kind==='video'){
   const used=counts.get(scene.asset.src)||0;const available=Math.max(0,(scene.asset.duration||0)-(scene.end-scene.start));
   scene.asset.trimStart=Math.min(used,available);counts.set(scene.asset.src,scene.asset.trimStart+scene.end-scene.start);
  }
  return scene;
 });
}
