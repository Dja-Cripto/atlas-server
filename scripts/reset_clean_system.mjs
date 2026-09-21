import {createStore} from '../lib/store.mjs';
import {saveTopicsData,loadTopicsData} from '../lib/topics.mjs';
import {readdir,rm,mkdir} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = process.env.ATLAS_DATA_DIR || path.join(root, 'data');

console.log(`[CLEAN] Starting system cleanup on dir: ${dir} and root: ${root}`);

// 1. Clean jobs from SQLite store while preserving settings and API keys
const store = createStore(dir);
const allJobs = store.list();
console.log(`[CLEAN] Removing ${allJobs.length} previous job records from SQLite database...`);

for (const j of allJobs) {
  store.delete(j.id);
}

// 2. Reset topics.json queue and alerts while keeping scheduling preferences
console.log('[CLEAN] Resetting topics queue and alerts in topics.json...');
saveTopicsData(dir, {
  queue: [],
  alerts: [],
  settings: {
    autoRunTime: '00:00',
    enabled: true,
    defaultMinutes: 15,
    defaultShorts: true
  }
});

// 3. Clean generated media folders in data
const foldersToClean = [
  path.join(dir, 'shorts'),
  path.join(dir, 'long_videos'),
  path.join(root, '.temp'),
  path.join(root, 'renderer/src/generated')
];

for (const folder of foldersToClean) {
  if (existsSync(folder)) {
    console.log(`[CLEAN] Cleaning folder: ${folder}`);
    await rm(folder, {recursive: true, force: true}).catch(() => {});
    await mkdir(folder, {recursive: true}).catch(() => {});
  }
}

// Clean any legacy UUID folders in dir
try {
  const entries = await readdir(dir, {withFileTypes: true});
  for (const entry of entries) {
    if (entry.isDirectory() && /^[a-f0-9-]{36}$/.test(entry.name)) {
      console.log(`[CLEAN] Removing legacy project folder: ${path.join(dir, entry.name)}`);
      await rm(path.join(dir, entry.name), {recursive: true, force: true}).catch(() => {});
    }
  }
} catch (e) {
  console.error('[CLEAN ERROR] readdir dir:', e);
}

// Clean renderer/public/auto (except world.json)
const autoPublicDir = path.join(root, 'renderer/public/auto');
if (existsSync(autoPublicDir)) {
  try {
    const autoEntries = await readdir(autoPublicDir, {withFileTypes: true});
    for (const entry of autoEntries) {
      if (entry.name !== 'world.json') {
        console.log(`[CLEAN] Removing auto cache item: ${entry.name}`);
        await rm(path.join(autoPublicDir, entry.name), {recursive: true, force: true}).catch(() => {});
      }
    }
  } catch (e) {
    console.error('[CLEAN ERROR] autoPublicDir:', e);
  }
}

const remainingJobs = store.list();
const settings = store.settings();
const hasKeys = Boolean(settings.geminiKey || settings.fishKey);
store.close();

console.log(`[CLEAN SUCCESS] Cleanup complete! Remaining jobs: ${remainingJobs.length}. API keys preserved: ${hasKeys ? 'YES' : 'NO'}.`);
