import {createStore} from '../lib/store.mjs';
import * as p from '../lib/providers.mjs';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const store=createStore(fileURLToPath(new URL('../data/',import.meta.url)));
const s={...p.defaults,...store.settings()};store.close();
const geminiCredential=s.geminiBackend==='vertex'?'vertexCredentials':'geminiKey';
const directory=new URL('../data/integration-check/',import.meta.url);await mkdir(directory,{recursive:true});
const original=globalThis.fetch;
globalThis.fetch=async(url,options)=>{const r=await original(url,options);if(!r.ok){let detail='';try{const d=await r.clone().json();detail=JSON.stringify(d.error||d.detail||d.message||{});}catch{}for(const key of p.secretFields)if(s[key])detail=detail.split(s[key]).join('[redacted]');throw new Error(`HTTP ${r.status}: ${detail.slice(0,700)}`);}if(String(url).startsWith('https://opencode.ai/')){const d=await r.clone().json();const choice=d.choices?.[0];let details=JSON.stringify({choice,usage:d.usage});for(const key of p.secretFields)if(s[key])details=details.split(s[key]).join('[redacted]');await writeFile(new URL('go-response.json',directory),details);}return r;};
const j={id:randomUUID(),title:'Why is Vatican City a small country?',script:'Small countries can have fascinating stories. This is a short audio test for Atlas Studio.'};
const checks=[
 ['Gemini research',geminiCredential,async()=>{const r=await p.research(s,j);return {sources:r.sources.length,characters:r.text.length};}],
 ['Gemini scenes',geminiCredential,async()=>({scenes:(await p.scenePlan({...s,sceneProvider:'gemini'},j)).scenes.length})],
 ['OpenCode Go','goKey',async()=>({scenes:(await p.scenePlan({...s,sceneProvider:'go'},j)).scenes.length})],
 ['Pexels','pexelsKey',async()=>({results:(await p.footage(s,'Singapore skyline')).length})],
 ['Fish Audio','fishKey',async()=>{const b=await p.voice(s,j);if(b.length<100)throw new Error('Audio too short');await writeFile(new URL('voice.mp3',directory),b);return {bytes:b.length};}],
 ['Gemini image',geminiCredential,async()=>{const r=await p.thumbnail(s,j);await writeFile(new URL('thumbnail.'+r.extension,directory),r.buffer);return {bytes:r.buffer.length};}],
 ['YouTube','youtubeKey',async()=>({results:(await p.youtube(s,'Singapore skyline')).length})]
];
const only=process.argv.slice(2);
const results=await Promise.all(checks.filter(([name])=>!only.length||only.includes(name)).map(async([name,key,run])=>{let result;if(!s[key])result={name,status:'not_configured'};else try{result={name,status:'ok',...await run()};}catch(e){let message=e.message;for(const key of p.secretFields)if(s[key])message=message.split(s[key]).join('[redacted]');result={name,status:'failed',error:message};}console.log(JSON.stringify(result));return result;}));
let previous=[];try{previous=JSON.parse(await readFile(new URL('report.json',directory),'utf8')).results;}catch{}
await writeFile(new URL('report.json',directory),JSON.stringify({date:new Date().toISOString(),results:[...previous.filter(x=>!results.some(r=>r.name===x.name)),...results]},null,2));
