import {readdir,unlink,rename} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import path from 'node:path';

const targetDir = process.argv[2];
if (!targetDir) {
  console.error('Usage: node scripts/transcode_existing.mjs <directory>');
  process.exit(1);
}

async function transcode(input, output) {
  return new Promise((resolve, reject) => {
    const args = [
      '-y',
      '-hide_banner',
      '-loglevel', 'error',
      '-i', input,
      '-vf', "scale='min(1920,iw)':-2:flags=bicubic",
      '-c:v', 'libx264',
      '-preset', 'ultrafast',
      '-crf', '23',
      '-g', '30',
      '-pix_fmt', 'yuv420p',
      '-an',
      output
    ];
    const child = spawn('ffmpeg', args, { windowsHide: true, stdio: ['ignore', 'ignore', 'pipe'] });
    let err = '';
    child.stderr?.on('data', c => { err += c; });
    child.on('error', reject);
    child.on('exit', code => {
      if (code === 0) resolve();
      else reject(new Error(`Failed with code ${code}: ${err.slice(-300)}`));
    });
  });
}

const files = await readdir(targetDir);
const mp4s = files.filter(f => f.endsWith('.mp4') && !f.startsWith('video-') && !f.includes('.tmp.'));
console.log(`Found ${mp4s.length} MP4 clips to check/transcode in ${targetDir}...`);

let count = 0;
for (const file of mp4s) {
  const fullPath = path.join(targetDir, file);
  const tempPath = path.join(targetDir, file + '.tmp.mp4');
  try {
    const t0 = Date.now();
    await transcode(fullPath, tempPath);
    await rename(tempPath, fullPath);
    count++;
    console.log(`[${count}/${mp4s.length}] Transcoded ${file} (${Date.now() - t0}ms)`);
  } catch (err) {
    try { await unlink(tempPath); } catch {}
    console.warn(`[WARN] Skipped ${file}: ${err.message}`);
  }
}
console.log(`Transcoding complete: ${count}/${mp4s.length} clips optimized!`);
