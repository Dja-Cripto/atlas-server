import {renderEditPlan,renderCovers,renderFootage} from './editing-ui.js';
let shotFilter='';
const $=s=>document.querySelector(s),esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeURL=u=>{try{const x=new URL(u,location.origin);return ['https:','http:'].includes(x.protocol)?esc(x.href):'#';}catch{return '#';}};
let state={jobs:[],settings:{configured:{}}},scheduleData={queue:[],history:[],settings:{longTime:'13:00',shortTimes:['15:00','17:30','20:00','09:00','12:00']}},musicCatalog={categories:{},tracks:[]},hubData={todayJob:null,alerts:[],queue:[],channels:[]},topicsData={queue:[],alerts:[],settings:{autoRunTime:'00:00',enabled:true}},topicsFilter='pending',page='overview',selected=null,tab='research',lastFingerprint='',busy=false;
const names={overview:'Hub Central',topics:'Banco de Pautas',projects:'Produções',library:'Biblioteca',schedule:'Agendamento & Fila',settings:'Integrações',detail:'Produção'};
const statusNames={draft:'Rascunho',running:'Em andamento',review:'Para revisar',error:'Precisa de atenção',interrupted:'Interrompido',scheduled:'Agendado',done:'Concluído'};
const stepNames={research:'Pesquisa',script:'Roteiro',scenes:'Plano de cenas',media:'Filmagens',voice:'Narração',thumbnail:'Capa'};
const providers=[['gemini','G','Gemini','Pesquisa, roteiro e imagens'],['go','⌘','OpenCode Go','Configuração técnica das cenas'],['fish','≈','Fish Audio','Narração oficial em inglês'],['pexels','P','Pexels','Filmagens de banco'],['pixabay','Px','Pixabay','Vídeos e fotografias'],['youtube','▶','YouTube','Busca de referências']];

function showLogin(err,skipIntro=false){
 const overlay=$('#login-overlay');
 if(!overlay)return;
 overlay.classList.remove('hidden');
 const introScreen=$('#intro-screen');
 const loginCardContainer=$('#login-card-container');
 const errEl=$('#login-error');
 if(err||skipIntro){
  if(introScreen)introScreen.classList.add('hidden');
  if(loginCardContainer){
   loginCardContainer.classList.remove('hidden');
   loginCardContainer.classList.add('fade-in');
  }
  if(errEl&&err){errEl.textContent=err;errEl.style.display='block';}
  const input=$('#login-password');
  if(input)setTimeout(()=>input.focus(),100);
 }else{
  if(introScreen)introScreen.classList.remove('hidden','launching');
  if(loginCardContainer)loginCardContainer.classList.add('hidden');
  if(errEl){errEl.textContent='';errEl.style.display='none';}
 }
}

function launchIntro(){
 const introScreen=$('#intro-screen');
 const loginCardContainer=$('#login-card-container');
 if(!introScreen||introScreen.classList.contains('launching'))return;
 introScreen.classList.add('launching');
 setTimeout(()=>{
  introScreen.classList.add('hidden');
  if(loginCardContainer){
   loginCardContainer.classList.remove('hidden');
   loginCardContainer.classList.add('fade-in');
   const input=$('#login-password');
   if(input)setTimeout(()=>input.focus(),100);
  }
 },650);
}

function hideLogin(){
 const overlay=$('#login-overlay');
 if(overlay)overlay.classList.add('hidden');
 const introScreen=$('#intro-screen');
 if(introScreen)introScreen.classList.remove('launching');
 const errEl=$('#login-error');
 if(errEl){errEl.textContent='';errEl.style.display='none';}
}

async function api(url,data,method){
 const opts={method:method||(data===undefined?'GET':'POST'),headers:{}};
 if(data!==undefined){opts.headers['Content-Type']='application/json';opts.body=JSON.stringify(data);}
 const r=await fetch(url,opts);
 if(r.status===401&&!url.startsWith('/api/auth/login')){
  showLogin('Sessão expirada. Digite sua senha novamente.');
  throw new Error('Sessão não autorizada.');
 }
 const d=await r.json();
 if(!r.ok)throw new Error(d.error||'Não foi possível concluir.');
 return d;
}
function toast(text){$('#toast').textContent=text;$('#toast').classList.add('show');clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),5000);}
function date(v){return new Date(v).toLocaleDateString('pt-BR',{day:'2-digit',month:'short'});}
function heading(title,description,action=true){return `<div class="page-top"><div><span class="eyebrow">SEU ESTÚDIO DE CONTEÚDO</span><h1>${title}</h1><p>${description}</p></div>${action?'<button class="primary" data-new>＋ <span>Nova produção</span></button>':''}</div>`;}
function empty(title,text,button=''){return `<div class="empty"><div class="empty-symbol">▧</div><h3>${title}</h3><p>${text}</p>${button}</div>`;}
function integrations(){return providers.map(([id,icon,title,desc])=>`<div class="integration-row"><span class="provider-icon">${icon}</span><div><b>${title}</b><small>${state.settings.configured[id+'Key']?'Chave cadastrada · ativa':desc}</small></div><i class="state-dot ${state.settings.configured[id+'Key']?'on':''}"></i></div>`).join('');}
function row(j){
 const hasFinal=Boolean(j.finalVideo||(j.renders&&j.renders.length>0));
 const hasShorts=Boolean(j.shorts?.finished||(j.shorts?.items&&j.shorts.items.some(x=>x?.finished)));
 const shortsBadgeCount = (j.shorts?.items?.filter(x=>x?.finished)?.length) || (j.shortsCount) || 5;
 return `<div class="job-row" data-job="${j.id}" tabindex="0" role="button">
  <div class="job-art">${j.thumbnail?`<img src="${esc(j.thumbnail)}" alt="Capa da produção">`:'◎'}</div>
  <div class="job-info">
   <h3>${esc(j.title)}</h3>
   <small>${j.minutes} min · Inglês · ${date(j.createdAt)} ${j.generateShorts?`· +${shortsBadgeCount>1?shortsBadgeCount+' Shorts':'1 Short'}`:''} ${j.scheduled?`· Agendado ${j.scheduled.targetDate}`:''}</small>
  </div>
  <div class="job-row-actions" onclick="event.stopPropagation();">
   ${hasFinal?`<button type="button" class="job-btn-pill pill-primary" data-open-job="${j.id}" data-open-tab="final" data-scroll-to="section-main-video" title="Abrir vídeo principal na aba Final & Publicação">🎬 Vídeo Principal</button>`:''}
   ${hasShorts?`<button type="button" class="job-btn-pill pill-secondary" data-open-job="${j.id}" data-open-tab="final" data-scroll-to="section-shorts" title="Abrir Shorts na aba Final & Publicação">📱 ${shortsBadgeCount>1?shortsBadgeCount+' Shorts':'Short (9:16)'}</button>`:''}
  </div>
  <span class="badge ${j.status}">${statusNames[j.status]||j.status}</span>
  <button type="button" class="text-btn" data-delete-job="${j.id}" title="Excluir produção e arquivos" style="color:#a8b3ac;padding:6px 10px;font-size:13px;border-radius:4px;margin-left:4px;" onmouseover="this.style.color='#b25d3b'" onmouseout="this.style.color='#a8b3ac'" onclick="event.stopPropagation();">🗑</button>
  <span>›</span>
 </div>`;
}

function hubAlerts(){
 const alerts=(topicsData.alerts||[]).filter(a=>!a.dismissed);
 if(!alerts.length)return '';
 return `<section class="hub-alerts-section">
  ${alerts.map(a=>`
   <div class="hub-alert-card ${a.type==='error'?'error':''}">
    <div class="hub-alert-icon">${a.type==='error'?'⚠️':'💡'}</div>
    <div class="hub-alert-content">
     <h4>${esc(a.title)}</h4>
     <p>${esc(a.message)}</p>
     ${a.advice?`<div class="hub-alert-advice">“${esc(a.advice)}”</div>`:''}
    </div>
    <button type="button" class="hub-alert-dismiss" data-dismiss-alert="${a.id}">Entendido ✕</button>
   </div>
  `).join('')}
 </section>`;
}

function hubTodayCard(){
 const todayJob=hubData.todayJob||state.jobs.find(j=>j.scheduled)||state.jobs[0];
 if(!todayJob){
  return `<div class="hub-today-card">
   <div class="hub-today-header">
    <span class="hub-today-badge">PRODUÇÃO DO DIA</span>
    <small style="color:#7a8480;">Nenhuma produção ativa hoje</small>
   </div>
   <div style="padding:20px 0;text-align:center;">
    <p style="margin-bottom:14px;">Cadastre uma pauta ou produza o próximo tema da fila para abastecer o canal hoje.</p>
    <div style="display:flex;gap:10px;justify-content:center;">
     <button class="primary" data-open-topics-dialog>＋ Adicionar Pautas</button>
     <button class="secondary" data-run-next-topic>▶ Produzir Próxima Pauta</button>
    </div>
   </div>
  </div>`;
 }

 const hasFinal=Boolean(todayJob.finalVideo||todayJob.renders?.length);
 const shortsCount=todayJob.shorts?.items?.filter(x=>x?.finished)?.length||(todayJob.generateShorts?5:0);
 const scheduledDate=todayJob.scheduled?.targetDate||'Agendamento automático';

 return `<div class="hub-today-card">
  <div class="hub-today-header">
   <span class="hub-today-badge">PRODUÇÃO EM DESTAQUE</span>
   <small style="color:#7a8480;font-weight:600;">Postagem: ${esc(scheduledDate)}</small>
  </div>
  <div class="hub-today-body">
   <div class="hub-today-thumb">
    ${todayJob.thumbnail?`<img src="${esc(todayJob.thumbnail)}" alt="Capa">`:'🎬'}
   </div>
   <div class="hub-today-info">
    <h3>${esc(todayJob.title)}</h3>
    <p>${todayJob.minutes} min · 1 Vídeo Longo (1080p) + ${shortsCount} Shorts verticais</p>
    <div style="display:flex;gap:8px;flex-wrap:wrap;">
     ${hasFinal?`<button class="primary" style="padding:7px 14px;font-size:11px;" data-watch-video="${todayJob.finalVideo?.path||todayJob.renders?.[0]?.url}" data-video-title="${esc(todayJob.title)} (1080p)" data-type="🎬 VÍDEO PRINCIPAL">▶ Assistir Vídeo</button>`:''}
     ${shortsCount?`<button class="secondary" style="padding:7px 14px;font-size:11px;" data-open-job="${todayJob.id}" data-open-tab="final" data-scroll-to="section-shorts">📱 Ver ${shortsCount} Shorts</button>`:''}
     <button class="text-btn" style="font-size:11px;" data-open-job="${todayJob.id}">Ver Detalhes ↗</button>
    </div>
   </div>
  </div>
 </div>`;
}

function hubChannelsCard(){
 return `<div class="hub-channels-card">
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;padding-bottom:10px;border-bottom:1px solid #edf2ee;">
   <h4 style="margin:0;font-size:13px;font-weight:600;">Canais de Postagem</h4>
   <span class="badge" style="font-size:9px;">Via N8N</span>
  </div>
  <div class="hub-channel-row">
   <div class="hub-channel-info">
    <span class="hub-channel-icon yt">▶</span>
    <div><b style="font-size:12px;">YouTube</b><small style="display:block;font-size:10px;color:#7a8480;">Canal Principal + Shorts</small></div>
   </div>
   <span class="channel-status-pill pending">Aguardando Credencial</span>
  </div>
  <div class="hub-channel-row">
   <div class="hub-channel-info">
    <span class="hub-channel-icon fb">f</span>
    <div><b style="font-size:12px;">Facebook</b><small style="display:block;font-size:10px;color:#7a8480;">Página Atlas Unbound & Reels</small></div>
   </div>
   <span class="channel-status-pill ready">✓ Conectado (Atlas Unbound)</span>
  </div>
  <div class="hub-channel-row">
   <div class="hub-channel-info">
    <span class="hub-channel-icon tt">♪</span>
    <div><b style="font-size:12px;">TikTok</b><small style="display:block;font-size:10px;color:#7a8480;">Cortes Verticais Diários</small></div>
   </div>
   <span class="channel-status-pill pending">Aguardando Credencial</span>
  </div>
 </div>`;
}

