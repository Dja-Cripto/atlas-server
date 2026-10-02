import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate, spring, Easing} from 'remotion';

const C = {
  bg: '#070e14',
  panel: '#0f1c24',
  deep: '#1b4965',
  waterA: '#2a6f97',
  waterB: '#122c42',
  bed: '#0a1822',
  amber: '#e5a93c',
  red: '#e63946',
  ink: '#eaf3f7',
  dim: '#8fa8b5',
  concrete: '#2b3e4a',
};

const CL = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const LAKE_X = 640;
const LAKE_W = 640;
const LAKE_TOP = 320;
const LAKE_BOTTOM = 720;
const SURFACE = 380;
const DEPTH = LAKE_BOTTOM - SURFACE;
const DROP = Math.round(DEPTH * 0.4);

const FONT = 'Inter, Helvetica Neue, Arial, sans-serif';

const Ship: React.FC<{x: number; y: number; scale?: number; flip?: boolean; opacity?: number; color?: string}> = ({x, y, scale = 1, flip = false, opacity = 1, color = '#b9cbd4'}) => (
  <div style={{position: 'absolute', left: x, top: y, width: 120, height: 54, transform: `scale(${scale}) scaleX(${flip ? -1 : 1})`, transformOrigin: 'top left', opacity}}>
    <svg width='120' height='54' viewBox='0 0 120 54'>
      <polygon points='2,32 102,32 118,20 118,32 106,48 12,48' fill={color} />
      <rect x='16' y='22' width='15' height='10' fill='#e5a93c' />
      <rect x='33' y='22' width='15' height='10' fill='#e63946' />
      <rect x='50' y='22' width='15' height='10' fill='#2a6f97' />
      <rect x='67' y='22' width='15' height='10' fill='#e5a93c' />
      <rect x='86' y='12' width='16' height='20' fill='#dfe9ee' />
      <rect x='89' y='6' width='10' height='6' fill='#8fa8b5' />
    </svg>
  </div>
);

const Gate: React.FC<{x: number}> = ({x}) => (
  <div style={{position: 'absolute', left: x, top: 388, width: 60, height: 332}}>
    <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 16, background: 'repeating-linear-gradient(45deg, #e5a93c 0px, #e5a93c 8px, #101d26 8px, #101d26 16px)'}} />
    <div style={{position: 'absolute', left: 0, right: 0, top: 16, bottom: 0, background: C.concrete, borderLeft: '1px solid rgba(143,168,181,0.35)', borderRight: '1px solid rgba(0,0,0,0.5)'}} />
    <div style={{position: 'absolute', left: 14, right: 14, top: -26, height: 26, background: '#16242e', border: '1px solid rgba(143,168,181,0.35)', borderBottom: 'none', borderRadius: '6px 6px 0 0'}} />
    <div style={{position: 'absolute', left: '50%', top: 60, transform: 'translateX(-50%)', fontSize: 13, letterSpacing: 3, color: 'rgba(234,243,247,0.55)', writingMode: 'vertical-rl'}}>LOCK</div>
  </div>
);

const Drops: React.FC<{f0: number; x: number; y: number}> = ({f0, x, y}) => {
  const frame = useCurrentFrame();
  const t = frame - f0;
  if (t < 0 || t > 42) {
    return null;
  }
  return (
    <div>
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const local = t - i * 3;
        if (local < 0) {
          return null;
        }
        const fall = interpolate(local, [0, 30], [0, 130], {...CL, easing: Easing.in(Easing.quad)});
        const op = interpolate(local, [0, 5, 24, 32], [0, 1, 1, 0], CL);
        return <div key={i} style={{position: 'absolute', left: x + (i - 2.5) * 16, top: y + fall, width: 8, height: 13, borderRadius: 5, background: '#7fc4e8', opacity: op}} />;
      })}
    </div>
  );
};

const DrainTag: React.FC<{f0: number; x: number; y: number}> = ({f0, x, y}) => {
  const frame = useCurrentFrame();
  const t = frame - f0;
  if (t < 0 || t > 48) {
    return null;
  }
  const rise = interpolate(t, [0, 42], [0, -80], {...CL, easing: Easing.out(Easing.cubic)});
  const op = interpolate(t, [0, 5, 36, 48], [0, 1, 1, 0], CL);
  return (
    <div style={{position: 'absolute', left: x, top: y + rise, transform: 'translateX(-50%)', opacity: op, color: C.amber, fontSize: 25, fontWeight: 800, letterSpacing: 1, whiteSpace: 'nowrap'}}>- 50M GAL</div>
  );
};

