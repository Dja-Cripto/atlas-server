import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { gemini, goResponseText, footage, photos, pixabay, pixabayImages } from './providers.mjs';
import { commons, commonsVideos, libraryOfCongress, candidateMeetsFullHd, cachedDownload } from './auto-media.mjs';
import { judgeBatch, MIN_SCORE } from './visual-judge.mjs';

export function estimateTokensCost(promptTokens = 0, candidateTokens = 0) {
  // Gemini 2.5 Flash / 3.6 Flash pricing: $0.075 / 1M prompt, $0.30 / 1M completion
  const inputCost = (Number(promptTokens) || 0) * (0.075 / 1_000_000);
  const outputCost = (Number(candidateTokens) || 0) * (0.30 / 1_000_000);
  return Number((inputCost + outputCost).toFixed(6));
}

export function deduplicateCandidates(items) {
  const map = new Map();
  for (const item of items || []) {
    if (!item) continue;
    const key = String(item.url || item.download || (item.source + ':' + item.id)).trim().toLowerCase();
    if (!key) continue;
    if (map.has(key)) {
      const existing = map.get(key);
      existing.queries = [...new Set([...(existing.queries || []), ...(item.queries || [])])];
    } else {
      map.set(key, { ...item, queries: Array.isArray(item.queries) ? [...item.queries] : [] });
    }
  }
  return [...map.values()];
}