function overview(){
 const jobs=state.jobs;
 const pendingTopics=(topicsData.queue||[]).filter(t=>t.status==='pending');

 return heading('Hub Central de Produção','Controle diário do seu canal, pautas automáticas e publicações.')+
  hubAlerts()+
  `<div class="hub-grid-top">
    ${hubTodayCard()}
    ${hubChannelsCard()}
  </div>
  <div class="stats">${[
   ['Pautas na Fila',pendingTopics.length,'Próximos temas que o robô vai produzir','▥'],
   ['Produções no Servidor',jobs.length,'Vídeos longos no acervo','▤'],
   ['Shorts no Acervo',jobs.reduce((acc,j)=>(acc+(j.shorts?.items?.filter(x=>x?.finished)?.length||(j.generateShorts?5:0))),0),'Cortes 9:16 gerados','▧'],
   ['Agendador 24/7',topicsData.settings?.autoRunTime||'00:00',topicsData.settings?.enabled?'Disparo noturno ativo':'Pausado','⚙']
  ].map(([label,n,sub,icon])=>`<div class="stat"><div class="stat-top">${label}<span class="stat-icon">${icon}</span></div><div class="stat-value">${n}</div><small>${sub}</small></div>`).join('')}</div>
  
  <div class="grid-main">
   <section class="panel">
    <div class="panel-head">
     <div>
      <h3>Fila Próxima de Pautas</h3>
      <p>O robô consome um tema por dia à 00:00. Se detectar repetição, pula automaticamente sem deixar você sem vídeo.</p>
     </div>
     <div style="display:flex;gap:8px;">
      <button class="primary" style="padding:8px 14px;font-size:11px;" data-open-topics-dialog>＋ Nova Pauta</button>
      <button class="secondary" style="padding:8px 14px;font-size:11px;" data-run-next-topic>▶ Produzir Próxima Agora</button>
     </div>
    </div>
    <div class="topics-list">
     ${pendingTopics.length ? pendingTopics.slice(0, 4).map((t, i) => `
      <div class="topic-row">
       <span class="topic-order">#${i+1}</span>
       <div class="topic-info">
        <h3>${esc(t.title)}</h3>
        <p>${esc(t.description || 'Curiosidade do mundo')} · ${t.minutes} min · +5 Shorts</p>
       </div>
       <span class="topic-badge pending">Na Fila</span>
       <button type="button" class="text-btn" data-delete-topic="${t.id}" title="Excluir pauta">🗑</button>
      </div>
     `).join('') : empty('Nenhuma pauta pendente na fila', 'Adicione uma lista de temas para o robô trabalhar sozinho.', '<button class="primary" data-open-topics-dialog>＋ Cadastrar Ideias</button>')}
    </div>
    ${pendingTopics.length > 4 ? `<div style="padding:12px 20px;text-align:right;"><button class="text-btn" data-page="topics">Ver todas as ${pendingTopics.length} pautas ↗</button></div>` : ''}
   </section>

   <section class="panel">
    <div class="panel-head">
     <h3>Suas ferramentas de IA</h3>
     <button class="text-btn" data-page="settings">Configurar ↗</button>
    </div>
    ${integrations()}
   </section>
  </div>`;
}

function topicsPage(){
 const queue=topicsData.queue||[];
 const pending=queue.filter(t=>t.status==='pending');
 const skipped=queue.filter(t=>t.status==='skipped_duplicate');
 const completed=queue.filter(t=>t.status==='completed');

 const filteredQueue = topicsFilter === 'pending'
   ? pending
   : topicsFilter === 'completed'
   ? completed
   : topicsFilter === 'skipped'
   ? skipped
   : queue;

 return heading('Banco de Pautas & Fila Automática','Insira seus temas e acompanhe o que já foi produzido e o que está por vir.')+
  hubAlerts()+
  `<div class="stats">${[
   ['A Fazer (Na Fila)',pending.length,'Aguardando produção noturna','⏳'],
   ['Já Produzidos',completed.length,'Vídeos e Shorts já gerados','✓'],
   ['Pulados por Duplicidade',skipped.length,'Alertas de semelhança emitidos','💡'],
   ['Horário do Disparo',topicsData.settings?.autoRunTime||'00:00','Horário de Brasília (BRT)','⚙']
  ].map(([label,n,sub,icon])=>`<div class="stat"><div class="stat-top">${label}<span class="stat-icon">${icon}</span></div><div class="stat-value">${n}</div><small>${sub}</small></div>`).join('')}</div>

  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:12px;">
   <div class="topics-filter-bar" style="display:flex;gap:6px;background:#f0f4f1;padding:4px;border-radius:8px;">
    <button type="button" class="topics-filter-btn ${topicsFilter==='pending'?'active':''}" data-topics-filter="pending" style="padding:6px 14px;border-radius:6px;border:none;background:${topicsFilter==='pending'?'#fff':'none'};color:${topicsFilter==='pending'?'#176b52':'#6b7570'};font-weight:600;font-size:12px;cursor:pointer;box-shadow:${topicsFilter==='pending'?'0 1px 4px rgba(0,0,0,0.06)':'none'};">
     ⏳ A Fazer (${pending.length})
    </button>
    <button type="button" class="topics-filter-btn ${topicsFilter==='completed'?'active':''}" data-topics-filter="completed" style="padding:6px 14px;border-radius:6px;border:none;background:${topicsFilter==='completed'?'#fff':'none'};color:${topicsFilter==='completed'?'#176b52':'#6b7570'};font-weight:600;font-size:12px;cursor:pointer;box-shadow:${topicsFilter==='completed'?'0 1px 4px rgba(0,0,0,0.06)':'none'};">
     ✓ Já Produzidos (${completed.length})
    </button>
    <button type="button" class="topics-filter-btn ${topicsFilter==='skipped'?'active':''}" data-topics-filter="skipped" style="padding:6px 14px;border-radius:6px;border:none;background:${topicsFilter==='skipped'?'#fff':'none'};color:${topicsFilter==='skipped'?'#176b52':'#6b7570'};font-weight:600;font-size:12px;cursor:pointer;box-shadow:${topicsFilter==='skipped'?'0 1px 4px rgba(0,0,0,0.06)':'none'};">
     💡 Pulados (${skipped.length})
    </button>
    <button type="button" class="topics-filter-btn ${topicsFilter==='all'?'active':''}" data-topics-filter="all" style="padding:6px 14px;border-radius:6px;border:none;background:${topicsFilter==='all'?'#fff':'none'};color:${topicsFilter==='all'?'#176b52':'#6b7570'};font-weight:600;font-size:12px;cursor:pointer;box-shadow:${topicsFilter==='all'?'0 1px 4px rgba(0,0,0,0.06)':'none'};">
     Todas (${queue.length})
    </button>
   </div>
   <div style="display:flex;gap:10px;">
    <button class="secondary" data-run-next-topic ${!pending.length?'disabled':''}>▶ Produzir Próxima Pauta Agora</button>
    <button class="primary" data-open-topics-dialog>＋ Adicionar Pautas</button>
   </div>
  </div>

  <section class="panel">
   <div class="topics-list">
    ${filteredQueue.length ? filteredQueue.map((t, i) => `
     <div class="topic-row">
      <span class="topic-order">#${i+1}</span>
      <div class="topic-info">
       <h3 style="display:flex;align-items:center;gap:8px;">
        ${esc(t.title)}
       </h3>
       <p>${esc(t.description || 'Sem descrição específica')} · ${t.minutes} min · +5 Shorts ${t.processedAt ? `· Processado em ${new Date(t.processedAt).toLocaleDateString('pt-BR')}` : ''}</p>
       ${t.duplicateInfo?.advice ? `<div class="hub-alert-advice" style="margin-top:8px;"><b>Conselho do Robô:</b> “${esc(t.duplicateInfo.advice)}”</div>` : ''}
      </div>
      <div class="topic-meta" style="display:flex;align-items:center;gap:10px;">
       <span class="topic-badge ${t.status}">${t.status==='pending'?'Na Fila':t.status==='running'?'Produzindo':t.status==='completed'?'✓ Já Produzido':t.status==='skipped_duplicate'?'Pulado (Duplicado)':t.status}</span>
       ${t.status === 'completed' && t.jobId ? `
        <button type="button" class="secondary" style="padding:6px 12px;font-size:11px;font-weight:600;" data-open-job="${t.jobId}" data-open-tab="final">🎬 Abrir Vídeo ↗</button>
       ` : t.status === 'pending' ? `
        <button type="button" class="secondary" style="padding:6px 12px;font-size:11px;" data-run-specific-topic="${t.id}" title="Produzir este tema agora">▶ Produzir Agora</button>
       ` : ''}
       <button type="button" class="text-btn" data-delete-topic="${t.id}" title="Excluir pauta">🗑</button>
      </div>
     </div>
    `).join('') : empty(
      topicsFilter === 'pending' ? 'Nenhuma pauta pendente para fazer' :
      topicsFilter === 'completed' ? 'Nenhuma pauta foi produzida ainda' :
      topicsFilter === 'skipped' ? 'Nenhuma pauta foi pulada por duplicidade' :
      'Seu banco de pautas está vazio',
      topicsFilter === 'pending' ? 'Adicione novos temas ou clique em "Todas" para ver o histórico.' :
      'Cadastre novos temas para o robô começar a produzir.',
      '<button class="primary" data-open-topics-dialog>＋ Cadastrar Ideias</button>'
    )}
   </div>
  </section>`;
}

function projects(){return heading('Suas produções','Todas as ideias e etapas, em um só lugar.')+`<div class="page-toolbar"><input id="filter" aria-label="Buscar produções" placeholder="Buscar pelo título do vídeo..."></div><section class="panel" id="job-list">${state.jobs.length?state.jobs.map(row).join(''):empty('Nada por aqui ainda','Comece com a pergunta que você gostaria de responder.','<button class="primary" data-new>Nova produção</button>')}</section>`;}
function pilotCard(j){return j.pilot?`<section class="panel library-item"><h3>Piloto · Luxemburgo</h3><video class="output-image" controls preload="metadata" src="${esc(j.pilot)}"></video><p>33 segundos · Montagem supervisionada de teste</p><a href="${esc(j.pilot)}" download>Baixar piloto MP4</a></section>`:'';}

function library(){
 const jobs=state.jobs.filter(j=>j.voice||j.thumbnail);
 return heading('Biblioteca','Capas e narrações geradas ficam salvas aqui.',false)+`<div class="callout">Vídeos longos e Shorts derivados organizados por projeto.</div>`+state.jobs.filter(j=>j.renders?.length).map(automaticPanel).join('')+state.jobs.map(pilotCard).join('')+(jobs.length?`<div class="library-grid">${jobs.map(j=>`<div class="panel library-item"><h3>${esc(j.title)}</h3>${j.thumbnail?`<a href="${esc(j.thumbnail)}" target="_blank"><img class="output-image" src="${esc(j.thumbnail)}" alt="Capa gerada"></a>`:''}${j.voice?`<audio controls src="${esc(j.voice)}"></audio><a href="${esc(j.voice)}" download>Baixar narração</a>`:''}<button class="text-btn" data-job="${j.id}">Abrir produção ↗</button></div>`).join('')}</div>`:empty('Sua biblioteca está pronta para receber materiais','As capas e narrações aparecem aqui assim que forem geradas.'));
}

