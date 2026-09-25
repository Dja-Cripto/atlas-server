import fs from 'node:fs';

const autoDir = '/srv/robo/portal-bot/data/atlas-storage/auto/80c05879-a5de-4652-993a-09319eacdd5f';

const transcript = JSON.parse(fs.readFileSync(`${autoDir}/transcript.json`, 'utf8'));
console.log('=== SPOKEN NARRATION ===');
transcript.forEach(seg => {
  console.log(`[${seg.start.toFixed(1)}s - ${seg.end.toFixed(1)}s] ${seg.text}`);
});

const manifest = JSON.parse(fs.readFileSync(`${autoDir}/manifest.json`, 'utf8'));
console.log('\n=== MANIFEST SCENES ===');
manifest.scenes.forEach((s, i) => {
  console.log(`Scene ${i} | ${s.start.toFixed(1)}s-${s.end.toFixed(1)}s | kind: ${s.kind.padEnd(8)} | treat: ${(s.treatment||'').padEnd(8)} | map: ${s.map ? 'YES' : 'NO '} | asset: ${(s.asset ? s.asset.kind + ':' + s.asset.src.slice(-20) : 'NONE').padEnd(25)} | bgIdx: ${s.backgroundIndex} | "${s.heading || ''}"`);
});
