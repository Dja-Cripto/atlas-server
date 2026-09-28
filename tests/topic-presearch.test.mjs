import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { estimateTokensCost, deduplicateCandidates, preSearchTopic } from '../lib/topic-presearch.mjs';
import {
  ensureSeedTopics,
  loadTopicsData,
  saveTopicsData,
  acquireWorkerLease,
  isWorkerLeaseActive,
  renewWorkerLease,
  releaseWorkerLease,
  SEED_TOPICS
} from '../lib/topics.mjs';

test('estimateTokensCost accurately measures Gemini token pricing', () => {
  // 1,000,000 prompt tokens = $0.075, 1,000,000 candidate tokens = $0.30
  const cost = estimateTokensCost(1_000_000, 1_000_000);
  assert.equal(cost, 0.375);

  // Small call (500 prompt, 200 candidate)
  const smallCost = estimateTokensCost(500, 200);
  assert.ok(smallCost > 0 && smallCost < 0.001);
});

test('deduplicateCandidates merges duplicate assets and aggregates search queries', () => {
  const items = [
    { url: 'https://example.com/photo1.jpg', title: 'Photo 1', queries: ['japan'] },
    { url: 'https://example.com/photo1.jpg', title: 'Photo 1 Duplicate', queries: ['tokyo'] },
    { url: 'https://example.com/video1.mp4', title: 'Video 1', queries: ['earthquake'] }
  ];
  const deduped = deduplicateCandidates(items);
  assert.equal(deduped.length, 2);
  const photo = deduped.find(d => d.url === 'https://example.com/photo1.jpg');
  assert.ok(photo);
  assert.deepEqual(photo.queries.sort(), ['japan', 'tokyo']);
});

test('ensureSeedTopics populates the 5 approved seeds without duplicating', () => {
  const data = { queue: [], alerts: [], settings: {} };
  const changed = ensureSeedTopics(data);
  assert.equal(changed, true);
  assert.equal(data.queue.length, 5);
  assert.deepEqual(
    data.queue.map(t => t.seedId),
    SEED_TOPICS.map(s => s.seedId)
  );

  // Calling again must not add duplicates
  const secondCall = ensureSeedTopics(data);
  assert.equal(secondCall, false);
  assert.equal(data.queue.length, 5);
});

test('worker lease enforces single concurrent worker and supports renew and release', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'atlas-lease-'));
  try {
    assert.equal(isWorkerLeaseActive(dir), false);

    const lease = acquireWorkerLease(dir, { workerId: 'worker_1', ttlMs: 5000 });
    assert.ok(lease);
    assert.equal(lease.workerId, 'worker_1');
    assert.equal(isWorkerLeaseActive(dir), true);

    // Second worker cannot acquire while active
    const secondLease = acquireWorkerLease(dir, { workerId: 'worker_2' });
    assert.equal(secondLease, null);

    // Renew lease
    const renewed = renewWorkerLease(dir, 'worker_1', 10000);
    assert.equal(renewed, true);

    // Release lease
    const released = releaseWorkerLease(dir, 'worker_1');
    assert.equal(released, true);
    assert.equal(isWorkerLeaseActive(dir), false);

    // Can acquire again after release
    const thirdLease = acquireWorkerLease(dir, { workerId: 'worker_3' });
    assert.ok(thirdLease);
    releaseWorkerLease(dir, 'worker_3');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