function schedule(){
 const q=scheduleData.queue||[], h=scheduleData.history||[], cfg=scheduleData.settings||{longTime:'13:00',shortTimes:['15:00','17:30','20:00','09:00','12:00']};
 const nextSlot=scheduleData.nextSlot||{targetDate:'Próximo dia livre'};
 const unscheduledReady=state.jobs.filter(j=>!j.scheduled);

 return heading('Agendamento e fila de publicações','Defina os horários padrão e gerencie a linha de postagens.',false)+`
 <div class="stats">${[
  ['Produções na fila',q.length,'Publicações programadas','▦'],
  ['Vídeos longos',q.length,`${cfg.longTime||'13:00'} (horário padrão)`,'▤'],
  ['Shorts derivados',q.length*5,'5 cortes verticais por produção','▧'],
  ['Próxima data livre',nextSlot.targetDate||'Amanhã','Sem conflito de horário','◉']
 ].map(([label,n,sub,icon])=>`<div class="stat"><div class="stat-top">${label}<span class="stat-icon">${icon}</span></div><div class="stat-value">${n}</div><small>${sub}</small></div>`).join('')}</div>

 <section class="panel">
  <div class="panel-head">
   <div>
    <h3>Horários padrão de publicação</h3>
    <p>Defina o horário de postagem do vídeo longo e o intervalo dos 5 Shorts.</p>
   </div>
   <span class="badge">Fuso: EST (EUA)</span>
  </div>
  <form id="schedule-settings-form" style="padding:22px 24px;">
   <div class="schedule-slots-grid">
    <label>Vídeo longo<input type="time" name="longTime" value="${esc(cfg.longTime||'13:00')}" required></label>
    <label>Short 1 (Dia 1)<input type="time" name="short1" value="${esc(cfg.shortTimes?.[0]||'15:00')}" required></label>
    <label>Short 2 (Dia 1)<input type="time" name="short2" value="${esc(cfg.shortTimes?.[1]||'17:30')}" required></label>
    <label>Short 3 (Dia 1)<input type="time" name="short3" value="${esc(cfg.shortTimes?.[2]||'20:00')}" required></label>
    <label>Short 4 (Dia 2)<input type="time" name="short4" value="${esc(cfg.shortTimes?.[3]||'09:00')}" required></label>
    <label>Short 5 (Dia 2)<input type="time" name="short5" value="${esc(cfg.shortTimes?.[4]||'12:00')}" required></label>
   </div>
   <div style="display:flex;justify-content:space-between;align-items:center;margin-top:16px;">
    <p style="font-size:11px;color:var(--muted);margin:0;">O agendamento distribui 1 vídeo longo + 3 shorts no primeiro dia e 2 shorts no segundo dia.</p>
    <button type="submit" class="primary">Salvar horários</button>
   </div>
  </form>
 </section>

 <section class="panel section-gap">
  <div class="panel-head">
   <div>
    <h3>Fila de publicações programadas</h3>
    <p>Produções agendadas na grade por data e horário.</p>
   </div>
   <span class="badge">${q.length} na fila</span>
  </div>
  ${q.length?q.map(j=>`
   <div class="job-row" data-job="${j.id}" tabindex="0" role="button">
    <div class="job-art">${j.thumbnail?`<img src="${esc(j.thumbnail)}" alt="Capa">`:'◎'}</div>
    <div class="job-info">
     <h3>${esc(j.scheduled?.longVideo?.title||j.title)}</h3>
     <small>Agendado para ${j.scheduled.targetDate} · Vídeo longo às ${j.scheduled.longVideo?.time||cfg.longTime} EST · 5 Shorts (${(j.scheduled.shorts||[]).map(s=>s.time).join(', ')})</small>
    </div>
    <span class="badge scheduled">Agendado: ${j.scheduled.targetDate}</span>
    <a class="text-btn" href="/api/jobs/${j.id}/package" download title="Baixar pacote de publicação" style="margin:0 4px;" onclick="event.stopPropagation();">Pacote ↓</a>
    <button type="button" class="text-btn" data-action="unschedule-job" data-job-action="${j.id}" title="Remover agendamento" style="color:#a8b3ac;padding:6px 10px;font-size:13px;border-radius:4px;" onmouseover="this.style.color='#b25d3b'" onmouseout="this.style.color='#a8b3ac'" onclick="event.stopPropagation();">🗑</button>
    <span>›</span>
   </div>
  `).join(''):empty('Nenhuma publicação na fila','Ao concluir uma produção, agende-a para que ela entre na grade sem sobreposição de datas.')}
 </section>

 ${unscheduledReady.length?`
 <section class="panel section-gap">
  <div class="panel-head">
   <div>
    <h3>Produções prontas para agendar</h3>
    <p>Adicione estas produções ao próximo dia livre (${nextSlot.targetDate||'Amanhã'}).</p>
   </div>
  </div>
  ${unscheduledReady.map(j=>`
   <div class="job-row" data-job="${j.id}" tabindex="0" role="button">
    <div class="job-art">${j.thumbnail?`<img src="${esc(j.thumbnail)}" alt="Capa">`:'◎'}</div>
    <div class="job-info">
     <h3>${esc(j.title)}</h3>
     <small>${j.minutes} min · Status: ${statusNames[j.status]||j.status} ${j.generateShorts?'· +5 Shorts':''}</small>
    </div>
    <span class="badge ${j.status}">${statusNames[j.status]||j.status}</span>
    <button type="button" class="secondary" data-action="quick-schedule" data-job-action="${j.id}" style="padding:6px 12px;font-size:11px;" onclick="event.stopPropagation();">Agendar para ${nextSlot.targetDate||'próximo dia'} ↗</button>
    <span>›</span>
   </div>
  `).join('')}
 </section>
 `:''}

 <section class="panel section-gap">
  <div class="panel-head">
   <div>
    <h3>Histórico de produções</h3>
    <p>Todos os projetos gerados no estúdio.</p>
   </div>
  </div>
  ${h.length?h.map(row).join(''):empty('Nenhum vídeo no histórico ainda','Seus projetos aparecerão aqui.')}
 </section>`;
}


function field(name,label,value,placeholder='',type='text'){
 if(name==='geminiKey'&&state.settings.geminiBackend==='vertex')return `<div class="callout"><b>Google Cloud · Vertex AI</b><br>${state.settings.vertexConfigured?'Conta de serviço importada.':'Importe a conta de serviço para conectar.'} O servidor renova os tokens automaticamente.</div><label>Arquivo da conta de serviço (.json)<input id="vertex-file" type="file" accept=".json,application/json"></label><small>O conteúdo da chave fica somente no servidor local, criptografado.</small>${field('vertexProject','Projeto Google Cloud',state.settings.vertexProject)}${field('vertexLocation','Região do Vertex',state.settings.vertexLocation||'global')}`;
 return `<label>${label}<input type="${type}" name="${name}" value="${esc(value||'')}" placeholder="${esc(placeholder)}" autocomplete="off"></label>`;
}

function settings(){
 const s=state.settings;
 return heading('Conecte suas ferramentas','Cadastre as chaves aqui. Elas não precisam ser enviadas pelo chat.',false)+`<form id="settings-form"><div class="settings-grid">${providers.map(([id,icon,title,desc])=>`<section class="panel settings-card"><div class="card-title"><span class="provider-icon">${icon}</span><h3>${title}</h3><span class="badge">${s.configured[id+'Key']?'Cadastrada':'Não configurada'}</span></div><p>${({gemini:'Pesquisa com fontes, escrita em inglês e geração de imagens para capas.',go:'Programa as sequências Remotion pelo modelo de motion configurado, com GLM 5.3 Flash como padrão.',fish:'API oficial de narração. Preserva nuances emocionais e prosódia.',pexels:'Busca de filmagens em alta definição com registro de autor e procedência.',pixabay:'Segunda base de vídeos e fotografias para ampliar a cobertura.',youtube:'Busca de referências com filtro Creative Commons.'})[id]}</p>${field(id+'Key','Chave de API','',s.configured[id+'Key']?'Chave salva · deixe vazio para manter':'Cole sua chave aqui','password')}${id==='gemini'?field('geminiModel','Modelo de texto',s.geminiModel)+field('imageModel','Modelo de imagem',s.imageModel):''}${id==='go'?field('goModel','Modelo do plano técnico',s.goModel)+field('motionModel','Modelo que programa as animações Remotion',s.motionModel||'glm-5.3-flash'):''}${id==='fish'?`<label>Estilo documental da voz (Fish Audio)<select onchange="const inp=this.form.querySelector('input[name=fishVoice]');if(this.value!=='custom'){inp.value=this.value;}"><option value="3df6f0a0b0f349dbb0f9425e50c36a5b" ${(s.fishVoice==='3df6f0a0b0f349dbb0f9425e50c36a5b'||!s.fishVoice)?'selected':''}>🎙️ Documentarista BBC (Sóbrio, Britânico e Analítico)</option><option value="7f92f8afb8ec43bf81429cc1c9199cb1" ${s.fishVoice==='7f92f8afb8ec43bf81429cc1c9199cb1'?'selected':''}>🎙️ American Deep Baritone (Grave, Firme e Investigativo)</option><option value="54a587fc19b64816912ff4802c67cf75" ${s.fishVoice==='54a587fc19b64816912ff4802c67cf75'?'selected':''}>🎙️ Discovery Narrator (Enérgico e Autoritário)</option><option value="custom" ${!['3df6f0a0b0f349dbb0f9425e50c36a5b','7f92f8afb8ec43bf81429cc1c9199cb1','54a587fc19b64816912ff4802c67cf75'].includes(s.fishVoice)&&s.fishVoice?'selected':''}>✏️ Personalizado (ID abaixo)</option></select></label>`+field('fishModel','Modelo de voz',s.fishModel)+field('fishVoice','ID da voz (Reference ID Fish Audio)',s.fishVoice||'3df6f0a0b0f349dbb0f9425e50c36a5b'):''}${s.configured[id+'Key']?`<button type="button" class="text-btn" data-clear="${id}Key">Remover chave</button>`:'<small>Salvar a chave não testa a conexão e não consome a API.</small>'}</section>`).join('')}<section class="panel settings-card"><div class="card-title"><span class="provider-icon">R</span><h3>Montagem e preferências</h3></div><p>Remotion e CapCut Desktop rodam localmente no seu computador.</p><label>Provedor do plano técnico das cenas<select name="sceneProvider"><option value="gemini" ${s.sceneProvider==='gemini'?'selected':''}>Gemini</option><option value="go" ${s.sceneProvider==='go'?'selected':''}>OpenCode Go</option></select></label><div class="callout">Motor de montagem: Automático local + CapCut Multi-Pistas.<br>Formato: 1080p horizontal + 9:16 vertical para Shorts.</div></section></div><div class="panel save-bar"><p>Chaves criptografadas no armazenamento local.<br>Proteja a pasta data.</p><button type="submit" class="primary">Salvar integrações →</button></div></form>`;
}

const stageTitles={research:'Pesquisa factual com fontes primárias',script:'Redação do roteiro narrativo com modulação',voice:'Narração de voz com Fish Audio',direction:'Direção e enquadramento das cenas',assets:'Coleta e seleção de vídeos e imagens em HD','visual-review':'Revisão visual e continuidade','motion-code':'Direção global e programação cena por cena','motion-repair':'Correção técnica do código Remotion',thumbnail:'Geração da capa do vídeo',render:'Renderização do vídeo MP4 local','motion-inspection':'Inspeção de intervalos estáticos','preview-ready':'Produção concluída e pronta',done:'Produção concluída'};

function postProductionActions(j){
 if(!j.auto?.finished&&!j.auto?.preview?.ready)return '';
 const isRendering=j.status==='running'&&j.current==='render';
 const isCapcutOpening=j.status==='running'&&j.current==='capcut';
 return `<div class="post-prod-card" style="margin-top:20px;padding:20px;background:rgba(20,59,54,0.18);border:1px solid rgba(122,202,157,0.4);border-radius:10px;">
  <h3 style="margin-bottom:6px;display:flex;align-items:center;gap:8px;color:#a8efbe;"><span>🎬</span> Produção do Vídeo Longo Concluída:</h3>
  <p style="color:var(--muted);margin-bottom:16px;font-size:14px;">Escolha uma das 3 opções para visualizar, renderizar ou editar o projeto:</p>
  <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center;">
   <button class="primary" data-action="render" data-job-action="${j.id}" ${isRendering?'disabled':''}>${isRendering?'🎬 Renderizando MP4…':'🎬 1. Renderizar Vídeo Final (MP4 1080p)'}</button>
   <a class="secondary" href="/api/jobs/${j.id}/studio" target="_blank" rel="noopener" style="text-decoration:none;display:inline-flex;align-items:center;gap:6px;padding:9px 16px;border-radius:6px;border:1px solid var(--border);color:var(--text);">🖥️ 2. Abrir no Remotion Studio ↗</a>
   <button class="primary" data-action="capcut" data-job-action="${j.id}" ${isCapcutOpening?'disabled':''} style="background:#00e5ff;color:#051412;font-weight:700;">${isCapcutOpening?'✂️ Abrindo no CapCut…':'✂️ 3. Abrir no CapCut Desktop ↗'}</button>
  </div>
 </div>`;
}

