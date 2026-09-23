import {createStore} from '../lib/store.mjs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = process.env.ATLAS_DATA_DIR || path.join(root, 'data');
const store = createStore(dir);
const jobId = process.argv[2] || '3677be46-ea60-4ea1-aee9-adab207b5235';
const j = store.get(jobId);

if (process.argv[2] === 'list' || (!process.argv[2] && !store.get(jobId))) {
  console.log(JSON.stringify(store.list().map(x => ({
    id: x.id,
    title: x.title,
    status: x.status,
    progress: x.progress,
    updatedAt: x.updatedAt
  })), null, 2));
} else {
  const targetId = process.argv[2] || jobId;
  const j = store.get(targetId);
  if (!j) {
    console.log(`Job ${targetId} not found. Available jobs:`);
    console.log(JSON.stringify(store.list().map(x => ({ id: x.id, title: x.title, status: x.status })), null, 2));
  } else {
    console.log(JSON.stringify({
      id: j.id,
      title: j.title,
      status: j.status,
      stage: j.stage,
      progress: j.progress,
      autoStage: j.auto?.stage,
      autoProgress: j.auto?.progress,
      shortsStage: j.shorts?.stage,
      shortsProgress: j.shorts?.progress,
      shortsItems: (j.shorts?.items || []).map(x => ({ index: x.index, title: x.title, finished: x.finished })),
      lastEvents: (j.events || []).slice(-10)
    }, null, 2));
  }
}
store.close();
