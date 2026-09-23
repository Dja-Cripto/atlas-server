import { readdir, rename, unlink, stat } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import path from 'node:path';

function transcodeOne(srcPath, tmpPath) {
  return new Promise((resolve, reject) => {
    const exe = process.env.FFMPEG_BIN || 'ffmpeg';
    const args = [
      '-y',
      '-hide_banner',
      '-loglevel', 'error',
      '-i', srcPath,
      '-vf', "scale='min(1920,iw)':-2:flags=bicubic,fps=30",
      '-c:v', 'libx264',
      '-preset', 'ultrafast',
      '-crf', '22',
      '-g', '30',
      '-keyint_min', '30',
      '-pix_fmt', 'yuv420p',
      '-an',
      tmpPath
    ];
    const child = spawn(exe, args, { stdio: ['ignore', 'ignore', 'pipe'] });
    let err = '';
    child.stderr?.on('data', chunk => { err += chunk; });
    child.on('error', reject);
    child.on('exit', code => {
      if (code === 0) resolve();
      else reject(new Error(`FFmpeg error (${code}): ${err.slice(-300)}`));
    });
  });
}

export async function transcodeDirectory(targetDir) {
  const files = await readdir(targetDir);
  const mp4s = files.filter(f => f.endsWith('.mp4') && !f.includes('.tmp.') && !f.includes('.opt.'));
  console.log(`[Batch Transcode] Found ${mp4s.length} MP4 files in ${targetDir}`);

  let done = 0;
  let skipped = 0;
  for (const file of mp4s) {
    const src = path.join(targetDir, file);
    const tmp = path.join(targetDir, `${file}.opt.tmp.mp4`);

    try {
      const beforeStat = await stat(src);
      await transcodeOne(src, tmp);
      const afterStat = await stat(tmp);

      if (afterStat.size > 1024) {
        await unlink(src);
        await rename(tmp, src);
        done++;
        const mbBefore = (beforeStat.size / (1024 * 1024)).toFixed(1);
        const mbAfter = (afterStat.size / (1024 * 1024)).toFixed(1);
        console.log(`[${done}/${mp4s.length}] ${file}: ${mbBefore}MB -> ${mbAfter}MB`);
      } else {
        await unlink(tmp).catch(() => {});
        skipped++;
      }
    } catch (err) {
      await unlink(tmp).catch(() => {});
      console.error(`[Error] Failed to transcode ${file}:`, err.message);
      skipped++;
    }
  }

  console.log(`[Batch Transcode] Finished: ${done} transcoded, ${skipped} skipped.`);
}

if (process.argv[1] && process.argv[1].endsWith('batch_transcode.mjs')) {
  const runId = process.argv[2] || '535e79bb-d9dd-42de-b87a-c87c077344ac';
  const targetDir = path.resolve('renderer/public/auto', runId);
  transcodeDirectory(targetDir).catch(err => {
    console.error('Batch transcode failed:', err);
    process.exit(1);
  });
}
