import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate, spring, Easing} from 'remotion';

const MetricCard: React.FC<{x:number; label:string; value:string; accent:string; f:number; delay:number}> = ({x,label,value,accent,f,delay}) => {
  const s = spring({frame: f - delay, fps: 30, config:{damping:14, stiffness:110}});
  const op = interpolate(s,[0,1],[0,1]);
  return (
    <div style={{position:'absolute', left:x, bottom:100, width:380, height:160, opacity:op, transform:`translateY(${interpolate(s,[0,1],[40,0])}px)`, background:'rgba(15,28,36,0.92)', border:'1px solid rgba(27,73,101,0.9)', borderRadius:14, padding:'22px 28px', boxSizing:'border-box'}}>
      <div style={{fontSize:20, letterSpacing:3, color:'#8fb3c7', textTransform:'uppercase', fontFamily:'Helvetica, Arial'}}>{label}</div>
      <div style={{fontSize:56, fontWeight:700, color:accent, fontFamily:'Helvetica, Arial', marginTop:6}}>{value}</div>
      <div style={{position:'absolute', left:0, top:0, width:6, height:'100%', background:accent, borderRadius:14}}/>
    </div>
  );
};

const WaitShip: React.FC<{x:number; y:number; f:number; delay:number; color:string}> = ({x,y,f,delay,color}) => {
  const s = spring({frame: f - delay, fps: 30, config:{damping:18}});
  return <div style={{position:'absolute', left:x, top:y, width:18, height:9, borderRadius:2, background:color, opacity:interpolate(s,[0,1],[0,0.9]), transform:`translateX(${interpolate(s,[0,1],[-14,0])}px)`}}/>;
};

