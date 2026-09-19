import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createStore } from '../lib/store.mjs';
import * as providers from '../lib/providers.mjs';
import { exportCapCut, renderFinalMP4 } from '../lib/automatic.mjs';
import { exportToCapCut } from '../lib/capcut.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = path.join(root, 'data');
const store = createStore(dir);

const jobId = '240f0a8f-8898-4791-bcf9-6a191f6fb125';
const j = store.get(jobId);

if (!j) {
  console.error('Projeto não encontrado:', jobId);
  process.exit(1);
}

console.log('Iniciando renderização e exportação direta para o CapCut...');
console.log('Título:', j.title || j.research?.title || 'How China Quietly Bought 100 Strategic Ports Around the World');
console.log('RunId:', j.auto?.runId);

const s = { ...providers.defaults, ...store.settings() };

function log(job, msg) {
  console.log(`[${new Date().toLocaleTimeString()}] ${msg}`);
  job.events = job.events || [];
  job.events.push({ at: new Date().toISOString(), message: msg });
  store.put(job);
}

try {
  const result = await exportCapCut(s, j, { root, dir, log });
  console.log('✓ Sucesso total! Projeto exportado para o CapCut Desktop:');
  console.log(JSON.stringify(result, null, 2));
} catch (err) {
  console.error('Erro na exportação:', err);
  process.exit(1);
}
