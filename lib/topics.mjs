import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync, readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import path from 'node:path';
import { preSearchTopic } from './topic-presearch.mjs';

export const SEED_TOPICS = [
  {
    seedId: 'v3-japan-earthquake-design',
    title: 'How Japan Builds Cities That Live with Earthquakes',
    description: 'Explore how buildings, transport systems, public drills and everyday design help Japanese cities prepare for earthquakes. Connect visible city life with clear explanations of engineering and its limits.',
    minutes: 15,
    generateShorts: true
  },
  {
    seedId: 'v3-netherlands-water-life',
    title: 'How the Netherlands Makes Room for Water',
    description: 'Follow the relationship between Dutch cities, rivers and flood defenses, showing how infrastructure and daily life adapt to water instead of treating it only as an enemy.',
    minutes: 15,
    generateShorts: true
  },
  {
    seedId: 'v3-singapore-water',
    title: 'Where Singapore Gets Its Water',
    description: 'Trace the different ways Singapore collects, treats and supplies water, linking reservoirs and urban life to the engineering behind a densely populated island city.',
    minutes: 15,
    generateShorts: true
  },
  {
    seedId: 'v3-panama-canal-journey',
    title: 'How Ships Cross the Panama Canal',
    description: 'Follow a ship\'s journey through the canal and explain how locks, water and navigation make the crossing possible, with a clear visual account of the mechanism and the people operating it.',
    minutes: 15,
    generateShorts: true
  },
  {
    seedId: 'v3-mongolia-seasons',
    title: 'How Mongolia’s Nomadic Herders Follow the Seasons',
    description: 'Follow the seasonal decisions of herding families, from moving camp to caring for animals, connecting the Mongolian landscape with everyday work and changes in modern life.',
    minutes: 15,
    generateShorts: true
  }
];

export function ensureSeedTopics(data) {
  let changed = false;
  for (const seed of SEED_TOPICS) {
    const exists = data.queue.some(t => t.seedId === seed.seedId || t.title.toLowerCase() === seed.title.toLowerCase());
    if (!exists) {
      data.queue.push({
        id: 'topic_' + seed.seedId,
        seedId: seed.seedId,
        title: seed.title,
        description: seed.description,
        minutes: seed.minutes || 15,
        generateShorts: seed.generateShorts !== false,
        status: 'pending',
        order: data.queue.length + 1,
        createdAt: new Date().toISOString(),
        processedAt: null,
        jobId: null,
        duplicateInfo: null
      });
      changed = true;
    }
  }
  return changed;
}

function getTopicsFile(dir) {
  return path.join(dir, 'topics.json');
}

export function loadTopicsData(dir, { seed = false } = {}) {
  const file = getTopicsFile(dir);
  let data = {
    queue: [],
    alerts: [],
    settings: {
      autoRunTime: '00:00',
      enabled: true,
      defaultMinutes: 15,
      defaultShorts: true,
      lastAutoRunDate: ''
    }
  };
  if (existsSync(file)) {
    try {
      const raw = readFileSync(file, 'utf8');
      const parsed = JSON.parse(raw);
      data = {
        queue: Array.isArray(parsed.queue) ? parsed.queue : [],
        alerts: Array.isArray(parsed.alerts) ? parsed.alerts : [],
        settings: {
          autoRunTime: parsed.settings?.autoRunTime || '00:00',
          enabled: parsed.settings?.enabled !== false,
          defaultMinutes: parsed.settings?.defaultMinutes || 15,
          defaultShorts: parsed.settings?.defaultShorts !== false,
          lastAutoRunDate: parsed.settings?.lastAutoRunDate || ''
        }
      };
    } catch {}
  }
  if (seed && ensureSeedTopics(data)) {
    saveTopicsData(dir, data);
  }
  return data;
}