const MotionScene: React.FC<{scene:any; context:any}> = ({scene}) => {
  const f = useCurrentFrame();
  const fps = 30;
  // headline
  const hIn = spring({frame: f, fps, config:{damping:15, stiffness:100}});
  // lake level: full (y=560) drops to depleted (y=660) between f 60..140
  const lakeTop = interpolate(f,[56,150],[560,668],{easing:Easing.inOut(Easing.ease), extrapolateRight:'clamp'});
  const drainRamp = interpolate(f,[60,150],[0,1],{easing:Easing.inOut(Easing.ease), clamp:true});
  // volume bar of lock: cycle phantom passes so the lock drain repeats every ~38 frames
  const lockCycle = (f % 38) / 38;
  const lockFill = interpolate(lockCycle,[0,0.55,1],[1,0,1],{clamp:true}) * drainRamp;
  const passes = Math.floor(f / 38);
  const shipX = interpolate(lockCycle,[0,0.55],[150,1720],{clamp:true, easing:Easing.inOut(Easing.ease)});
  const shipVisible = drainRamp > 0.02;
  // counting
  const stranded = Math.min(130, Math.floor(drainRamp * 130));
  const waitDays = Math.min(21, Math.floor(Math.max(0, f - 60) / 4.2));
  const dropPct = Math.round(drainRamp * 40);

  return (
    <AbsoluteFill style={{background:'linear-gradient(180deg,#070e14 0%,#0f1c24 60%,#070e14 100%)', fontFamily:'Helvetica, Arial'}}>
      {/* subtle grid */}
      <AbsoluteFill style={{opacity:0.12, backgroundImage:'linear-gradient(rgba(27,73,101,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(27,73,101,0.5) 1px, transparent 1px)', backgroundSize:'80px 80px'}}/>

      {/* headline */}
      <div style={{position:'absolute', left:80, top:70, opacity:interpolate(hIn,[0,1],[0,1])}}>
        <div style={{fontSize:20, letterSpacing:6, color:'#e5a93c', textTransform:'uppercase'}}>Why the Panama Canal is running out of water</div>
        <div style={{fontSize:72, fontWeight:800, color:'#f4f7f9', letterSpacing:-1, marginTop:8}}>The Gatun Lake Bottleneck</div>
      </div>

      {/* terrain silhouette */}
      <svg width="1920" height="1080" style={{position:'absolute', left:0, top:0}}>
        <path d="M80,560 L260,520 L420,555 L640,540 L860,565 L1060,535 L1240,558 L1450,538 L1660,558 L1840,540 L1840,760 L80,760 Z" fill="#0f1c24" opacity={interpolate(lakeTop,[560,668],[1,0.6])}/>
        {/* canal channel walls below lake surface (solid rock) */}
        <rect x={80} y={760} width={1760} height={240} fill="#0b141b"/>
      </svg>

      {/* lake water body */}
      <div style={{position:'absolute', left:80, right:80, top:lakeTop, height:760 - lakeTop + 240, background:'linear-gradient(180deg, rgba(27,73,101,0.95), rgba(11,20,27,0.95))', borderTop:'2px solid rgba(143,179,199,0.7)'}}>
        <div style={{position:'absolute', right:140, top:14, fontSize:18, letterSpacing:3, color:'#8fb3c7', textTransform:'uppercase'}}>Lake Gatun</div>
      </div>

      {/* water level gauge (right) */}
      <div style={{position:'absolute', left:1740, top:560, width:24, height:440, border:'1px solid rgba(143,179,199,0.5)', borderRadius:12, overflow:'hidden'}}>
        <div style={{position:'absolute', bottom:interpolate(drainRamp,[0,1],[0,176]), left:0, right:0, top:0, background:'rgba(27,73,101,0.85)'}}/>
      </div>
      <div style={{position:'absolute', left:1700, top:640, fontSize:44, fontWeight:800, color:'#e63946', opacity:drainRamp}}>-{dropPct}%</div>

      {/* lock chamber on right side */}
       {/* no-op guard */}
      <div style={{position:'absolute', left:1400, top:760, width:260, height:180, border:'2px solid rgba(229,169,60,0.7)', borderRadius:6, overflow:'hidden', background:'rgba(11,20,27,0.4)'}}>
        <div style={{position:'absolute', left:0, right:0, bottom:0, height: lockFill * 170, background:'rgba(27,73,101,0.9)'}}/>
        <div style={{position:'absolute', left:12, top:8, fontSize:15, letterSpacing:2, color:'#e5a93c'}}>LOCK STEP {Math.min(passes+1, 9)}</div>
        {lockFill < 0.9 ? (
          <div style={{position:'absolute', left:0, right:0, bottom: (lockFill*170), height:30, background:'rgba(230,57,70,0.85)'}}/>
        ) : null}
      </div>

      {/* transit ship moving through channel */}
      {shipVisible ? (
        <div style={{position:'absolute', left:shipX - 110, top:726, width:220, height:56, borderRadius:8, background:'#e63946', opacity:0.95, boxShadow:'0 0 0 3px rgba(230,57,70,0.25)'}}>
          <div style={{position:'absolute', left:14, top:-22, width:60, height:20, background:'#9c2b35', borderRadius:3}}/>
          <div style={{position:'absolute', left:24, top:12, fontSize:17, fontWeight:700, color:'#fff', letterSpacing:2}}>CARGO ×50M GAL</div>
        </div>
      ) : null}

      {/* waiting queues: stacked ship silhouettes with habit lanes */}
      {/* left coast queue */}
      {Array.from({length:13}).map((_,i)=>(
        <WaitShip key={'l'+i} x={110 + (i%4)*30} y={820 + Math.floor(i/4)*14} f={f} delay={70 + i*3} color="#e5a93c"/>
      ))}
      <div style={{position:'absolute', left:110, top:890, fontSize:17, letterSpacing:2, color:'#e5a93c'}}>
        PACIFIC SIDE · {Math.floor(stranded/2)} WAITING
      </div>
      {/* right coast queue */}
      {Array.from({length:13}).map((_,i)=>(
        <WaitShip key={'r'+i} x={1560 - (i%4)*30} y={820 + Math.floor(i/4)*14} f={f} delay={85 + i*3} color="#e5a93c"/>
      ))}
      <div style={{position:'absolute', left:1560, top:890, fontSize:17, letterSpacing:2, color:'#e5a93c'}}>
        ATLANTIC SIDE · {stranded - Math.floor(stranded/2)} WAITING
      </div>

      {/* 21-day wait clock */}
      <div style={{position:'absolute', left:1060, top:900, fontSize:26, fontWeight:700, color:'#e63946', letterSpacing:2}}>
        ⏱ UP TO {waitDays} DAYS WAIT
      </div>

      {/* metric cards */}
      <MetricCard x={100} label="Water per ship" value="50M gal" accent="#1b4965" f={f} delay={118}/>
      <MetricCard x={520} label="Lake level drop" value="-40%" accent="#e63946" f={f} delay={130}/>
      <MetricCard x={940} label="Stranded ships" value={`${stranded}`} accent="#e5a93c" f={f} delay={142}/>
      <MetricCard x={1360} label="Max wait" value="21 days" accent="#e63946" f={f} delay={154}/>
    </AbsoluteFill>
  );
};

export default MotionScene;
