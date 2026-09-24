import {createStore} from '../lib/store.mjs';

const store = createStore(process.env.ATLAS_DATA_DIR || './data');
const list = await store.list();

console.log('Total jobs:', list.length);
for (const item of list) {
  const j = await store.get(item.id);
  console.log(`\nID: ${item.id}`);
  console.log(`Title: "${j?.title}"`);
  console.log(`Status: ${j?.status} | Stage: ${j?.auto?.stage} | Progress: ${j?.auto?.progress}%`);
  console.log(`Created: ${j?.createdAt} | Updated: ${j?.updatedAt}`);
  console.log(`Selected Music: ${j?.selectedMusic?.name || 'none'}`);
  console.log(`Renders: ${j?.renders?.length || 0} | Shorts: ${j?.shortsItems?.length || 0}`);
}
