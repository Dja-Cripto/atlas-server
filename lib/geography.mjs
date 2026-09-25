import {readFile,writeFile,mkdir,rename} from 'node:fs/promises';
import path from 'node:path';
import {randomUUID} from 'node:crypto';

const loads=new Map();
const aliases=new Map([
  ['vatican city','vatican'],
  ['vatican city state','vatican'],
  ['holy see','vatican'],
  ['usa','united states of america'],
  ['united states','united states of america'],
  ['uk','united kingdom'],
  ['great britain','united kingdom'],
  ['britain','united kingdom'],
  ['england','united kingdom'],
  ['scotland','united kingdom'],
  ['wales','united kingdom'],
  ['northern ireland','united kingdom'],
  ['holland','netherlands'],
  ['czech republic','czechia'],
  ['south korea','south korea'],
  ['republic of korea','south korea'],
  ['korea south','south korea'],
  ['north korea','north korea'],
  ['dprk','north korea'],
  ['korea north','north korea'],
  ['uae','united arab emirates'],
  ['drc','democratic republic of the congo'],
  ['dr congo','democratic republic of the congo'],
  ['russian federation','russia']
]);

export function countryKey(value){
 const key=String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
 return aliases.get(key)||key;
}

const isFrenchGuiana=k=>['french guiana','guiana francesa','guyane','guyane francaise','french guyana'].includes(k);
const isMetroFrance=k=>['metropolitan france','france metropolitaine'].includes(k);

export function buildGeographicMap(scene,world){
 const hasFG=(scene.countries||[]).some(c=>isFrenchGuiana(countryKey(c)));

 const features=(scene.countries||[]).map((name,index)=>{
  const key=countryKey(name);

  // Natural Earth admin-0 embeds French Guiana in France's MultiPolygon at coordinates[0]
  if(isFrenchGuiana(key)){
   const france=world.features.find(({properties:p={}})=>p.ADMIN==='France'||p.NAME==='France');
   if(france&&france.geometry?.coordinates?.[0]){
    return {
      type:'Feature',
      geometry:{type:'Polygon',coordinates:france.geometry.coordinates[0]},
      properties:{name:'French Guiana',ADMIN:'French Guiana',focal:index===0,requestedName:name}
    };
   }
  }

  // When French Guiana is explicitly distinguished, France refers to European Metropolitan France
  if(isMetroFrance(key)||(key==='france'&&hasFG)){
   const france=world.features.find(({properties:p={}})=>p.ADMIN==='France'||p.NAME==='France');
   if(france&&france.geometry?.coordinates?.length>1){
    const europeanPolys=[france.geometry.coordinates[1],france.geometry.coordinates[11]].filter(Boolean);
    return {
      type:'Feature',
      geometry:{type:'MultiPolygon',coordinates:europeanPolys},
      properties:{name:isMetroFrance(key)?'Metropolitan France':'France',ADMIN:'France',focal:index===0,requestedName:name}
    };
   }
  }

  const found=world.features.find(({properties:p={}})=>[p.ADMIN,p.NAME,p.NAME_LONG,p.ISO_A2,p.ISO_A3,p.NAME_EN,p.NAME_PT,p.NAME_ES,p.FORMAL_EN].some(value=>value&&countryKey(value)===key));
  if(!found)throw Error('País não reconhecido na base geográfica: '+name);
  return {type:'Feature',geometry:found.geometry,properties:{name:found.properties.ADMIN||found.properties.NAME,focal:index===0,requestedName:name}};
 });
 if(!features.length)throw Error('Mapa sem países identificados.');
 const endpoint=name=>features.findIndex(feature=>[feature.properties.name,feature.properties.requestedName].some(value=>value&&countryKey(value)===countryKey(name)));
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