export function shortMediaQuery(query){
 return String(query||'').replace(/\b(?:footage|timelapse|time lapse|aerial|video|photograph|photo|operation|operating|historical|archive|geography|geographic|view|modern|cinematic|approach)\b/gi,' ').replace(/\s+/g,' ').trim();
}
export function verifiedMediaCapacity(items){
 const unique=deduplicateCandidates(items);
 return {assets:unique.length,videoSeconds:unique.filter(c=>c.files?.length).reduce((n,c)=>n+Math.min(15,Math.max(0,Number(c.duration)||0)),0)};
}
export async function preSearchTopic(candidateTopic, s, { dir = 'data', maxCostUsd = 0.10, judgeCall, searchers = {}, planner, fetchImage: fetchImageOverride, onProgress=async()=>{} } = {}) {
  const {commonsPhotos = commons, commonsClips = commonsVideos, stockVideos = footage, stockPhotos = photos, archive = libraryOfCongress} = searchers;
  const result = {
    topicId: candidateTopic.id,
    title: candidateTopic.title,
    status: 'inconclusive', // 'approved' | 'insufficient' | 'inconclusive'
    recommendedMinutes: null,
    reason: '',
    gaps: [],
    mediaSummary: {
      totalFound: 0,
      uniquePhotos: 0,
      uniqueVideos: 0,
      openingVideoCandidates: 0,
      coveredBlocksCount: 0,
      totalBlocksCount: 0
    },
    blocks: [],
    usage: {
      promptTokens: 0,
      candidateTokens: 0,
      estimatedCostUsd: 0
    },
    evaluatedAt: new Date().toISOString()
  };

  try {
    // Stage 1: Generate a concise 4-block narrative outline and targeted queries
    const prompt = `You are the lead visual researcher for "Atlas Studio", an international factual curiosity channel.
We are pre-evaluating if a proposed topic has enough real factual media (footage and photos) to sustain a 10 to 15 minute video (minimum 10 minutes, approx 80-100 scenes).

Proposed Topic: "${candidateTopic.title}"
Creator Notes: "${candidateTopic.description || 'Focus on factual geography, human context and systemic mechanisms.'}"

Provide a structured 4-block narrative plan. Include topicAliases (2-3 SHORT exact entity names in English/local language, e.g. "Panama Canal", "Canal de Panama"). Each block needs essentialSubjects (1-2 concrete visually verifiable subjects truly necessary for that block) and searchQueries (2-5 words, entity names, not sentences). Separate generic contextual support from specific local mechanisms. Essential subjects are the minimum visual concepts needed to answer the creator question, not every example that could appear in a script. Do not invent mandatory named vehicles, brands, explorers, control centers or historical artifacts for a broad topic. Put interchangeable named examples in optionalSubjects. Require a specific identity only when the creator explicitly requests it or the topic cannot be explained truthfully without it. For a general exploration topic, equipment and its operation can be essential; a particular named machine is optional unless that machine is the topic. Generic footage must never be claimed to depict a named example. Separate narrated scientific concepts from physical subjects that need documentary imagery. A force, quantity or scale can be explained with an accurate graphic over relevant real media; never invent a mandatory measuring instrument to prove that concept. Instruments or vehicles introduced only by the planner belong in optionalSubjects unless explicitly requested by the creator. Choose a narrative that can stand without the optional examples; do not silently relax explicit creator requirements.
Respond strictly in JSON with this schema:
{
  "blocks": [
    {
      "id": "block-1",
      "purpose": "Opening hook and core question",
      "essentialSubjects": ["exact subject or place"],
      "optionalSubjects": ["interchangeable named example, if useful"],
      "searchQueries": ["entity query", "local language query or regional setting"]
    },
    {
      "id": "block-2",
      "purpose": "Context needed to understand the central question",
      "essentialSubjects": ["visually relevant context central to this topic"],
      "searchQueries": ["historical query", "context query"]
    },
    {
      "id": "block-3",
      "purpose": "Explain the central mechanism or scale",
      "essentialSubjects": ["visible subject central to the explanation; not an invented instrument"],
      "searchQueries": ["mechanism query", "action query"]
    },
    {
      "id": "block-4",
      "purpose": "Resolve the question and its directly relevant consequences",
      "essentialSubjects": ["visible subject needed for the payoff, without unrelated tangents"],
      "searchQueries": ["current landscape query", "broader region query"]
    }
  ],
  "topicAliases": ["short exact topic name", "local name"],
  "broadQueries": ["2-4 essential search queries in English and local names"]
}`;

    const outlineRes = planner ? await planner(prompt) : s.textProvider==='go' ? {text:await goResponseText(s,{id:candidateTopic.id||'presearch'},prompt,{model:s.scriptModel||'gpt-6-luna'})} : await gemini(s, prompt, {
      generationConfig: { responseMimeType: 'application/json', temperature: 0.2 }
    });

    const promptTokens = Number(outlineRes.usage?.promptTokens || outlineRes.usage?.promptTokenCount || 400);
    const candidateTokens = Number(outlineRes.usage?.candidatesTokens || outlineRes.usage?.candidatesTokenCount || 350);
    result.usage.promptTokens += promptTokens;
    result.usage.candidateTokens += candidateTokens;
    result.usage.estimatedCostUsd = estimateTokensCost(result.usage.promptTokens, result.usage.candidateTokens);

    if (result.usage.estimatedCostUsd > maxCostUsd) {
      result.status = 'inconclusive';
      result.reason = `Teto de orçamento de pré-avaliação ($${maxCostUsd}) atingido.`;
      return result;
    }

    let parsedPlan = { blocks: [], broadQueries: [] };
    try {
      const text = outlineRes.text || (typeof outlineRes === 'string' ? outlineRes : JSON.stringify(outlineRes));
      parsedPlan = JSON.parse(text.replace(/^```json/m, '').replace(/```$/m, '').trim());
    } catch {
      parsedPlan = {
        blocks: [
          { id: 'block-1', purpose: 'Opening', searchQueries: [candidateTopic.title] },
          { id: 'block-2', purpose: 'Context', searchQueries: [candidateTopic.title + ' history'] },
          { id: 'block-3', purpose: 'Mechanism', searchQueries: [candidateTopic.title + ' aerial'] },
          { id: 'block-4', purpose: 'Consequences', searchQueries: [candidateTopic.title + ' landscape'] }
        ],
        broadQueries: [candidateTopic.title]
      };
    }

    const blocks = Array.isArray(parsedPlan.blocks) ? parsedPlan.blocks : [];
    result.blocks = blocks;
    result.mediaSummary.totalBlocksCount = blocks.length;

    const aliases=[...new Set((parsedPlan.topicAliases||parsedPlan.broadQueries||[]).map(shortMediaQuery).filter(Boolean))].slice(0,3);
    const rawCandidates=[];const searchAudit=[];let searchesRun=0,searchesFailed=0;
    const searched=new Set();
    const attempt=async(source,query,fn)=>{
      searchesRun++;try{const found=await fn();rawCandidates.push(...found.map(c=>({...c,queries:[query]})));searchAudit.push({source,query,count:found.length});}
      catch(error){searchesFailed++;searchAudit.push({source,query,count:0,error:String(error.message).replace(/https?:\/\/\S+/g,'[endpoint]').slice(0,160)});}
    };
    const search=async(query,page=1)=>{
      query=shortMediaQuery(query);const key=query+'|'+page;if(!query||searched.has(key))return;searched.add(key);
      const tasks=[];
      if(page===1){tasks.push(()=>attempt('Wikimedia photos',query,()=>commonsPhotos(query)),()=>attempt('Wikimedia videos',query,()=>commonsClips(query)));}
      if(s.pexelsKey)tasks.push(()=>attempt('Pexels videos',query,()=>stockVideos(s,query,{perPage:15,page})),()=>attempt('Pexels photos',query,()=>stockPhotos(s,query,{perPage:15,page})));
      if(s.pixabayKey)tasks.push(()=>attempt('Pixabay videos',query,()=> (searchers.pixabayVideos||pixabay)(s,query,{perPage:15,page})),()=>attempt('Pixabay photos',query,()=> (searchers.pixabayPhotos||pixabayImages)(s,query,{perPage:15,page})));
      if(page===1)tasks.push(()=>attempt('Library of Congress',query,()=>archive(query)));
      // Bounded parallelism, same provider quotas; no retries to bypass limits.
      for(let i=0;i<tasks.length;i+=3)await Promise.allSettled(tasks.slice(i,i+3).map(fn=>fn()));
    };
    const initial=[...new Set([...aliases,...blocks.flatMap(b=>b.searchQueries||[]).map(shortMediaQuery)])].slice(0,12);
    for(const q of initial)await search(q);
    const fetchImage=fetchImageOverride||(url=>cachedDownload(dir,url,5_000_000));
    const verdictsById=new Map();const assessments=[];const reviewers=[];let sampled=0,judgeFailures=0,judgedCalls=0,budgetStopped=false;
    for(const block of blocks){
      const essential=Array.isArray(block.essentialSubjects)?block.essentialSubjects:(block.requiredSubjects||[]);
      const seen=new Set();const accepted=new Map();const covered=new Set();let reviewed=0;
      const pseudoScene={id:block.id,heading:block.purpose,narration:[block.purpose,...essential].join('. '),topic:candidateTopic.title,essentialSubjects:essential,query:(block.searchQueries||[])[0]||aliases[0],narrativeRole:'context'};
      const review=async(limit,videoOnly=false)=>{
        const words=shortMediaQuery([...essential,...(block.searchQueries||[])].join(' ')).toLowerCase().match(/[a-z]{4,}/g)||[];
        const rank=c=>words.reduce((n,w)=>n+Number([c.title,c.locationEvidence].join(' ').toLowerCase().includes(w)),0)+((block.searchQueries||[]).some(q=>c.queries?.includes(shortMediaQuery(q)))?5:0);
        const pool=deduplicateCandidates(rawCandidates).filter(candidateMeetsFullHd).filter(c=>!seen.has(c.source+':'+c.id)&&(!videoOnly||c.files?.length)).sort((a,b)=>rank(b)-rank(a));
        // Reserve both media types and multiple providers; topic tags only rank.
        const selection=[];const providers=[...new Set(pool.map(c=>c.source))];
        for(let i=0;selection.length<limit;i++){let added=false;for(const source of providers)for(const video of [true,false]){const group=pool.filter(c=>c.source===source&&Boolean(c.files?.length)===video);if(group[i]){selection.push(group[i]);added=true;}}if(!added)break;}
        const reviewBatchSize=s.visualProvider==='go'?2:8;
        for(let i=0;i<Math.min(limit,selection.length);i+=reviewBatchSize){
          if(estimateTokensCost(result.usage.promptTokens,result.usage.candidateTokens)>=maxCostUsd){budgetStopped=true;break;}
          const batch=selection.slice(i,Math.min(i+reviewBatchSize,limit));batch.forEach(c=>seen.add(c.source+':'+c.id));
          const r=await judgeBatch(s,pseudoScene,batch,{fetchImage,call:judgeCall});judgedCalls++;if(r.failed)judgeFailures++;
          result.usage.promptTokens+=Number(r.usage?.promptTokenCount||0);result.usage.candidateTokens+=Number(r.usage?.candidatesTokenCount||0);
          for(const item of r.items){if(!item.verdict)continue;sampled++;reviewed++;const key=item.candidate.source+':'+item.candidate.id;
            const ok=item.verdict.role!=='unrelated'&&item.verdict.score>=MIN_SCORE;
            const coveredSubjects=(item.verdict.coveredSubjects||[]).filter(subject=>essential.includes(subject));
            const v={...item.verdict,coveredSubjects,ok,candidate:item.candidate,blockId:block.id};
            const old=verdictsById.get(key);if(!old||(!old.ok&&ok))verdictsById.set(key,v);
            if(ok){accepted.set(key,v);coveredSubjects.forEach(subject=>covered.add(subject));}
          }
        }
      };
      await review(32);
      let deepened=false;
      if(accepted.size<3||essential.some(subject=>!covered.has(subject))){
        deepened=true;const missing=essential.filter(subject=>!covered.has(subject));
        for(const q of [...new Set([...missing,...(block.searchQueries||[])])].slice(0,4)){await search(q);await search(q,2);}
        await review(32);
      }
      const assessment={...block,essentialSubjects:essential,reviewed,usable:accepted.size,coveredSubjects:[...covered],missingSubjects:essential.filter(subject=>!covered.has(subject)),deepened,coverageVerified:accepted.size>=3&&essential.length>0&&essential.every(subject=>covered.has(subject))};
      assessments.push(assessment);
      reviewers.push(async()=>{const before=seen.size;await review(32,true);Object.assign(assessment,{reviewed,usable:accepted.size,coveredSubjects:[...covered],missingSubjects:essential.filter(subject=>!covered.has(subject)),coverageVerified:accepted.size>=3&&essential.length>0&&essential.every(subject=>covered.has(subject))});return seen.size>before;});
      await onProgress({phase:'block-review',block:block.id,usable:accepted.size,missing:assessment.missingSubjects});
    }
    // Review remaining clips when duration is short; do not extrapolate approval.
    for(let round=0;round<3&&!budgetStopped;round++){
      if(verifiedMediaCapacity([...verdictsById.values()].filter(v=>v.ok).map(v=>v.candidate)).videoSeconds>=300)break;
      let progressed=false;
      for(const reviewMore of reviewers){progressed=(await reviewMore())||progressed;if(budgetStopped)break;}
      await onProgress({phase:'duration-review',round:round+1,seconds:verifiedMediaCapacity([...verdictsById.values()].filter(v=>v.ok).map(v=>v.candidate)).videoSeconds});
      if(!progressed)break;
    }
    const inventory=deduplicateCandidates(rawCandidates);const hd=inventory.filter(candidateMeetsFullHd);
    const ok=[...verdictsById.values()].filter(v=>v.ok);const clips=ok.filter(v=>v.candidate.files?.length&&Number(v.candidate.duration)>=4);const images=ok.filter(v=>!v.candidate.files?.length);
    const capacity=verifiedMediaCapacity(ok.map(v=>v.candidate));
    const coveredBlocks=assessments.filter(b=>b.coverageVerified).length;
    const opening=assessments[0];const openingCandidates=clips.filter(v=>v.blockId===opening?.id&&Number(v.candidate.duration)>=6);
    const reviewerWorked=sampled>0&&!budgetStopped&&judgeFailures<Math.max(2,judgedCalls*.5);
    const representative=searchesRun>=12&&searchesFailed/Math.max(1,searchesRun)<.34&&hd.length>=30;
    result.blocks=assessments;result.searchAudit=searchAudit;
    result.mediaSummary={...result.mediaSummary,totalFound:inventory.length,hdFound:hd.length,searchesRun,searchesFailed,sources:Object.fromEntries([...new Set(inventory.map(c=>c.source))].map(src=>[src,inventory.filter(c=>c.source===src).length])),rawVideos:hd.filter(c=>c.files?.length).length,rawPhotos:hd.filter(c=>!c.files?.length).length,uniqueVideos:clips.length,uniquePhotos:images.length,reviewedVisually:sampled,usableAfterReview:ok.length,projectedUsable:ok.length,estimatedVideoSeconds:capacity.videoSeconds,verifiedVideoSeconds:capacity.videoSeconds,coveredBlocksCount:coveredBlocks,openingVideoCandidates:openingCandidates.length,totalBlocksCount:blocks.length,pixabayConfigured:Boolean(s.pixabayKey)};
    result.usage.estimatedCostUsd=estimateTokensCost(result.usage.promptTokens,result.usage.candidateTokens);
    result.mediaPlan={narrativeBlocks:assessments.map(b=>({purpose:b.purpose,essentialSubjects:b.essentialSubjects,optionalSubjects:b.optionalSubjects||[],coveredSubjects:b.coveredSubjects})),basis:'visually-reviewed-candidates-only',maxSecondsPerVideo:15,videoSeconds:capacity.videoSeconds,sources:ok.map(v=>({source:v.candidate.source,id:v.candidate.id,url:v.candidate.url,blockId:v.blockId,kind:v.candidate.files?.length?'video':'photo',usableSeconds:v.candidate.files?.length?Math.min(15,Number(v.candidate.duration)||0):0})),requiresSceneAllocation:true};
    result.inventory=ok.map(v=>({...v.candidate,presearchReview:{score:v.score,role:v.role,coveredSubjects:v.coveredSubjects,blockId:v.blockId}}));
    for(const b of assessments)if(!b.coverageVerified)result.gaps.push('Bloco "'+b.purpose+'": '+b.usable+' mídias aprovadas; assuntos sem evidência: '+(b.missingSubjects.join(', ')||'variedade insuficiente')+'.');
    if(capacity.videoSeconds<300)result.gaps.push('Filmagem visualmente verificada: '+Math.round(capacity.videoSeconds)+'s; necessários pelo menos300s para10min. Arquivos não avaliados não contam.');
    if(searchesFailed)result.gaps.push(searchesFailed+' de '+searchesRun+' buscas falharam; consultar auditoria por fonte.');
    if(!s.pixabayKey)result.gaps.push('Chave do Pixabay não configurada: fonte ignorada.');
    if(!s.pexelsKey)result.gaps.push('Chave do Pexels não configurada: fonte ignorada.');
    const enough=capacity.assets>=20&&capacity.videoSeconds>=300&&openingCandidates.length>0&&blocks.length>0&&coveredBlocks===blocks.length&&reviewerWorked;
    if(enough){result.status='approved';result.recommendedMinutes=capacity.assets>=35&&capacity.videoSeconds>=450?15:capacity.assets>=28&&capacity.videoSeconds>=360?12:10;result.reason='Acervo visualmente verificado: '+ok.length+' mídias ('+clips.length+' vídeos, '+images.length+' fotos), '+Math.round(capacity.videoSeconds)+'s de filmagem utilizável e todos os blocos cobertos; '+result.recommendedMinutes+' minutos.';}
    else if(!reviewerWorked||!representative||budgetStopped||hd.some(c=>!verdictsById.has(c.source+':'+c.id))){result.status='inconclusive';result.reason='Pré-avaliação inconclusiva: lacunas de cobertura ou duração após aprofundamento. Acervo não avaliado, falhas de fonte ou revisão incompleta impedem comprovar escassez; produção não liberada.';}
    else{result.status='insufficient';result.reason='Acervo avaliado e buscas aprofundadas sem material relevante suficiente para10min; produção não iniciada.';}

    // Persist presearch inventory to data/presearch/${candidateTopic.id}.json
    const presearchDir = path.join(dir, 'presearch');
    await mkdir(presearchDir, { recursive: true });
    const presearchFile = path.join(presearchDir, `${candidateTopic.id}.json`);
    await writeFile(presearchFile, JSON.stringify({
      ...result,
      inventory: inventory,
      reviews: [...verdictsById.entries()].map(([key, v]) => ({ key, blockId:v.blockId, coveredSubjects:v.coveredSubjects, score: v.score, role: v.role, sees: v.sees, reason: v.reason, ok: v.ok, source: v.candidate.source, title: v.candidate.title || '', url: v.candidate.url, image: v.candidate.image, kind: v.candidate.files?.length ? 'video' : 'photo', duration: v.candidate.duration || null }))
    }, null, 2), 'utf8');

    return result;
  } catch (err) {
    result.status = 'inconclusive';
    result.reason = `Falha na pré-avaliação do tema: ${err.message || 'Erro transitório'}`;
    return result;
  }
}
