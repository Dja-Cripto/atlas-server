import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';

const RED = '#b1442e';
const DARK = '#16100c';

export default function SceneGLMFlashGLMFlash({ scene }: { scene: any; context: any }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const D = scene.durationInFrames;

  // cloud band fading across ridge
  const cloudFade = interpolate(frame, [30, 90], [1, 0], { extrapolateRight: 'clamp' });
  const cloudX = interpolate(frame, [0, 90], [0, 260], { easing: Easing.out(Easing.quad), extrapolateRight: 'clamp' });

  // arid expanse grows after clouds die
  const aridW = interpolate(frame, [60, 120], [0, 1290], { easing: Easing.out(Easing.cubic), extrapolateRight: 'clamp' });
  const pct = Math.round(interpolate(frame, [95, 125], [0, 82], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
  const greenShrink = interpolate(frame, [60, 120], [1, 0.22], { easing: Easing.out(Easing.cubic), extrapolateRight: 'clamp' });

  const thresholdX = 80 + aridW;
  const labelIn = interpolate(frame, [110, 130], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const clouds = [];
  for (let i = 0; i < 14; i++) {
    const r = 34 + (i * 37) % 46;
    clouds.push({ x: 300 + (i * 131) % 520, y: 130 + (i * 97) % 420, r, o: 0.5 + ((i * 13) % 5) * 0.09 });
  }

  return (
    <AbsoluteFill style={{ backgroundColor: DARK }}>
      {/* sky */}
      <AbsoluteFill style={{ background: 'linear-gradient(180deg,#2a2118 0%,#4a382a 55%,#6b4a34 100%)' }} />

      {/* arid landmass */}
      <div style={{ position: 'absolute', left: 80, bottom: 60, width: aridW, height: 620, backgroundColor: RED, borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(120deg,#c25535 0%,#a63d28 60%,#8f3220 100%)' }} />
        <div style={{ position: 'absolute', left: 60, top: 40, opacity: labelIn, color: '#ffd9c8', fontFamily: 'Helvetica, Arial, sans-serif', fontSize: 44, fontWeight: 700, letterSpacing: 1 }}>LARGER THAN W. EUROPE</div>
      </div>

      {/* shrinking green coastal fringe */}
      <div style={{ position: 'absolute', left: 80, bottom: 60, width: 1290 * greenShrink, height: 620, backgroundColor: '#5a7d3a', borderRadius: 10, opacity: 0.9 * (1 - labelIn * 0.4) }} />

      {/* mountains */}
      <svg width={520} height={1080} style={{ position: 'absolute', left: 80, top: 0 }} viewBox="0 0 520 1080">
        <polygon points="0,680 140,400 260,660 380,380 520,700 520,680 0,680" fill="#241a12" />
        <polygon points="90,680 140,400 190,680" fill="#3a2a1c" />
        <polygon points="330,680 380,380 440,680" fill="#3a2a1c" />
        <rect x={0} y={676} width={520} height={404} fill="#241a12" />
      </svg>

      {/* dying cloud band */}
      {clouds.map((c, i) => (
        <div key={i} style={{
          position: 'absolute', left: c.x - cloudX, top: c.y, width: c.r * 2, height: c.r * 1.15,
          borderRadius: c.r, backgroundColor: '#e8e2d8', opacity: c.o * cloudFade,
          transform: `scale(${1 + (1 - cloudFade) * 0.6})`,
        }} />
      ))}

      {/* 500 mm threshold line */}
      {aridW > 20 && (
        <div style={{ position: 'absolute', left: thresholdX, top: 60, width: 4, height: 960, backgroundColor: '#fff' }} />
      )}
      {aridW > 20 && (
        <div style={{ position: 'absolute', left: Math.min(thresholdX, 1720), top: 960, transform: 'translateX(-50%)', fontSize: 30, fontWeight: 700, color: '#fff', fontFamily: 'Helvetica, Arial, sans-serif', textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>500 mm</div>
      )}

      {/* percentage focal */}
      <div style={{ position: 'absolute', right: 80, top: 100, textAlign: 'right', opacity: labelIn }}>
        <div style={{ fontSize: 180, fontWeight: 800, color: '#fff', fontFamily: 'Helvetica, Arial, sans-serif', lineHeight: 1, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{pct}%</div>
        <div style={{ fontSize: 40, color: '#ffd9c8', fontFamily: 'Helvetica, Arial, sans-serif', marginTop: 10 }}>IS ARID</div>
      </div>

      {/* title, brief */}
      <div style={{ position: 'absolute', left: 110, top: 96, opacity: interpolate(frame, [4, 20, 150, D], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>
        <div style={{ fontSize: 64, fontWeight: 800, color: '#fff', fontFamily: 'Helvetica, Arial, sans-serif', textShadow: '0 2px 4px rgba(0,0,0,0.55)' }}>The Dead Zone</div>
      </div>
    </AbsoluteFill>
  );
}