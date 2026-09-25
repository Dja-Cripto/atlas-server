import fs from 'node:fs';

const autoDir = '/srv/robo/portal-bot/data/atlas-storage/auto/80c05879-a5de-4652-993a-09319eacdd5f';
const genDir = '/srv/robo/portal-bot/data/atlas-storage/generated/80c05879-a5de-4652-993a-09319eacdd5f';

console.log('=== TRANSCRIPT (NARRATION) ===');
try {
  const transcript = JSON.parse(fs.readFileSync(`${autoDir}/transcript.json`, 'utf8'));
  transcript.forEach(seg => {
    console.log(`[${seg.start.toFixed(1)}s - ${seg.end.toFixed(1)}s] ${seg.text}`);
  });
} catch (e) {
  console.log('Transcript error:', e.message);
}

console.log('\n=== MANIFEST SCENES ===');
try {
  const manifest = JSON.parse(fs.readFileSync(`${autoDir}/manifest.json`, 'utf8'));
  console.log('Total scenes:', manifest.scenes.length);
  manifest.scenes.forEach((s, i) => {
    console.log(`\nScene ${i} (${s.id}):`);
    console.log(`  Timing: ${s.start.toFixed(1)}s - ${s.end.toFixed(1)}s (${s.durationInFrames || Math.round((s.end - s.start)*30)} frames)`);
    console.log(`  Kind: ${s.kind} | Treatment: ${s.treatment} | Heading: "${s.heading || ''}"`);
    console.log(`  Countries:`, s.countries || []);
    console.log(`  Has Map:`, !!s.map);
    console.log(`  Has Asset:`, !!s.asset, s.asset ? `(${s.asset.kind}: ${s.asset.src})` : '');
    console.log(`  Background Index:`, s.backgroundIndex);
  });
} catch (e) {
  console.log('Manifest error:', e.message);
}

console.log('\n=== SCENE TSX FILES ===');
try {
  const files = fs.readdirSync(genDir).filter(f => f.startsWith('Scene') && f.endsWith('.tsx'));
  for (const file of files.sort()) {
    console.log(`\n--- ${file} ---`);
    const code = fs.readFileSync(`${genDir}/${file}`, 'utf8');
    // Print first 25 lines
    const lines = code.split('\n').slice(0, 30);
    console.log(lines.join('\n'));
  }
} catch (e) {
  console.log('Scene TSX error:', e.message);
}
