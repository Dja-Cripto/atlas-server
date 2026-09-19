import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

export const defaultScheduleSlots = {
  longTime: '13:00',
  shortTimes: ['15:00', '17:30', '20:00', '09:00', '12:00'],
  timezone: 'America/New_York'
};

export function getScheduleSettings(store) {
  const s = store.settings();
  return {
    longTime: s.scheduleLongTime || defaultScheduleSlots.longTime,
    shortTimes: Array.isArray(s.scheduleShortTimes) && s.scheduleShortTimes.length === 5 
      ? s.scheduleShortTimes 
      : defaultScheduleSlots.shortTimes,
    timezone: s.scheduleTimezone || defaultScheduleSlots.timezone
  };
}

export function saveScheduleSettings(store, incoming) {
  const current = store.settings();
  if (incoming.longTime && typeof incoming.longTime === 'string') {
    current.scheduleLongTime = incoming.longTime.trim();
  }
  if (Array.isArray(incoming.shortTimes) && incoming.shortTimes.length === 5) {
    current.scheduleShortTimes = incoming.shortTimes.map(t => String(t).trim());
  }
  if (incoming.timezone && typeof incoming.timezone === 'string') {
    current.scheduleTimezone = incoming.timezone.trim();
  }
  store.saveSettings(current);
  return getScheduleSettings(store);
}

export function formatDateYMD(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function calculateNextAvailableDate(store, fromDate = new Date()) {
  const jobs = store.list();
  const occupiedDates = new Set();

  for (const j of jobs) {
    if (j.scheduled?.targetDate) {
      occupiedDates.add(j.scheduled.targetDate);
    }
  }

  // Next available day starting from tomorrow
  let candidate = addDays(fromDate, 1);
  while (occupiedDates.has(formatDateYMD(candidate))) {
    candidate = addDays(candidate, 1);
  }

  const targetDate = formatDateYMD(candidate);
  const nextDate = formatDateYMD(addDays(candidate, 1));
  const settings = getScheduleSettings(store);

  // 1 Long Video + 5 Shorts scheduled slots
  const slots = {
    targetDate,
    nextDate,
    longVideo: {
      date: targetDate,
      time: settings.longTime,
      label: 'Vídeo Principal (1080p)'
    },
    shorts: [
      { index: 1, date: targetDate, time: settings.shortTimes[0], label: 'Short 1' },
      { index: 2, date: targetDate, time: settings.shortTimes[1], label: 'Short 2' },
      { index: 3, date: targetDate, time: settings.shortTimes[2], label: 'Short 3' },
      { index: 4, date: nextDate, time: settings.shortTimes[3], label: 'Short 4' },
      { index: 5, date: nextDate, time: settings.shortTimes[4], label: 'Short 5' }
    ]
  };

  return slots;
}

export function scheduleJob(store, jobId, options = {}) {
  const j = store.get(jobId);
  if (!j) throw new Error('Projeto não encontrado.');

  const slots = options.slots || calculateNextAvailableDate(store);
  const nowIso = new Date().toISOString();

  const scheduledRecord = {
    targetDate: slots.targetDate,
    nextDate: slots.nextDate,
    longVideo: {
      date: slots.longVideo.date,
      time: slots.longVideo.time,
      title: options.selectedTitle || j.publishingMetadata?.titles?.[0] || j.title,
      description: options.description || j.publishingMetadata?.description || '',
      tags: options.tags || j.publishingMetadata?.tags || [],
      status: 'scheduled'
    },
    shorts: (slots.shorts || []).map((s, idx) => ({
      index: s.index || idx + 1,
      date: s.date,
      time: s.time,
      title: j.shorts?.curiosities?.[idx]?.title || `Short ${idx + 1}: ${j.title}`,
      description: `#Shorts\n\nFull Video: ${j.title}\n\n${j.shorts?.curiosities?.[idx]?.hook || ''}`,
      status: 'scheduled'
    })),
    scheduledAt: nowIso,
    status: 'scheduled'
  };

  j.scheduled = scheduledRecord;
  j.status = 'scheduled';
  j.updatedAt = nowIso;
  store.put(j);

  return scheduledRecord;
}

export function unscheduleJob(store, jobId) {
  const j = store.get(jobId);
  if (!j) throw new Error('Projeto não encontrado.');
  delete j.scheduled;
  if (j.status === 'scheduled') j.status = 'review';
  j.updatedAt = new Date().toISOString();
  store.put(j);
  return j;
}

export function listScheduleQueue(store) {
  const jobs = store.list();
  const scheduled = jobs
    .filter(j => j.scheduled?.targetDate)
    .sort((a, b) => a.scheduled.targetDate.localeCompare(b.scheduled.targetDate));
  return scheduled;
}

export function listHistory(store) {
  const jobs = store.list();
  return jobs.filter(j => j.scheduled || j.status === 'done' || j.status === 'scheduled' || j.completed?.includes('render') || j.renders?.length);
}

