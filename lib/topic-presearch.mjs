import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { gemini, footage, photos } from './providers.mjs';
import { commons, commonsVideos, libraryOfCongress } from './auto-media.mjs';

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

export async function preSearchTopic(candidateTopic, s, { dir = 'data', maxCostUsd = 0.10 } = {}) {
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
    const prompt = `You are the lead visual researcher for "Atlas Studio", an international documentary channel.
We are pre-evaluating if a proposed topic has enough real factual media (footage and photos) to sustain a 10 to 15 minute video (minimum 10 minutes, approx 80-100 scenes).

Proposed Topic: "${candidateTopic.title}"
Creator Notes: "${candidateTopic.description || 'Focus on factual geography, human context and systemic mechanisms.'}"

Provide a structured 4-block narrative plan and broad search queries.
Respond strictly in JSON with this schema:
{
  "blocks": [
    {
      "id": "block-1",
      "purpose": "Opening hook and core question",
      "requiredSubjects": ["exact subject or place"],
      "searchQueries": ["entity query", "local language query or regional setting"]
    },
    {
      "id": "block-2",
      "purpose": "Historical and geographic context",
      "requiredSubjects": ["monuments, treaties, terrain or city"],
      "searchQueries": ["historical query", "context query"]
    },
    {
      "id": "block-3",
      "purpose": "Core mechanisms, systems or daily life",
      "requiredSubjects": ["infrastructure, people, operation or work"],
      "searchQueries": ["mechanism query", "action query"]
    },
    {
      "id": "block-4",
      "purpose": "Modern consequences, resolution and outlook",
      "requiredSubjects": ["landscape, borders, citizens or future"],
      "searchQueries": ["current landscape query", "broader region query"]
    }
  ],
  "broadQueries": ["2-4 essential search queries in English and local names"]
}`;

    const outlineRes = await gemini(s, prompt, {
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

    // Collect all queries to search
    const allQueries = [
      ...(parsedPlan.broadQueries || []),
      ...blocks.flatMap(b => b.searchQueries || [])
    ].map(q => String(q).trim()).filter(Boolean);
    const uniqueQueries = [...new Set(allQueries)].slice(0, 8);

    // Stage 2: Media Gathering across Free/Configured APIs
    const rawCandidates = [];

    for (const query of uniqueQueries) {
      // 1. Commons Photos (Free)
      try {
        const cPhotos = await commons(query);
        rawCandidates.push(...cPhotos.map(item => ({ ...item, queries: [query] })));
      } catch {}

      // 2. Commons Videos (Free)
      try {
        const cVideos = await commonsVideos(query);
        rawCandidates.push(...cVideos.map(item => ({ ...item, queries: [query] })));
      } catch {}

      // 3. Pexels Videos & Photos (Free official tier)
      if (s.pexelsKey) {
        try {
          const pVideos = await footage(s, query, { perPage: 8 });
          rawCandidates.push(...pVideos.map(item => ({ ...item, queries: [query] })));
        } catch {}
        try {
          const pPhotos = await photos(s, query, { perPage: 8 });
          rawCandidates.push(...pPhotos.map(item => ({ ...item, queries: [query] })));
        } catch {}
      }

      // 4. Library of Congress (Free)
      try {
        const locPhotos = await libraryOfCongress(query);
        rawCandidates.push(...locPhotos.map(item => ({ ...item, queries: [query] })));
      } catch {}
    }

    const uniqueMedia = deduplicateCandidates(rawCandidates);
    const videos = uniqueMedia.filter(c => c.files?.length && Number(c.duration) >= 4);
    const photosList = uniqueMedia.filter(c => !c.files?.length);

    // Identify opening video candidates: video >= 6s with relevant subject/location
    const openingCandidates = videos.filter(v => Number(v.duration) >= 6);

    result.mediaSummary.totalFound = uniqueMedia.length;
    result.mediaSummary.uniquePhotos = photosList.length;
    result.mediaSummary.uniqueVideos = videos.length;
    result.mediaSummary.openingVideoCandidates = openingCandidates.length;

    // Check block coverage: count how many blocks have at least 1 relevant media item
    let coveredBlocks = 0;
    const blockGaps = [];

    for (const block of blocks) {
      const bQueries = (block.searchQueries || []).map(q => q.toLowerCase().trim());
      const bTokens = (block.requiredSubjects || []).flatMap(s => s.toLowerCase().split(/\s+/)).filter(w => w.length >= 4);
      const hasMedia = uniqueMedia.some(m => {
        if (m.queries?.some(q => bQueries.includes(q.toLowerCase().trim()))) return true;
        const text = [m.title, m.locationEvidence].join(' ').toLowerCase();
        return bQueries.some(bq => bq.split(/\s+/).filter(w => w.length >= 4).some(word => text.includes(word))) ||
               bTokens.some(tok => text.includes(tok));
      });
      if (hasMedia) {
        coveredBlocks++;
      } else {
        blockGaps.push(`Bloco "${block.purpose || block.id}" sem mídia relevante encontrada.`);
      }
    }

    result.mediaSummary.coveredBlocksCount = coveredBlocks;

    // Stage 3: Feasibility Decision for a 10 to 15-minute video (600s - 900s)
    // Minimum 10 minutes requires at least 20 distinct media items and at least 1 opening video.
    const totalDistinctAssets = photosList.length + videos.length;
    const hasOpening = openingCandidates.length > 0;
    const hasSufficientBreadth = coveredBlocks >= Math.min(3, blocks.length);
    // File counts alone cannot establish the 50% footage requirement for a
    // ten-minute production. Limit each source's estimate to a short distinct
    // excerpt; this is a preliminary budget, not proof of editorial relevance.
    const estimatedVideoSeconds=videos.reduce((sum,item)=>sum+Math.min(15,Math.max(0,Number(item.duration)||0)),0);
    result.mediaSummary.estimatedVideoSeconds=estimatedVideoSeconds;

    if (totalDistinctAssets >= 20 && hasOpening && hasSufficientBreadth && estimatedVideoSeconds>=300) {
      result.status = 'approved';
      // Recommend between 10 and 15 minutes depending on volume
      if (totalDistinctAssets >= 35 && videos.length >= 8 && estimatedVideoSeconds>=450) {
        result.recommendedMinutes = 15;
      } else if (totalDistinctAssets >= 28 && estimatedVideoSeconds>=360) {
        result.recommendedMinutes = 12;
      } else {
        result.recommendedMinutes = 10;
      }
      result.reason = `Acervo suficiente aprovado (${totalDistinctAssets} mídias distintas, ${videos.length} vídeos e ${photosList.length} fotos) para sustentar ${result.recommendedMinutes} minutos.`;
    } else {
      result.status = 'insufficient';
      if(totalDistinctAssets>=20&&hasOpening&&hasSufficientBreadth&&estimatedVideoSeconds<300)result.status='inconclusive';
      result.reason = `Daniel, o tema "${candidateTopic.title}" não teve conteúdo suficiente para um vídeo de 10 minutos.`;
      if(result.status==='inconclusive')result.reason=`Daniel, há mídias para "${candidateTopic.title}", mas a duração de filmagem ainda não foi comprovada para10min. Produção não iniciada; avaliação inconclusiva.`;
      if(estimatedVideoSeconds<300)result.gaps.push(`Filmagem estimada em ${Math.round(estimatedVideoSeconds)}s, abaixo dos 300s necessários para 50% de um vídeo de10min; avaliação preliminar, não prova de inexistência na internet.`);
      
      if (!hasOpening) {
        result.gaps.push('Nenhuma filmagem em vídeo real compatível para a abertura do tema.');
      }
      if (totalDistinctAssets < 20) {
        result.gaps.push(`Acervo total escasso: apenas ${totalDistinctAssets} mídias distintas encontradas (mínimo de 20 para 10 minutos).`);
      }
      result.gaps.push(...blockGaps);
    }

    // Persist presearch inventory to data/presearch/${candidateTopic.id}.json
    const presearchDir = path.join(dir, 'presearch');
    await mkdir(presearchDir, { recursive: true });
    const presearchFile = path.join(presearchDir, `${candidateTopic.id}.json`);
    await writeFile(presearchFile, JSON.stringify({
      ...result,
      inventory: uniqueMedia.slice(0, 100)
    }, null, 2), 'utf8');

    return result;
  } catch (err) {
    result.status = 'inconclusive';
    result.reason = `Falha na pré-avaliação do tema: ${err.message || 'Erro transitório'}`;
    return result;
  }
}
