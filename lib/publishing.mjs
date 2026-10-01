const DEFAULT_WEBHOOK = 'http://n8n:5678/webhook/atlas-publish-video';
const PUBLIC_BASE = 'https://painel.setupdja.website';

export function getPublishingSettings(store) {
  const settings = store.settings();
  return {
    enabled: settings.publishingEnabled === true,
    youtube: settings.publishingYouTube !== false,
    facebook: settings.publishingFacebook !== false,
    youtubeMode: ['private', 'scheduled', 'public'].includes(settings.youtubePublishMode)
      ? settings.youtubePublishMode
      : 'scheduled',
  };
}

export function savePublishingSettings(store, incoming = {}) {
  const settings = store.settings();
  if (typeof incoming.enabled === 'boolean') settings.publishingEnabled = incoming.enabled;
  if (typeof incoming.youtube === 'boolean') settings.publishingYouTube = incoming.youtube;
  if (typeof incoming.facebook === 'boolean') settings.publishingFacebook = incoming.facebook;
  if (['private', 'scheduled', 'public'].includes(incoming.youtubeMode)) settings.youtubePublishMode = incoming.youtubeMode;
  store.saveSettings(settings);
  return getPublishingSettings(store);
}

function partsAt(date, timezone) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
  }).formatToParts(date);
  return Object.fromEntries(parts.map((part) => [part.type, part.value]));
}

export function zonedDateTimeToISOString(date, time, timezone) {
  const [year, month, day] = String(date).split('-').map(Number);
  const [hour, minute] = String(time).split(':').map(Number);
  if (![year, month, day, hour, minute].every(Number.isFinite)) throw new Error('Data ou horário de publicação inválido.');
  let candidate = new Date(Date.UTC(year, month - 1, day, hour, minute));
  for (let attempt = 0; attempt < 3; attempt++) {
    const shown = partsAt(candidate, timezone);
    const shownUtc = Date.UTC(Number(shown.year), Number(shown.month) - 1, Number(shown.day), Number(shown.hour), Number(shown.minute));
    const wantedUtc = Date.UTC(year, month - 1, day, hour, minute);
    candidate = new Date(candidate.getTime() + wantedUtc - shownUtc);
  }
  return candidate.toISOString();
}

export function descriptionWithoutLinks(value) {
  const sourceNames = new Set();
  const body = String(value || '').replace(/(?:https?:\/\/|www\.)[^\s<>]+/gi, raw => {
    try {
      const address = /^www\./i.test(raw) ? `https://${raw}` : raw;
      const host = new URL(address.replace(/[),.;]+$/, '')).hostname.toLowerCase().replace(/^www\./, '');
      if (!host.endsWith('vertexaisearch.cloud.google.com') && !host.endsWith('google.com')) sourceNames.add(host);
    } catch {}
    return '';
  });
  const trimmed = body.replace(/^\s*(?:📚\s*)?SOURCES\s*:\s*$/gim, '').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  return sourceNames.size ? trimmed + '\n\nSources: ' + [...sourceNames].join(', ') : trimmed;
}

function absoluteUrl(value) {
  if (!value) return null;
  return /^https?:\/\//i.test(value) ? value : `${PUBLIC_BASE}${value.startsWith('/') ? '' : '/'}${value}`;
}

function finalVideoUrl(job) {
  return absoluteUrl(job.finalVideo?.path || job.renders?.at(-1)?.url || null);
}

function shortVideoUrl(job, item, index) {
  return absoluteUrl(item?.mp4Url || `/shorts/${job.id}/short_${index + 1}/short_${index + 1}.mp4`);
}

export function buildPublicationPlan(job, scheduleSettings, publishingSettings) {
  if (!job?.scheduled) return [];
  const plan = [];
  const channels = [
    ...(publishingSettings.youtube ? ['youtube'] : []),
    ...(publishingSettings.facebook ? ['facebook'] : []),
  ];
  const longUrl = finalVideoUrl(job);
  if (longUrl) {
    for (const channel of channels) {
      const channelSlot = channel === 'youtube' ? job.scheduled.youtube?.longVideo : null;
      plan.push({
      key: `${channel}:long`, channel, kind: 'long', index: 0,
      title: job.scheduled.longVideo?.title || job.selectedTitle || job.publishingMetadata?.titles?.[0] || job.title,
      description: descriptionWithoutLinks(job.scheduled.longVideo?.description || job.publishingMetadata?.description || ''),
      tags: job.scheduled.longVideo?.tags || job.publishingMetadata?.tags || [],
      videoUrl: longUrl,
      thumbnailUrl: absoluteUrl(job.thumbnail),
      captionRef: {kind: 'long'},
      publishAt: zonedDateTimeToISOString(channelSlot?.date || job.scheduled.longVideo.date, channelSlot?.time || job.scheduled.longVideo.time, scheduleSettings.timezone),
    });
    }
  }
  const items = job.shorts?.items || [];
  for (let index = 0; index < items.length; index++) {
    const item = items[index];
    if (!item?.renderedMp4 && !item?.mp4Url) continue;
    const slot = job.scheduled.shorts?.[index];
    if (!slot) continue;
    for (const channel of channels) {
      const channelSlot = channel === 'youtube' ? job.scheduled.youtube?.shorts?.[index] : null;
      plan.push({
      key: `${channel}:short:${index + 1}`, channel, kind: 'short', index: index + 1,
      title: slot.title || item.title || `Short ${index + 1}: ${job.title}`,
      description: descriptionWithoutLinks(slot.description || `#Shorts\n\n${job.title}`),
      tags: ['Shorts', ...(job.publishingMetadata?.tags || [])].slice(0, 20),
      videoUrl: shortVideoUrl(job, item, index),
      thumbnailUrl: null,
      captionRef: {kind: 'short', index: index + 1},
      publishAt: zonedDateTimeToISOString(channelSlot?.date || slot.date, channelSlot?.time || slot.time, scheduleSettings.timezone),
    });
    }
  }
  return plan;
}

