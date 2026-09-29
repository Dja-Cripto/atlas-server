import test from 'node:test';
import assert from 'node:assert/strict';
import {buildPublicationPlan,dispatchPublicationQueue,zonedDateTimeToISOString} from '../lib/publishing.mjs';

function fakeStore(settings = {}, jobs = []) {
  return {
    settings: () => settings,
    saveSettings: (next) => Object.assign(settings, next),
    list: () => jobs,
    put: (job) => {
      const index = jobs.findIndex((item) => item.id === job.id);
      if (index >= 0) jobs[index] = job;
    },
  };
}

const scheduledJob = () => ({
  id: 'job-1',
  title: 'Original title',
  selectedTitle: 'Selected title',
  thumbnail: '/outputs/job-1/thumbnail.png',
  renders: [{url: '/outputs/job-1/video-render.mp4'}],
  publishingMetadata: {description: 'Description', tags: ['atlas']},
  shorts: {items: Array.from({length: 5}, (_, index) => ({
    index,
    title: `Short ${index + 1}`,
    renderedMp4: true,
    mp4Url: `/shorts/job-1/short_${index + 1}/short_${index + 1}.mp4`,
  }))},
  scheduled: {
    longVideo: {date: '2026-09-21', time: '13:00', title: 'Selected title', description: 'Description', tags: ['atlas']},
    shorts: Array.from({length: 5}, (_, index) => ({date: index < 3 ? '2026-09-21' : '2026-09-22', time: ['15:00', '17:30', '20:00', '09:00', '12:00'][index], title: `Short ${index + 1}`})),
  },
});

test('publishing plan creates long video and five Shorts per enabled channel', () => {
  const plan = buildPublicationPlan(scheduledJob(), {timezone: 'America/New_York'}, {youtube: true, facebook: true});
  assert.equal(plan.length, 12);
  assert.equal(plan[0].title, 'Selected title');
  assert.match(plan[0].videoUrl, /video-render\.mp4$/);
  assert.equal(plan.filter((item) => item.kind === 'short').length, 10);
  assert.equal(plan.every((item) => item.publishAt.endsWith('Z')), true);
});

test('YouTube may use a later date without changing already accepted Facebook slots', () => {
  const job = scheduledJob();
  job.scheduled.youtube = {
    longVideo: {date: '2026-10-01', time: '13:00'},
    shorts: [{date: '2026-10-01', time: '15:00'}],
  };
  const plan = buildPublicationPlan(job, {timezone: 'America/New_York'}, {youtube: true, facebook: true});
  assert.equal(plan.find((item) => item.key === 'youtube:long').publishAt, '2026-10-01T17:00:00.000Z');
  assert.equal(plan.find((item) => item.key === 'facebook:long').publishAt, '2026-09-21T17:00:00.000Z');
  assert.equal(plan.find((item) => item.key === 'youtube:short:1').publishAt, '2026-10-01T19:00:00.000Z');
  assert.equal(plan.find((item) => item.key === 'facebook:short:1').publishAt, '2026-09-21T19:00:00.000Z');
});

test('timezone conversion preserves requested New York wall time', () => {
  assert.equal(zonedDateTimeToISOString('2026-09-21', '13:00', 'America/New_York'), '2026-09-21T17:00:00.000Z');
});

test('publication gate prevents every webhook while disabled', async () => {
  let calls = 0;
  const result = await dispatchPublicationQueue({
    store: fakeStore({publishingEnabled: false}, [scheduledJob()]),
    scheduleSettings: {timezone: 'America/New_York'},
    fetchImpl: async () => { calls++; throw new Error('must not run'); },
  });
  assert.equal(result.enabled, false);
  assert.equal(calls, 0);
});

test('enabled queue records each accepted platform item and does not resend it', async () => {
  const job = scheduledJob();
  const store = fakeStore({publishingEnabled: true, publishingYouTube: true, publishingFacebook: false}, [job]);
  let calls = 0;
  const fetchImpl = async () => ({ok: true, status: 200, text: async () => JSON.stringify({id: `external-${++calls}`})});
  const now = new Date('2026-09-20T00:00:00.000Z');
  const results = [];
  for (let index = 0; index < 7; index++) results.push(await dispatchPublicationQueue({store, scheduleSettings: {timezone: 'America/New_York'}, fetchImpl, now}));
  assert.equal(results.slice(0, 6).every((result) => result.accepted === 1), true);
  assert.equal(results[6].attempted, 0);
  assert.equal(calls, 6);
  assert.equal(Object.values(job.publications).every((item) => item.status === 'accepted'), true);
});
