import {createStore} from '../lib/store.mjs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = process.env.ATLAS_DATA_DIR || path.join(root, 'data');

const store = createStore(dir);
const jobs = store.list();

console.log(`[STATUS] Total jobs: ${jobs.length}`);
for (const j of jobs) {
  console.log(`\n========================================`);
  console.log(`JOB ID: ${j.id}`);
  console.log(`TITLE: ${j.title}`);
  console.log(`STATUS: ${j.status} | CURRENT STEP: ${j.current || 'none'}`);
  console.log(`MINUTES: ${j.minutes} | SHORTS: ${j.generateShorts !== false}`);
  console.log(`STAGE: ${j.auto?.stage || 'none'} | AUTO PROGRESS: ${j.auto?.progress || 0}%`);
  console.log(`RENDERING MP4: ${j.auto?.renderingMp4 ? 'YES (' + j.auto?.renderProgress + '%)' : (j.auto?.renderedMp4 ? 'DONE' : 'NO')}`);
  console.log(`VOICE DURATION: ${Math.round(j.voiceDuration || 0)}s (${(Math.round(j.voiceDuration || 0) / 60).toFixed(1)} min)`);
  console.log(`COMPLETED STEPS: ${(j.completed || []).join(', ') || 'none'}`);
  if (j.error) console.log(`ERROR: ${j.error}`);
  console.log(`\nRECENT EVENTS:`);
  for (const e of (j.events || []).slice(-15)) {
    console.log(`  - [${e.at?.slice(11, 19) || ''}] ${e.message}`);
  }
}
store.close();
