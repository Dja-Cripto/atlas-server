import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring, Easing } from 'remotion';

const W = 1920, H = 1080;
const A = '#e5a93c', C = '#4cc9f0', R = '#e63946', BG = '#070e14', BG2 = '#0f1c24';

const Op = (f: number, s: number, e: number, a = 0, b = 1) =>
  interpolate(f, [s, e], [a, b], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

const MetricCard: React.FC<{ x: number; label: string; value: string; unit: string; color: string; delay: number; num: number; suffix?: string }> =
({ x, label, value, unit, color, delay, num, suffix }) => {
  const frame = useCurrentFrame();
  const sp = spring({ frame: frame - delay, fps: 30, config: { damping: 14, stiffness: 120 } });
  const shown = Math.round(interpolate(frame, [delay + 8, delay + 45], [0, num], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
  return (
    <div style={{
      position: 'absolute', left: x, top: 780, width: 520, height: 200,
      background: BG2, border: `1px solid ${color}44`, borderRadius: 12,
      transform: `translateY(${interpolate(sp, [0, 1], [60, 0])}px)`, opacity: Op(frame, delay, delay + 10),
      fontFamily: 'Helvetica, Arial, sans-serif', padding: '28px 36px', boxSizing: 'border-box'
    }}>
      <div style={{ fontSize: 22, letterSpacing: 4, color: '#8fb3c2', textTransform: 'uppercase' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginTop: 14 }}>
        <div style={{ fontSize: 92, fontWeight: 700, color }}>
          {num != null && isFinite(num) && shown != null ? shown : ''}{suffix}
        </div>
        <div style={{ fontSize: 40, fontWeight: 600, color: value }}>{unit}</div>
      </div>
    </div>
  );
};

const MotionScene: React.FC<{ scene: any; context: any }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const dur = scene?.durationInFrames ?? 180;

  // Route arc draw progress
  const arcticDraw = Op(frame, 10, 90) * 100;
  const suezDraw = Op(frame, 35, 115) * 100;
  const arcticGlow = 0.4 + 0.6 * Math.sin(frame / 12) * 0.25 + 0.35;
  const chokePulse = frame > 70 ? 0.5 + 0.5 * Math.sin((frame - 70) / 5) : 0;
  const headlineSp = spring({ frame: frame - 118, fps: 30, config: { damping: 12, stiffness: 90 } });
  const suezDim = Op(frame, 100, 125, 1, 0.45);
  const titleSp = spring({ frame: frame - 4, fps: 30, config: { damping: 14, stiffness: 110 } });

  const dash = 24;
  const dashOffset = -(frame * 1.5) % 2000;

  return (
    <AbsoluteFill style={{ background: BG, fontFamily: 'Helvetica, Arial, sans-serif' }}>
      {/* subtle vignette panels */}
      <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, ${BG2}cc 0%, transparent 30%, transparent 70%, ${BG2}aa 100%)` }} />

      {/* MAP GRID */}
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }} viewBox={`0 0 ${W} ${H}`}>
        {Array.from({ length: 14 }).map((_, i) => (
          <line key={'h' + i} x1={80} x2={1840} y1={160 + i * 50} y2={160 + i * 50}
            stroke="#1d3444" strokeWidth={1} opacity={Op(frame, 0, 30) * 0.5} />
        ))}
        {Array.from({ length: 16 }).map((_, i) => (
          <line key={'v' + i} y1={160} y2={700} x1={80 + i * 117} x2={80 + i * 117}
            stroke="#1d3444" strokeWidth={1} opacity={Op(frame, 0, 30) * 0.5} />
        ))}

        {/* Suez route (gold) */}
        <path d="M 300 620 Q 940 560 1600 340" fill="none" stroke={A} strokeWidth={5}
          strokeDasharray={`${suezDraw} 4000`} opacity={suezDraw > 0 ? suezDim * 0.95 : 0} strokeLinecap="round" />
        {/* Suez dash flow */}
        <path d="M 300 620 Q 940 560 1600 340" fill="none" stroke="#ffd98a" strokeWidth={2}
          strokeDasharray={`${dash} ${dash}`} strokeDashoffset={dashOffset}
          opacity={suezDraw >= 100 ? suezDim * 0.7 : 0} strokeLinecap="round" />

        {/* Arctic route (cyan, emphasized) */}
        <path d="M 300 340 Q 960 60 1600 340" fill="none" stroke={C} strokeWidth={8}
          strokeDasharray={`${arcticDraw} 4000`} strokeLinecap="round"
          opacity={arcticDraw > 0 ? 0.95 : 0} />
        <path d="M 300 340 Q 960 60 1600 340" fill="none" stroke="#bfeeff" strokeWidth={2.5}
          strokeDasharray={`${dash} ${dash}`} strokeDashoffset={dashOffset}
          opacity={arcticDraw >= 100 ? Math.min(1, arcticGlow) * 0.85 : 0} strokeLinecap="round" />

        {/* Ice shelf hint along arctic arc */}
        {frame > 55 && Array.from({ length: 7 }).map((_, i) => {
          const t = 0.12 + i * 0.13;
          const x = (1 - t) * (1 - t) * 300 + 2 * (1 - t) * t * 960 + t * t * 1600;
          const y = (1 - t) * (1 - t) * 340 + 2 * (1 - t) * t * 60 + t * t * 340;
          return <circle key={'ice' + i} cx={x} cy={y - 14} r={5 + (i % 3) * 3} fill="#ffffff" opacity={Op(frame, 55 + i * 5, 70 + i * 5) * 0.28} />;
        })}

        {/* Suez choke point red pulse */}
        {frame > 70 && (() => {
          const t = 0.53;
          const cx = (1 - t) * (1 - t) * 300 + 2 * (1 - t) * t * 940 + t * t * 1600;
          const cy = (1 - t) * (1 - t) * 620 + 2 * (1 - t) * t * 560 + t * t * 340;
          return (
            <g>
              <circle cx={cx} cy={cy} r={16 + chokePulse * 14} fill="none" stroke={R} strokeWidth={3} opacity={0.9 - chokePulse * 0.6} />
              <circle cx={cx} cy={cy} r={7} fill={R} opacity={0.95} />
            </g>
          );
        })()}

        {/* Port nodes */}
        {[{ x: 300, y: 340, name: 'SHANGHAI', d: 15 }, { x: 1600, y: 340, name: 'ROTTERDAM', d: 22 }].map((p, i) => (
          <g key={p.name} opacity={Op(frame, p.d, p.d + 16)}>
            <circle cx={p.x} cy={p.y} r={11} fill={BG} stroke={C} strokeWidth={3} />
            <circle cx={p.x} cy={p.y} r={5} fill={C}
              opacity={0.6 + 0.4 * Math.sin(frame / 8)} />
            <text x={p.x} y={p.y - 28} textAnchor="middle" fill="#cfe8f2" fontSize={24} fontWeight={700} letterSpacing={3}>{p.name}</text>
          </g>
        ))}

        {/* Route labels */}
        <g opacity={Op(frame, 78, 100)}>
          <text x={960} y={118} textAnchor="middle" fill={C} fontSize={30} fontWeight={700} letterSpacing={4}>NORTHERN SEA ROUTE — 18,000 NM</text>
        </g>
        <g opacity={Op(frame, 100, 122) * suezDim}>
          <text x={960} y={555} textAnchor="middle" fill={A} fontSize={26} fontWeight={600} letterSpacing={3}>VIA SUEZ CANAL — 21,000 NM</text>
        </g>
      </svg>

      {/* TITLE */}
      <div style={{
        position: 'absolute', top: 66, left: 80, right: 80, textAlign: 'center',
        transform: `translateY(${interpolate(titleSp, [0, 1], [-36, 0])}px)`, opacity: Op(frame, 4, 22)
      }}>
        <div style={{ fontSize: 18, letterSpacing: 10, color: A, marginBottom: 8 }}>SHANGHAI → ROTTERDAM</div>
        <div style={{ fontSize: 56, fontWeight: 800, letterSpacing: 6, color: '#eaf4f8' }}>THE ARCTIC SHORTCUT</div>
        <div style={{ width: 260, height: 3, background: C, margin: '14px auto 0' }} />
      </div>

      {/* HEADLINE */}
      <div style={{
        position: 'absolute', top: 0, bottom: 0, left: 0, right: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none'
      }}>
        <div style={{
          fontSize: 170, fontWeight: 800, color: '#0a1118', letterSpacing: 2,
          WebkitTextStroke: `3px ${C}`,
          transform: `scale(${interpolate(headlineSp, [0, 1], [1.6, 1])})`,
          opacity: Op(frame, 118, 132, 0, 0.92),
          textShadow: '0 0 60px rgba(76,201,240,0.35)'
        }}>40% SHORTER</div>
      </div>

      {/* METRIC CARDS */}
      <MetricCard x={80} label="Time Saved" num={14} suffix={''} unit="days at sea" value="#eaf4f8" color={C} delay={52} />
      <MetricCard x={700} label="Distance Saved" num={3000} suffix={''} unit="nautical miles" value="#eaf4f8" color={A} delay={62} />
      <MetricCard x={1320} label="Polar Air Temp" num={40} suffix={'°'} unit="celsius" value="#8fb3c2" color={R} delay={72} />

      {/* Footnote */}
      <div style={{
        position: 'absolute', bottom: 40, left: 80, right: 80, textAlign: 'center',
        fontSize: 20, letterSpacing: 3, color: '#5f7d8c', opacity: Op(frame, 96, 120)
      }}>
        AS ARCTIC SEA ICE RETREATS, THE POLAR SILK ROAD BYPASSES THE SUEZ CHOKE POINT
      </div>

      {/* End session fade-up guard */}
      <AbsoluteFill style={{ background: BG, opacity: interpolate(frame, [dur - 6, dur], [0, 0.85], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }), pointerEvents: 'none' }} />
    </AbsoluteFill>
  );
};

export default MotionScene;