export function saveTopicsData(dir, data) {
  const file = getTopicsFile(dir);
  const clean = {
    queue: Array.isArray(data.queue) ? data.queue : [],
    alerts: Array.isArray(data.alerts) ? data.alerts : [],
    settings: {
      autoRunTime: data.settings?.autoRunTime || '00:00',
      enabled: data.settings?.enabled !== false,
      defaultMinutes: data.settings?.defaultMinutes || 15,
      defaultShorts: data.settings?.defaultShorts !== false,
      lastAutoRunDate: data.settings?.lastAutoRunDate || ''
    }
  };
  writeFileSync(file, JSON.stringify(clean, null, 2), 'utf8');
  return clean;
}

export function addTopic(dir, rawTopic) {
  const data = loadTopicsData(dir);
  const id = 'topic_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
  const item = {
    id,
    title: String(rawTopic.title || '').trim(),
    description: String(rawTopic.description || '').trim(),
    minutes: Number(rawTopic.minutes) || data.settings.defaultMinutes || 15,
    generateShorts: rawTopic.generateShorts !== false,
    status: 'pending', // pending, running, completed, skipped_duplicate, error
    order: data.queue.length + 1,
    createdAt: new Date().toISOString(),
    processedAt: null,
    jobId: null,
    duplicateInfo: null
  };
  if (!item.title) throw new Error('O título da pauta é obrigatório.');
  data.queue.push(item);
  saveTopicsData(dir, data);
  return item;
}

export function addBulkTopics(dir, rawList) {
  if (!Array.isArray(rawList)) throw new Error('Lista de pautas inválida.');
  const added = [];
  for (const t of rawList) {
    if (t && t.title && typeof t.title === 'string' && t.title.trim().length >= 4) {
      added.push(addTopic(dir, t));
    }
  }
  return added;
}

export function parseBulkText(text) {
  if (!text || typeof text !== 'string') return [];
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const result = [];
  for (const line of lines) {
    // Check if format is "Title | Description" or "Title - Description" or just "Title"
    let title = line;
    let desc = '';
    if (line.includes('|')) {
      const parts = line.split('|');
      title = parts[0].trim();
      desc = parts.slice(1).join('|').trim();
    } else if (line.match(/^(\d+[\.\)]\s*)/)) {
      // Strips leading "1. " or "1) "
      title = line.replace(/^(\d+[\.\)]\s*)/, '').trim();
    }
    if (title.length >= 4) {
      result.push({ title, description: desc });
    }
  }
  return result;
}

export function updateTopic(dir, id, patch) {
  const data = loadTopicsData(dir);
  const idx = data.queue.findIndex(t => t.id === id);
  if (idx === -1) throw new Error('Pauta não encontrada.');
  const item = data.queue[idx];
  if (patch.title) item.title = String(patch.title).trim();
  if (patch.description !== undefined) item.description = String(patch.description).trim();
  if (patch.minutes) item.minutes = Number(patch.minutes) || item.minutes;
  if (patch.generateShorts !== undefined) item.generateShorts = Boolean(patch.generateShorts);
  if (patch.status) item.status = patch.status;
  if (patch.order !== undefined) item.order = Number(patch.order);
  if (patch.jobId) item.jobId = patch.jobId;
  if (patch.duplicateInfo !== undefined) item.duplicateInfo = patch.duplicateInfo;
  if (patch.processedAt) item.processedAt = patch.processedAt;
  saveTopicsData(dir, data);
  return item;
}

export function deleteTopic(dir, id) {
  const data = loadTopicsData(dir);
  data.queue = data.queue.filter(t => t.id !== id);
  // Reindex order
  data.queue.forEach((t, i) => { t.order = i + 1; });
  saveTopicsData(dir, data);
  return { success: true };
}

export function dismissAlert(dir, alertId) {
  const data = loadTopicsData(dir);
  const alert = data.alerts.find(a => a.id === alertId);
  if (alert) alert.dismissed = true;
  saveTopicsData(dir, data);
  return { success: true };
}

export function addAlert(dir, alert) {
  const data = loadTopicsData(dir);
  const newAlert = {
    id: 'alert_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
    type: alert.type || 'info', // duplicate_skipped, system_notice, error
    title: alert.title || 'Aviso da Produção',
    message: alert.message || '',
    advice: alert.advice || '',
    topicId: alert.topicId || null,
    jobId: alert.jobId || null,
    createdAt: new Date().toISOString(),
    dismissed: false
  };
  data.alerts.unshift(newAlert);
  // Keep last 40 alerts
  if (data.alerts.length > 40) data.alerts = data.alerts.slice(0, 40);
  saveTopicsData(dir, data);
  return newAlert;
}

