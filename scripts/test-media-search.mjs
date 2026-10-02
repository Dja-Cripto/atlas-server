// Teste real da busca de mídia: roda a pré-pesquisa nova com as chaves salvas no
// Atlas e gera um relatório HTML com miniaturas, notas e o que o Gemini viu.
// Uso: node scripts/test-media-search.mjs ["Título do tema"]
import {mkdirSync,writeFileSync,readFileSync} from 'node:fs';
import path from 'node:path';
import {createStore} from '../lib/store.mjs';
import * as providers from '../lib/providers.mjs';
import {preSearchTopic} from '../lib/topic-presearch.mjs';

const TOPICS=[
 'How Iceland Heats Its Capital with Geothermal Energy','How Venice Survives the Rising Tides','Why Bangkok Is Sinking',
 'How the Banaue Rice Terraces Were Built','How Switzerland Moves Trains Through the Alps','How Dubai Gets Its Drinking Water',
 'How Norway Drives Almost Entirely on Electric Cars','How Singapore Built Land from the Sea','Life Inside a Faroe Islands Village',
 'How Egypt Lives on the Nile','How the Netherlands Makes Room for Water','How Ships Cross the Panama Canal'
];
const title=process.argv[2]||TOPICS[Math.floor(Math.random()*TOPICS.length)];
const dataDir=path.resolve('data');
const store=createStore(dataDir);
const s={...providers.defaults,...store.settings()};
store.close();

const flag=v=>v?'configurada':'NÃO configurada';
console.log('Tema:',title);
console.log('Pexels:',flag(s.pexelsKey),'| Pixabay:',flag(s.pixabayKey),'| Gemini:',s.geminiBackend==='vertex'?flag(s.vertexCredentials)+' (Vertex)':flag(s.geminiKey));
console.log('Buscando e revisando visualmente. Isso leva alguns minutos e usa a API do Gemini (custo estimado abaixo de US$ 0,10)...\n');

const topic={id:'media-test-'+Date.now(),title,description:''};
const t0=Date.now();
const r=await preSearchTopic(topic,s,{dir:dataDir,maxCostUsd:0.10,onProgress:async p=>console.log('Revisão:',JSON.stringify(p))});
const file=path.join(dataDir,'presearch',topic.id+'.json');
let saved={};try{saved=JSON.parse(readFileSync(file,'utf8'));}catch{}
const reviews=saved.reviews||[];
const m=r.mediaSummary;
const esc=x=>String(x??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const card=v=>`<div class="c ${v.ok?'ok':'no'}"><a href="${esc(v.url)}" target="_blank"><img loading="lazy" src="${esc(v.image)}"></a><div class="b"><b class="n">${v.score}/10</b> <span>${esc(v.role)}</span> <span>${esc(v.kind)}${v.duration?' '+Math.round(v.duration)+'s':''} · ${esc(v.source)}</span><p><i>Viu:</i> ${esc(v.sees)}</p><p class="t">${esc(v.reason)}</p><p class="t">${esc(v.title).slice(0,90)}</p></div></div>`;
const approved=reviews.filter(v=>v.ok).sort((a,b)=>b.score-a.score),rejected=reviews.filter(v=>!v.ok).sort((a,b)=>b.score-a.score);
const html=`<!doctype html><meta charset="utf-8"><title>Teste de busca - ${esc(title)}</title><style>
body{font:15px system-ui;margin:24px;background:#111;color:#eee}h1{font-size:22px}h2{margin-top:28px}.s{background:#1c1c1c;padding:14px;border-radius:8px;line-height:1.6}
.g{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:12px}.c{background:#1c1c1c;border-radius:8px;overflow:hidden;border:2px solid #333}.c.ok{border-color:#2e9e5b}.c.no{border-color:#8a3a3a}
.c img{width:100%;aspect-ratio:16/9;object-fit:cover;display:block;background:#000}.b{padding:8px;font-size:13px}.n{font-size:17px}.t{color:#999;font-size:12px;margin:2px 0}p{margin:4px 0}.st{font-size:20px;font-weight:700}
</style><h1>${esc(title)}</h1>
<div class="s"><div class="st">Resultado: ${esc(r.status)}${r.recommendedMinutes?' ('+r.recommendedMinutes+' min recomendados)':''}</div>
<div>${esc(r.reason)}</div>
<div>Buscas: ${m.searchesRun??'?'} (${m.searchesFailed??0} falharam) · Mídias encontradas: ${m.totalFound} · Full HD: ${m.hdFound??'?'} · Revisadas visualmente: ${m.reviewedVisually??0}</div>
<div><b>Contagem antiga (só arquivos):</b> ${m.rawVideos??'?'} vídeos + ${m.rawPhotos??'?'} fotos. <b>Aprovadas pela imagem:</b> ${m.usableAfterReview??0} (${m.uniqueVideos??0} vídeos, ${m.uniquePhotos??0} fotos) · filmagem verificada (planejamento conservador) ${Math.round(m.estimatedVideoSeconds||0)}s</div>
<div>Fontes: ${esc(JSON.stringify(m.sources||{}))} · Estimativa do código (não faturamento): US$ ${r.usage.estimatedCostUsd} · Tempo: ${Math.round((Date.now()-t0)/1000)}s</div>
<div>Lacunas: ${r.gaps.length?r.gaps.map(esc).join(' | '):'nenhuma'}</div>
<div>Blocos: ${(r.blocks||[]).map(b=>esc(b.purpose)+': '+b.usable+' aprovadas de '+b.reviewed).join(' · ')}</div></div>
<h2>Aprovadas (${approved.length})</h2><div class="g">${approved.map(card).join('')}</div>
<h2>Rejeitadas (${rejected.length})</h2><div class="g">${rejected.map(card).join('')}</div>`;
mkdirSync(path.join(dataDir,'relatorios'),{recursive:true});
const out=path.join(dataDir,'relatorios','teste-busca-'+new Date().toISOString().replace(/[:.]/g,'-')+'.html');
writeFileSync(out,html);
console.log('Status:',r.status);console.log(r.reason);
console.log('Aprovadas pela imagem:',m.usableAfterReview??0,'de',m.reviewedVisually??0,'revisadas | Full HD encontradas:',m.hdFound??0,'| custo US$',r.usage.estimatedCostUsd);
console.log('\nRelatório:',out);
