import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring } from 'remotion';

export default function SceneKimiCodeKimiCode({ scene, context }: { scene: any; context: any }) {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = scene;

  const titleOpacity = interpolate(frame, [0, 25], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const titleY = interpolate(frame, [0, 30], [-20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const mapScale = spring({ frame, fps, config: { damping: 20, stiffness: 80 } });
  const mapOpacity = interpolate(frame, [0, 30], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const mountainDraw = interpolate(frame, [20, 65], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const mountainLabelOpacity = interpolate(frame, [40, 70], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const cloudX = interpolate(frame, [35, 90], [950, 795], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const cloudOpacity = interpolate(frame, [30, 45, 75, 95], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const aridReveal = interpolate(frame, [60, 120], [0, 900], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const aridOpacity = interpolate(frame, [55, 80], [0, 0.85], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const panelY = interpolate(frame, [95, 130], [30, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const panelOpacity = interpolate(frame, [95, 130], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const gaugeFill = interpolate(frame, [120, 165], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const compReveal = interpolate(frame, [130, 165], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const pulseFrame = Math.max(0, frame - 145);
  const pulse = spring({ frame: pulseFrame, fps, config: { damping: 12, stiffness: 60 } });
  const bigPercentScale = 1 + pulse * 0.04;

  const australiaPath = 'M 80 180 C 80 120, 160 60, 280 50 C 400 40, 520 60, 600 120 C 680 180, 740 160, 800 180 C 850 220, 860 300, 840 380 C 820 460, 760 540, 680 560 C 620 580, 580 560, 560 520 C 540 480, 520 460, 480 460 C 440 460, 420 500, 400 540 C 380 580, 320 590, 260 560 C 200 530, 160 480, 140 400 C 120 320, 80 260, 80 180 Z';

  return (
    <AbsoluteFill style={{ background: '#0b1412', fontFamily: 'Inter, system-ui, sans-serif', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 55% 45%, #162420 0%, #0b1412 70%)' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 50%, transparent 40%, rgba(0,0,0,0.55) 100%)' }} />

      <div style={{ position: 'absolute', left: 100, top: 80, opacity: titleOpacity, transform: `translateY(${titleY}px)` }}>
        <div style={{ color: '#e5a93c', fontSize: 18, letterSpacing: 3, textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>{scene.topic}</div>
        <h1 style={{ color: '#f2f0eb', fontSize: 64, fontWeight: 800, lineHeight: 1.05, margin: 0, maxWidth: 700 }}>{scene.heading}</h1>
      </div>

      <div style={{ position: 'absolute', left: 460, top: 140, width: 1000, height: 700, opacity: mapOpacity, transform: `scale(${0.94 + mapScale * 0.06})` }}>
        <svg viewBox='0 0 900 650' width='100%' height='100%' style={{ overflow: 'visible' }}>
          <defs>
            <mask id='aridMask'>
              <rect x={900 - aridReveal} y={0} width={aridReveal} height={650} fill='white' />
            </mask>
            <linearGradient id='aridGrad' x1='0%' y1='0%' x2='0%' y2='100%'>
              <stop offset='0%' stopColor='#c44d34' />
              <stop offset='100%' stopColor='#8f2e1d' />
            </linearGradient>
            <filter id='cloudGlow'>
              <feGaussianBlur stdDeviation='3' result='coloredBlur' />
              <feMerge>
                <feMergeNode in='coloredBlur' />
                <feMergeNode in='SourceGraphic' />
              </feMerge>
            </filter>
          </defs>

          <path d={australiaPath} fill='none' stroke='#3d4f49' strokeWidth={3} />
          <ellipse cx='450' cy='615' rx='35' ry='18' fill='none' stroke='#3d4f49' strokeWidth={3} />

          <path d={australiaPath} fill='url(#aridGrad)' fillOpacity={aridOpacity} mask='url(#aridMask)' />
          <ellipse cx='450' cy='615' rx='35' ry='18' fill='url(#aridGrad)' fillOpacity={aridOpacity} mask='url(#aridMask)' />

          <path d='M 805 120 L 835 210 L 795 290 L 845 390 L 805 490 L 835 580' fill='none' stroke='#e5a93c' strokeWidth={6} strokeLinecap='round' strokeLinejoin='round' pathLength={1} strokeDasharray={1} strokeDashoffset={mountainDraw} style={{ filter: 'drop-shadow(0 0 6px rgba(229,169,60,0.5))' }} />

          <g transform={`translate(${cloudX}, 200)`} opacity={cloudOpacity}>
            <path d='M 0 0 C -25 -20, -55 -10, -60 20 C -80 25, -85 55, -60 70 C -35 85, 5 75, 20 55 C 45 60, 70 45, 65 20 C 60 -5, 30 -15, 0 0 Z' fill='#e8e6e3' fillOpacity={0.9} filter='url(#cloudGlow)' />
          </g>
        </svg>

        <div style={{ position: 'absolute', left: 640, top: 90, color: '#e5a93c', fontSize: 13, letterSpacing: 2, textTransform: 'uppercase', fontWeight: 700, transform: 'rotate(90deg)', transformOrigin: 'left top', opacity: mountainLabelOpacity }}>Mountain Barrier</div>
      </div>

      <div style={{ position: 'absolute', left: 120, top: 850, width: 1680, height: 130, display: 'flex', gap: 24, opacity: panelOpacity, transform: `translateY(${panelY}px)` }}>
        <div style={{ flex: 1, background: 'rgba(22,36,32,0.92)', border: '1px solid rgba(229,169,60,0.35)', borderRadius: 8, padding: '18px 28px', display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ color: '#e5a93c', fontSize: 68, fontWeight: 800, transform: `scale(${bigPercentScale})` }}>82%</div>
          <div style={{ color: '#f2f0eb', fontSize: 18, lineHeight: 1.3 }}>
            <div style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Arid Zone</div>
            <div style={{ color: '#a8b0ad', fontSize: 15 }}>of the entire continent</div>
          </div>
        </div>

        <div style={{ flex: 1, background: 'rgba(22,36,32,0.92)', border: '1px solid rgba(229,169,60,0.35)', borderRadius: 8, padding: '18px 28px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ color: '#f2f0eb', fontSize: 16, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Annual Rainfall</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1, height: 10, background: '#0b1412', borderRadius: 5, overflow: 'hidden' }}>
              <div style={{ width: `${gaugeFill * 100}%`, height: '100%', background: '#e5a93c' }} />
            </div>
            <div style={{ color: '#e5a93c', fontSize: 24, fontWeight: 800, minWidth: 90 }}>&lt;500mm</div>
          </div>
          <div style={{ color: '#a8b0ad', fontSize: 13, marginTop: 6 }}>Less than 500 millimeters per year</div>
        </div>

        <div style={{ flex: 1, background: 'rgba(22,36,32,0.92)', border: '1px solid rgba(229,169,60,0.35)', borderRadius: 8, padding: '18px 28px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ color: '#f2f0eb', fontSize: 16, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Scale Comparison</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{ width: `${140 * compReveal}px`, height: 8, background: '#3d4f49', borderRadius: 4 }} />
            <div style={{ color: '#a8b0ad', fontSize: 13 }}>Western Europe</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: `${260 * compReveal}px`, height: 8, background: '#e5a93c', borderRadius: 4 }} />
            <div style={{ color: '#f2f0eb', fontSize: 14, fontWeight: 700 }}>Australian Empty Zone</div>
          </div>
        </div>
      </div>

      {context?.showDebug && <div style={{ position: 'absolute', right: 100, top: 80, color: 'rgba(242,240,235,0.4)', fontSize: 14 }}>{frame}/{durationInFrames}</div>}
    </AbsoluteFill>
  );
}