const MetricCard: React.FC<{start: number; x: number; value: string; label: string; accent: string; frame: number; fps: number}> = ({start, x, value, label, accent, frame, fps}) => {
  const p = spring({frame: Math.max(0, frame - start), fps, config: {damping: 15, stiffness: 110, mass: 0.9}});
  const ty = interpolate(p, [0, 1], [70, 0], CL);
  const op = Math.min(1, Math.max(0, p));
  return (
    <div style={{position: 'absolute', left: x, top: 838, width: 410, height: 150, background: 'rgba(15,28,36,0.94)', border: '1px solid rgba(143,168,181,0.25)', borderTop: `4px solid ${accent}`, borderRadius: 10, padding: '20px 24px', transform: `translateY(${ty}px)`, opacity: op, boxSizing: 'border-box'}}>
      <div style={{fontSize: 42, fontWeight: 800, color: accent, lineHeight: 1.05, fontVariantNumeric: 'tabular-nums'}}>{value}</div>
      <div style={{marginTop: 10, fontSize: 17, lineHeight: 1.35, color: C.dim, letterSpacing: 0.3}}>{label}</div>
    </div>
  );
};

const Sun: React.FC<{frame: number}> = ({frame}) => {
  const appear = interpolate(frame, [62, 80], [0, 1], CL);
  const rot = interpolate(frame, [62, 180], [0, 45], CL);
  return (
    <div style={{position: 'absolute', left: 1420, top: 100, width: 120, height: 120, opacity: appear, transform: `scale(${appear})`}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: 120, height: 120, transform: `rotate(${rot}deg)`}}>
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div key={i} style={{position: 'absolute', left: 57, top: 8, width: 6, height: 22, borderRadius: 3, background: C.amber, transform: `rotate(${i * 45}deg)`, transformOrigin: '50% 52px', opacity: 0.9}} />
        ))}
      </div>
      <div style={{position: 'absolute', left: 32, top: 32, width: 56, height: 56, borderRadius: 28, background: 'linear-gradient(180deg, #f2c14e 0%, #e5a93c 100%)', boxShadow: '0 0 24px rgba(229,169,60,0.45)'}} />
    </div>
  );
};

