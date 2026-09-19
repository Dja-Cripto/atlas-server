import {spawnSync} from 'node:child_process';
import {writeFileSync} from 'node:fs';
import ffmpeg from '../renderer/node_modules/ffmpeg-static/index.js';
const cuts=[[19.23,24.72],[97.80,107.18],[138.58,148.80],[197.30,203.30]];
const filters=cuts.map(([a,b],i)=>`[0:a]atrim=start=${a}:end=${b},asetpts=PTS-STARTPTS,afade=t=in:d=0.012,afade=t=out:st=${b-a-0.025}:d=0.025,apad=pad_dur=0.22[a${i}]`);
filters.push(cuts.map((_,i)=>`[a${i}]`).join('')+'concat=n=4:v=0:a=1,loudnorm=I=-16:TP=-1.5:LRA=11[out]');
const r=spawnSync(ffmpeg,['-hide_banner','-loglevel','error','-y','-i','data/0bdc37fa-2353-4721-9252-5d74d99cd700/voice.mp3','-filter_complex',filters.join(';'),'-map','[out]','-ar','48000','renderer/public/pilot/narration.wav'],{stdio:'inherit'});if(r.status)process.exit(r.status);
writeFileSync('renderer/public/pilot/cuts.json',JSON.stringify({cuts,duration:cuts.reduce((s,[a,b])=>s+b-a+0.22,0)},null,2));
