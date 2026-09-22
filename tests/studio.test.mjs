import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm,readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import http from 'node:http';
import {createStore} from '../lib/store.mjs';
import {publicSettings} from '../lib/providers.mjs';
async function cleanTestDir(dir){const resolved=path.resolve(dir);assert.equal(path.dirname(resolved),path.resolve(tmpdir()));assert.match(path.basename(resolved),/^atlas-(store|http)-/);await rm(resolved,{recursive:true,force:true});}
test('encrypted persistence and secret redaction survive reopening',async()=>{
 const dir=await mkdtemp(path.join(tmpdir(),'atlas-store-'));let s=createStore(dir);
 try{s.saveSettings({geminiBackend:'api',geminiKey:'test-secret-never-public',fishModel:'s2.1-pro-free'});s.put({id:'abc',title:'A test'});s.close();s=createStore(dir);assert.equal(s.settings().geminiKey,'test-secret-never-public');assert.equal(s.get('abc').title,'A test');assert.equal(publicSettings(s.settings()).geminiKey,undefined);assert.equal(publicSettings(s.settings()).configured.geminiKey,true);assert.equal((await readFile(path.join(dir,'studio.sqlite'))).includes(Buffer.from('test-secret-never-public')),false);}finally{s.close();await cleanTestDir(dir);}
});
test('dashboard API: projects, prerequisites, credentials, CSRF and file boundaries',async()=>{
 const dir=await mkdtemp(path.join(tmpdir(),'atlas-http-')),port=44310;
 const child=spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:String(port),ATLAS_DATA_DIR:dir},stdio:['ignore','pipe','pipe']});
 const request=(p,data,headers={})=>fetch(`http://127.0.0.1:${port}${p}`,data===undefined?{headers}:{method:'POST',headers:{'Content-Type':'application/json',...headers},body:JSON.stringify(data)});
 try{
  await Promise.race([once(child.stdout,'data'),new Promise((_,reject)=>setTimeout(()=>reject(new Error('Server did not start')),8000).unref())]);
  assert.equal((await request('/')).status,200);
  assert.equal((await request('/api/jobs',{title:'x',minutes:8})).status,400);
  assert.equal((await request('/api/jobs',{title:'A focused geography topic',minutes:3,notes:'x'.repeat(401)})).status,400);
  const r=await request('/api/jobs',{title:'Why are small countries rich?',minutes:3,notes:'Focus on Monaco and its tax rules.'});assert.equal(r.status,201);const j=await r.json();assert.equal(j.notes,'Focus on Monaco and its tax rules.');
  assert.equal((await request('/api/settings',{geminiBackend:'api',geminiKey:'secret-for-test'},{Origin:'https://attacker.invalid'})).status,403);
  assert.equal((await request('/api/settings',{geminiBackend:'api',geminiKey:'secret-for-test'})).status,200);
  const state=await(await request('/api/state')).json();assert.equal(state.jobs.length,1);assert.equal(state.jobs[0].notes,'Focus on Monaco and its tax rules.');assert.equal(state.settings.configured.geminiKey,true);assert.equal(JSON.stringify(state).includes('secret-for-test'),false);
  await request('/api/settings',{clear:['geminiKey']});
  assert.equal((await request(`/api/jobs/${j.id}/run`,{step:'research'})).status,202);
  let failed;for(let i=0;i<20;i++){failed=(await(await request('/api/state')).json()).jobs[0];if(failed.status==='error')break;await new Promise(r=>setTimeout(r,25));}assert.equal(failed.status,'error');assert.match(failed.error,/Configure/);assert.equal(failed.completed.length,0);
  assert.equal((await request(`/api/jobs/${j.id}/run`,{step:'publish'})).status,400);
  assert.equal((await request('/outputs/studio.sqlite')).status,404);
  assert.equal((await request('/data/.vault-key')).status,404);
  assert.equal((await request(`/api/jobs/${j.id}/export`)).status,200);
  const hostStatus=await new Promise((resolve,reject)=>{http.get(`http://127.0.0.1:${port}/api/state`,{headers:{Host:'attacker.invalid'}},r=>{r.resume();resolve(r.statusCode);}).on('error',reject);});assert.equal(hostStatus,403);
 }finally{child.kill();await once(child,'exit');await cleanTestDir(dir);}
});

