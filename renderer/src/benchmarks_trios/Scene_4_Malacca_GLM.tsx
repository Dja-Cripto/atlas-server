import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring, Easing } from 'remotion';

const FPS = 30;
const DUR = 180;

const Counter: React.FC<{value: number; suffix?: string; prefix?: string; start: number; color: string; label: string}> = ({value, suffix = '', prefix = '', start, color, label}) => {
  const frame = useCurrentFrame();
  const t = Math.max(0, frame - start);
  const s = spring({frame: t, fps: FPS, config: {damping: 200}});
  const num = Math.round(interpolate(s, [0, 1], [0, value]));
  const op = interpolate(t, [0, 8], [0, 1], {extrapolateRight: 'clamp'});
  return (
    <div style={{opacity: op, transform: `translateY(${interpolate(s, [0,1],[24,0])}px)`, width: 380}}>
      <div style={{fontSize: 72, fontWeight: 700, color, fontFamily: 'Helvetica, Arial, sans-serif', letterSpacing: -2, lineHeight: 1.1}}>
        {prefix}{num.toLocaleString()}{suffix}
      </div>
      <div style={{fontSize: 20, color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', letterSpacing: 3, fontFamily: 'Helvetica, Arial, sans-serif', marginTop: 6}}>{label}</div>
      <div style={{width: 60, height: 3, background: color, marginTop: 10}} />
    </div>
  );
};

const Ship: React.FC<{delay: number; speed: number; y: number; scale: number; start: number}> = ({delay, speed, y, scale, start}) => {
  const frame = useCurrentFrame();
  const t = Math.max(0, frame - start) * speed + delay;
  const p = (t % 140) / 140;
  const x = interpolate(p, [0, 1], [180, 1740]);
  const mfd = interpolate(p, [0.42, 0.5, 0.58], [1, 0.55, 1]);
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) scale(${scale * mfd})`, opacity: 0.9 * mfd}}>
      <div style={{width: 26, height: 8, background: '#e5a93c', borderRadius: 2, transform: 'rotate(-4deg)'}} />
    </div>
  );
};

const MotionScene: React.FC<{scene: any; context: any}> = ({scene}) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const local = (h: number) => frame - h;

  // global fade in
  const gOp = interpolate(frame, [0, 12], [0, 1], {extrapolateRight: 'clamp'});

  // Camera push toward chokepoint (choke at x~1180, y~470 within map area 700,140..1800,900)
  const zoomSpring = spring({frame: Math.max(0, local(45)), fps: FPS, config: {damping: 100, mass: 1.2}});
  const zoom = interpolate(zoomSpring, [0, 1], [1, 2.1]);
  const camX = interpolate(zoomSpring, [0, 1], [430, 1760]);
  const camY = interpolate(zoomSpring, [0, 1], [200, 1320]);

  // Title
  const tt = Math.max(0, local(4));
  const titleOp = interpolate(tt, [0, 15], [0, 1], {extrapolateRight: 'clamp'});
  const titleY = interpolate(spring({frame: tt, fps: FPS, config: {damping: 14}}), [0, 1], [40, 0]);

  // lane draw
  const laneP = interpolate(frame, [8, 55], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});

  // chokepoint ring phase (starts ~ f75 after zoom begins)
  const ringT = Math.max(0, local(80));
  const ringS = spring({frame: ringT, fps: FPS, config: {damping: 12}});
  const ringOp = interpolate(ringT, [0, 10], [0, 1], {extrapolateRight: 'clamp'});

  // caliper phase
  const calT = Math.max(0, local(110));
  const calS = spring({frame: calT, fps: FPS, config: {damping: 16, stiffness: 70}});
  const calOp = interpolate(calT, [0, 12], [0, 1], {extrapolateRight: 'clamp'});

  // radar pulse
  const pulseP = ((frame - 125) / 45) % 1;
  const pulseActive = frame >= 125;
  const pulseR = pulseP * 90;
  const pulseOp = (1 - pulseP) * 0.8;

  const counterOp = interpolate(frame, [30, 45], [0, 1], {extrapolateRight: 'clamp'});
  const metricsY = interpolate(spring({frame: Math.max(0, local(30)), fps: FPS, config: {damping: 18}}), [0, 1], [30, 0]);

  const landPath = 'M 780 300 L 900 340 L 1040 300 L 1180 380 L 1300 340 L 1420 420 L 1560 380 L 1700 460';
  const land2 = 'M 800 860 L 950 800 L 1120 840 L 1280 760 L 1450 800 L 1640 720';
  const lane = 'M 780 470 C 950 500, 1050 520, 1180 505 C 1300 490, 1350 470, 1450 480 C 1560 490, 1650 470, 1760 460';

  return (
    <AbsoluteFill style={{background: '#070e14', opacity: gOp}}>
      {/* map viewport clipped to safe area */}
      <div style={{position: 'absolute', left: 80, top: 180, width: 1080, height: 780, overflow: 'hidden', background: '#0f1c24', border: '1px solid rgba(229,169,60,0.25)', borderRadius: 8, right: 0}}>
        <AbsoluteFill style={{transform: `translate(${-camX * (zoom - 1) / zoom}px, ${-camY * (zoom - 1) / zoom}px) scale(${zoom})`, transformOrigin: '0 0'}}>
          {/* graticule */}
          {Array.from({length: 14}).map((_, i) => (
            <div key={'gv' + i} style={{position: 'absolute', left: 700 + i * 90, top: 140, width: 1, height: 760, background: 'rgba(229,169,60,0.06)'}} />
          ))}
          {Array.from({length: 9}).map((_, i) => (
            <div key={'gh' + i} style={{position: 'absolute', left: 700, top: 140 + i * 90, width: 1080, height: 1, background: 'rgba(229,169,60,0.06)'}} />
          ))}
          {/* landmasses */}
          <svg width="1920" height="1080" style={{position: 'absolute', inset: 0}}>
            <path d={landPath} fill="none" stroke="#1d3340" strokeWidth={90} strokeLinecap="round" />
            <path d={land2} fill="none" stroke="#1d3340" strokeWidth={90} strokeLinecap="round" />
            {/* shipping lane */}
            <path d={lane} fill="none" stroke="rgba(229,169,60,0.2)" strokeWidth={14} strokeLinecap="round" />
            <path d={lane} fill="none" stroke="#e5a93c" strokeWidth={3} strokeLinecap="round" strokeDasharray={`${laneP * 1600} 1600`} />
          </svg>
          {/* ships */}
          {[0, 14, 28, 42, 56, 70, 84, 98, 112, 126, 140, 154].map((d, i) => (
            <Ship key={i} delay={d} speed={1.1 + (i % 3) * 0.15} y={[468, 460, 476, 464, 480][i % 5]} scale={1 + (i % 3) * 0.3} start={50 + (i % 4) * 5} />
          ))}
          {/* chokepoint ring + radar pulse centered at (1230, 505) approx lane near x=1180 */}
          {ringOp > 0 && (
            <div style={{position: 'absolute', left: 1180, top: 505, opacity: ringOp}}>
              <div style={{position: 'absolute', left: 0, top: 0, transform: 'translate(-50%,-50%)', width: 130, height: 130, borderRadius: '50%', border: `2px solid rgba(229,169,60,${0.9})`}} />
              <div style={{position: 'absolute', left: 0, top: 0, transform: `translate(-50%,-50%) scale(${interpolate(ringS, [0,1],[1.8,1])})`, width: 130, height: 130, borderRadius: '50%', border: '2px solid rgba(230,57,70,0.5)'}} />
              {pulseActive && (
                <div style={{position: 'absolute', left: 0, top: 0, transform: `translate(-50%,-50%)`, width: pulseR * 2, height: pulseR * 2, borderRadius: '50%', border: '1px solid rgba(230,57,70,0.6)', opacity: pulseOp}} />
              )}
              {/* lane gap: red segment showing narrow channel */}
              <div style={{position: 'absolute', left: -30, top: 0, width: 60, height: 6, transform: 'translate(0,-3px) rotate(-90deg)', background: '#e63946', opacity: ringOp}} />
            </div>
          )}
        </AbsoluteFill>
        {/* viewport label */}
        <div style={{position: 'absolute', left: 20, top: 18, fontSize: 15, letterSpacing: 4, color: 'rgba(229,169,60,0.8)', fontFamily: 'Helvetica, Arial, sans-serif', textTransform: 'uppercase'}}>
          Strait of Malacca — Shipping Corridor
        </div>
        <div style={{position: 'absolute', right: 20, top: 18, fontSize: 15, letterSpacing: 2, color: 'rgba(255,255,255,0.4)', fontFamily: 'Helvetica, Arial, sans-serif'}}>
          LIVE DENSITY
        </div>
      </div>

      {/* title */}
      <div style={{position: 'absolute', left: 80, top: 70, opacity: titleOp, transform: `translateY(${titleY}px)`}}>
        <div style={{fontSize: 20, letterSpacing: 6, color: '#e5a93c', textTransform: 'uppercase', fontFamily: 'Helvetica, Arial, sans-serif', marginBottom: 8}}>
          Maritime Chokepoints
        </div>
        <div style={{fontSize: 62, fontWeight: 700, color: '#f4f7f9', fontFamily: 'Helvetica, Arial, sans-serif', letterSpacing: -1}}>
          The 1.7-Mile Chokepoint
        </div>
      </div>

      {/* right metrics column */}
      <div style={{position: 'absolute', left: 1240, top: 210, width: 600, opacity: counterOp, transform: `translateY(${metricsY}px)`}}>
        <Counter value={84000} start={32} color="#e5a93c" label="Ships per year" />
        <div style={{height: 40}} />
        <div style={{display: 'flex', gap: 40}}>
          <Counter value={25} suffix="%" start={48} color="#e63946" label="World's traded oil" />
          <Counter value={3.5} prefix="$" suffix="T" start={64} color="#f4f7f9" label="Traded goods value" />
        </div>
      </div>

      {/* 1.7-mile caliper callout */}
      {calOp > 0 && (
        <div style={{position: 'absolute', left: 1240, top: 620, width: 600, opacity: calOp}}>
          <div style={{background: 'rgba(230,57,70,0.08)', border: '1px solid rgba(230,57,70,0.5)', borderRadius: 8, padding: '28px 32px'}}>
            <div style={{fontSize: 18, letterSpacing: 3, color: '#e63946', textTransform: 'uppercase', fontFamily: 'Helvetica, Arial, sans-serif'}}>Narrowest navigable channel</div>
            <div style={{fontSize: 96, fontWeight: 700, color: '#f4f7f9', fontFamily: 'Helvetica, Arial, sans-serif', letterSpacing: -2, lineHeight: 1}}>1.7 <span style={{fontSize: 40, color: 'rgba(255,255,255,0.6)', fontWeight: 400}}>miles wide</span></div>
            <div style={{marginTop: 20, height: 4, width: `${interpolate(calS, [0, 1], [0, 100])}%`, background: '#e63946'}} />
            <div style={{marginTop: 8, display: 'flex', justifyContent: 'space-between'}}>
              <span style={{color: 'rgba(255,255,255,0.4)', fontFamily: 'Helvetica, Arial, sans-serif', fontSize: 14, letterSpacing: 2}}>PHILLIP CHANNEL</span>
              <span style={{color: '#e5a93c', fontFamily: 'Helvetica, Arial, sans-serif', fontSize: 14, letterSpacing: 2}}>RADAR LOCK ✔</span>
            </div>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default MotionScene;