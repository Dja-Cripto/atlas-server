import {detectConsecutiveFootage,detectExhaustedSegments,sourceIdentifier} from './visual-continuity.mjs';
import {MAX_UNFILMED_RUN_SECONDS,unfilmedRuns,photoStreaks} from './video-coverage-repair.mjs';

/**
 * Pass 1: Media Plan Review before motion authoring.
 * Detects consecutive repeated sources, segment exhaustion, unfilmed runs, and narrative role mismatches.
 */
export function reviewMediaPlan(scenes,{duration=0,isShort=false}={}){
 const issues=[];

 // 1. Consecutive footage check
 const consecutive=detectConsecutiveFootage(scenes);
 for(const item of consecutive){
  issues.push({
   sceneId:item.sceneId,
   sceneIndex:item.index,
   severity:'error',
   type:'consecutive-footage',
   reason:`Mesma filmagem original utilizada em cenas consecutivas (${item.prevIndex+1} e ${item.index+1}).`,
   evidence:item.sourceId,
   proposedFix:'Substituir por outra fonte documental ou foto relevante com autoria.',
   state:'open'
  });
 }

 // 2. Exhausted footage segments
 const exhausted=detectExhaustedSegments(scenes);
 for(const scene of exhausted){
  issues.push({
   sceneId:scene.id,
   sceneIndex:scene.index,
   severity:'warning',
   type:'exhausted-segment',
   reason:'Duração da fonte esgotada; avanço de corte não possui mais material inédito.',
   evidence:sourceIdentifier(scene.asset),
   proposedFix:'Procurar clipe complementar ou usar outra tomada da mesma região.',
   state:'open'
  });
 }

 // 3. Narrative role vs media representation check
 for(let i=0;i<scenes.length;i++){
  const scene=scenes[i];
  if(scene.narrativeRole==='evidence'&&scene.asset?.representationRole==='contextual'&&!scene.asset?.credit?.reason?.includes('exato')){
   issues.push({
    sceneId:scene.id,
    sceneIndex:i,
    severity:'warning',
    type:'evidence-mismatch',
    reason:'A cena descreve um sujeito específico com função de evidência, mas a mídia é B-roll contextual.',
    evidence:`Sujeito requerido: "${scene.requiredSubject||scene.location||'específico'}". Mídia: ${scene.asset?.credit?.source||'Stock'}.`,
    proposedFix:'Buscar foto histórica/específica com autoria ou tratar como contextual.',
    state:'open'
   });
  }
 }

 // 4. Long unfilmed runs
 if(!isShort&&duration>=120){
  const runs=unfilmedRuns(scenes).filter(r=>r.seconds>MAX_UNFILMED_RUN_SECONDS);
  for(const run of runs){
   issues.push({
    sceneId:scenes[run.start]?.id||`run-${run.start}`,
    sceneIndex:run.start,
    severity:'warning',
    type:'long-unfilmed-run',
    reason:`Trecho de ${Math.round(run.seconds)}s contínuos sem filmagem real (cenas ${run.start+1} a ${run.end}).`,
    evidence:`Duração do trecho: ${Math.round(run.seconds)}s`,
    proposedFix:'Substituir fotos contextuais não históricas por filmagem real ou registrar exceção fundamentada.',
    state:'open'
   });
  }
 }

 const errors=issues.filter(i=>i.severity==='error');
 return {
  valid:errors.length===0,
  issues,
  summary:{
   totalScenes:scenes.length,
   consecutiveFootageErrors:consecutive.length,
   exhaustedSegments:exhausted.length,
   totalIssues:issues.length
  }
 };
}

/**
 * Pass 2: Authored Blocks Review before final render.
 * Detects visual monotony in consecutive photo or motion scenes.
 */
export function reviewAuthoredBlocks(scenes,codesMap=new Map()){
 const issues=[];
 const streaks=photoStreaks(scenes).filter(s=>s.length>=3);

 for(const streak of streaks){
  const streakScenes=scenes.slice(streak.start,streak.end);
  const codes=streakScenes.map(s=>codesMap.get(s.index)||s.code||'').filter(Boolean);
  
  if(codes.length>=3){
   // Check if all scenes in the streak use the exact same template pattern (e.g. pan + caption only)
   const allSimplePanZoom=codes.every(c=>
    /interpolate\s*\(\s*frame\s*,\s*\[\s*0\s*,\s*duration\s*\]\s*,\s*\[\s*1\.(?:02|04|06)/.test(c)||
    /translateX\s*\(\s*pan\s*\)/.test(c)
   );
   const hasVariedTechniques=codes.some(c=>
    /clipPath|mask|svg|rect|circle|borderLeft|grid|transformOrigin|scale\s*:\s*interpolateColors|\bcomparison\b|\bannotation\b|\bdetail\b/i.test(c)
   );

   if(allSimplePanZoom&&!hasVariedTechniques){
    issues.push({
     streakStart:streak.start,
     streakEnd:streak.end,
     length:streak.length,
     severity:'warning',
     type:'photo-monotony',
     reason:`Sequência de ${streak.length} fotografias consecutivas (cenas ${streak.start+1} a ${streak.end}) com tratamento visual similar (zoom/pan padrão).`,
     proposedFix:'Variar recorte, destaque de detalhes ou composição animada em pelo menos uma foto.'
    });
   }
  }
 }

 return {
  approved:issues.filter(i=>i.severity==='error').length===0,
  issues,
  streakCount:streaks.length
 };
}