function automaticPanel(j){
 const isRunning=j.status==='running';
 const isAutoRunning=isRunning&&j.current==='automatic';
 const isRenderRunning=(isRunning&&j.current==='render')||Boolean(j.auto?.renderingMp4);
 const isCapcutRunning=isRunning&&j.current==='capcut';
 const isShortsRunning=isRunning&&j.current==='shorts';

 const hasFinalVideo=Boolean(j.finalVideo||(j.renders&&j.renders.length>0));
 const finalVideoUrl=j.finalVideo?.path||j.renders?.[0]?.url||null;

 const lastRenderMsg=(j.events||[]).slice().reverse().find(e=>e.message?.includes('Renderização MP4:'))?.message;
 const renderPctFromLog=lastRenderMsg?parseInt(lastRenderMsg.match(/(\d+)%/)?.[1]||0,10):0;
 const renderPct=j.auto?.renderProgress!==undefined?j.auto.renderProgress:renderPctFromLog;

 const autoFinished=Boolean(j.auto?.finished||j.auto?.preview?.ready);
 const shortsFinished=Boolean(j.shorts?.finished);
 const shortsItems=(j.shorts?.items||[]).filter(x=>x?.finished);
 const stageName=stageTitles[j.auto?.stage]||j.auto?.stage||'Pronto para iniciar';
 const shortsStageTitles={curiosities:'Extraindo curiosidades do vídeo principal',script:'Gerando roteiro do Short',voice:'Gerando narração do Short',transcription:'Transcrevendo para sincronização',direction:'Dirigindo cenas do Short',assets:'Selecionando mídia para o Short','motion-code':'GLM programando cenas verticais','preview-validation':'Validando composição do Short',done:'Todos os 5 Shorts prontos'};

  const totalScenesCount=j.automaticPlan?.shots?.length||j.scenes?.length||69;
  const mainVideoCard=`
  <section class="panel" style="margin-bottom:24px;border:1px solid ${hasFinalVideo?'#a8efbe':isRenderRunning?'#0288d1':autoFinished?'#2e7d32':'var(--line)'};">
   <div class="panel-head" style="background:${hasFinalVideo?'#f4fbf6':isRenderRunning?'#e1f5fe':autoFinished?'#f2faf4':'#fff'};">
    <div>
     <h3 style="font-size:15px;display:flex;align-items:center;gap:8px;">
      <span>🎬</span> Vídeo Principal (Documentário de ${j.minutes||13} Minutos)
     </h3>
     <p>1080p horizontal · Narração oficial Fish Audio, filmagens HD, mapas animados e efeitos visuais.</p>
    </div>
    <div>
     ${hasFinalVideo?'<span class="badge" style="background:#d4f3e0;color:#18613d;font-weight:700;">✓ VÍDEO FINAL RENDERIZADO</span>':
       isRenderRunning?`<span class="badge running" style="background:#b3e5fc;color:#01579b;font-weight:700;"><span class="pulse-dot" style="background:#01579b;"></span> RENDERIZANDO MP4 (${renderPct}%)...</span>`:
       autoFinished?'<span class="badge review" style="background:#e8f5e9;color:#1b5e20;font-weight:700;">✓ PRONTO PARA ASSISTIR</span>':
       isAutoRunning?'<span class="badge running"><span class="pulse-dot"></span> GERANDO PRODUÇÃO...</span>':
       '<span class="badge">NÃO INICIADO</span>'}
    </div>
   </div>

   <div style="padding:20px;">
    ${autoFinished&&!hasFinalVideo?`
     <div style="margin-bottom:18px;padding:16px;background:linear-gradient(135deg,rgba(20,59,54,0.08),rgba(122,202,157,0.18));border:1.5px solid #2e7d32;border-radius:10px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">
      <div>
       <h4 style="margin:0 0 4px 0;color:#1b5e20;font-size:14px;display:flex;align-items:center;gap:6px;">
        <span>🎉</span> Vídeo Principal 100% Programado e Pronto para Assistir!
       </h4>
       <p style="margin:0;font-size:12px;color:#2e7d32;">
        Todas as ${totalScenesCount} cenas animadas, narração oficial e trilha sonora estão prontas. Você pode assistir agora mesmo no Remotion Studio ou renderizar o arquivo MP4.
       </p>
      </div>
      <div style="display:flex;gap:10px;align-items:center;">
       <a class="primary" href="/api/jobs/${j.id}/studio" target="_blank" rel="noopener" style="text-decoration:none;display:inline-flex;align-items:center;gap:6px;padding:10px 18px;background:#1db86f;color:#fff;font-weight:700;font-size:13px;border-radius:6px;box-shadow:0 2px 8px rgba(29,184,111,0.3);">
        ▶ 👁️ Abrir Player no Remotion Studio ↗
       </a>
      </div>
     </div>
    `:''}

    <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(190px, 1fr));gap:10px;margin-bottom:18px;padding:12px;background:#f9fbf9;border-radius:8px;border:1px solid #eef2ee;">
     <div style="font-size:12px;"><b>1. Roteiro:</b> ${j.script?'<span style="color:var(--green)">✓ Pronto ('+j.script.split(/\s+/).length+' palavras)</span>':'<span style="color:var(--muted)">Pendente</span>'}</div>
     <div style="font-size:12px;"><b>2. Narração:</b> ${j.voice?'<span style="color:var(--green)">✓ Gravada ('+(Math.round((j.voiceDuration||543)/60*10)/10)+' min)</span>':'<span style="color:var(--muted)">Pendente</span>'}</div>
     <div style="font-size:12px;"><b>3. Cenas & Mídias:</b> ${j.scenes||j.auto?.mediaCoverage?'<span style="color:var(--green)">✓ '+totalScenesCount+' Cenas programadas</span>':'<span style="color:var(--muted)">Pendente</span>'}</div>
     <div style="font-size:12px;"><b>4. Efeitos Visuais (MP4):</b> ${hasFinalVideo?'<span style="color:var(--green);font-weight:700;">✓ 100% Renderizado</span>':isRenderRunning?`<span style="color:#0288d1;font-weight:700;display:inline-flex;align-items:center;gap:4px;"><span class="pulse-dot" style="background:#0288d1;"></span> Renderizando (${renderPct}%)</span>`:'<span style="color:#2e7d32;font-weight:600;">✓ Pronto (Remotion Studio)</span>'}</div>
    </div>

    ${isRenderRunning?`
     <div style="margin:16px 0;padding:16px;background:#f0f9ff;border:2px solid #0288d1;border-radius:10px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
       <span style="font-weight:700;color:#01579b;font-size:13px;display:flex;align-items:center;gap:8px;">
        <span class="pulse-dot" style="background:#0288d1;"></span> ⏳ Renderizando Vídeo com 100% dos Efeitos Visuais em 1080p...
       </span>
       <span style="font-size:16px;font-weight:800;color:#0277bd;">${renderPct}%</span>
      </div>
      <div style="height:12px;background:#b3e5fc;border-radius:6px;overflow:hidden;">
       <div style="height:100%;width:${Math.max(4,renderPct)}%;background:linear-gradient(90deg, #0288d1, #00e5ff);transition:width 0.4s ease;border-radius:6px;"></div>
      </div>
      <div style="display:flex;justify-content:space-between;margin-top:6px;font-size:11px;color:#0277bd;">
       <span>Compilando ${totalScenesCount} cenas animadas, mapas D3, rotas marítimas SVG e gráficos</span>
       <span><b>${renderPct}% concluído</b></span>
      </div>
     </div>
    `:isAutoRunning?`
     <div class="auto-status-card running" style="margin:12px 0;">
      <div class="auto-meta-row">
       <span><b>Etapa Atual:</b> ${esc(stageName)}</span>
       <span class="auto-pct"><b>${j.auto?.progress||0}%</b></span>
      </div>
      <div class="auto-progress-bar-bg"><div class="auto-progress-bar-fill running" style="width:${j.auto?.progress||10}%;"></div></div>
     </div>
    `:''}

    ${hasFinalVideo?`
     <div style="margin:16px 0;padding:16px;background:#13231e;border-radius:10px;color:#fff;">
      <h4 style="margin:0 0 10px 0;color:#a8efbe;font-size:14px;display:flex;align-items:center;gap:8px;">▶ Vídeo Final com Efeitos Visuais (Pronto para Assistir):</h4>
      <video controls preload="metadata" src="${esc(finalVideoUrl)}" style="width:100%;max-height:420px;border-radius:6px;background:#000;"></video>
      <div style="margin-top:10px;display:flex;gap:12px;align-items:center;">
       <a href="${esc(finalVideoUrl)}" download class="primary" style="padding:8px 14px;font-size:12px;background:#1db86f;">↓ Baixar Vídeo MP4 (1080p)</a>
      </div>
     </div>
    `:''}

    <div style="margin-top:16px;">
     <b style="display:block;margin-bottom:10px;font-size:13px;color:#2c3a33;">Ações do Vídeo Principal:</b>
     <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(230px, 1fr));gap:12px;">
      
      <div style="padding:14px;background:#fff;border:1px solid #dbe6dd;border-radius:8px;display:flex;flex-direction:column;justify-content:space-between;">
       <div>
        <div style="font-weight:700;font-size:13px;margin-bottom:4px;color:var(--green);">Opção 1: Renderizar Vídeo MP4</div>
        <p style="font-size:11px;color:var(--muted);margin-bottom:12px;">Gera o MP4 final em 1080p com 100% dos efeitos visuais (mapas animados, rotas SVG e gráficos).</p>
       </div>
       <button class="primary" data-action="render" data-job-action="${j.id}" ${isRunning?'disabled':''} style="width:100%;justify-content:center;background:${isRenderRunning?'#0288d1':''};">
        ${isRenderRunning?`⏳ Renderizando MP4 (${renderPct}%)…`:hasFinalVideo?'🔄 Renderizar Novamente':'🎬 1. Renderizar Vídeo Final'}
       </button>
      </div>

      <div style="padding:14px;background:#fff;border:1px solid ${hasFinalVideo?'#b2dfdb':'#e0e0e0'};border-radius:8px;display:flex;flex-direction:column;justify-content:space-between;opacity:${hasFinalVideo?'1':'0.85'};">
       <div>
        <div style="font-weight:700;font-size:13px;margin-bottom:4px;color:${hasFinalVideo?'#007a8c':'#757575'};">Opção 2: Exportar para CapCut</div>
        <p style="font-size:11px;color:var(--muted);margin-bottom:12px;">Limpa rascunhos velhos e envia o projeto multi-pistas completo (com vídeo de efeitos e mídias) para o CapCut.</p>
       </div>
       <div>
        <button class="primary" data-action="capcut" data-job-action="${j.id}" ${(!hasFinalVideo||isRunning)?'disabled':''} style="width:100%;justify-content:center;background:${hasFinalVideo?'#0097a7':'#9e9e9e'};border-color:${hasFinalVideo?'#00838f':'#757575'};cursor:${hasFinalVideo?'pointer':'not-allowed'};">
         ${isCapcutRunning?'✂️ Exportando para CapCut…':hasFinalVideo?'✂️ 2. Exportar para CapCut Desktop':'🔒 2. Exportar para CapCut'}
        </button>
        ${!hasFinalVideo?`
         <small style="color:#d32f2f;display:block;margin-top:6px;font-size:10.5px;font-weight:600;text-align:center;">⚠️ Renderize o vídeo MP4 (Opção 1) antes de exportar para o CapCut.</small>
        `:`
         <small style="color:#1b5e20;display:block;margin-top:6px;font-size:10.5px;font-weight:600;text-align:center;">✓ Efeitos visuais 100% prontos para abrir na timeline do CapCut.</small>
        `}
       </div>
      </div>

      <div style="padding:14px;background:#fff;border:1px solid #dbe6dd;border-radius:8px;display:flex;flex-direction:column;justify-content:space-between;">
       <div>
        <div style="font-weight:700;font-size:13px;margin-bottom:4px;color:#455a64;">Opção 3: Remotion Studio</div>
        <p style="font-size:11px;color:var(--muted);margin-bottom:12px;">Abre o player interativo ao vivo no navegador para navegar frame a frame em todas as cenas.</p>
       </div>
       <a class="secondary" href="/api/jobs/${j.id}/studio" target="_blank" rel="noopener" style="display:flex;justify-content:center;align-items:center;padding:11px;font-size:12px;text-align:center;width:100%;background:#f0faf4;border-color:#1db86f;color:#18613d;font-weight:700;">
        🖥️ 3. Abrir no Remotion Studio ↗
       </a>
      </div>

     </div>
    </div>
   </div>
  </section>`;

 const shortsCard=`
 <section class="panel" style="margin-bottom:24px;border:1px solid ${shortsFinished?'#a8efbe':isShortsRunning?'#ffb74d':'var(--line)'};">
  <div class="panel-head" style="background:${shortsFinished?'#f4fbf6':isShortsRunning?'#fffbf5':'#fff'};">
   <div>
    <h3 style="font-size:15px;display:flex;align-items:center;gap:8px;">
     <span>📱</span> 5 Shorts Verticais (Cortes Derivados em 9:16)
    </h3>
    <p>5 vídeos verticais curtos (50s a 1m) com curiosidades independentes derivadas deste episódio.</p>
   </div>
   <div>
    ${shortsFinished?'<span class="badge" style="background:#d4f3e0;color:#18613d;font-weight:700;">✓ 5 DE 5 SHORTS CONCLUÍDOS</span>':
      isShortsRunning?'<span class="badge running" style="background:#fff3e0;color:#b26a00;font-weight:700;"><span class="pulse-dot"></span> GERANDO SHORTS ('+shortsItems.length+'/5)...</span>':
      '<span class="badge">NÃO INICIADO</span>'}
   </div>
  </div>

  <div style="padding:20px;">
   ${isShortsRunning?`
    <div class="auto-status-card running" style="margin-bottom:16px;">
     <div class="auto-meta-row">
      <span><b>Etapa Atual dos Shorts:</b> ${esc(shortsStageTitles[j.shorts?.stage]||j.shorts?.stage||'Gerando...')}</span>
      <span class="auto-pct"><b>${j.shorts?.progress||0}%</b></span>
     </div>
     <div class="auto-progress-bar-bg"><div class="auto-progress-bar-fill running" style="width:${j.shorts?.progress||0}%;"></div></div>
    </div>
   `:''}

   <div style="display:grid;gap:8px;margin-bottom:16px;">
    ${[0,1,2,3,4].map(idx=>{
      const item=j.shorts?.items?.[idx];
      const curiosity=j.shorts?.curiosities?.[idx];
      const isDone=Boolean(item&&item.finished);
      const isCurrent=isShortsRunning&&!isDone&&(idx===shortsItems.length);
      return `
       <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:${isDone?'#f2f8f4':isCurrent?'#fffbf0':'#fafafa'};border:1px solid ${isDone?'#cde7d5':isCurrent?'#ffe082':'#eef0ee'};border-radius:8px;gap:8px;flex-wrap:wrap;">
        <div style="display:flex;align-items:center;gap:10px;min-width:0;flex:1;">
         <span style="display:grid;place-items:center;width:24px;height:24px;border-radius:50%;background:${isDone?'var(--green)':'#ddd'};color:#fff;font-weight:700;font-size:11px;">${idx+1}</span>
         <div style="min-width:0;flex:1;">
          <b style="display:block;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${esc(item?.title||curiosity?.title||'Short '+(idx+1))}</b>
          <small style="color:var(--muted);font-size:10px;">${isDone?'✓ Concluído ('+Math.round(item.duration)+'s) · Salvo em data/shorts/'+j.id+'/short_'+(idx+1)+'/':isCurrent?'⏳ Processando roteiro, voz e cenas...':'Aguardando início'}</small>
         </div>
        </div>
        <div style="display:flex;gap:6px;align-items:center;">
         ${isDone?`
          <a href="/shorts/${j.id}/short_${idx+1}/short_${idx+1}.mp4" download class="text-btn" style="color:var(--green);font-size:11px;padding:3px 8px;border:1px solid #cde7d5;border-radius:4px;text-decoration:none;" target="_blank">🎬 MP4</a>
          <a href="/shorts/${j.id}/short_${idx+1}/voice.mp3" download class="text-btn" style="color:#546e7a;font-size:11px;padding:3px 8px;border:1px solid #ddd;border-radius:4px;text-decoration:none;">🎤 Áudio</a>
          <span class="badge" style="background:#e0f2e9;color:#1e7e4c;font-weight:700;">✓ PRONTO</span>
         `:isCurrent?'<span class="badge running"><span class="pulse-dot"></span> GERANDO</span>':'<span class="badge">PENDENTE</span>'}
        </div>
       </div>
      `;
    }).join('')}
   </div>

   <div style="display:flex;gap:12px;align-items:center;">
    <button class="secondary" data-run="shorts" data-auto-job="${j.id}" ${isRunning||shortsFinished?'disabled':''} style="font-weight:600;">
     ${shortsFinished?'✓ Todos os 5 Shorts Gerados com Sucesso':isShortsRunning?'⏳ Gerando Shorts em Segundo Plano…':'⚡ Gerar os 5 Shorts Agora'}
    </button>
   </div>
  </div>
 </section>`;

  const music=j.selectedMusic||{
   name:'Trilha Automática Inteligente',
   category:'geopolitics',
   categoryName:'Geopolítica & Estratégia',
   path:'Musicas/músicas canal dark sem copy/Warzone - Anno Domini Beats.mp3',
   mood:'Tensão e poder militar',
   energy:'high',
   defaultVolume:0.20,
   reason:'Selecionada automaticamente pelo robô de acordo com o tema do documentário.',
   alternatives:[]
  };

  const musicCard=`
  <section class="panel" style="margin-bottom:24px;border:1px solid #cce3d4;">
   <div class="panel-head" style="background:#f4fbf6;">
    <div>
     <h3 style="font-size:15px;display:flex;align-items:center;gap:8px;">
      <span>🎵</span> Trilha Sonora de Fundo (BGM)
     </h3>
     <p>O robô seleciona automaticamente a música ideal da pasta de acordo com o clima e ritmo do vídeo.</p>
    </div>
    <span class="badge" style="background:#e8f5e9;color:#2e7d32;font-weight:700;">${esc(music.categoryName||'Automática')}</span>
   </div>
   <div style="padding:18px 20px;">
    <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:12px;">
     <div>
      <div style="display:flex;align-items:center;gap:8px;">
       <b style="font-size:14px;color:#17221f;">${esc(music.name)}</b>
       <span class="badge" style="font-size:10px;padding:2px 8px;background:#e0f2f1;color:#00695c;">${esc(music.mood||'Adequada ao tema')}</span>
      </div>
      <p style="font-size:11px;color:var(--muted);margin-top:4px;max-width:680px;">💡 <i>${esc(music.reason||'Trilha integrada ao vídeo.')}</i></p>
     </div>
     <div style="font-size:11px;color:#546e7a;">
      <b>Volume mixado:</b> ${Math.round((music.defaultVolume||0.20)*100)}% (voz nítida)
     </div>
    </div>

    <audio controls src="/${esc(music.path)}" style="width:100%;height:38px;margin-bottom:14px;border-radius:6px;"></audio>

    ${(music.alternatives&&music.alternatives.length)?`
     <div style="margin-top:12px;padding-top:12px;border-top:1px dashed #dce7df;">
      <b style="display:block;font-size:11.5px;color:#37474f;margin-bottom:8px;">Sugestões alternativas no mesmo estilo:</b>
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
       ${music.alternatives.map(alt=>`
        <button type="button" class="secondary" data-action="select-music" data-job-action="${j.id}" data-music-path="${esc(alt.path)}" data-music-name="${esc(alt.name)}" data-music-cat="${esc(alt.category)}" data-music-cat-name="${esc(alt.categoryName)}" data-music-mood="${esc(alt.mood)}" data-music-energy="${esc(alt.energy)}" style="padding:5px 10px;font-size:11px;display:inline-flex;align-items:center;gap:4px;">
         ▶ ${esc(alt.name)}
        </button>
       `).join('')}
      </div>
     </div>
    `:''}

    <div style="margin-top:14px;display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
     <label style="font-size:11.5px;font-weight:600;color:#2e3c36;margin:0;">Trocar por qualquer música da biblioteca:</label>
     <select id="music-select-dropdown" style="flex:1;min-width:240px;padding:6px 10px;font-size:11.5px;border-radius:6px;border:1px solid #c8d6cb;">
      <option value="">-- Escolha uma das 212 músicas da pasta Musicas --</option>
      ${(musicCatalog.tracks||[]).map(t=>`
       <option value="${esc(t.relPath)}" data-name="${esc(t.filename.replace(/\.mp3$/i,''))}" data-category="${esc(t.category)}" data-category-name="${esc(t.categoryName)}" data-mood="${esc(t.mood)}" data-energy="${esc(t.energy)}" ${t.relPath===music.path?'selected':''}>
        [${esc(t.folder)}] ${esc(t.filename)} (${esc(t.mood)})
       </option>
      `).join('')}
     </select>
    </div>
   </div>
  </section>`;

 const eventsCard=`
 <section class="panel">
  <div class="panel-head">
   <div>
    <h3 style="font-size:14px;display:flex;align-items:center;gap:8px;">
     <span>▤</span> Registro de Atividades em Tempo Real
    </h3>
    <p>Últimas operações e eventos do robô nesta produção.</p>
   </div>
  </div>
  <div style="padding:16px;max-height:260px;overflow-y:auto;">
   ${(j.events||[]).slice().reverse().slice(0,20).map(e=>`
    <div class="event" style="padding:6px 0;font-size:12px;">
     <time style="color:#8ca093;font-size:10px;margin-right:10px;font-family:monospace;">${new Date(e.at).toLocaleTimeString('pt-BR')}</time>
     <span>${esc(e.message)}</span>
    </div>
   `).join('')}
  </div>
 </section>`;

 return mainVideoCard+musicCard+shortsCard+eventsCard;
}

