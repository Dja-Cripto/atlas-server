import {readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {generateJSON} from './providers.mjs';
import {sceneContract,shortsSceneContract,cleanPromptScene,normalizeMotionCode,validateMotionCode,generateFallbackSceneCode} from './motion-author.mjs';

// Repair only the failed scene, preserving the remaining authored video.
export async function recoverScene(s,j,scene,{folder,error,isShort=false,log}){
 const filename=path.join(folder,`Scene${scene.index}.tsx`);
 const previousCode=await readFile(filename,'utf8').catch(()=>null);
 let code=null;
 if(s.goKey){
  try{
   const result=await generateJSON({...s,sceneProvider:'go',goModel:s.motionModel||'glm-5.3-flash',timeoutMs:180000},j,(isShort?shortsSceneContract:sceneContract)+'\nRepair this ONE scene. Preserve its creative intent; fix the execution error. Return JSON {code}. Data: '+JSON.stringify({scene:cleanPromptScene(scene),previousCode,error:String(error.message||error).slice(0,2000)}));
   code=normalizeMotionCode(result.code,scene);validateMotionCode(code,scene);
   log(j,`Cena ${scene.index+1}: reparo específico preservando a composição.`);
  }catch(cause){log(j,`Cena ${scene.index+1}: reparo específico indisponível (${String(cause.message).slice(0,160)}).`);}
 }
 if(!code){
  code=generateFallbackSceneCode(scene,isShort);validateMotionCode(code,scene);
  const state=isShort?j.shorts:j.auto;
  state.visualFallbacks=[...new Set([...(state.visualFallbacks||[]),scene.id])];
  log(j,`Cena ${scene.index+1}: alternativa de contingência aplicada; revisar resultado visual.`);
 }
 await writeFile(filename,code);
 const savedFile=path.join(folder,`scene-${scene.index}.json`);
 const saved=await readFile(savedFile,'utf8').then(JSON.parse).catch(()=>({}));
 await writeFile(savedFile,JSON.stringify({...saved,code,recoveredAt:new Date().toISOString()},null,2));
 return code;
}