export function getTokens(str) {
  return (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length >= 3);
}

export function computeTextSimilarity(t1, t2) {
  const tokens1 = new Set(getTokens(t1));
  const tokens2 = new Set(getTokens(t2));
  if (!tokens1.size || !tokens2.size) return 0;
  let intersection = 0;
  for (const token of tokens1) {
    if (tokens2.has(token)) intersection++;
  }
  const union = new Set([...tokens1, ...tokens2]).size;
  return Math.round((intersection / union) * 100);
}

export async function checkDuplicateWithGemini(candidateTopic, pastContents, geminiApiKey) {
  // If no past contents, definitely fresh
  if (!pastContents || pastContents.length === 0) {
    return { isDuplicate: false, similarityScore: 0, matchedTitle: null, matchedDate: null, advice: '' };
  }

  // Pre-filter with token similarity to find top 5 candidates
  const scored = pastContents.map(past => {
    const simTitle = computeTextSimilarity(candidateTopic.title, past.title);
    const simDesc = past.description ? computeTextSimilarity(candidateTopic.description || '', past.description) : 0;
    const score = Math.max(simTitle, Math.round((simTitle * 0.7) + (simDesc * 0.3)));
    return { ...past, fastScore: score };
  }).sort((a, b) => b.fastScore - a.fastScore);

  const topMatches = scored.slice(0, 5);

  // If Gemini API Key is available, use semantic evaluation
  if (geminiApiKey) {
    try {
      const prompt = `Você é o editor-chefe analítico de um canal de documentários de curiosidades geopolíticas e econômicas ("Atlas Studio").
Daniel (o criador) enviou uma NOVA PAUTA de vídeo:
Título: "${candidateTopic.title}"
Descrição/Ângulo: "${candidateTopic.description || 'Sem descrição específica'}"

Abaixo está o histórico de vídeos e pautas que o canal já produziu recentemente:
${topMatches.map((m, i) => `${i + 1}. Título: "${m.title}" (Data: ${m.date || 'recente'}) | Resumo: ${m.summary || m.description || 'N/A'}`).join('\n')}

Analise se a NOVA PAUTA é essencialmente REPETIDA ou se trata do MESMO ASSUNTO / MESMO ÂNGULO de algum dos vídeos anteriores (o que entediaria o público com conteúdo repetido).
Responda EXCLUSIVAMENTE em formato JSON com o seguinte schema:
{
  "isDuplicate": boolean, // true apenas se a abordagem for substancialmente repetida ou redundante (similaridade >= 70%)
  "similarityScore": number, // de 0 a 100
  "matchedTitle": string ou null, // o título do vídeo anterior que é similar
  "matchedDate": string ou null, // data do vídeo anterior
  "advice": string // Se for repetido, dê um conselho direto e amigável para Daniel, começando com "Daniel, ...", explicando por que é parecido e sugerindo um novo ângulo ou desfecho diferente para aproveitar a ideia no futuro. Se for inédito, deixe vazio.
}`;

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json', temperature: 0.2 }
        })
      });

      if (res.ok) {
        const json = await res.json();
        const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const parsed = JSON.parse(text);
          return {
            isDuplicate: Boolean(parsed.isDuplicate),
            similarityScore: Number(parsed.similarityScore) || 0,
            matchedTitle: parsed.matchedTitle || (parsed.isDuplicate ? topMatches[0]?.title : null),
            matchedDate: parsed.matchedDate || (parsed.isDuplicate ? topMatches[0]?.date : null),
            advice: parsed.advice || ''
          };
        }
      }
    } catch {
      // Fall back to heuristic
    }
  }

  // Fallback heuristic if Gemini fails or no key
  const best = topMatches[0];
  if (best && best.fastScore >= 60) {
    return {
      isDuplicate: true,
      similarityScore: best.fastScore,
      matchedTitle: best.title,
      matchedDate: best.date || 'recente',
      advice: `Daniel, o tema "${candidateTopic.title}" tem ${best.fastScore}% de semelhança com o vídeo já produzido "${best.title}". Aconselho você a abordar a curiosidade por um ângulo diferente ou com novos países para não repetir o conteúdo para o público.`
    };
  }

  return { isDuplicate: false, similarityScore: best?.fastScore || 0, matchedTitle: null, matchedDate: null, advice: '' };
}

