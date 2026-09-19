import {readFileSync,writeFileSync,existsSync,copyFileSync} from 'node:fs';
import {createStore} from '../lib/store.mjs';
import {validateDirection} from '../lib/auto-plan.mjs';
const store=createStore('data');
try{
 const j=store.get('166ba46f-e9b5-49b3-be1c-d8c812fe426b');if(j.status==='running')throw Error('Aguarde a execução ativa.');
 const folder=`renderer/public/auto/${j.auto.runId}`,file=folder+'/resolved.json';
 const scenes=JSON.parse(readFileSync(file)),get=id=>scenes.find(s=>s.id===id);
 if(!existsSync(folder+'/resolved-before-editor-review.json'))copyFileSync(file,folder+'/resolved-before-editor-review.json');
 Object.assign(get('shot-3'),{kind:'explain',heading:'Global Peace Index',caption:'',callout:'#1',sourceLabel:'IEP · Global Peace Index · 2025',map:structuredClone(get('shot-2').map)});
 Object.assign(get('shot-5'),{kind:'footage',heading:'Iceland',caption:'',location:'Iceland',asset:structuredClone(get('shot-14').asset)});
 const quote='**Tajikistan** achieved the highest overall **Law and Order Index** score in the world at **97 out of 100**, followed by Singapore (95), Kosovo (94), China (93), and Iceland (93).';
 const shot=get('shot-9');Object.assign(shot,validateDirection(shot,{...shot,kind:'chart',heading:'Law and Order Index',caption:'Gallup · 2024/2025 report',chart:{unit:'/100',source:'https://www.gallup.com/',quote,values:[{label:'Tajikistan',value:97}]}},j.research));
 Object.assign(get('shot-11'),{kind:'explain',heading:'Small countries, different measures',caption:'',map:structuredClone(get('shot-10').map),sourceLabel:'San Marino and Monaco · Country outlines: Natural Earth'});
 writeFileSync(file,JSON.stringify(scenes,null,2));
 j.auto.editorialRevisions={at:new Date().toISOString(),shots:['shot-3','shot-5','shot-9','shot-11'],note:'Substituições editoriais supervisionadas; não geradas pelo robô.'};
 j.status='interrupted';j.error=null;j.events.push({at:new Date().toISOString(),message:'Revisão: cenas 3, 5, 9 e 11 substituídas. Plano salvo; pronto para retomar antes da capa/renderização.'});store.put(j);
 console.log(JSON.stringify(scenes.filter(s=>['shot-3','shot-5','shot-9','shot-11'].includes(s.id)).map(s=>({id:s.id,kind:s.kind,heading:s.heading}))));
}finally{store.close();}