function finalPanel(j){
 const hasFinalVideo=Boolean(j.finalVideo||(j.renders&&j.renders.length>0));
 const finalVideoPath=j.finalVideo?.path||j.renders?.[0]?.url||null;
 const isRunning=j.status==='running';
 const isRenderRunning=(isRunning&&j.current==='render')||Boolean(j.auto?.renderingMp4);
 const isCapcutRunning=isRunning&&j.current==='capcut';
 const autoFinished=Boolean(j.auto?.finished||j.auto?.preview?.ready);
 const totalScenesCount=j.automaticPlan?.shots?.length||j.scenes?.length||69;
 const durationSec=Math.round(j.voiceDuration||j.renders?.[0]?.duration||(j.minutes*60));
 const durationMin=Math.floor(durationSec/60);
 const durationSecRem=durationSec%60;

 const lastRenderMsg=(j.events||[]).slice().reverse().find(e=>e.message?.includes('Renderização MP4:'))?.message;
 const renderPctFromLog=lastRenderMsg?parseInt(lastRenderMsg.match(/(\d+)%/)?.[1]||0,10):0;
 const renderPct=j.auto?.renderProgress!==undefined?j.auto.renderProgress:renderPctFromLog;

 const shortsFinished=Boolean(j.shorts?.finished);
 const isShortsRunning=isRunning&&j.current==='shorts';
 const shortsItems=j.shorts?.items||[];
 const curiosities=j.shorts?.curiosities||[];
 const shortsCount=shortsItems.filter(x=>x?.finished).length;

 // Section 1: Main Big Video (1080p)
 const mainVideoSection=`
 <section class="panel" id="section-main-video" style="margin-top:20px;border:1.5px solid ${hasFinalVideo?'#2e7d32':isRenderRunning?'#0288d1':'var(--line)'};">
  <div class="panel-head" style="background:${hasFinalVideo?'#f4fbf6':isRenderRunning?'#e1f5fe':'#fff'};">
   <div>
    <h3 style="font-size:15px;display:flex;align-items:center;gap:8px;">
     <span>🎬</span> 1. Vídeo Principal (Documentário Completo em 1080p)
    </h3>
    <p>1920x1080 Horizontal · Duração: ${durationMin}m${durationSecRem>0?` ${durationSecRem}s`:''} · ${totalScenesCount} Cenas Animadas Remotion + Narração Oficial</p>
   </div>
   <div>
    ${hasFinalVideo?'<span class="badge" style="background:#d4f3e0;color:#18613d;font-weight:700;">✓ VÍDEO FINAL PRONTO</span>':
      isRenderRunning?`<span class="badge running" style="background:#b3e5fc;color:#01579b;font-weight:700;"><span class="pulse-dot" style="background:#01579b;"></span> RENDERIZANDO (${renderPct}%)...</span>`:
      autoFinished?'<span class="badge review" style="background:#e8f5e9;color:#1b5e20;font-weight:700;">✓ PRONTO NO REMOTION</span>':
      '<span class="badge">NÃO INICIADO</span>'}
   </div>
  </div>

  <div style="padding:20px;">
   ${hasFinalVideo?`
    <div style="background:#0d1916;border-radius:10px;padding:16px;margin-bottom:18px;border:1px solid #1f3d35;">
     <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:8px;">
      <div style="display:flex;align-items:center;gap:8px;">
       <b style="font-size:13px;color:#a8efbe;">▶ Player do Vídeo Final (1080p MP4)</b>
       <span class="badge" style="background:#1d4337;color:#a8efbe;border:1px solid #2e7d32;font-size:10px;">${durationMin}m ${durationSecRem}s</span>
      </div>
      <div style="display:flex;gap:8px;">
       <button type="button" class="secondary" data-watch-video="${esc(finalVideoPath)}" data-video-title="${esc(j.title)}" data-aspect="16-9" data-studio-url="/api/jobs/${j.id}/studio" data-download-url="${esc(finalVideoPath)}" data-type="🎬 VÍDEO PRINCIPAL (1080p)" style="background:#1c372f;color:#e8f5ec;border-color:#2e7d32;font-size:11px;padding:5px 10px;">
        📺 Modo Cinema
       </button>
       <a href="${esc(finalVideoPath)}" target="_blank" class="secondary" style="background:#1c372f;color:#e8f5ec;border-color:#2e7d32;font-size:11px;padding:5px 10px;text-decoration:none;">
        🌐 Abrir em Nova Aba ↗
       </a>
      </div>
     </div>
     <video controls playsinline preload="metadata" src="${esc(finalVideoPath)}" style="width:100%;max-height:480px;border-radius:6px;background:#000;"></video>
    </div>
   `:autoFinished?`
    <div style="margin-bottom:16px;padding:16px;background:linear-gradient(135deg,rgba(20,59,54,0.08),rgba(122,202,157,0.18));border:1.5px solid #2e7d32;border-radius:8px;">
     <b style="color:#1b5e20;font-size:13.5px;display:block;margin-bottom:4px;">🎉 Vídeo Principal Programado no Remotion!</b>
     <p style="font-size:12px;color:#2e7d32;margin-bottom:12px;">Assista agora mesmo no Remotion Studio frame a frame ou renderize o arquivo MP4.</p>
     <div style="display:flex;gap:10px;flex-wrap:wrap;">
      <a class="primary" href="/api/jobs/${j.id}/studio" target="_blank" rel="noopener" style="font-size:12px;padding:8px 14px;background:#1db86f;">
       🖥️ Abrir no Remotion Studio ↗
      </a>
      <button class="primary" data-action="render" data-job-action="${j.id}" ${isRunning?'disabled':''} style="font-size:12px;padding:8px 14px;">
       🎬 Renderizar Arquivo MP4
      </button>
     </div>
    </div>
   `:empty('Vídeo principal pendente','Inicie a etapa Produção Automática para gerar o vídeo.')}

   <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-top:12px;">
    ${hasFinalVideo?`
     <a href="${esc(finalVideoPath)}" download class="primary" style="font-size:12px;padding:9px 16px;background:#1db86f;">↓ Baixar Vídeo MP4 (1080p)</a>
    `:''}
    <a class="secondary" href="/api/jobs/${j.id}/studio" target="_blank" rel="noopener" style="font-size:12px;padding:9px 16px;">🖥️ Remotion Studio ↗</a>
    <button class="primary" data-action="capcut" data-job-action="${j.id}" ${(!hasFinalVideo||isRunning)?'disabled':''} style="font-size:12px;padding:9px 16px;background:${hasFinalVideo?'#0097a7':'#9e9e9e'};border-color:${hasFinalVideo?'#00838f':'#757575'};">
     ${isCapcutRunning?'✂️ Exportando…':hasFinalVideo?'✂️ Abrir no CapCut Desktop ↗':'🔒 Exportar para CapCut'}
    </button>
   </div>

   <div class="dropzone" id="capcut-dropzone" style="margin-top:16px;" onclick="$('#capcut-file-input').click()">
    <span class="dropzone-icon">📥</span>
    <b>Substituir pelo MP4 editado no CapCut (opcional)</b>
    <p style="color:var(--muted);font-size:11px;margin:3px 0;">Arraste o arquivo .mp4 exportado do CapCut para cá</p>
    <input type="file" id="capcut-file-input" accept="video/mp4" style="display:none;">
   </div>
  </div>
 </section>`;

 // Section 2: 5 Shorts Gallery
  // Section 2: Shorts Gallery
  const targetShortsCount = (j.shorts?.finished && j.shorts?.items?.length) ? j.shorts.items.length : (j.shortsCount || (j.shorts?.items?.length > 1 ? j.shorts.items.length : (j.generateShorts ? 5 : 1)));
  const targetIndices = Array.from({length: Math.max(targetShortsCount, (j.shorts?.items?.length || 0))}, (_, i) => i);
  const doneShortsCount = (j.shorts?.items?.filter(x=>x?.finished)?.length) || 0;
  const isAllDone = shortsFinished || (targetShortsCount > 0 && doneShortsCount >= targetShortsCount);
  const shortsSection=`
  <section class="panel" id="section-shorts" style="margin-top:20px;border:1.5px solid ${isAllDone?'#2e7d32':isShortsRunning?'#ffb74d':'var(--line)'};">
   <div class="panel-head" style="background:${isAllDone?'#f4fbf6':isShortsRunning?'#fffbf5':'#fff'};">
    <div>
     <h3 style="font-size:15px;display:flex;align-items:center;gap:8px;">
      <span>📱</span> 2. ${targetShortsCount > 1 ? 'Os ' + targetShortsCount + ' YouTube Shorts Verticais' : 'O YouTube Short Vertical'} (1080x1920 • Formato 9:16)
     </h3>
     <p>${targetShortsCount > 1 ? targetShortsCount + ' vídeos verticais curtos' : 'Vídeo vertical curto'} com curiosidades independentes derivadas deste documentário.</p>
    </div>
    <div style="display:flex;gap:8px;align-items:center;">
     ${isAllDone?`<span class="badge" style="background:#d4f3e0;color:#18613d;font-weight:700;">✓ ${doneShortsCount || targetShortsCount} DE ${targetShortsCount} PRONTOS</span>`:
       isShortsRunning?`<span class="badge running" style="background:#fff3e0;color:#b26a00;font-weight:700;"><span class="pulse-dot"></span> GERANDO (${shortsCount}/${targetShortsCount})...</span>`:
       '<span class="badge">NÃO INICIADO</span>'}
     <button class="secondary" data-run="shorts" data-auto-job="${j.id}" ${isRunning||isAllDone?'disabled':''} style="font-size:11px;padding:5px 10px;">
      ${isAllDone?`✓ ${targetShortsCount > 1 ? targetShortsCount + ' Shorts' : 'Short'} Concluído`:isShortsRunning?'⏳ Gerando...':`⚡ Gerar ${targetShortsCount > 1 ? 'os ' + targetShortsCount + ' Shorts' : 'Short'}`}
     </button>
    </div>
   </div>

   <div style="padding:20px;">
    <div class="shorts-grid">
     ${targetIndices.map(idx=>{
      const item=shortsItems[idx];
      const curiosity=curiosities[idx];
      const isDone=Boolean(item&&item.finished);
      const isCurrent=isShortsRunning&&!isDone&&(idx===shortsCount);
      const title=item?.title||curiosity?.title||`Short ${idx+1}`;
      const hook=curiosity?.hook||curiosity?.body||'Curiosidade independente derivada do vídeo.';
      const shortVideoUrl=`/shorts/${j.id}/short_${idx+1}/short_${idx+1}.mp4`;
      const shortVoiceUrl=`/shorts/${j.id}/short_${idx+1}/voice.mp3`;
      const shortStudioUrl=`/api/jobs/${j.id}/shorts/${idx+1}/studio`;
      const durSec=item?.duration?Math.round(item.duration):55;

      return `
       <div class="short-card" style="border:1.5px solid ${isDone?'#bce5ca':isCurrent?'#ffe082':'#e5ebe7'};background:${isDone?'#fff':'#fafcfb'};">
        <div class="short-card-header">
         <div style="display:flex;align-items:center;gap:8px;">
          <span style="display:grid;place-items:center;width:24px;height:24px;border-radius:50%;background:${isDone?'#176b52':'#9e9e9e'};color:#fff;font-weight:800;font-size:11px;">${idx+1}</span>
          <b style="font-size:12px;color:#182823;">Short #${idx+1}</b>
         </div>
         <span class="short-badge" style="background:${isDone?'#e8f5ec':'#f5f5f5'};color:${isDone?'#18613d':'#757575'};font-size:10px;">
          ${isDone?`✓ ${durSec}s (9:16)`:isCurrent?'⏳ GERANDO':'PENDENTE'}
         </span>
        </div>

        <div class="short-card-body">
         <h4 style="margin:0 0 5px 0;font-size:12.5px;line-height:1.35;color:#192e26;">${esc(title)}</h4>
         <p style="font-size:11px;color:#5e6d66;margin-bottom:10px;line-height:1.45;max-height:44px;overflow:hidden;text-overflow:ellipsis;">
          <i>"${esc(hook)}"</i>
         </p>

         <div class="short-video-container" style="max-height:300px;">
          ${isDone?`
           <video controls playsinline preload="metadata" src="${esc(shortVideoUrl)}"></video>
          `:`
           <div style="color:#7a8a83;font-size:11px;text-align:center;padding:20px;">
            <div style="font-size:24px;margin-bottom:6px;">${isCurrent?'⏳':'📱'}</div>
            <span>${isCurrent?'Renderizando cenas verticais...':'Aguardando geração'}</span>
           </div>
          `}
         </div>

         ${isDone?`
          <div class="short-actions">
           <button type="button" class="job-btn-pill pill-primary" data-watch-video="${esc(shortVideoUrl)}" data-video-title="${esc(title)}" data-aspect="9-16" data-studio-url="${esc(shortStudioUrl)}" data-download-url="${esc(shortVideoUrl)}" data-type="📱 SHORT #${idx+1} (9:16)" style="flex:1;justify-content:center;padding:6px 6px;font-size:10.5px;">
            📺 Assistir
           </button>
           <a href="${esc(shortStudioUrl)}" target="_blank" class="job-btn-pill pill-secondary" style="padding:6px 6px;font-size:10.5px;" title="Remotion Studio 9:16">
            🖥️ Studio ↗
           </a>
           <a href="${esc(shortVideoUrl)}" target="_blank" class="job-btn-pill pill-secondary" style="padding:6px 6px;font-size:10.5px;" title="Abrir em Nova Aba">
            🌐 Aba ↗
           </a>
           <a href="${esc(shortVideoUrl)}" download class="job-btn-pill pill-primary" style="padding:6px 6px;font-size:10.5px;" title="Baixar Short MP4">
            ↓ MP4
           </a>
           <a href="${esc(shortVoiceUrl)}" download class="job-btn-pill pill-secondary" style="padding:6px 6px;font-size:10.5px;" title="Baixar Áudio MP3">
            🎤 Áudio
           </a>
          </div>
         `:''}
        </div>
       </div>
      `;
    }).join('')}
   </div>
  </div>
 </section>`;

 // Section 3: Publishing Metadata
 const meta=j.publishingMetadata;
 const metadataSection=`<section class="panel" style="margin-top:20px;">
  <div class="panel-head">
   <div>
    <h3>3. Metadados de Publicação (Alto CTR & SEO)</h3>
    <p>Títulos irresistíveis, capítulos com timestamps exatos e tags otimizadas para o YouTube.</p>
   </div>
   <button class="secondary" data-action="generate-metadata" data-job-action="${j.id}" ${isRunning?'disabled':''}>✨ Gerar Títulos & SEO com IA</button>
  </div>
  <div style="padding:20px;">
   ${meta?`
    <div>
     <b>Escolha o Título Oficial do Vídeo (Clique para selecionar):</b>
     ${(meta.titles||[]).map((t,idx)=>`
      <div class="title-option ${(j.selectedTitle||meta.titles[0])===t?'selected':''}" data-action="select-title" data-job-action="${j.id}" data-title="${esc(t)}">
       <span>${idx+1}.</span> <span>${esc(t)}</span>
      </div>
     `).join('')}
     
     <label style="margin-top:16px;display:block;"><b>Descrição Completa para o YouTube (com Capítulos & Fontes):</b>
      <textarea rows="10" readonly style="width:100%;margin-top:6px;font-family:monospace;font-size:12px;">${esc(meta.description)}</textarea>
     </label>
     
     <div style="margin-top:12px;">
      <b>Tags sugeridas:</b> <small style="color:var(--muted);">${(meta.tags||[]).join(', ')}</small>
     </div>
    </div>
   `:empty('Gere os metadados com um clique','O robô criará 3 títulos de alto clique, capítulos calculados pelas cenas e tags para o YouTube.')}
  </div>
 </section>`;

 // Section 4: Scheduling & Package
 const isScheduled=Boolean(j.scheduled);
 const scheduleSection=`<section class="panel" style="margin-top:20px;">
  <div class="panel-head">
   <div>
    <h3>4. Agendamento Inteligente & Pacote</h3>
    <p>Agende para o próximo dia livre na grade ou baixe os dados completos de publicação.</p>
   </div>
  </div>
  <div style="padding:20px;">
   ${isScheduled?`
    <div class="callout" style="border-left:4px solid var(--green);margin-bottom:16px;background:rgba(122,202,157,0.12);">
     <b>Agendamento Confirmado:</b><br>
     • <b>Vídeo Longo:</b> Postagem em <b>${j.scheduled.targetDate}</b> às <b>${j.scheduled.longVideo?.time} EST</b><br>
     • <b>5 Shorts:</b> Distribuídos em ${j.scheduled.targetDate} e ${j.scheduled.nextDate}<br>
     • <b>Status:</b> Na fila de publicações
    </div>
   `:''}
   <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center;">
    <button class="primary" data-action="schedule-job" data-job-action="${j.id}" ${isRunning?'disabled':''}>${isScheduled?'Reagendar (Próximo Dia Livre)':'Agendar Publicação (Próximo Dia Livre)'}</button>
    <a class="secondary" href="/api/jobs/${j.id}/package" download style="text-decoration:none;display:inline-flex;align-items:center;gap:6px;padding:9px 16px;border-radius:6px;border:1px solid var(--border);color:var(--text);">Baixar Pacote de Publicação (JSON)</a>
   </div>
  </div>
 </section>`;

 return mainVideoSection+shortsSection+metadataSection+scheduleSection;
}

