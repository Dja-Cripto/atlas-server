import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {bundle} from '../renderer/node_modules/@remotion/bundler/dist/index.js';
import {selectComposition, renderMedia} from '../renderer/node_modules/@remotion/renderer/dist/index.js';
import {browserOptions, renderConcurrency} from '../lib/render-runtime.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const runId = '535e79bb-d9dd-42de-b87a-c87c077344ac';
const entryPoint = path.join(root, 'renderer/src/generated', runId, 'index.tsx');
const tempBundleDir = path.join(root, '.temp', 'test-bundle-' + Date.now());
const outputLocation = path.join(root, '.temp', 'test-render-30f.mp4');

console.log('Testing Remotion render speed...');
console.log('Entry point:', entryPoint);

const t0 = Date.now();
const serveUrl = await bundle({
  entryPoint,
  publicDir: path.join(root, 'renderer/public'),
  outDir: tempBundleDir,
  symlinkPublicDir: true
});
console.log(`Bundle created in ${((Date.now() - t0) / 1000).toFixed(2)}s`);

const composition = await selectComposition({
  serveUrl,
  id: 'AutomaticVideo',
  ...browserOptions()
});
console.log(`Composition loaded: durationInFrames=${composition.durationInFrames}, fps=${composition.fps}, width=${composition.width}, height=${composition.height}`);

const t1 = Date.now();
let lastLogged = 0;
await renderMedia({
  ...browserOptions(),
  composition,
  serveUrl,
  codec: 'h264',
  pixelFormat: 'yuv420p',
  x264Preset: 'ultrafast',
  outputLocation,
  frameRange: [0, 59], // Render first 60 frames (2 seconds)
  concurrency: renderConcurrency(),
  offthreadVideoCacheSizeInBytes: 512 * 1024 * 1024,
  crf: 24,
  onProgress: ({progress, renderedFrames, encodedFrames}) => {
    const elapsed = (Date.now() - t1) / 1000;
    const fps = renderedFrames > 0 ? (renderedFrames / elapsed).toFixed(1) : 0;
    console.log(`Progress: ${(progress * 100).toFixed(1)}% | Rendered: ${renderedFrames}/60 frames | Speed: ${fps} fps | Elapsed: ${elapsed.toFixed(1)}s`);
  }
});

const totalElapsed = (Date.now() - t1) / 1000;
console.log(`Render completed in ${totalElapsed.toFixed(2)}s (${(60 / totalElapsed).toFixed(1)} fps)`);