export function getWorkerLeaseFile(dir) {
  return path.join(dir, 'worker.lease');
}

export function isWorkerLeaseActive(dir) {
  const file = getWorkerLeaseFile(dir);
  if (!existsSync(file)) return false;
  try {
    const data = JSON.parse(readFileSync(file, 'utf8'));
    if (data.expiresAt && Date.now() < Number(data.expiresAt)) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export function acquireWorkerLease(dir, info = {}) {
  const file = getWorkerLeaseFile(dir);
  if (isWorkerLeaseActive(dir)) {
    return null; // Busy
  }
  const lease = {
    workerId: info.workerId || 'worker_' + Date.now(),
    topicId: info.topicId || null,
    jobId: info.jobId || null,
    action: info.action || 'production',
    acquiredAt: Date.now(),
    expiresAt: Date.now() + (info.ttlMs || 45 * 60 * 1000)
  };
  try {
    writeFileSync(file, JSON.stringify(lease, null, 2), 'utf8');
    return lease;
  } catch {
    return null;
  }
}

export function renewWorkerLease(dir, workerId, ttlMs = 45 * 60 * 1000) {
  const file = getWorkerLeaseFile(dir);
  try {
    if (!existsSync(file)) return false;
    const data = JSON.parse(readFileSync(file, 'utf8'));
    if (!workerId || data.workerId === workerId) {
      data.expiresAt = Date.now() + ttlMs;
      writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
      return true;
    }
  } catch {}
  return false;
}

export function releaseWorkerLease(dir, workerId = null) {
  const file = getWorkerLeaseFile(dir);
  try {
    if (!existsSync(file)) return true;
    if (workerId) {
      const data = JSON.parse(readFileSync(file, 'utf8'));
      if (data.workerId !== workerId) return false;
    }
    unlinkSync(file);
    return true;
  } catch {
    return false;
  }
}

export function localProductionClock(now = new Date(), timezone = 'America/Bahia') {
  const values = Object.fromEntries(new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23'
  }).formatToParts(now).map(part => [part.type, part.value]));
  return { date: `${values.year}-${values.month}-${values.day}`, time: `${values.hour}:${values.minute}` };
}

export async function dailyTopicTick({ store, dir, geminiKey, settings, runProductionFn, now = new Date() }) {
  const data = loadTopicsData(dir);
  if (!data.settings?.enabled) return { status: 'disabled' };
  const local = localProductionClock(now);
  if (local.time < (data.settings.autoRunTime || '00:00') || data.settings.lastAutoRunDate === local.date) {
    return { status: 'not-due' };
  }
  const s = settings || (geminiKey ? { geminiKey } : (typeof store?.settings === 'function' ? store.settings() : {}));
  const result = await processNextTopicInQueue(store, s, runProductionFn);
  if (['started', 'all_duplicates_skipped', 'all_insufficient'].includes(result.status)) {
    const latest = loadTopicsData(dir);
    latest.settings.lastAutoRunDate = local.date;
    saveTopicsData(dir, latest);
  }
  return result;
}

