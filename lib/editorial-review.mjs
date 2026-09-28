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
 * Detects whether a scene component confines the media into an unnecessary split-screen / side-by-side tile
 * rather than displaying full-bleed media with integrated overlays.
 */
export function isSplitScreenLayout(code){
 if(!code||typeof code!=='string')return false;
 const hasMedia=/<(?:Img|OffthreadVideo|Video)\b/.test(code);
 if(!hasMedia)return false;

 const mediaInConstrainedBox=/<div[^>]*style=\{\{[^}]*\b(?:width|maxWidth)\s*:\s*(?:[1-9]\d{2}|1[0-5]\d{2}|[2-7]\d%)/i.test(code);
 const sidePanel=/(?:left|right)\s*:\s*(?:8\d{2}|9\d{2}|1[0-5]\d{2})(?:px)?\b/i.test(code)&&
                 /<(?:svg|div)[^>]*\b(?:style=\{\{[^}]*(?:backgroundColor|background)\s*:|className\b)/i.test(code);
 const explicitSplit=/\b(?:split-screen|side-by-side)\b/i.test(code);

 return (mediaInConstrainedBox&&sidePanel)||explicitSplit;
}

/**
 * Detects visual redundancy between adjacent scenes: duplicate media sources,
 * identical split-screen templates, or repetitive layouts.
 */
export function detectVisualRedundancy(scenes,codesMap=new Map()){
 const redundancies=[];
 for(let i=0;i<scenes.length-1;i++){
  const curr=scenes[i],next=scenes[i+1];
  const currSrc=curr.asset?.src||curr.asset?.url;
  const nextSrc=next.asset?.src||next.asset?.url;
  if(currSrc&&nextSrc&&currSrc===nextSrc){
   redundancies.push({
    start:i,
    end:i+1,
    reason:`Mesma mídia utilizada repetidamente entre as cenas ${i+1} e ${i+2}.`
   });
  }
  const currCode=codesMap.get(curr.index)||curr.code||'';
  const nextCode=codesMap.get(next.index)||next.code||'';
  if(currCode&&nextCode&&isSplitScreenLayout(currCode)&&isSplitScreenLayout(nextCode)){
   redundancies.push({
    start:i,
    end:i+1,
    reason:`Padrão repetitivo de split-screen identificado consecutivamente nas cenas ${i+1} e ${i+2}.`
   });
  }
 }
 return redundancies;
}

/**
 * Pass 2: Authored Blocks Review before final render.
 * Detects unnecessary split-screens, visual redundancy, and monotony in consecutive photo or motion scenes.
 */
export function reviewAuthoredBlocks(scenes,codesMap=new Map()){
 const issues=[];

 // 1. Unnecessary split-screen detection
 scenes.forEach((scene,idx)=>{
  const code=codesMap.get(scene.index)||scene.code||'';
  if(code&&isSplitScreenLayout(code)){
   issues.push({
    sceneIndex:scene.index??idx,
    severity:'warning',
    type:'unnecessary-split-screen',
    reason:`Cena ${(scene.index??idx)+1} utiliza layout split-screen desnecessário, encolhendo a mídia em caixa lateral em vez de usar mídia full-bleed (1920x1080) com overlay integrado.`,
    proposedFix:'Expandir a mídia para cobrir a tela inteira (1920x1080) com objectFit cover e aplicar elementos gráficos como overlays translúcidos sobre a imagem.'
   });
  }
 });

 // 2. Visual redundancy between adjacent scenes
 const redundancies=detectVisualRedundancy(scenes,codesMap);
 for(const r of redundancies){
  issues.push({
   streakStart:r.start,
   streakEnd:r.end,
   severity:'warning',
   type:'visual-redundancy',
   reason:r.reason,
   proposedFix:'Variar a composição, perspectiva visual ou mídia para assegurar diversidade e dinamismo.'
  });
 }

 // 3. Photo streaks monotony check
 const streaks=photoStreaks(scenes).filter(s=>s.length>=3);
 for(const streak of streaks){
  const streakScenes=scenes.slice(streak.start,streak.end);
  const codes=streakScenes.map(s=>codesMap.get(s.index)||s.code||'').filter(Boolean);
  if(codes.length>=3){
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
