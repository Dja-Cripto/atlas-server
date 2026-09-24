// Technical samples, not a demand for constant motion or an editorial verdict.
export function sceneSampleFrames(scene,maxFrame){
 const start=Math.max(0,Math.round(Number(scene.from)||0));
 const duration=Math.max(1,Math.round(Number(scene.durationInFrames)||1));
 return [...new Set([0,Math.floor(duration/2),duration-1].map(offset=>Math.min(maxFrame,start+offset)))];
}
