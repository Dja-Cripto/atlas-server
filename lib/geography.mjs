import {readFile,writeFile,mkdir,rename} from 'node:fs/promises';
import path from 'node:path';
import {randomUUID} from 'node:crypto';

const loads=new Map();
const aliases=new Map([['vatican city','vatican'],['vatican city state','vatican'],['holy see','vatican'],['usa','united states of america'],['united states','united states of america'],['uk','united kingdom']]);
export function countryKey(value){
 const key=String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
 return aliases.get(key)||key;
}
export function buildGeographicMap(scene,world){
 const features=(scene.countries||[]).map((name,index)=>{
  const found=world.features.find(({properties:p={}})=>[p.ADMIN,p.NAME,p.NAME_LONG,p.ISO_A2,p.ISO_A3].some(value=>value&&countryKey(value)===countryKey(name)));
  if(!found)throw Error('País não reconhecido na base geográfica: '+name);
  return {type:'Feature',geometry:found.geometry,properties:{name:found.properties.ADMIN||found.properties.NAME,focal:index===0,requestedName:name}};
 });
 if(!features.length)throw Error('Mapa sem países identificados.');
 const endpoint=name=>features.findIndex(feature=>[feature.properties.name,feature.properties.requestedName].some(value=>countryKey(value)===countryKey(name)));
 const from=endpoint(scene.routeFrom),to=endpoint(scene.routeTo);
 // Legacy boolean alone never fabricates an origin, destination or route direction.
 const route=scene.routes===true&&scene.routeEvidence&&from>=0&&to>=0&&from!==to?{from,to,schematic:true}:null;
 return {type:'FeatureCollection',features,atlasRoute:route};
}
async function loadBase(root,name,resolution){
 const filename=path.join(root,'renderer/public/auto',name);
 const key=path.resolve(filename);
 if(!loads.has(key))loads.set(key,(async()=>{
  try{const data=JSON.parse(await readFile(filename,'utf8'));if(data.features?.length)return data;}catch{}
  const response=await fetch(`https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_${resolution}_admin_0_countries.geojson`,{signal:AbortSignal.timeout(60000)});
  if(!response.ok)throw Error('Base geográfica indisponível: HTTP '+response.status);
  const data=await response.json();if(!data.features?.length)throw Error('Base geográfica inválida.');
  await mkdir(path.dirname(filename),{recursive:true});
  const temporary=filename+'.'+randomUUID()+'.tmp';
  await writeFile(temporary,JSON.stringify(data));await rename(temporary,filename);
  return data;
 })().catch(error=>{loads.delete(key);throw error;}));
 return loads.get(key);
}
export async function materializeMap(scene,root){
 const [world]=await Promise.all([loadBase(root,'world.json','10m'),loadBase(root,'world-background.json','50m')]);
 return {...scene,map:buildGeographicMap(scene,world)};
}
