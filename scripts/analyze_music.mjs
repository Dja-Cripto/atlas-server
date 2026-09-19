import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const baseDir = './Musicas';
const cats = fs.readdirSync(baseDir, { withFileTypes: true }).filter(d => d.isDirectory());
const allTracks = [];

for (const cat of cats) {
  const catPath = path.join(baseDir, cat.name);
  const files = fs.readdirSync(catPath).filter(f => f.toLowerCase().endsWith('.mp3'));
  for (const file of files) {
    const full = path.join(catPath, file);
    try {
      const probe = execSync(`ffprobe -v error -show_entries format=duration,bit_rate -of json "${full}"`, { encoding: 'utf8' });
      const data = JSON.parse(probe);
      const dur = parseFloat(data.format?.duration || '0');
      const bitRate = parseInt(data.format?.bit_rate || '0', 10);
      allTracks.push({
        folder: cat.name,
        filename: file,
        path: full.replace(/\\/g, '/'),
        durationSec: Math.round(dur),
        bitRateKbps: Math.round(bitRate / 1000)
      });
    } catch (e) {
      allTracks.push({ folder: cat.name, filename: file, path: full.replace(/\\/g, '/'), error: e.message });
    }
  }
}

fs.mkdirSync('./scratch', { recursive: true });
fs.writeFileSync('./scratch/analyzed_music.json', JSON.stringify(allTracks, null, 2), 'utf8');
console.log(`Analyzed ${allTracks.length} music tracks successfully.`);
