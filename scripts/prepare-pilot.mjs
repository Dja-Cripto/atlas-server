import {createStore} from '../lib/store.mjs';
import {defaults,footage} from '../lib/providers.mjs';
import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';
const out='renderer/public/pilot';mkdirSync(out,{recursive:true});
const store=createStore('data'),s={...defaults,...store.settings()};store.close();
const mode=process.argv[2];
if(mode==='media'){
 const items=await footage(s,'Luxembourg');writeFileSync(out+'/candidates.json',JSON.stringify(items,null,2));console.log(items.map(x=>({id:x.id,url:x.url,author:x.author,duration:x.duration})));
}
if(mode==='map'){
 const url='https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_0_countries.geojson';const r=await fetch(url);if(!r.ok)throw Error('Map HTTP '+r.status);const d=await r.json();d.features=d.features.filter(f=>['Luxembourg','France','Belgium','Germany','Netherlands','Switzerland'].includes(f.properties.ADMIN));writeFileSync(out+'/countries.json',JSON.stringify(d));console.log(d.features.map(f=>f.properties.ADMIN));
}
if(mode==='download'){
 const items=JSON.parse(readFileSync(out+'/candidates.json'));
 for(const id of [8211790,8374061]){const item=items.find(x=>x.id===id);const file=item.files.filter(f=>f.width>=1280&&f.width<=1920).sort((a,b)=>b.width-a.width)[0];if(!file)throw Error('No HD file');const r=await fetch(file.url);if(!r.ok)throw Error('Download HTTP '+r.status);writeFileSync(out+'/'+id+'.mp4',Buffer.from(await r.arrayBuffer()));console.log('Saved',id);}
}
