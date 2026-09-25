import {createStore} from '../lib/store.mjs';
import * as providers from '../lib/providers.mjs';
import {automatic, finalizeMainPackage} from '../lib/automatic.mjs';
import {automaticShorts, renderAllShortsMP4} from '../lib/shorts.mjs';
import {randomUUID} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {stat} from 'node:fs/promises';
import {spawn} from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = process.env.ATLAS_DATA_DIR || path.join(root, 'data');
const store = createStore(dir);

const topicTitle = process.argv[2] || 'The Coldest Inhabited Place on Earth: Oymyakon';
const targetDuration = Number(process.argv[3]) || 55; // ~1 minute target
const shouldGenShort = process.argv[4] === '1'; // Default: only main video

console.log(`Creating test production: "${topicTitle}" (~${targetDuration}s)...`);

const jobId = randomUUID();
const now = new Date().toISOString();

const job = {
  id: jobId,
  title: topicTitle,
  minutes: 1,
  targetDuration: 55,
  skipThumbnail: true, // User requested no AI image generation call for thumbnail
  shortsCount: shouldGenShort ? 1 : 0,
  completed: [],
  status: 'running',
  autoStage: 'research',
  autoProgress: 5,
  events: [{at: now, message: `Iniciando produção de teste: "${topicTitle}" (~${targetDuration}s)`}],
  createdAt: now,
  updatedAt: now
};

store.put(job);
console.log(`Job created with ID: ${jobId}`);

const s = { ...providers.defaults, ...store.settings() };
const log = (j, msg) => {
  const at = new Date().toISOString();
  j.events = [...(j.events || []), { at, message: msg }];
  j.updatedAt = at;
  console.log(`[${at.slice(11, 19)}] ${msg}`);
  store.put(j);
};

async function verifyMedia(filePath) {
  return new Promise((resolve, reject) => {
    const child = spawn('ffprobe', ['-v', 'error', '-show_entries', 'format=duration,size,bit_rate:stream=codec_type,width,height,codec_name', '-of', 'json', filePath]);
    let stdout = '', stderr = '';
    child.stdout.on('data', d => stdout += d);
    child.stderr.on('data', d => stderr += d);
    child.on('close', code => {
      if (code !== 0) return reject(new Error(`ffprobe failed (${code}): ${stderr}`));
      try {
        resolve(JSON.parse(stdout));
      } catch (e) {
        reject(e);
      }
    });
  });
}

try {
  // Step 1: Automatic Long Video Generation & Render
  console.log('\n--- ETAPA 1: VÍDEO PRINCIPAL (1 MINUTO) ---');
  log(job, 'Iniciando pipeline automático do vídeo principal...');
  await automatic(s, job, { root, dir, log, store });
  
  // Step 2: Finalize Main Package (Thumbnails from video frame, titles, descriptions)
  console.log('\n--- ETAPA 2: PACOTE PRINCIPAL ---');
  log(job, 'Finalizando pacote do vídeo principal (capas e metadados)...');
  await finalizeMainPackage(s, job, { root, dir, log, store });
  
  const mainRunId = job.auto?.runId;
  const mainVideoPath = path.join(dir, 'long_videos', job.id, `video-${mainRunId}.mp4`);
  const mainStats = await stat(mainVideoPath);
  const mainProbe = await verifyMedia(mainVideoPath);
  const mainDuration = parseFloat(mainProbe.format?.duration || 0);
  const mainVideo = mainProbe.streams?.find(st => st.codec_type === 'video');
  
  console.log(`\n✓ Vídeo Principal concluído:`);
  console.log(`  - Arquivo: ${mainVideoPath}`);
  console.log(`  - Tamanho: ${(mainStats.size / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  - Duração: ${mainDuration.toFixed(1)}s`);
  console.log(`  - Resolução: ${mainVideo?.width}x${mainVideo?.height}`);
  console.log(`  - Trilha selecionada: "${job.selectedMusic?.name}" (${job.selectedMusic?.categoryName})`);

  if (shouldGenShort) {
    // Step 3: Generate 1 Short
    console.log('\n--- ETAPA 3: GERAÇÃO DO SHORT (1 MINUTO VERTICAL) ---');
    log(job, 'Iniciando geração do Short vertical...');
    await automaticShorts(s, job, { root, dir, log, store });
    
    console.log('\n--- ETAPA 4: RENDERIZAÇÃO DO SHORT ---');
    log(job, 'Renderizando Short vertical em 1080x1920...');
    await renderAllShortsMP4(s, job, { root, dir, log, store });
    
    const short0 = job.shorts?.items?.[0];
    const shortPath = short0?.videoPath || path.join(dir, 'shorts', job.id, 'short-1.mp4');
    const shortStats = await stat(shortPath);
    const shortProbe = await verifyMedia(shortPath);
    const shortDuration = parseFloat(shortProbe.format?.duration || 0);
    const shortVideo = shortProbe.streams?.find(st => st.codec_type === 'video');

    console.log(`\n✓ Short vertical concluído:`);
    console.log(`  - Arquivo: ${shortPath}`);
    console.log(`  - Tamanho: ${(shortStats.size / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  - Duração: ${shortDuration.toFixed(1)}s`);
    console.log(`  - Resolução: ${shortVideo?.width}x${shortVideo?.height}`);
  }

  job.status = 'review';
  store.put(job);
  console.log('\n=== TESTE CONCLUÍDO COM SUCESSO ===');
  process.exit(0);

} catch (err) {
  console.error('\n❌ ERRO NA PRODUÇÃO DE TESTE:', err);
  job.status = 'error';
  job.error = err.message;
  log(job, `Erro fatal na produção de teste: ${err.message}`);
  process.exit(1);
}
