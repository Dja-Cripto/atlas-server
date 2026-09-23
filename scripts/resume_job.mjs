import {createStore} from '../lib/store.mjs';
import * as providers from '../lib/providers.mjs';
import {automatic,renderFinalMP4,finalizeMainPackage} from '../lib/automatic.mjs';
import {automaticShorts,renderAllShortsMP4} from '../lib/shorts.mjs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = process.env.ATLAS_DATA_DIR || path.join(root, 'data');

const store = createStore(dir);
const jobId = process.argv[2] || '3677be46-ea60-4ea1-aee9-adab207b5235';
const j = store.get(jobId);

if (!j) {
  console.error(`Job ${jobId} not found!`);
  process.exit(1);
}

const s = { ...providers.defaults, ...store.settings() };
const log = (job, msg) => {
  const at = new Date().toISOString();
  job.events = [...(job.events || []), { at, message: msg }];
  job.updatedAt = at;
  console.log(`[${at.slice(11, 19)}] ${msg}`);
  store.put(job);
};

console.log(`Resuming job "${j.title}" (${j.id})...`);
j.status = 'running';
j.error = null;
store.put(j);

try {
  // Step 1: Long Video (produces code + renders MP4)
  log(j, 'Verificando e finalizando vídeo principal...');
  await automatic(s, j, { root, dir, log, store });
  await finalizeMainPackage(s, j, { root, dir, log, store });
  j.completed = [...new Set([...(j.completed || []), 'automatic', 'render'])];
  store.put(j);

  j.status = 'review';
  store.put(j);
  log(j, 'Vídeo principal completo e disponível para revisão. Shorts aguardam ação do usuário.');} catch (err) {
  j.status = 'error';
  j.error = err.message || String(err);
  log(j, `Erro na execução: ${j.error}`);
  store.put(j);
  console.error(err);
} finally {
  store.close();
}
