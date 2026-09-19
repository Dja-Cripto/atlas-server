import {spawn} from 'node:child_process';
import ffmpeg from '../renderer/node_modules/ffmpeg-static/index.js';

// Runs only as part of a user-triggered generation. This detects still frames,
// not editorial quality or whether a movement is meaningful.
export async function inspectMotion(filename){
 return new Promise((resolve,reject)=>{
  const process=spawn(ffmpeg,['-hide_banner','-i',filename,'-vf','freezedetect=n=-50dB:d=1.5','-an','-f','null','-'],{windowsHide:true,stdio:['ignore','ignore','pipe']});
  let output='';process.stderr.on('data',chunk=>{output=(output+chunk).slice(-50000);});process.on('error',reject);
  process.on('exit',code=>{
   if(code!==0){reject(Error('Não foi possível verificar os intervalos estáticos.'));return;}
   const starts=[...output.matchAll(/freeze_start:\s*([\d.]+)/g)].map(m=>Number(m[1]));
   if(starts.length){reject(Error('Intervalos visualmente estáticos de pelo menos 1,5 segundo detectados a partir de: '+starts.map(t=>t.toFixed(2)+'s').join(', ')+'. Continue a ação visual ou faça uma transição; não deixe o restante da cena parado.'));return;}
   resolve({staticIntervals:0,thresholdSeconds:1.5});
  });
 });
}
