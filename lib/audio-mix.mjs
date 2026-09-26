import {spawn} from 'node:child_process';
import {rename,rm} from 'node:fs/promises';

// Normalize a selected track, never the catalog original or an existing production.
export async function normalizeBgmFile(file,{ffmpeg=process.env.FFMPEG_BIN||'ffmpeg'}={}){
 const output=file+'.normalized.mp3';
 await rm(output,{force:true}).catch(()=>{});
 try{
  await new Promise((resolve,reject)=>{
   const child=spawn(ffmpeg,['-hide_banner','-loglevel','error','-y','-i',file,'-af','loudnorm=I=-18:TP=-3:LRA=11','-codec:a','libmp3lame','-q:a','3',output],{windowsHide:true,stdio:['ignore','ignore','pipe']});
   let stderr='';
   child.stderr.on('data',part=>{stderr=(stderr+part).slice(-700);});
   child.on('error',reject);
   child.on('close',code=>code===0?resolve():reject(new Error('Normalização da música falhou: '+stderr)));
  });
  await rename(output,file);
  return {targetLufs:-18,truePeakDb:-3};
 }catch(error){await rm(output,{force:true}).catch(()=>{});throw error;}
}