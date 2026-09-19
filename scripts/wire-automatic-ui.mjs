import {readFileSync,writeFileSync} from 'node:fs';
let s=readFileSync('server.mjs','utf8');
s=s.replace("editing:'Plano de edição detalhado'}","editing:'Plano de edição detalhado',automatic:'Produção automática'}");
s=s.replace("['thumbnail','editing','media'].includes(b.step)","['thumbnail','editing','media','automatic'].includes(b.step)");
s=s.replace("void run(j,b.step,{direction:b.direction});","if(b.step==='automatic'){if(active.size)throw new Error('Aguarde a produção em andamento antes da montagem automática.');await preflight(root,{...providers.defaults,...store.settings()});}void run(j,b.step,{direction:b.direction});");
s=s.replace('voice\\.mp3|pilot\\.mp4|thumbnail','voice\\.mp3|pilot\\.mp4|video-[a-f0-9-]+\\.mp4|credits-[a-f0-9-]+\\.json|thumbnail');
s=s.replace("'.mp4':'video/mp4'","'.mp4':'video/mp4','.json':'application/json'");
writeFileSync('server.mjs',s);
let a=readFileSync('public/app.js','utf8');
if(!a.includes('function automaticPanel')){
a=a.replace('function detail(){',`function automaticPanel(j){return \`<section class="panel detail-body"><h3>Produção automática</h3><p>O robô prepara as etapas que faltam, escolhe vídeos ou fotos reais, compõe mapas e gráficos e exporta o MP4. Materiais existentes serão reutilizados.</p><button class="primary" data-run="automatic" \${j.status==='running'?'disabled':''}>\${j.status==='running'&&j.current==='automatic'?'Robô trabalhando…':j.auto&&!j.auto.finished?'Retomar geração automática':'Gerar vídeo automaticamente'}</button><p>Usa as APIs configuradas e renderiza neste computador. Mantenha o servidor aberto. Não publica no YouTube.</p>\${j.auto?\`<p><b>Etapa:</b> \${esc(j.auto.stage)} · \${j.auto.progress||0}%</p>\`:''}\${(j.auto?.warnings||[]).map(w=>\`<p class="callout">\${esc(w)}</p>\`).join('')}\${(j.renders||[]).slice().reverse().map(v=>\`<div class="section-gap"><h3>Vídeo automático · \${Math.round(v.duration)}s</h3><video class="output-image" controls preload="metadata" src="\${esc(v.url)}"></video><p><a href="\${esc(v.url)}" download>Baixar MP4</a> · <a href="\${esc(v.credits)}" download>Fontes e créditos</a></p></div>\`).join('')}</section>\`;}
function detail(){`);
a=a.replace('<div class="step"><div><h3>07 &nbsp; Montagem / publicação</h3><small>Disponível na próxima fase</small></div><span class="badge">Em breve</span></div>','<div class="step"><div><h3>07 &nbsp; Montagem automática</h3><small>Disponível no painel abaixo</small></div></div>');
a=a.replace('<div class="detail-body">${detailContent(j)}</div>','${automaticPanel(j)}<div class="detail-body">${detailContent(j)}</div>');
a=a.replace("state.jobs.map(pilotCard).join('')","state.jobs.filter(j=>j.renders?.length).map(automaticPanel).join('')+state.jobs.map(pilotCard).join('')");
// Library buttons must address their own project, not the last open production.
a=a.replace('data-run="automatic"','data-run="automatic" data-auto-job="${j.id}"');
a=a.replace('document.addEventListener(\'click\',async e=>{',"document.addEventListener('click',async e=>{const autoTarget=e.target.closest('[data-auto-job]');if(autoTarget)selected=autoTarget.dataset.autoJob;");
a=a.replace('O primeiro piloto está disponível abaixo. A montagem automática completa continua em desenvolvimento.','Os vídeos automáticos e o piloto supervisionado ficam identificados separadamente abaixo.');
a=a.replace('Motor de montagem: próxima fase.','Motor de montagem: automático local disponível.');
writeFileSync('public/app.js',a);
}