function detail(){
 const j=state.jobs.find(x=>x.id===selected);
 if(!j){page='projects';return projects();}
 const blocked=j.status==='running',isAuto=blocked&&j.current==='automatic',isShorts=blocked&&j.current==='shorts';
 const tabMap={
  events:'Painel de Produção & Shorts',
  ...stepNames,
  final:'Final & Publicação'
 };
 return `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;"><button class="text-btn" data-page="projects">← Todas as produções</button><button class="text-btn" data-delete-job="${j.id}" style="color:#b25d3b;font-size:11px;">🗑 Excluir esta produção e arquivos</button></div>`+heading(esc(j.title),`${j.minutes} minutos planejados · Inglês americano · Criado em ${date(j.createdAt)} ${j.generateShorts?'· (+5 Shorts ativado)':''} ${j.scheduled?`· Agendado para ${j.scheduled.targetDate}`:''}`,false)+`${j.error&&tab==='events'?`<div class="error-box">${esc(j.error)}</div>`:''}<div class="details-grid"><section class="panel"><div class="panel-head"><h3>Etapas da produção</h3></div>${Object.entries(stepNames).map(([key,name],i)=>`<div class="step"><div><h3>${String(i+1).padStart(2,'0')} &nbsp; ${name}</h3><small>${(j.current===key||(key==='scenes'&&j.current==='editing'))&&blocked?'Em execução...':j.completed.includes(key)?'Concluída':'Aguardando'}</small></div><button class="secondary" data-run="${key}" ${blocked||j.completed.includes(key)?'disabled':''}>${j.completed.includes(key)?'✓':'Iniciar'}</button></div>`).join('')}<div class="step" style="border-top:1px solid var(--border);padding-top:12px;margin-top:10px;"><div><h3>07 &nbsp; Vídeo Completo</h3><small>${isAuto?'Gerando...':j.auto?.finished?'✓ Concluído':'Automático Remotion'}</small></div><button class="primary" data-run="automatic" ${isAuto||j.auto?.finished?'disabled':''}>${isAuto?'Gerando...':j.auto?.finished?'✓ Pronto':'Gerar Vídeo'}</button></div><div class="step"><div><h3>08 &nbsp; 5 Shorts Verticais</h3><small>${isShorts?'Gerando...':j.shorts?.finished?'✓ 5 prontos':'Cortes 9:16 (1 a 1,5m)'}</small></div><button class="secondary" data-run="shorts" ${isShorts||!j.auto?.finished||j.shorts?.finished?'disabled':''}>${isShorts?'Gerando...':j.shorts?.finished?'✓ Prontos':'Gerar 5 Shorts'}</button></div><div class="detail-body"><p>Cada etapa pode ser controlada individualmente ou pelo robô automático.</p><a class="text-btn" href="/api/jobs/${j.id}/export">↓ Exportar projeto JSON</a></div></section><section class="panel"><div class="detail-tabs">${Object.entries(tabMap).map(([k,n])=>`<button data-tab="${k}" class="${tab===k?'active':''}">${n}</button>`).join('')}</div><div class="detail-body">${tab==='events'?automaticPanel(j):detailContent(j)}</div></section></div>`;
}

