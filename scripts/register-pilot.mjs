import {readFileSync,writeFileSync,copyFileSync,existsSync} from 'node:fs';
import {createStore} from '../lib/store.mjs';
const id='0bdc37fa-2353-4721-9252-5d74d99cd700';
if(!existsSync('renderer/out/luxembourg-pilot.mp4'))throw Error('Render missing');
copyFileSync('renderer/out/luxembourg-pilot.mp4',`data/${id}/pilot.mp4`);
let s=readFileSync('server.mjs','utf8');
s=s.replace('voice\\.mp3|thumbnail','voice\\.mp3|pilot\\.mp4|thumbnail').replace("'.mp3':'audio/mpeg'","'.mp3':'audio/mpeg','.mp4':'video/mp4'");
writeFileSync('server.mjs',s);
let a=readFileSync('public/app.js','utf8');
if(!a.includes('function pilotCard')){
a=a.replace('function library(){',`function pilotCard(j){return j.pilot?\`<section class="panel library-item"><h3>Piloto · Luxemburgo</h3><video class="output-image" controls preload="metadata" src="\${esc(j.pilot)}"></video><p>33 segundos · Montagem supervisionada de teste</p><a href="\${esc(j.pilot)}" download>Baixar piloto MP4</a></section>\`:'';}\nfunction library(){`);
a=a.replace('A montagem e o histórico de vídeos MP4 serão conectados na próxima fase.','O primeiro piloto está disponível abaixo. A montagem automática completa continua em desenvolvimento.');
a=a.replace('+(jobs.length?`<div class="library-grid">','+state.jobs.map(pilotCard).join(\'\')+(jobs.length?`<div class="library-grid">');
writeFileSync('public/app.js',a);
}
const store=createStore('data'),j=store.get(id);if(j.status==='running')throw Error('Wait for active production');j.pilot=`/outputs/${id}/pilot.mp4`;store.put(j);store.close();console.log('Pilot registered in library');
