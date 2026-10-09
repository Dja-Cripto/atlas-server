import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import path from 'node:path';

export const isOpenCodePause=message=>/OpenCode.*(?:em pausa|HTTP 429)|Orçamento diário de chamadas OpenCode/i.test(String(message));
export function openCodePause(dir=path.resolve('data/opencode-control'),now=Date.now()){
 let state={};try{state=JSON.parse(readFileSync(path.join(dir,'usage.json'),'utf8'));}catch(e){if(e.code!=='ENOENT')throw Error('Controle OpenCode ilegível; chamadas bloqueadas para proteger a franquia.');}
 if(state.blockedUntil>now)return state.blockedUntil;
 if(state.day===new Date(now).toISOString().slice(0,10)&&(state.text>=80||state.visual>=120))return Math.floor(now/86400000)*86400000+86400000;
 return 0;
}

// Persist reservations before sending: crashes and HTTP failures must not reset limits.
export async function controlledGoFetch(url,options,{fetchImpl=fetch,dir=path.resolve('data/opencode-control'),now=Date.now()}={}){
 mkdirSync(dir,{recursive:true});const file=path.join(dir,'usage.json');let state={};
 try{state=JSON.parse(readFileSync(file,'utf8'));}catch(e){if(e.code!=='ENOENT')throw Error('Controle OpenCode ilegível; chamadas bloqueadas para proteger a franquia.');}
 if(state.blockedUntil>now)throw Error('OpenCode em pausa por limite até '+new Date(state.blockedUntil).toISOString()+'. Trabalho preservado.');
 const day=new Date(now).toISOString().slice(0,10);if(state.day!==day)state={...state,day,text:0,visual:0};
 const payload=JSON.parse(options.body||'{}');const visual=JSON.stringify(payload.messages||[]).includes('image_url');const kind=visual?'visual':'text';
 const limit=visual?120:80;
 if((state[kind]||0)>=limit)throw Error('Orçamento diário de chamadas OpenCode atingido ('+kind+'); trabalho preservado para retomada.');
 state[kind]=(state[kind]||0)+1;writeFileSync(file,JSON.stringify(state));
 const r=await fetchImpl(url,options);
 if(r.status===429){const seconds=Number(r.headers?.get('retry-after'));state=JSON.parse(readFileSync(file,'utf8'));state.blockedUntil=Math.max(state.blockedUntil||0,now+Math.max(24*3600,Number.isFinite(seconds)?seconds:0)*1000);writeFileSync(file,JSON.stringify(state));throw Error('OpenCode HTTP 429: envios suspensos por pelo menos24h; sem repetição nem fallback Gemini.');}
 return r;
}