function detailContent(j){
 if(tab==='final')return finalPanel(j);
 if(tab==='scenes')return renderEditPlan(j,esc);
 if(tab==='thumbnail')return renderCovers(j,esc);
 if(tab==='media')return renderFootage(j,{esc,safeURL,shotFilter});
 if(tab==='events')return j.events.slice().reverse().map(e=>`<div class="event"><time>${new Date(e.at).toLocaleTimeString('pt-BR')}</time>${esc(e.message)}</div>`).join('');
 if(tab==='research')return j.research?`<div class="prose">${esc(j.research.text)}</div><div class="source-list">${j.research.sources.map(s=>`<a href="${safeURL(s.uri)}" target="_blank" rel="noopener noreferrer">↗ ${esc(s.title||s.uri)}</a>`).join('')}</div>`:empty('Tudo começa com uma boa pesquisa','Inicie a etapa Pesquisa. O resultado e suas fontes aparecerão aqui.');
 if(tab==='script')return j.script?`<form id="script-form"><h3>Roteiro em inglês</h3><textarea name="text" rows="18" ${j.voice||j.scenes?'readonly':''}>${esc(j.script)}</textarea><button class="secondary" ${j.voice||j.scenes?'disabled':''}>Salvar revisão</button></form>`:empty('O roteiro ganha forma aqui','Conclua a pesquisa e inicie a etapa Roteiro.');
 if(tab==='voice')return j.voice?`<h3>Narração Oficial · Fish Audio</h3><audio controls src="${esc(j.voice)}"></audio><a class="secondary" href="${esc(j.voice)}" download>↓ Baixar MP3</a>`:empty('Dê voz à sua história','Revise o roteiro e inicie a etapa Narração com a Fish Audio.');
 if(tab==='thumbnail')return j.thumbnail?`<h3>Capa gerada · Gemini</h3><img class="output-image" src="${esc(j.thumbnail)}" alt="Capa gerada"><a class="secondary" href="${esc(j.thumbnail)}" download>↓ Baixar imagem</a>`:empty('A primeira impressão do seu vídeo','Inicie a etapa Capa para gerar uma imagem com o Gemini.');
}

function render(){
 document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('active',b.dataset.page===(page==='detail'?'projects':page)));
 $('#breadcrumb').innerHTML=`Workspace <span>/</span> ${names[page]||page}`;
 $('#nav-count').textContent=state.jobs.length;
 const topicsBadge=$('#topics-count');
 if(topicsBadge) topicsBadge.textContent=(topicsData.queue||[]).filter(t=>t.status==='pending').length;
 $('#content').innerHTML=({overview,topics:topicsPage,projects,library,schedule,settings,detail}[page])();
}

async function refresh(force=false){
 const next=await api('/api/state');
 const fingerprint=JSON.stringify(next);
 state=next;
 hubData=await api('/api/hub').catch(()=>hubData);
 topicsData=await api('/api/topics').catch(()=>topicsData);
 const topicsBadge=$('#topics-count');
 if(topicsBadge) topicsBadge.textContent=(topicsData.queue||[]).filter(t=>t.status==='pending').length;
 if(!musicCatalog.tracks?.length){
  musicCatalog=await api('/api/music').catch(()=>({categories:{},tracks:[]}));
 }
 if(page==='schedule'){
  scheduleData=await api('/api/schedule').catch(()=>scheduleData);
 }
 if(force||fingerprint!==lastFingerprint){
  lastFingerprint=fingerprint;
  if(force||!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName)&&page!=='settings')render();
 }
}

document.addEventListener('click',async e=>{
 const watchBtn=e.target.closest('[data-watch-video]');
 if(watchBtn){
  e.stopPropagation();
  const src=watchBtn.dataset.watchVideo;
  const title=watchBtn.dataset.videoTitle||'Vídeo';
  const aspect=watchBtn.dataset.aspect||'16-9';
  const studioUrl=watchBtn.dataset.studioUrl||'#';
  const downloadUrl=watchBtn.dataset.downloadUrl||src;
  const typeText=watchBtn.dataset.type||'🎬 VÍDEO';

  const modal=$('#player-modal');
  const video=$('#player-modal-video');
  if(modal&&video){
   $('#player-modal-type').textContent=typeText;
   $('#player-modal-title').textContent=title;
   $('#player-modal-newtab').href=src;
   const studioBtn=$('#player-modal-studio');
   if(studioUrl&&studioUrl!=='#'){
    studioBtn.href=studioUrl;
    studioBtn.style.display='inline-flex';
   }else{
    studioBtn.style.display='none';
   }
   $('#player-modal-download').href=downloadUrl;
   
   if(aspect==='9-16') modal.classList.add('vertical-mode');
   else modal.classList.remove('vertical-mode');

   video.src=src;
   modal.showModal();
   video.play().catch(()=>{});
  }
  return;
 }

 if(e.target.closest('#player-modal-close')||(e.target.id==='player-modal'&&e.target===e.currentTarget)){
  const modal=$('#player-modal');
  const video=$('#player-modal-video');
  if(video){video.pause();video.removeAttribute('src');video.load();}
  if(modal)modal.close();
  return;
 }

 const openJobBtn=e.target.closest('[data-open-job]');
 if(openJobBtn){
  e.stopPropagation();
  selected=openJobBtn.dataset.openJob;
  page='detail';
  tab=openJobBtn.dataset.openTab||'final';
  const scrollToId=openJobBtn.dataset.scrollTo;
  render();
  if(scrollToId){
   setTimeout(()=>{
    const el=document.getElementById(scrollToId);
    if(el) el.scrollIntoView({behavior:'smooth',block:'start'});
   },60);
  }
  return;
 }

 const autoTarget=e.target.closest('[data-auto-job]');
 if(autoTarget)selected=autoTarget.dataset.autoJob;
 const b=e.target.closest('button,[data-job],a[data-action],.title-option');
 if(!b||b.disabled)return;
 try{
   if(b.dataset.page){page=b.dataset.page;if(page==='schedule')scheduleData=await api('/api/schedule').catch(()=>scheduleData);render();}
   if(b.hasAttribute('data-new')){$('#new-dialog').showModal();$('#new-form input').focus();}
   if(b.hasAttribute('data-close')) (b.closest('dialog')||$('#new-dialog')||$('#topics-dialog'))?.close();
   if(b.hasAttribute('data-open-topics-dialog')||b.closest('[data-open-topics-dialog]')){
    const dlg=$('#topics-dialog');
    if(dlg){
     dlg.showModal();
     const titleInput=dlg.querySelector('input[name="title"]');
     if(titleInput) setTimeout(()=>titleInput.focus(),100);
    }
    return;
   }
   if(b.id==='tab-topic-single'){
    b.classList.add('active');
    b.style.background='#eaf3ee';
    b.style.color='#216b51';
    const tabBulk=$('#tab-topic-bulk');
    if(tabBulk){tabBulk.classList.remove('active');tabBulk.style.background='none';tabBulk.style.color='#7a8480';}
    const singleFields=$('#topic-single-fields');
    const bulkFields=$('#topic-bulk-fields');
    if(singleFields) singleFields.style.display='block';
    if(bulkFields) bulkFields.style.display='none';
    const titleInput=singleFields?.querySelector('input[name="title"]');
    if(titleInput) titleInput.required=true;
    return;
   }
   if(b.id==='tab-topic-bulk'){
    b.classList.add('active');
    b.style.background='#eaf3ee';
    b.style.color='#216b51';
    const tabSingle=$('#tab-topic-single');
    if(tabSingle){tabSingle.classList.remove('active');tabSingle.style.background='none';tabSingle.style.color='#7a8480';}
    const singleFields=$('#topic-single-fields');
    const bulkFields=$('#topic-bulk-fields');
    if(singleFields) singleFields.style.display='none';
    if(bulkFields) bulkFields.style.display='block';
    const titleInput=singleFields?.querySelector('input[name="title"]');
    if(titleInput) titleInput.required=false;
    return;
   }
   if(b.hasAttribute('data-run-next-topic')||b.closest('[data-run-next-topic]')){
    b.disabled=true;
    toast('Iniciando análise inteligente e produção da próxima pauta...');
    const res=await api('/api/topics/run-next',{},'POST');
    if(res.jobId){
     selected=res.jobId;
     page='detail';
     tab='events';
    }
    await refresh(true);
    toast(res.message||'Produção iniciada com sucesso!');
    return;
   }
   if(b.dataset.topicsFilter){
    topicsFilter=b.dataset.topicsFilter;
    render();
    return;
   }
   if(b.dataset.runSpecificTopic){
    b.disabled=true;
    toast('Iniciando análise e produção desta pauta...');
    const res=await api('/api/topics/run-next',{topicId:b.dataset.runSpecificTopic},'POST');
    if(res.jobId){
     selected=res.jobId;
     page='detail';
     tab='events';
    }
    await refresh(true);
    toast(res.message||'Produção iniciada com sucesso!');
    return;
   }
   if(b.dataset.dismissAlert){
    b.disabled=true;
    await api(`/api/hub/alerts/${b.dataset.dismissAlert}/dismiss`,{},'POST');
    await refresh(true);
    return;
   }
   if(b.dataset.deleteTopic){
    const topicId=b.dataset.deleteTopic;
    if(!confirm('Deseja excluir esta pauta da fila?')) return;
    b.disabled=true;
    await api(`/api/topics/${topicId}`,undefined,'DELETE');
    await refresh(true);
    toast('Pauta excluída com sucesso.');
    return;
   }
  if(b.dataset.deleteJob){
   e.stopPropagation();
   const jobId=b.dataset.deleteJob;
   const jobObj=state.jobs.find(x=>x.id===jobId);
   const jobTitle=jobObj?.title||'esta produção';
   if(!confirm(`Excluir permanentemente "${jobTitle}" e todos os arquivos gerados no computador?`))return;
   b.disabled=true;
   await api(`/api/jobs/${jobId}`,undefined,'DELETE');
   if(selected===jobId)selected=null;
   page='projects';
   await refresh(true);
   toast('Produção e arquivos excluídos com sucesso.');
   return;
  }
  if(b.dataset.job){
   selected=b.dataset.job;
   page='detail';
   const j=state.jobs.find(x=>x.id===selected);
   if(j?.renders?.length||j?.finalVideo||j?.shorts?.finished)tab='final';
   else tab='events';
   render();
  }
  if(b.dataset.detailShot){shotFilter=b.dataset.detailShot;tab='media';render();}
  if(b.dataset.cover){await api(`/api/jobs/${selected}/select-thumbnail`,{id:b.dataset.cover});await refresh(true);toast('Capa principal atualizada.');}
  if(b.dataset.tab){tab=b.dataset.tab;render();}
  if(b.dataset.action==='render'){
   b.disabled=true;
   await api(`/api/jobs/${b.dataset.jobAction}/render`,{});
   await refresh(true);
   toast('Renderização MP4 iniciada! Acompanhe na aba Atividade.');
  }
  if(b.dataset.action==='toggle-shorts'){
   b.disabled=true;
   await api(`/api/jobs/${b.dataset.jobAction}/toggle-shorts`,{});
   await refresh(true);
   toast('Opção de Shorts atualizada!');
  }
  if(b.dataset.action==='capcut'){
   b.disabled=true;
   await api(`/api/jobs/${b.dataset.jobAction}/capcut`,{});
   await refresh(true);
   toast('Projeto sincronizado e CapCut Desktop aberto com sucesso!');
  }
  if(b.dataset.action==='generate-metadata'){
   b.disabled=true;
   toast('Gerando títulos de alto clique, capítulos e SEO com Gemini...');
   await api(`/api/jobs/${b.dataset.jobAction}/metadata`,{});
   await refresh(true);
   toast('Metadados de publicação gerados com sucesso!');
  }
  if(b.dataset.action==='select-title'){
   const j=state.jobs.find(x=>x.id===selected);
   if(j){j.selectedTitle=b.dataset.title;render();}
  }
  if(b.dataset.action==='schedule-job'){
   b.disabled=true;
   const j=state.jobs.find(x=>x.id===b.dataset.jobAction);
   const selTitle=j?.selectedTitle||j?.publishingMetadata?.titles?.[0]||j?.title;
   const res=await api(`/api/jobs/${b.dataset.jobAction}/schedule`,{selectedTitle:selTitle});
   scheduleData=await api('/api/schedule').catch(()=>scheduleData);
   await refresh(true);
   toast(`✓ Projeto agendado com sucesso para ${res.scheduled.targetDate} às ${res.scheduled.longVideo.time}!`);
  }
  if(b.dataset.action==='quick-schedule'){
   b.disabled=true;
   const res=await api(`/api/jobs/${b.dataset.jobAction}/schedule`,{});
   scheduleData=await api('/api/schedule').catch(()=>scheduleData);
   await refresh(true);
   toast(`✓ Projeto agendado com sucesso para ${res.scheduled.targetDate} às ${res.scheduled.longVideo.time}!`);
  }
  if(b.dataset.action==='unschedule-job'){
   b.disabled=true;
   await api(`/api/jobs/${b.dataset.jobAction}/unschedule`,{});
   scheduleData=await api('/api/schedule').catch(()=>scheduleData);
   await refresh(true);
   toast('Projeto removido da fila de agendamento.');
  }
  if(b.dataset.action==='select-music'){
   b.disabled=true;
   await api(`/api/jobs/${b.dataset.jobAction}/music`,{
    path:b.dataset.musicPath,
    name:b.dataset.musicName,
    category:b.dataset.musicCat,
    categoryName:b.dataset.musicCatName,
    mood:b.dataset.musicMood,
    energy:b.dataset.musicEnergy
   });
   await refresh(true);
   toast(`✓ Trilha sonora alterada para "${b.dataset.musicName}"!`);
  }
  if(b.dataset.run){
   b.disabled=true;
   tab=b.dataset.run==='automatic'?'events':b.dataset.run==='editing'?'scenes':b.dataset.run;
   await api(`/api/jobs/${selected}/run`,{step:b.dataset.run});
   await refresh(true);
  }
  if(b.dataset.clear){
   await api('/api/settings',{clear:[b.dataset.clear==='geminiKey'&&state.settings.geminiBackend==='vertex'?'vertexCredentials':b.dataset.clear]});
   await refresh(true);
   toast('Chave removida.');
  }
  if(b.dataset.media){
   await api(`/api/jobs/${selected}/approve-media`,{id:b.dataset.media,source:b.dataset.source});
   await refresh(true);
   toast('Referência selecionada.');
  }
 }catch(err){
  toast(err.message);
  b.disabled=false;
 }
});

