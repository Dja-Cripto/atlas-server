import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

function getTopicsFile(dir) {
  return path.join(dir, 'topics.json');
}

export function loadTopicsData(dir) {
  const file = getTopicsFile(dir);
  if (!existsSync(file)) {
    return {
      queue: [],
      alerts: [],
      settings: {
        autoRunTime: '00:00',
        enabled: true,
        defaultMinutes: 15,
        defaultShorts: true
      }
    };
  }
  try {
    const raw = readFileSync(file, 'utf8');
    const parsed = JSON.parse(raw);
    return {
      queue: Array.isArray(parsed.queue) ? parsed.queue : [],
      alerts: Array.isArray(parsed.alerts) ? parsed.alerts : [],
      settings: {
        autoRunTime: parsed.settings?.autoRunTime || '00:00',
        enabled: parsed.settings?.enabled !== false,
        defaultMinutes: parsed.settings?.defaultMinutes || 15,
        defaultShorts: parsed.settings?.defaultShorts !== false
      }
    };
  } catch {
    return { queue: [], alerts: [], settings: { autoRunTime: '00:00', enabled: true, defaultMinutes: 15, defaultShorts: true } };
  }
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
      defaultShorts: data.settings?.defaultShorts !== false
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

export async function processNextTopicInQueue(store, geminiKey, runProductionFn, specificTopicId = null) {
  const dir = store?.dir || process.env.ATLAS_DATA_DIR || 'data';
  const data = loadTopicsData(dir);
  let pending = data.queue.filter(t => t.status === 'pending').sort((a, b) => a.order - b.order);

  if (specificTopicId) {
    const specific = pending.find(t => t.id === specificTopicId);
    if (specific) {
      pending = [specific];
    }
  }

  if (pending.length === 0) {
    return { status: 'empty', message: 'Nenhuma pauta pendente na fila.' };
  }

  // Prepare past contents from jobs and completed topics
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

  // Try candidate topics in order until one is accepted or queue exhausted
  for (const candidate of pending) {
    const dupCheck = await checkDuplicateWithGemini(candidate, allPast, geminiKey);

    if (dupCheck.isDuplicate && dupCheck.similarityScore >= 65) {
      // Mark candidate as skipped_duplicate
      candidate.status = 'skipped_duplicate';
      candidate.processedAt = new Date().toISOString();
      candidate.duplicateInfo = {
        matchedTitle: dupCheck.matchedTitle,
        matchedDate: dupCheck.matchedDate,
        similarityScore: dupCheck.similarityScore,
        advice: dupCheck.advice
      };
      saveTopicsData(dir, data);

      // Create notification in Daniel's Hub
      addAlert(dir, {
        type: 'duplicate_skipped',
        title: `Pauta Pulada: "${candidate.title}"`,
        message: `Identificamos que este tema é muito parecido com "${dupCheck.matchedTitle}". Para o seu canal não ficar sem vídeo hoje, o robô pulou esta pauta automaticamente e seguiu para a próxima da fila!`,
        advice: dupCheck.advice || `Daniel, o tema "${candidate.title}" é muito parecido com um vídeo anterior. Sugestão: tente um enfoque diferente.`,
        topicId: candidate.id
      });

      // Continue to next pending topic in loop! (So the day is never without a video!)
      continue;
    }

    // Found a fresh, approved topic!
    candidate.status = 'running';
    candidate.processedAt = new Date().toISOString();
    saveTopicsData(dir, data);

    // Create job in store
    const job = store.create({
      title: candidate.title,
      minutes: candidate.minutes || data.settings.defaultMinutes || 15,
      generateShorts: candidate.generateShorts !== false,
      notes: candidate.description || ''
    });

    candidate.jobId = job.id;
    saveTopicsData(dir, data);

    // Trigger production asynchronously
    if (typeof runProductionFn === 'function') {
      runProductionFn(job.id, candidate).catch(err => {
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
    }

    return {
      status: 'started',
      topic: candidate,
      jobId: job.id
    };
  }

  return { status: 'all_duplicates_skipped', message: 'Todas as pautas pendentes eram duplicadas e foram puladas. Adicione novos temas ao banco.' };
}
