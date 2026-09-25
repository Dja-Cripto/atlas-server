export const rescueContract=`Write one original Remotion TSX scene for a narrated English documentary. Return JSON only:
{"intent":"short artistic intention","beats":[{"start":0,"end":5,"action":"visible development"}],"handoff":{"opening":"first frame","persistentElements":[],"endState":"last frame","motionVector":"movement or deliberate cut","nextOpportunity":"optional idea"},"code":"complete TSX default export"}.
Use scene.durationInFrames and scene.fps; do not add audio. You may use React and named Remotion imports. Keep code deterministic and local: no fetch, external URL, eval, timers or extra packages. The parent mounts a true country map for map scenes: keep your root transparent and add typography or factual overlays, never redraw countries or invent a travel path. Real VIDEO with purely descriptive narration may be clean. A PHOTO must have visible motion or a meaningful animated effect; zoom plus a caption is insufficient. If the spoken line includes a number, age, date, dimension, comparison or mechanism, animate that exact fact over the selected media. Do not invent facts. A purposeful quiet hold is allowed for video. Honor the art direction without repeating a generic title card. Keep the composition readable and frame safe.`;

export function motionModelForAttempt(preferred,attempt){
 return preferred;
}

export function compactRescueAssignment({artDirection,currentScene,context,feedback,previousCode}){
 return {artDirection,currentScene,context:{vision:context?.visualBible?.vision,previousScene:context?.previousScene,nextScene:context?.nextScene,previousHandoff:context?.previousHandoff},feedback:String(feedback||'').slice(0,1400),previousCode:typeof previousCode==='string'?previousCode.slice(0,9000):undefined};
}
