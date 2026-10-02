import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate, spring, Easing} from 'remotion';

const PALETTE = {
  bg: '#070e14',
  panel: '#0f1c24',
  cyan: '#4cc9f0',
  gold: '#e5a93c',
  red: '#e63946',
  water: '#1e4d66',
  land: '#2a4d3e',
  text: '#e6edf2',
  muted: '#8ba3b3',
  dam: '#1a262f'
};

function seededRandom(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

const STARS = Array.from({length: 80}).map((_, i) => ({
  x: 80 + seededRandom(i) * 1760,
  y: 60 + seededRandom(i + 200) * 960,
  size: 1 + seededRandom(i + 400) * 2.5,
  baseOpacity: 0.15 + seededRandom(i + 600) * 0.45,
  phase: seededRandom(i + 800) * Math.PI * 2
}));

export default function MotionScene({scene, context}: {scene: any; context: any}) {
  const frame = useCurrentFrame();
  const fps = scene?.fps ?? 30;

  const revealTitle = spring({frame, fps, config: {damping: 18, stiffness: 60, mass: 1}, durationInFrames: 40, delay: 5});
  const revealCards = spring({frame, fps, config: {damping: 18, stiffness: 55, mass: 1}, durationInFrames: 50, delay: 20});
  const fillReservoir = spring({frame, fps, config: {damping: 24, stiffness: 40, mass: 1}, durationInFrames: 100, delay: 10});
  const revealAxis = spring({frame, fps, config: {damping: 20, stiffness: 55, mass: 1}, durationInFrames: 50, delay: 80});

  const shiftProgress = interpolate(frame, [95, 170], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.outCubic});
  const gaugeProgress = interpolate(frame, [110, 170], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.outCubic});

  const waterWave = Math.sin(frame * 0.12) * 5;

  const earthCx = 1180;
  const earthCy = 620;
  const earthR = 300;
  const groundY = 900;
  const damLeft = 760;
  const damRight = 880;
  const damTopY = 280;
  const resLeft = 140;
  const resBottom = groundY;
  const resTop = 300;
  const waterTop = resBottom - (resBottom - resTop) * fillReservoir;

  const baseEarthRotation = interpolate(frame, [0, 179], [0, -28], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const slowOffset = interpolate(frame, [110, 170], [0, 3.2], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const earthRotation = baseEarthRotation + slowOffset;

  const surfacePath = `M ${resLeft} ${waterTop} Q ${(resLeft + damLeft) / 2} ${waterTop + waterWave} ${damLeft} ${waterTop} L ${damLeft} ${resBottom} L ${resLeft} ${resBottom} Z`;

  const cardBase: React.CSSProperties = {
    position: 'absolute',
    background: 'rgba(15, 28, 36, 0.92)',
    border: '1px solid rgba(76, 201, 240, 0.25)',
    borderRadius: 4,
    padding: '18px 22px',
    fontFamily: 'Inter, system-ui, sans-serif'
  };

  return (
    <AbsoluteFill style={{background: `linear-gradient(180deg, ${PALETTE.bg} 0%, #0c151c 100%)`, overflow: 'hidden'}}>
      {STARS.map((s, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: s.x,
            top: s.y,
            width: s.size,
            height: s.size,
            borderRadius: '50%',
            background: PALETTE.text,
            opacity: s.baseOpacity * (0.6 + 0.4 * Math.sin(frame * 0.05 + s.phase))
          }}
        />
      ))}

      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle at 70% 60%, rgba(15, 28, 36, 0.65) 0%, transparent 60%)`
        }}
      />

      <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
        <defs>
          <clipPath id='earthClip'>
            <circle cx={earthCx} cy={earthCy} r={earthR - 3} />
          </clipPath>
        </defs>

        <line
          x1={earthCx}
          y1={60}
          x2={earthCx}
          y2={1020}
          stroke={PALETTE.cyan}
          strokeWidth={2}
          strokeOpacity={0.12 * revealAxis}
          strokeDasharray='8 8'
        />

        <path d={surfacePath} fill={PALETTE.water} fillOpacity={0.85} />

        <polygon
          points={`${damLeft},${groundY} ${damLeft},${damTopY} ${damRight},${damTopY - 20} ${damRight},${groundY}`}
          fill={PALETTE.dam}
          stroke={PALETTE.cyan}
          strokeWidth={2}
        />

        <g transform={`rotate(${earthRotation}, ${earthCx}, ${earthCy})`}>
          <circle cx={earthCx} cy={earthCy} r={earthR} fill={PALETTE.panel} stroke={PALETTE.cyan} strokeWidth={3} />
          <g clipPath='url(#earthClip)'>
            <path
              d={`M ${earthCx - 80} ${earthCy - 120} C ${earthCx + 40} ${earthCy - 180}, ${earthCx + 160} ${earthCy - 100}, ${earthCx + 180} ${earthCy + 20} C ${earthCx + 200} ${earthCy + 140}, ${earthCx + 60} ${earthCy + 200}, ${earthCx - 60} ${earthCy + 160} C ${earthCx - 160} ${earthCy + 120}, ${earthCx - 180} ${earthCy - 20}, ${earthCx - 80} ${earthCy - 120} Z`}
              fill={PALETTE.land}
              opacity={0.8}
            />
            {[-60, -30, 0, 30, 60].map((deg) => {
              const rx = earthR * Math.cos((deg * Math.PI) / 180);
              return (
                <ellipse
                  key={`lon-${deg}`}
                  cx={earthCx}
                  cy={earthCy}
                  rx={Math.max(rx, 1)}
                  ry={earthR}
                  fill='none'
                  stroke={PALETTE.cyan}
                  strokeOpacity={0.14}
                  strokeWidth={1.5}
                />
              );
            })}
            {[-60, -30, 0, 30, 60].map((deg) => {
              const y = earthCy + earthR * Math.sin((deg * Math.PI) / 180);
              return (
                <line
                  key={`lat-${deg}`}
                  x1={earthCx - earthR}
                  y1={y}
                  x2={earthCx + earthR}
                  y2={y}
                  stroke={PALETTE.cyan}
                  strokeOpacity={0.1}
                  strokeWidth={1.5}
                />
              );
            })}
          </g>
        </g>

        <line
          x1={earthCx}
          y1={earthCy - earthR - 18}
          x2={earthCx + 30 * shiftProgress}
          y2={earthCy - earthR - 18}
          stroke={PALETTE.gold}
          strokeWidth={2}
          strokeDasharray='4 4'
          opacity={revealAxis}
        />
        <circle cx={earthCx} cy={earthCy - earthR - 18} r={6} fill={PALETTE.cyan} opacity={revealAxis} />
        <circle cx={earthCx + 30 * shiftProgress} cy={earthCy - earthR - 18} r={7} fill={PALETTE.red} opacity={revealAxis} />
      </svg>

      <div
        style={{
          position: 'absolute',
          left: 80,
          right: 80,
          top: 60,
          textAlign: 'center',
          opacity: revealTitle,
          transform: `translateY(${(1 - revealTitle) * -20}px)`,
          fontFamily: 'Inter, system-ui, sans-serif'
        }}
      >
        <div style={{fontSize: 56, fontWeight: 800, color: PALETTE.text, letterSpacing: 1}}>ALTERING EARTH'S SPIN</div>
        <div style={{fontSize: 24, color: PALETTE.cyan, marginTop: 8}}>How the Three Gorges Dam shifted Earth's axis</div>
      </div>

      <div
        style={{
          ...cardBase,
          left: 140,
          top: 180,
          width: 300,
          borderLeft: `4px solid ${PALETTE.cyan}`,
          opacity: revealCards,
          transform: `translateY(${(1 - revealCards) * 30}px)`
        }}
      >
        <div style={{fontSize: 13, color: PALETTE.muted, textTransform: 'uppercase', letterSpacing: 1}}>Reservoir volume</div>
        <div style={{fontSize: 42, fontWeight: 700, color: PALETTE.text, marginTop: 6}}>
          39.3 <span style={{fontSize: 18, color: PALETTE.muted}}>billion m³</span>
        </div>
      </div>

      <div
        style={{
          ...cardBase,
          right: 140,
          top: 180,
          width: 270,
          borderLeft: `4px solid ${PALETTE.cyan}`,
          opacity: revealCards,
          transform: `translateY(${(1 - revealCards) * 30}px)`
        }}
      >
        <div style={{fontSize: 13, color: PALETTE.muted, textTransform: 'uppercase', letterSpacing: 1}}>Surface elevation</div>
        <div style={{fontSize: 42, fontWeight: 700, color: PALETTE.text, marginTop: 6}}>
          175 <span style={{fontSize: 18, color: PALETTE.muted}}>m above sea level</span>
        </div>
      </div>

      <div
        style={{
          ...cardBase,
          left: 140,
          top: 820,
          width: 300,
          borderLeft: `4px solid ${PALETTE.gold}`,
          opacity: revealCards,
          transform: `translateY(${(1 - revealCards) * 30}px)`
        }}
      >
        <div style={{fontSize: 13, color: PALETTE.muted, textTransform: 'uppercase', letterSpacing: 1}}>Rotation slowdown</div>
        <div style={{fontSize: 42, fontWeight: 700, color: PALETTE.text, marginTop: 6}}>
          −0.06 <span style={{fontSize: 18, color: PALETTE.muted}}>µs / day</span>
        </div>
        <div style={{height: 3, background: PALETTE.gold, width: `${gaugeProgress * 100}%`, marginTop: 12, borderRadius: 2}} />
      </div>

      <div
        style={{
          ...cardBase,
          left: 470,
          top: 820,
          width: 300,
          borderLeft: `4px solid ${PALETTE.red}`,
          opacity: revealCards,
          transform: `translateY(${(1 - revealCards) * 30}px)`
        }}
      >
        <div style={{fontSize: 13, color: PALETTE.muted, textTransform: 'uppercase', letterSpacing: 1}}>Geographic pole shift</div>
        <div style={{fontSize: 42, fontWeight: 700, color: PALETTE.text, marginTop: 6}}>
          +2 <span style={{fontSize: 18, color: PALETTE.muted}}>cm</span>
        </div>
        <div style={{height: 3, background: PALETTE.red, width: `${shiftProgress * 100}%`, marginTop: 12, borderRadius: 2}} />
      </div>

      <div
        style={{
          position: 'absolute',
          left: earthCx - 110,
          top: earthCy - earthR - 28,
          opacity: revealAxis * 0.9,
          color: PALETTE.cyan,
          fontSize: 14,
          fontWeight: 600,
          fontFamily: 'Inter, system-ui, sans-serif'
        }}
      >
        Geographic pole
      </div>

      <div
        style={{
          position: 'absolute',
          left: earthCx + 30 * shiftProgress + 14,
          top: earthCy - earthR - 54,
          opacity: revealAxis,
          color: PALETTE.red,
          fontSize: 16,
          fontWeight: 700,
          whiteSpace: 'nowrap',
          fontFamily: 'Inter, system-ui, sans-serif'
        }}
      >
        +2 cm shift
      </div>
    </AbsoluteFill>
  );
}