document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.matches('[data-job]'))e.target.click();});
document.addEventListener('change',async e=>{
 if(e.target.id==='shot-filter'){shotFilter=e.target.value;render();return;}
 if(e.target.id==='music-select-dropdown'){
  const opt=e.target.selectedOptions[0];
  if(!opt||!opt.value)return;
  try{
   await api(`/api/jobs/${selected}/music`,{
    path:opt.value,
    name:opt.dataset.name,
    category:opt.dataset.category,
    categoryName:opt.dataset.categoryName,
    mood:opt.dataset.mood,
    energy:opt.dataset.energy
   });
   await refresh(true);
   toast(`✓ Trilha sonora alterada para "${opt.dataset.name}"!`);
  }catch(err){toast(err.message);}
  return;
 }
 if(e.target.id==='vertex-file'){
  const file=e.target.files?.[0];
  if(!file)return;
  try{
   if(file.size>20000)throw new Error('Arquivo JSON muito grande.');
   await api('/api/settings/vertex',{credentials:await file.text()});
   await refresh(true);
   toast('Vertex AI configurado com a conta de serviço.');
  }catch(err){e.target.value='';toast(err.message);}
  return;
 }
 if(e.target.id==='capcut-file-input'){
  const file=e.target.files?.[0];
  if(!file)return;
  toast('Importando vídeo final do CapCut...');
  const reader=new FileReader();
  reader.onload=async()=>{
   try{
    await api(`/api/jobs/${selected}/upload-final`,{filename:file.name,data:reader.result});
    await refresh(true);
    toast('Vídeo final do CapCut importado com sucesso!');
   }catch(err){toast(err.message);}
  };
  reader.readAsDataURL(file);
 }
});

document.addEventListener('dragover',e=>{
 const dz=e.target.closest('#capcut-dropzone');
 if(dz){e.preventDefault();dz.classList.add('dragover');}
});
document.addEventListener('dragleave',e=>{
 const dz=e.target.closest('#capcut-dropzone');
 if(dz)dz.classList.remove('dragover');
});
document.addEventListener('drop',async e=>{
 const dz=e.target.closest('#capcut-dropzone');
 if(dz){
  e.preventDefault();dz.classList.remove('dragover');
  const file=e.dataTransfer.files?.[0];
  if(!file||!file.name.endsWith('.mp4')){toast('Por favor, envie um arquivo .mp4.');return;}
  toast('Importando vídeo final do CapCut...');
  const reader=new FileReader();
  reader.onload=async()=>{
   try{
    await api(`/api/jobs/${selected}/upload-final`,{filename:file.name,data:reader.result});
    await refresh(true);
    toast('Vídeo final do CapCut importado com sucesso!');
   }catch(err){toast(err.message);}
  };
  reader.readAsDataURL(file);
 }
});

document.addEventListener('input',e=>{if(e.target.id==='filter')$('#job-list').innerHTML=state.jobs.filter(j=>j.title.toLowerCase().includes(e.target.value.toLowerCase())).map(row).join('')||empty('Nenhuma produção encontrada','Tente outro título.');});

document.addEventListener('submit',async e=>{
 e.preventDefault();
 if(busy)return;
 const form=e.target,b=form.querySelector('button[type="submit"],button:not([type])'),data=Object.fromEntries(new FormData(form));
 busy=true;
 if(b)b.disabled=true;
 try{
  if(form.id==='schedule-settings-form'){
   const shortTimes=[data.short1,data.short2,data.short3,data.short4,data.short5];
   await api('/api/schedule/settings',{longTime:data.longTime,shortTimes});
   scheduleData=await api('/api/schedule').catch(()=>scheduleData);
   await refresh(true);
   toast('Horários de agendamento salvos com sucesso!');
  }
  if(form.id==='thumbnail-form'){await api(`/api/jobs/${selected}/run`,{step:'thumbnail',direction:data.direction});await refresh(true);toast('Gerando uma nova versão de capa.');}
  if(form.dataset.clip){await api(`/api/jobs/${selected}/assign-clip`,{id:form.dataset.clip,source:form.dataset.clipSource,shotId:form.dataset.shot,trimStart:Number(data.trimStart),trimEnd:Number(data.trimEnd),reviewed:data.reviewed==='on'});await refresh(true);toast('Trecho atribuído.');}
  if(form.id==='new-form'){
   const j=await api('/api/jobs',{...data,generateShorts:form.querySelector('[name="generateShorts"]')?.checked||false});
   selected=j.id;
   page='detail';
   tab='events';
   $('#new-dialog').close();
   form.reset();
   await refresh(true);
   toast('Produção criada! Inicie a geração automática.');
  }
  if(form.id==='topics-form'){
   const isBulk=$('#tab-topic-bulk')?.classList.contains('active');
   if(isBulk){
    const bulkText=data.bulkText;
    if(!bulkText||!bulkText.trim()) throw new Error('Cole ao menos um tema na lista.');
    const res=await api('/api/topics',{bulkText});
    $('#topics-dialog').close();
    form.reset();
    await refresh(true);
    toast(`✓ ${res.added?.length||0} pautas cadastradas com sucesso no banco!`);
   }else{
    const res=await api('/api/topics',{
     title:data.title,
     description:data.description||'',
     minutes:Number(data.minutes)||15,
     generateShorts:form.querySelector('[name="generateShorts"]')?.checked??true
    });
    $('#topics-dialog').close();
    form.reset();
    await refresh(true);
    toast('✓ Nova pauta cadastrada com sucesso!');
   }
  }
  if(form.id==='settings-form'){await api('/api/settings',data);await refresh(true);toast('Integrações salvas.');}
  if(form.id==='script-form'){await api(`/api/jobs/${selected}/script`,data);await refresh(true);toast('Revisão salva.');}
  if(form.id==='media-form'){toast('Buscando referências...');await api(`/api/jobs/${selected}/search`,data);await refresh(true);}
 }catch(err){
  toast(err.message);
 }finally{
  busy=false;
  if(b)b.disabled=false;
 }
});

const introScreen=$('#intro-screen');
if(introScreen){
 introScreen.addEventListener('click',()=>launchIntro());
 introScreen.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' ')launchIntro();});
}

const introStartBtn=$('#intro-start-btn');
if(introStartBtn){
 introStartBtn.addEventListener('click',e=>{
  e.stopPropagation();
  launchIntro();
 });
}

const loginForm=$('#login-form');
if(loginForm){
 loginForm.addEventListener('submit',async e=>{
  e.preventDefault();
  const pwInput=$('#login-password');
  const errEl=$('#login-error');
  const submitBtn=$('#login-submit');
  if(!pwInput||!pwInput.value)return;
  submitBtn.disabled=true;
  if(errEl)errEl.style.display='none';
  try{
   await api('/api/auth/login',{password:pwInput.value});
   hideLogin();
   pwInput.value='';
   const logoutBtn=$('#btn-logout');
   if(logoutBtn)logoutBtn.style.display='inline-flex';
   await refresh(true);
   toast('Bem-vindo ao Atlas Studio, Sr. Daniel.');
  }catch(err){
   if(errEl){errEl.textContent=err.message||'Chave incorreta.';errEl.style.display='block';}
   pwInput.focus();
  }finally{
   submitBtn.disabled=false;
  }
 });
}

const togglePwBtn=$('#toggle-password');
if(togglePwBtn){
 togglePwBtn.addEventListener('click',()=>{
  const input=$('#login-password');
  if(!input)return;
  if(input.type==='password'){
   input.type='text';
   togglePwBtn.textContent='🔒';
  }else{
   input.type='password';
   togglePwBtn.textContent='👁';
  }
 });
}

const logoutBtn=$('#btn-logout');
if(logoutBtn){
 logoutBtn.addEventListener('click',async()=>{
  if(!confirm('Deseja realmente encerrar a sessão?'))return;
  await api('/api/auth/logout',{}).catch(()=>{});
  showLogin();
 });
}

async function initApp(){
 try{
  const auth=await api('/api/auth/me');
  if(auth.authRequired){
   if(logoutBtn)logoutBtn.style.display='inline-flex';
   if(!auth.authenticated){
    showLogin();
    return;
   }
  }
  await refresh(true);
 }catch(e){
  // Se 401, o showLogin já foi acionado
 }
}

await initApp();
setInterval(()=>{
 const overlay=$('#login-overlay');
 if(overlay&&overlay.classList.contains('hidden')){
  refresh().catch(()=>{});
 }
},2500);