export async function processNextTopicInQueue(store, settingsOrKey, runProductionFn, specificTopicId = null) {
  const dir = store?.dir || process.env.ATLAS_DATA_DIR || 'data';
  const s = typeof settingsOrKey === 'string' ? { ...(typeof store?.settings === 'function' ? store.settings() : {}), geminiKey: settingsOrKey } : (settingsOrKey || {});

  // Check if store has any running job or if worker lease is currently held
  if (store.list().some(j => j.status === 'running') || isWorkerLeaseActive(dir)) {
    return { status: 'busy', message: 'Worker ou produção em andamento; a próxima pauta será tentada novamente após a conclusão.' };
  }

  const data = loadTopicsData(dir);
  let pending = data.queue.filter(t => t.status === 'pending' || t.status === 'inconclusive').sort((a, b) => a.order - b.order);

  if (specificTopicId) {
    const specific = data.queue.find(t => t.id === specificTopicId);
    if (specific) {
      pending = [specific];
    }
  }

  if (pending.length === 0) {
    return { status: 'empty', message: 'Nenhuma pauta pendente na fila.' };
  }

  // Acquire worker lease
  const lease = acquireWorkerLease(dir, { action: 'evaluating_queue' });
  if (!lease) {
    return { status: 'busy', message: 'Não foi possível adquirir a trava do worker.' };
  }

  try {
    // Prepare past contents from jobs and completed topics for duplicate checking
    const pastJobs = store.list().map(j => ({
      id: j.id,
      title: j.title,
      description: j.research?.summary || j.script?.slice(0, 150) || '',
      date: j.scheduled?.targetDate || (j.createdAt ? new Date(j.createdAt).toLocaleDateString('pt-BR') : 'recente')
    }));

    const pastCompletedTopics = data.queue
      .filter(t => t.status === 'completed' && t.title)
      .map(t => ({
        id: t.id,
        title: t.title,
        description: t.description || '',
        date: t.processedAt ? new Date(t.processedAt).toLocaleDateString('pt-BR') : 'recente'
      }));

    const allPast = [...pastJobs, ...pastCompletedTopics];

    let evaluatedCount = 0;
    let aggregatedCostUsd = 0;
    const maxEvaluationAttempts = 10;
    const maxAggregatedBudgetUsd = 1.00;

    for (const candidate of pending) {
      if (evaluatedCount >= maxEvaluationAttempts || aggregatedCostUsd >= maxAggregatedBudgetUsd) {
        addAlert(dir, {
          type: 'limit_reached',
          title: 'Limite Diário de Avaliações Atingido',
          message: `O robô avaliou ${evaluatedCount} pautas ($${aggregatedCostUsd.toFixed(2)} gastos) sem aprovar um tema viável hoje. O ciclo foi encerrado para proteger o orçamento.`
        });
        break;
      }

      // Step 1: Duplicate check
      const dupCheck = await checkDuplicateWithGemini(candidate, allPast, s.geminiKey);
      if (dupCheck.isDuplicate && dupCheck.similarityScore >= 65) {
        candidate.status = 'skipped_duplicate';
        candidate.processedAt = new Date().toISOString();
        candidate.duplicateInfo = {
          matchedTitle: dupCheck.matchedTitle,
          matchedDate: dupCheck.matchedDate,
          similarityScore: dupCheck.similarityScore,
          advice: dupCheck.advice
        };
        saveTopicsData(dir, data);

        addAlert(dir, {
          type: 'duplicate_skipped',
          title: `Pauta Pulada: "${candidate.title}"`,
          message: `Identificamos que este tema é muito parecido com "${dupCheck.matchedTitle}". Para o seu canal não ficar sem vídeo hoje, o robô pulou esta pauta automaticamente e seguiu para a próxima da fila!`,
          advice: dupCheck.advice || `Daniel, o tema "${candidate.title}" é muito parecido com um vídeo anterior. Sugestão: tente um enfoque diferente.`,
          topicId: candidate.id
        });
        continue;
      }

      // Step 2: Economic Pre-Search & Feasibility Evaluation
      candidate.status = 'pre_evaluating';
      saveTopicsData(dir, data);

      const presearchRes = await preSearchTopic(candidate, s, { dir, maxCostUsd: 0.10 });
      evaluatedCount++;
      aggregatedCostUsd += (presearchRes.usage?.estimatedCostUsd || 0);

      if (presearchRes.status === 'insufficient') {
        candidate.status = 'insufficient';
        candidate.processedAt = new Date().toISOString();
        candidate.presearch = {
          status: presearchRes.status,
          evaluatedAt: presearchRes.evaluatedAt,
          costUsd: presearchRes.usage?.estimatedCostUsd,
          gaps: presearchRes.gaps,
          mediaSummary: presearchRes.mediaSummary
        };
        saveTopicsData(dir, data);

        addAlert(dir, {
          type: 'insufficient_media',
          title: `Acervo Insuficiente: "${candidate.title}"`,
          message: `Daniel, o tema "${candidate.title}" não teve conteúdo suficiente para um vídeo de 10 minutos.`,
          advice: presearchRes.gaps?.length ? `Lacunas identificadas: ${presearchRes.gaps.join(' | ')}` : 'Sugerimos explorar um tema com acervo fotográfico ou documental mais amplo.',
          topicId: candidate.id
        });

        // Continue to next topic so today's video production is never skipped!
        continue;
      }

      if (presearchRes.status === 'inconclusive') {
        candidate.status = 'inconclusive';
        candidate.presearch = {
          status: presearchRes.status,
          evaluatedAt: presearchRes.evaluatedAt,
          costUsd: presearchRes.usage?.estimatedCostUsd,
          reason: presearchRes.reason
        };
        saveTopicsData(dir, data);

        addAlert(dir, {
          type: 'inconclusive_presearch',
          title: `Pré-avaliação Inconclusiva: "${candidate.title}"`,
          message: presearchRes.reason || 'Falha transitória na checagem de mídias.',
          advice: 'A pauta permanece na fila para nova tentativa no próximo ciclo.',
          topicId: candidate.id
        });
        continue;
      }

      // Step 3: Candidate is APPROVED for 10-15 minutes!
      const targetMinutes = Math.min(15, Math.max(10, presearchRes.recommendedMinutes || candidate.minutes || 15));
      candidate.status = 'running';
      candidate.minutes = targetMinutes;
      candidate.processedAt = new Date().toISOString();
      candidate.presearch = {
        status: presearchRes.status,
        evaluatedAt: presearchRes.evaluatedAt,
        recommendedMinutes: targetMinutes,
        costUsd: presearchRes.usage?.estimatedCostUsd,
        mediaSummary: presearchRes.mediaSummary
      };
      saveTopicsData(dir, data);

      // Create production job in store with minimum 10 minutes and 5 Shorts
      const job = store.create({
        title: candidate.title,
        minutes: targetMinutes,
        productionVersion: 'v3',
        editorialVersion: 'observant-dry-v1',
        generateShorts: candidate.generateShorts !== false,
        shortsCount: candidate.generateShorts !== false ? 5 : 0,
        notes: candidate.description || '',
        topicId: candidate.id,
        presearchInventory: presearchRes.inventory || []
      });

      candidate.jobId = job.id;
      saveTopicsData(dir, data);

      // Extend lease for production runtime
      renewWorkerLease(dir, lease.workerId, 90 * 60 * 1000);

      // Trigger production asynchronously
      if (typeof runProductionFn === 'function') {
        runProductionFn(job.id, candidate)
          .then(() => {
            releaseWorkerLease(dir, lease.workerId);
          })
          .catch(err => {
            releaseWorkerLease(dir, lease.workerId);
            candidate.status = 'error';
            saveTopicsData(dir, data);
            addAlert(dir, {
              type: 'error',
              title: `Erro na Produção: "${candidate.title}"`,
              message: err.message || 'Falha na produção automática.',
              topicId: candidate.id,
              jobId: job.id
            });
          });
      } else {
        releaseWorkerLease(dir, lease.workerId);
      }

      return {
        status: 'started',
        topic: candidate,
        jobId: job.id,
        recommendedMinutes: targetMinutes
      };
    }

    releaseWorkerLease(dir, lease.workerId);
    return {
      status: 'all_insufficient',
      message: 'Todas as pautas avaliadas hoje eram insuficientes ou duplicadas. Adicione novos temas ao banco.'
    };
  } catch (err) {
    releaseWorkerLease(dir, lease.workerId);
    throw err;
  }
}
