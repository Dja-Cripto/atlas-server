import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring, Easing } from 'remotion';

const GOLD = '#e5a93c';
const CYAN = '#4cc9f0';
const RED = '#e63946';
const FPS = 30;
const D = 180;

// deterministic pseudo random
const rand = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

export default function MotionScene({ scene, context }: { scene: any; context: any }) {
  const frame = useCurrentFrame();
  const t = frame / FPS;

  const sp = (d: number, st: number) => spring({ frame: frame - st, fps: FPS, config: { damping: 14, stiffness: 90, mass: 0.9 }, durationInFrames: d });

  // entrance animations
  const titleY = interpolate(sp(40, 8), [0, 1], [46, 0]);
  const titleO = interpolate(frame, [8, 30], [0, 1], { extrapolateRight: 'clamp' });
  const subO = interpolate(frame, [24, 48], [0, 1], { extrapolateRight: 'clamp' });

  // Earth rotation: constant then decelerating after frame 90
  const baseSpin = t * 18;
  const decel = interpolate(frame, [90, 170], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  const spinAngle = baseSpin - decel * 14; // visible slowdown
  const earthO = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });

  // axis tilt 2cm exaggerated
  const tilt = sp(60, 100);
  const tiltDeg = interpolate(tilt, [0, 1], [0, 7]);

  // mass particles migrate from lower globe to reservoir point (frames 40-90)
  const fill = interpolate(frame, [40, 90], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.sin) });

  // rotation gauge arc (-0.06 microseconds)
  const gaugeP = interpolate(frame, [105, 160], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });

  // cards
  const card1 = sp(35, 120);
  const card2 = sp(35, 136);

  // reservoir cross-section watermark fill
  const lvl = interpolate(frame, [50, 95], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const CX = 620, CY = 560, R = 240;

  // meridian/parallel paths
  const meridians: string[] = [];
  for (let k = 0; k < 6; k++) {
    const rx = R * Math.abs(Math.cos(((k + (spinAngle / 40) % 6) / 6) * Math.PI));
    meridians.push(`M ${CX - rx} ${CY - R} A ${rx} ${R} 0 0 ${k % 2 === 0 ? 1 : 0} ${CX + rx * (k % 2 === 0 ? 1 : 1)} ${CY + R}`);
  }

  return (
    <AbsoluteFill style={{ background: '#070e14', fontFamily: 'Helvetica, Arial, sans-serif' }}>
      {/* backdrop grid */}
      <AbsoluteFill style={{ opacity: 0.14 }}>
        <svg width={1920} height={1080}>
          {Array.from({ length: 12 }).map((_, i) => (
            <line key={'h' + i} x1={80} x2={1840} y1={60 + i * 82} y2={60 + i * 82} stroke="#0f1c24" strokeWidth={1} />
          ))}
          {Array.from({ length: 14 }).map((_, i) => (
            <line key={'v' + i} y1={60} y2={1020} x1={80 + i * 133} x2={80 + i * 133} stroke="#0f1c24" strokeWidth={1} />
          ))}
        </svg>
      </AbsoluteFill>

      {/* heading */}
      <div style={{ position: 'absolute', left: 100, top: 100, opacity: titleO, transform: `translateY(${titleY}px)` }}>
        <div style={{ fontSize: 30, letterSpacing: 8, color: CYAN, fontWeight: 600 }}>THREE GORGES DAM · CHINA</div>
        <div style={{ fontSize: 64, letterSpacing: 2, color: GOLD, fontWeight: 800, marginTop: 8 }}>ALTERING EARTH&apos;S SPIN</div>
        <div style={{ fontSize: 22, letterSpacing: 3, color: '#8fb4c7', marginTop: 10, opacity: subO }}>39 BILLION m³ OF WATER · 55 BILLION TONNES OF SHIFTED MASS</div>
      </div>

      {/* EARTH (steady, inside safe area) */}
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, opacity: earthO }}>
        <g transform={`rotate(${tiltDeg} ${CX} ${CY})`}>
          {/* glow behind */}
          <circle cx={CX} cy={CY} r={R + 26} fill="rgba(28,64,84,0.35)" />
          <circle cx={CX} cy={CY} r={R} fill="#0f1c24" stroke="#4cc9f0" strokeWidth={1.5} opacity={0.9} />
          {/* meridians */}
          {meridians.map((d, i) => (
            <path key={'m' + i} d={d} fill="none" stroke="#2a5a72" strokeWidth={1.2} />
          ))}
          {/* parallels */}
          {[0.35, 0.7, 1, 0.7, 0.35].map((f, i) => {
            const yy = CY - R + (i + 0.5) * (R / 3);
            const half = R * Math.sqrt(Math.max(0.02, 1 - Math.pow((i - 1) * 0.5 + 0.25, 2) * 0.9));
            return <ellipse key={'p' + i} cx={CX} cy={yy} rx={half} ry={half * 0.18} fill="none" stroke="#2a5a72" strokeWidth={1.1} />;
          })}
          {/* equator emphasized */}
          <ellipse cx={CX} cy={CY} rx={R} ry={R * 0.18} fill="none" stroke="#4cc9f0" strokeWidth={1.6} opacity={0.8} />

          {/* migrating mass particles: from southern hemisphere toward reservoir (mid-lat, right limb) */}
          {Array.from({ length: 26 }).map((_, i) => {
            const d = 55 + i * 1.4;
            const p = Math.min(1, Math.max(0, (fill - i * 0.01) / 0.75));
            const sx = CX + Math.cos(2.6 + rand(i) * 1.2) * R * 0.7;
            const sy = CY + Math.sin(2.6 + rand(i) * 1.2) * R * 0.7;
            const tx = CX + 165, ty = CY - 105;
            const x = sx + (tx - sx) * p;
            const y = sy + (ty - sy) * p;
            return <circle key={'pt' + i} cx={x} cy={y} r={4} fill={GOLD} opacity={0.25 + 0.75 * p} />;
          })}

          {/* reservoir marker */}
          <g opacity={interpolate(frame, [36, 52], [0, 1], { extrapolateRight: 'clamp' })}>
            <ellipse cx={CX + 165} cy={CY - 105} rx={fill * 40 + 10} ry={12} fill="rgba(229,169,60,0.35)" stroke={GOLD} strokeWidth={1.4} />
            <circle cx={CX + 165} cy={CY - 105} r={5} fill={GOLD} />
            <line x1={CX + 165} y1={CY - 117} x2={CX + 165} y2={CY - 165} stroke={GOLD} strokeWidth={1.2} />
            <text x={CX + 175} y={CY - 172} fill={GOLD} fontSize={20} fontWeight={700} letterSpacing={1}>RESERVOIR FILLS · 40–90</text>
          </g>

          {/* spin axis */}
          <g opacity={interpolate(frame, [96, 112], [0.35, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}>
            <line x1={CX} y1={CY - R - 70} x2={CX} y2={CY + R + 70} stroke="rgba(230,57,70,0.25)" strokeWidth={1.5} transform={`rotate(${tiltDeg} ${CX} ${CY})`} />
            <line x1={CX} y1={CY - R - 70} x2={CX} y2={CY - R - 20} stroke={RED} strokeWidth={3} transform={`rotate(${tiltDeg} ${CX} ${CY})`} />
            <text x={CX + 14} y={CY - R - 52} fill={RED} fontSize={19} fontWeight={700} transform={`rotate(${tiltDeg} ${CX} ${CY})`} opacity={tilt}>POLE SHIFTED 2 cm</text>
          </g>
        </g>

        {/* rotation arc gauge around Earth */}
        <g transform={`translate(${CX} ${CY})`} opacity={interpolate(frame, [100, 120], [0, 1], { extrapolateRight: 'clamp' })}>
          <circle r={R + 48} fill="none" stroke="rgba(76,201,240,0.2)" strokeWidth={10} strokeDasharray="204 300" transform="rotate(-135)" />
          <circle r={R + 48} fill="none" stroke={RED} strokeWidth={10} strokeDasharray={`${204 * gaugeP * 0.28} 1000`} strokeLinecap="round" transform="rotate(-135)" />
          <text x={0} y={R + 82} textAnchor="middle" fill={RED} fontSize={26} fontWeight={800}>− 0.06 µs / DAY</text>
          <text x={0} y={R + 106} textAnchor="middle" fill="#8fb4c7" fontSize={16} letterSpacing={2}>ROTATION SLOWED</text>
        </g>
      </svg>

      {/* reservoir cross-section panel (right) */}
      <div style={{ position: 'absolute', right: 100, top: 190, width: 430, height: 420, border: '1px solid rgba(76,201,240,0.35)', background: 'rgba(15,28,36,0.85)', opacity: interpolate(frame, [40, 58], [0, 1], { extrapolateRight: 'clamp' }), padding: 22 }}>
        <div style={{ color: CYAN, fontSize: 18, letterSpacing: 3, fontWeight: 700 }}>RESERVOIR CROSS-SECTION</div>
        <svg width={380} height={300} style={{ marginTop: 14 }}>
          <path d="M 20 260 L 200 260 L 260 60 L 340 60 L 340 260 Z" fill="none" stroke="#2a5a72" strokeWidth={2} />
          <rect x={22} y={260 - lvl * 196} width={316} height={lvl * 196} fill="rgba(229,169,60,0.30)" />
          <line x1={22} x2={340} y1={260} y2={260} stroke="#4cc9f0" strokeWidth={1.5} />
          <line x1={22} x2={340} y1={260 - 175 * 1.02} y2={260 - 175 * 1.02} stroke={GOLD} strokeWidth={1.5} strokeDasharray="6 5" />
          <text x={200} y={280} textAnchor="middle" fill="#8fb4c7" fontSize={16} letterSpacing={1}>≈600 km LONG</text>
          <text x={352} y={260 - 175 * 1.02 + 5} fill={GOLD} fontSize={16} fontWeight={700}>175 m</text>
        </svg>
        <div style={{ color: '#e8f2f8', fontSize: 20, marginTop: 8 }}>ELEVATION: <span style={{ color: GOLD, fontWeight: 800 }}>175 m</span> ABOVE SEA LEVEL</div>
      </div>

      {/* metric cards bottom */}
      <div style={{ position: 'absolute', left: 100, bottom: 80, display: 'flex', gap: 28 }}>
        {[
          { s: card1, v: '0.06', u: 'MICROSECONDS', l: 'ROTATION SLOWER PER DAY', c: RED },
          { s: card2, v: '2', u: 'CENTIMETERS', l: 'GEOGRAPHIC POLE SHIFT', c: GOLD },
        ].map((m, i) => (
          <div key={i} style={{ width: 470, borderLeft: `4px solid ${m.c}`, background: 'rgba(15,28,36,0.9)', padding: '22px 30px', opacity: m.s, transform: `translateY(${(1 - m.s) * 40}px)` }}>
            <div style={{ fontSize: 62, fontWeight: 800, color: '#e8f2f8', lineHeight: 1 }}>
              {m.v}<span style={{ fontSize: 26, color: m.c, marginLeft: 10, letterSpacing: 2 }}>{m.u}</span>
            </div>
            <div style={{ fontSize: 18, color: '#8fb4c7', letterSpacing: 3, marginTop: 10 }}>{m.l}</div>
          </div>
        ))}
      </div>

      {/* narration caption strip */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 26, textAlign: 'center', opacity: interpolate(frame, [30, 50], [0, 1], { extrapolateRight: 'clamp' }) }}>
        <span style={{ fontSize: 19, color: '#5f8598', letterSpacing: 4 }}>MOMENT OF INERTIA ↑ — MASS MOVED TOWARD THE EQUATOR-SIDE LATITUDES SLOWS THE SPIN</span>
      </div>
    </AbsoluteFill>
  );
}