export default function Scene_3_Kimi_K3({scene, context}: {scene: any; context: any}) {
  const frame = useCurrentFrame();
  const fps = (scene && scene.fps) || 30;

  const drought = interpolate(frame, [70, 112], [0, 1], {...CL, easing: Easing.inOut(Easing.cubic)});
  const waterH = DEPTH - DROP * drought;
  const bandH = DROP * drought;

  const kickerOp = interpolate(frame, [0, 12], [0, 1], CL);
  const headP = spring({frame: Math.max(0, frame - 3), fps, config: {damping: 16, stiffness: 120, mass: 0.9}});
  const headTy = interpolate(headP, [0, 1], [36, 0], CL);
  const subOp = interpolate(frame, [10, 24], [0, 1], CL);

  const heroX = interpolate(frame, [12, 24, 36, 50, 62, 76], [140, 460, 650, 1120, 1330, 1660], CL);
  const heroY = interpolate(frame, [12, 24, 36, 50, 62, 76], [507, 507, 327, 327, 507, 507], CL);
  const heroOp = interpolate(frame, [10, 14, 74, 80], [0, 1, 1, 0], CL);
  const transitOp = interpolate(frame, [14, 20, 52, 62], [0, 1, 1, 0], CL);

  const stranded = interpolate(frame, [124, 152], [0, 130], {...CL, easing: Easing.out(Easing.cubic)});
  const bannerP = spring({frame: Math.max(0, frame - 120), fps, config: {damping: 14, stiffness: 110, mass: 0.9}});
  const pulse = 1 + 0.03 * Math.sin(frame / 5);

  const pillOp = interpolate(frame, [62, 74], [0, 1], CL);
  const dot = 1 + 0.3 * Math.sin(frame / 4);
  const levelOp = interpolate(frame, [98, 110], [0, 1], CL);

  const leftQ = [
    {x: 100, y: 566, s: 118},
    {x: 215, y: 566, s: 122},
    {x: 330, y: 566, s: 126},
    {x: 445, y: 566, s: 130},
    {x: 157, y: 630, s: 134},
    {x: 272, y: 630, s: 138},
    {x: 387, y: 630, s: 142},
  ];
  const rightQ = [
    {x: 1350, y: 566, s: 120},
    {x: 1465, y: 566, s: 124},
    {x: 1580, y: 566, s: 128},
    {x: 1695, y: 566, s: 132},
    {x: 1407, y: 630, s: 136},
    {x: 1522, y: 630, s: 140},
    {x: 1637, y: 630, s: 144},
  ];

  const qShip = (x: number, y: number, s: number, flip: boolean, key: string) => {
    const p = spring({frame: Math.max(0, frame - s), fps, config: {damping: 13, stiffness: 140, mass: 0.8}});
    const sc = 0.9 * interpolate(p, [0, 1], [0.4, 1], CL);
    const op = Math.min(1, Math.max(0, p));
    return <Ship key={key} x={x} y={y} scale={sc} flip={flip} opacity={op} color='#9fb4bd' />;
  };

  const chip = (start: number, x: number, label: string, color: string) => {
    const p = spring({frame: Math.max(0, frame - start), fps, config: {damping: 12, stiffness: 160, mass: 0.8}});
    const ty = interpolate(p, [0, 1], [14, 0], CL);
    const op = Math.min(1, Math.max(0, p));
    return (
      <div style={{position: 'absolute', left: x, top: 520, transform: `translateY(${ty}px)`, opacity: op, background: 'rgba(7,14,20,0.88)', border: `1px solid ${color}`, color, borderRadius: 6, padding: '5px 12px', fontSize: 15, fontWeight: 700, letterSpacing: 1.5, whiteSpace: 'nowrap'}}>{label}</div>
    );
  };

  const cards = [
    {start: 34, x: 80, value: '50M GAL', label: 'Fresh water consumed per ship crossing', accent: '#6cb6dd'},
    {start: 100, x: 510, value: '-40%', label: 'Gatun Lake level after severe drought', accent: C.amber},
    {start: 124, x: 940, value: String(Math.round(stranded)), label: 'Cargo carriers stranded at anchor', accent: C.red},
    {start: 150, x: 1370, value: '21 DAYS', label: 'Maximum wait time to transit the canal', accent: C.red},
  ];

  return (
    <AbsoluteFill style={{background: C.bg, fontFamily: FONT, color: C.ink, overflow: 'hidden'}}>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(229,169,60,0.12) 0%, rgba(229,169,60,0) 45%)', opacity: drought}} />

      <div style={{position: 'absolute', left: 0, right: 0, top: 720, bottom: 0, background: '#091219'}} />

      {[80, 1340].map((x, i) => (
        <div key={i} style={{position: 'absolute', left: x, top: 560, width: 500, height: 160, background: `linear-gradient(180deg, ${C.waterA} 0%, ${C.waterB} 100%)`, borderTop: '2px solid rgba(154,205,229,0.65)', overflow: 'hidden'}}>
          <div style={{position: 'absolute', top: 0, bottom: 0, left: -((frame * 1.2) % 80), width: 660, background: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 36px, rgba(255,255,255,0) 36px, rgba(255,255,255,0) 80px)'}} />
        </div>
      ))}

      <div style={{position: 'absolute', left: 80, top: 730, fontSize: 14, letterSpacing: 3, color: C.dim}}>CARIBBEAN SIDE</div>
      <div style={{position: 'absolute', left: 1340, top: 730, width: 500, textAlign: 'right', fontSize: 14, letterSpacing: 3, color: C.dim}}>PACIFIC SIDE</div>
      <div style={{position: 'absolute', left: 640, top: 730, width: 640, textAlign: 'center', fontSize: 14, letterSpacing: 3, color: C.dim}}>FRESHWATER RESERVOIR</div>

      <div style={{position: 'absolute', left: LAKE_X, top: LAKE_TOP, width: LAKE_W, height: LAKE_BOTTOM - LAKE_TOP, background: C.bed, borderLeft: `8px solid ${C.concrete}`, borderRight: `8px solid ${C.concrete}`, borderBottom: `10px solid ${C.concrete}`, overflow: 'hidden', boxSizing: 'border-box'}}>
        <div style={{position: 'absolute', left: 0, right: 0, top: SURFACE - LAKE_TOP, height: bandH, background: 'rgba(178,141,79,0.30)', overflow: 'hidden'}}>
          <svg width='640' height='136' viewBox='0 0 640 136' style={{position: 'absolute', left: 0, bottom: 0}}>
            <polyline points='40,136 90,96 120,120 170,70' stroke='#8a6f47' strokeWidth='4' fill='none' />
            <polyline points='260,136 300,90 340,116 380,64' stroke='#8a6f47' strokeWidth='4' fill='none' />
            <polyline points='470,136 505,98 540,122 590,74' stroke='#8a6f47' strokeWidth='4' fill='none' />
          </svg>
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: waterH, background: `linear-gradient(180deg, ${C.waterA} 0%, ${C.waterB} 100%)`, borderTop: '2px solid rgba(154,205,229,0.7)', overflow: 'hidden'}}>
          <div style={{position: 'absolute', top: 0, bottom: 0, left: -((frame * 1.5) % 80), width: 800, background: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 36px, rgba(255,255,255,0) 36px, rgba(255,255,255,0) 80px)'}} />
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, top: SURFACE - LAKE_TOP, borderTop: '2px dashed rgba(234,243,247,0.5)', opacity: drought}} />
        <div style={{position: 'absolute', left: 14, top: SURFACE - LAKE_TOP - 28, fontSize: 14, letterSpacing: 2, color: 'rgba(234,243,247,0.8)', opacity: drought}}>NORMAL LEVEL</div>
        <div style={{position: 'absolute', right: 16, top: SURFACE - LAKE_TOP + bandH - 18, fontSize: 34, fontWeight: 800, color: C.red, opacity: levelOp}}>-40%</div>
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 22, textAlign: 'center', fontSize: 26, letterSpacing: 8, fontWeight: 700, color: 'rgba(234,243,247,0.28)'}}>GATUN LAKE</div>
      </div>

      <Gate x={580} />
      <Gate x={1280} />

      <div style={{position: 'absolute', left: 640, top: 284, width: 640, textAlign: 'center', opacity: transitOp, fontSize: 15, letterSpacing: 3, color: '#6cb6dd', fontWeight: 700}}>TRANSIT IN PROGRESS</div>

      <Drops f0={30} x={610} y={470} />
      <Drops f0={56} x={1310} y={470} />
      <DrainTag f0={30} x={610} y={430} />
      <DrainTag f0={56} x={1310} y={430} />

      <Ship x={heroX} y={heroY} scale={1.1} opacity={heroOp} color='#d7e3e9' />

      {leftQ.map((q, i) => qShip(q.x, q.y, q.s, false, `l${i}`))}
      {rightQ.map((q, i) => qShip(q.x, q.y, q.s, true, `r${i}`))}

      {chip(150, 120, 'ANCHORED — DAY 18', C.amber)}
      {chip(156, 1560, 'ANCHORED — DAY 21', C.red)}

      <div style={{position: 'absolute', left: 0, right: 0, top: 188, textAlign: 'center', opacity: Math.min(1, Math.max(0, bannerP)), transform: `scale(${interpolate(bannerP, [0, 1], [0.85, 1], CL)})`}}>
        <div style={{display: 'inline-block', fontSize: 84, fontWeight: 800, lineHeight: 1, color: C.red, fontVariantNumeric: 'tabular-nums', transform: `scale(${pulse})`}}>{Math.round(stranded)}</div>
        <div style={{fontSize: 21, letterSpacing: 4, color: C.ink, marginTop: 6, fontWeight: 600}}>SHIPS STRANDED ON BOTH OCEANS</div>
      </div>

      <div style={{position: 'absolute', left: 80, top: 64, opacity: kickerOp, fontSize: 19, letterSpacing: 5, color: C.amber, fontWeight: 700}}>PANAMA CANAL — FRESHWATER CRISIS</div>
      <div style={{position: 'absolute', left: 80, top: 94, width: 6, height: 60, background: C.amber, opacity: Math.min(1, Math.max(0, headP))}} />
      <div style={{position: 'absolute', left: 104, top: 90, fontSize: 56, fontWeight: 800, letterSpacing: -0.5, transform: `translateY(${headTy}px)`, opacity: Math.min(1, Math.max(0, headP))}}>The Gatun Lake Bottleneck</div>
      <div style={{position: 'absolute', left: 104, top: 158, fontSize: 21, color: C.dim, opacity: subOp}}>Why the Panama Canal is running out of water</div>

      <div style={{position: 'absolute', right: 80, top: 74, opacity: pillOp, border: `1px solid ${C.red}`, borderRadius: 999, padding: '8px 18px', display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(230,57,70,0.08)'}}>
        <div style={{width: 12, height: 12, borderRadius: 6, background: C.red, transform: `scale(${dot})`}} />
        <div style={{fontSize: 16, fontWeight: 700, letterSpacing: 3, color: C.red}}>SEVERE DROUGHT</div>
      </div>

      <Sun frame={frame} />

      {cards.map((c, i) => (
        <MetricCard key={i} start={c.start} x={c.x} value={c.value} label={c.label} accent={c.accent} frame={frame} fps={fps} />
      ))}

      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.5) 100%)'}} />
    </AbsoluteFill>
  );
}