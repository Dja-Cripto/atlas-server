import {createStore} from '../lib/store.mjs';

const store = createStore(process.env.ATLAS_DATA_DIR || './data');
const jobId = process.argv[2];

if (jobId) {
  const j = await store.get(jobId);
  if (!j) {
    console.log('Job not found:', jobId);
    process.exit(1);
  }
  console.log('Title:', j.title);
  console.log('Selected Music:', JSON.stringify(j.selectedMusic, null, 2));
  const events = (j.events || []).filter(e => e.message && (e.message.includes('Trilha') || e.message.includes('BGM') || e.message.includes('música') || e.message.includes('sonora')));
  console.log('Music Events:', JSON.stringify(events, null, 2));
} else {
  const list = await store.list();
  console.log('Recent jobs:');
  for (const item of list.slice(-10)) {
    const full = await store.get(item.id);
    console.log(`- ID: ${item.id} | Status: ${item.status} | Title: "${item.title}" | Music: "${full?.selectedMusic?.name || full?.selectedMusic?.path || 'none'}"`);
  }
}
