import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createStore } from '../lib/store.mjs';
import {
  calculateNextAvailableDate,
  scheduleJob,
  listScheduleQueue,
  listHistory,
  getScheduleSettings,
  saveScheduleSettings,
  formatDateYMD,
  addDays
} from '../lib/schedule.mjs';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

test('schedule settings save and retrieve default slots', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'atlas-sched-test-'));
  const store = createStore(tmp);
  try {
    const s1 = getScheduleSettings(store);
    assert.equal(s1.longTime, '13:00');
    assert.equal(s1.shortTimes.length, 5);

    saveScheduleSettings(store, { longTime: '14:30', shortTimes: ['15:00', '17:00', '19:00', '08:00', '11:00'] });
    const s2 = getScheduleSettings(store);
    assert.equal(s2.longTime, '14:30');
    assert.equal(s2.shortTimes[1], '17:00');
  } finally {
    store.close();
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('calculateNextAvailableDate allocates consecutive days without collisions', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'atlas-sched-test-'));
  const store = createStore(tmp);
  try {
    const baseDate = new Date('2026-09-16T12:00:00Z');
    const day1 = calculateNextAvailableDate(store, baseDate);
    assert.equal(day1.targetDate, '2026-09-17');
    assert.equal(day1.nextDate, '2026-09-18');
    assert.equal(day1.shorts.length, 5);

    // Schedule job 1
    const j1 = { id: 'job-1', title: 'Video 1', status: 'review' };
    store.put(j1);
    scheduleJob(store, 'job-1', { slots: day1 });

    // Next job should automatically get the day after (2026-09-18)
    const day2 = calculateNextAvailableDate(store, baseDate);
    assert.equal(day2.targetDate, '2026-09-18');
    assert.equal(day2.nextDate, '2026-09-19');

    // Schedule job 2
    const j2 = { id: 'job-2', title: 'Video 2', status: 'review' };
    store.put(j2);
    scheduleJob(store, 'job-2', { slots: day2 });

    // Next job should automatically get the day after (2026-09-19)
    const day3 = calculateNextAvailableDate(store, baseDate);
    assert.equal(day3.targetDate, '2026-09-19');

    const queue = listScheduleQueue(store);
    assert.equal(queue.length, 2);
    assert.equal(queue[0].id, 'job-1');
    assert.equal(queue[1].id, 'job-2');

    const history = listHistory(store);
    assert.equal(history.length, 2);
  } finally {
    store.close();
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});
