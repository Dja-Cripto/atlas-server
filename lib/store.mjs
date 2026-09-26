import {DatabaseSync} from 'node:sqlite';
import {mkdirSync,existsSync,readFileSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {randomBytes,randomUUID,createCipheriv,createDecipheriv} from 'node:crypto';
export function createStore(dir){
 mkdirSync(dir,{recursive:true});
 const keyPath=join(dir,'.vault-key'); if(!existsSync(keyPath))writeFileSync(keyPath,randomBytes(32),{mode:0o600});
 const key=readFileSync(keyPath), db=new DatabaseSync(join(dir,'studio.sqlite'));
 db.exec('PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS records (id TEXT PRIMARY KEY, value TEXT NOT NULL); CREATE TABLE IF NOT EXISTS settings (id TEXT PRIMARY KEY, value TEXT NOT NULL)');
 return {
 dir,
 create:(data={})=>{const id=data.id||randomUUID();const j={id,title:String(data.title||'').trim(),notes:String(data.notes||data.description||'').trim(),minutes:Number(data.minutes)||5,generateShorts:Boolean(data.generateShorts),shortsCount:data.generateShorts?5:0,status:'draft',createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),completed:[],events:[{at:new Date().toISOString(),message:'Projeto criado. Pronto para iniciar a produção.'}],current:null,approvedMedia:[],...data};db.prepare('INSERT INTO records VALUES (?,?) ON CONFLICT(id) DO UPDATE SET value=excluded.value').run(j.id,JSON.stringify(j));return j;},
 list:()=>db.prepare('SELECT value FROM records ORDER BY rowid DESC').all().map(x=>JSON.parse(x.value)),
 get:id=>{const r=db.prepare('SELECT value FROM records WHERE id=?').get(id);return r?JSON.parse(r.value):null;},
 put:j=>db.prepare('INSERT INTO records VALUES (?,?) ON CONFLICT(id) DO UPDATE SET value=excluded.value').run(j.id,JSON.stringify(j)),
 delete:id=>db.prepare('DELETE FROM records WHERE id=?').run(id),
 settings:()=>{const r=db.prepare('SELECT value FROM settings WHERE id=?').get('config');if(!r)return {};const [iv,tag,body]=r.value.split('.').map(x=>Buffer.from(x,'base64'));const d=createDecipheriv('aes-256-gcm',key,iv);d.setAuthTag(tag);return JSON.parse(Buffer.concat([d.update(body),d.final()]).toString());},
 saveSettings:s=>{const iv=randomBytes(12),c=createCipheriv('aes-256-gcm',key,iv);const body=Buffer.concat([c.update(JSON.stringify(s)),c.final()]);db.prepare('INSERT OR REPLACE INTO settings VALUES (?,?)').run('config',[iv,c.getAuthTag(),body].map(x=>x.toString('base64')).join('.'));},
 close:()=>db.close()
 };
}
