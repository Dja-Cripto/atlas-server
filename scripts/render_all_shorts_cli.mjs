import {createStore} from '../lib/store.mjs';
import * as providers from '../lib/providers.mjs';
import {renderAllShortsMP4,renderShortMP4} from '../lib/shorts.mjs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = process.env.ATLAS_DATA_DIR || path.join(root, 'data');

const store = createStore(dir);
const jobId = process.argv[2] || 'b6daffd0-5641-472d-aa2b-ef347510c971';
const job = store.get(jobId);

if (!job) {
  console.error(`[ERROR] Job ${jobId} not found in store at ${dir}`);
  process.exit(1);
}

const s = {...providers.defaults, ...store.settings()};
console.log(`[START] Rendering all Shorts MP4 for job: "${job.title}" (${job.id})`);

const log = (j, msg) => {
  console.log(`[RENDER-LOG] ${msg}`);
  if (j.events) j.events.push({at: new Date().toISOString(), message: msg});
  store.put(j);
};

try {
  await renderAllShortsMP4(s, job, {root, dir, log});
  store.put(job);
  console.log('[SUCCESS] All Shorts MP4 rendering complete!');
} catch (err) {
  console.error('[FATAL ERROR]', err);
  process.exit(1);
} finally {
  store.close();
}