let dispatchRunning=false;
export async function dispatchPublicationQueue(options) {
  if(dispatchRunning)return {enabled:true,attempted:0,accepted:0,failed:0,busy:true};
  dispatchRunning=true;
  try{return await dispatchPublicationQueueUnlocked(options);}finally{dispatchRunning=false;}
}
async function dispatchPublicationQueueUnlocked({store, scheduleSettings, captionResolver = null, fetchImpl = fetch, webhookUrl = process.env.N8N_PUBLISH_WEBHOOK || DEFAULT_WEBHOOK, now = new Date()}) {
  const publishingSettings = getPublishingSettings(store);
  if (!publishingSettings.enabled) return {enabled: false, attempted: 0, accepted: 0, failed: 0};
  if (publishingSettings.youtube && publishingSettings.youtubeMode === 'public') throw new Error('Publicação automática futura exige modo agendado no YouTube.');
  let attempted = 0, accepted = 0, failed = 0;
  let youtubeAttemptedThisRun=false;
  const youtubeSending=store.list().some(job=>Object.entries(job.publications||{}).some(([key,item])=>key.startsWith('youtube:')&&item.status==='sending'));
  for (const job of store.list()) {
    if (!job.scheduled) continue;
    const plan = buildPublicationPlan(job, scheduleSettings, publishingSettings);
    job.publications ||= {};
    for (const publication of plan) {
      if (publication.channel === 'youtube' && (youtubeSending || youtubeAttemptedThisRun || job.publicationPause?.youtube)) continue;
      const current = job.publications[publication.key];
      if (['accepted', 'published', 'sending', 'needs-reschedule'].includes(current?.status)) continue;
      // An unknown upload failure may have created a remote video. Reconcile it before retrying.
      if (current?.status === 'error' && !/upload limit|quota limit|exceeded the number of videos/i.test(current.error || '')) continue;
      if (current?.status === 'error' && Number(current?.attempts || 0) >= 3) continue;
      if (current?.status === 'error' && current?.attemptedAt && (now.getTime() - new Date(current.attemptedAt).getTime()) < 24 * 60 * 60 * 1000) continue;
      if (new Date(publication.publishAt).getTime() <= now.getTime() + 10 * 60 * 1000) {
        job.publications[publication.key] = {status: 'needs-reschedule', publishAt: publication.publishAt, error: 'Horário passou ou está próximo demais para agendar com segurança.'};
        store.put(job);
        continue;
      }
      attempted++;
      if (publication.channel === 'youtube') youtubeAttemptedThisRun = true;
      job.publications[publication.key] = {status: 'sending', attemptedAt: now.toISOString(), publishAt: publication.publishAt};
      store.put(job);
      try {
        const captionVtt = captionResolver ? await captionResolver(job, publication) : null;
        const response = await fetchImpl(webhookUrl, {
          method: 'POST', headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({jobId: job.id, publication: {...publication, captionRef: undefined, captionVtt}, youtubeMode: publishingSettings.youtubeMode}),
          signal: AbortSignal.timeout(30 * 60_000),
        });
        const text = await response.text();
        if (!response.ok) throw new Error(`n8n HTTP ${response.status}: ${text.slice(0, 180)}`);
        let result = null; try { result = JSON.parse(text); } catch {}
        if (!result?.id && !result?.videoId && !result?.uploadId) throw new Error('Resposta de publicação sem ID externo; conferir canal antes de reenviar.');
        job.publications[publication.key] = {status: 'accepted', acceptedAt: new Date().toISOString(), publishAt: publication.publishAt, externalId: result?.id || result?.videoId || result?.uploadId || null};
        accepted++;
      } catch (error) {
        const attempts = Number(current?.attempts || 0) + 1;
        const message = String(error.message).slice(0, 300);
        job.publications[publication.key] = {status: 'error', attempts, attemptedAt: new Date().toISOString(), publishAt: publication.publishAt, error: message};
        if (publication.channel === 'youtube' && !/upload limit|quota limit|exceeded the number of videos/i.test(message)) {
          job.publicationPause ||= {};
          job.publicationPause.youtube = {at: new Date().toISOString(), reason: 'Resultado do upload incerto; conferir o YouTube antes de reenviar.'};
        }
        failed++;
      }
      store.put(job);
    }
  }
  return {enabled: true, attempted, accepted, failed};
}
