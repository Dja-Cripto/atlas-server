const seconds=scene=>Math.max(0,Number(scene?.end)-Number(scene?.start))||0;

// A video preference is editorial guidance. Only an unresolved scene blocks
// production; a real photograph remains usable because motion authoring
// animates it and preserves its source.
export function assessVisualCoverage(scenes,duration){
 const total=Number(duration)>0?Number(duration):0;
 const mediaSeconds=scenes.filter(scene=>scene.asset&&scene.asset.representationRole!=='illustrative').reduce((sum,scene)=>sum+seconds(scene),0);
 const videoScenes=scenes.filter(scene=>scene.asset?.kind==='video');
 const photoScenes=scenes.filter(scene=>scene.asset?.kind==='image'&&scene.asset.representationRole!=='illustrative');
 const illustrationScenes=scenes.filter(scene=>scene.asset?.representationRole==='illustrative');
 const videoSeconds=videoScenes.reduce((sum,scene)=>sum+seconds(scene),0);
 const photoSeconds=photoScenes.reduce((sum,scene)=>sum+seconds(scene),0);
 const missing=scenes.filter(scene=>!scene.asset&&!scene.map&&!scene.chart).map(scene=>scene.id);
 const ratio=total?mediaSeconds/total:0;
 const videoRatio=total?videoSeconds/total:0;
 return {
  seconds:Number(mediaSeconds.toFixed(2)),ratio:Number(ratio.toFixed(3)),
  videoSeconds:Number(videoSeconds.toFixed(2)),videoRatio:Number(videoRatio.toFixed(3)),
  photoSeconds:Number(photoSeconds.toFixed(2)),videoScenes:videoScenes.length,photoScenes:photoScenes.length,illustrationScenes:illustrationScenes.length,mapScenes:scenes.filter(scene=>scene.map).length,
  missing,
  advisory:missing.length?null:ratio<.8||videoRatio<.75?'A proporção de vídeo ficou abaixo da meta editorial; fotografias reais animadas e gráficos necessários foram preservados.':null
 };
}
