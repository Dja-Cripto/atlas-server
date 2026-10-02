import React from 'react';
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame } from 'remotion';

export default function MotionScene({ scene, context }: { scene: any; context: any }) {
  const frame = useCurrentFrame();
  const fps = scene.fps || 30;
  const duration = scene.durationInFrames || 180;
  const end = duration - 1;
  const intro = spring({ frame, fps, config: { damping: 22, stiffness: 90, mass: 0.8 } });
  const focus = interpolate(frame, [48, 88, 120, end], [0, 0.25, 1, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  const shipCount = Math.round(interpolate(frame, [8, 60], [0, 84000], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) }));
  const routeDash = interpolate(frame, [0, 90], [620, 0], { extrapolateRight: 'clamp' });
  const ships = Array.from({ length: 10 }, (_, i) => {
    const y = ((i * 79 + frame * (1.5 + (i % 3) * 0.12)) % 620) + 18;
    const x = 420 + Math.sin(i * 1.71) * (18 + Math.sin((y / 660) * Math.PI) * 5);
    return { x, y, gold: i % 4 === 0 };
  });
  const cardStyle: React.CSSProperties = { position: 'absolute', left: 1380, width: 430, border: '1px solid rgba(184,202,213,0.16)', background: 'rgba(15,28,36,0.92)', borderRadius: 12, boxSizing: 'border-box', padding: '20px 24px' };

  return (
    <AbsoluteFill style={{ backgroundColor: '#070e14', color: '#edf2f4', fontFamily: 'Arial, Helvetica, sans-serif', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, opacity: 0.16, backgroundImage: 'linear-gradient(rgba(130,160,175,0.13) 1px, transparent 1px), linear-gradient(90deg, rgba(130,160,175,0.13) 1px, transparent 1px)', backgroundSize: '64px 64px' }} />
      <div style={{ position: 'absolute', left: 100, top: 72, opacity: intro, transform: `translateY(${(1 - intro) * 14}px)` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#e5a93c', fontSize: 14, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase' }}>
          <span style={{ width: 26, height: 2, background: '#e5a93c' }} /> Maritime chokepoints / 01
        </div>
        <div style={{ marginTop: 15, fontSize: 43, lineHeight: 1.06, fontWeight: 700, letterSpacing: -1.5 }}>The 1.7-Mile Chokepoint</div>
        <div style={{ marginTop: 10, fontSize: 18, color: '#9eafb8', letterSpacing: 0.2 }}>Why 84,000 ships risk the Strait of Malacca</div>
      </div>

      <div style={{ position: 'absolute', left: 92, top: 640, width: 330, opacity: interpolate(frame, [24, 48], [0, 1], { extrapolateRight: 'clamp' }), transform: `translateY(${interpolate(frame, [24, 48], [12, 0], { extrapolateRight: 'clamp' })}px)` }}>
        <div style={{ color: '#e5a93c', fontSize: 13, fontWeight: 700, letterSpacing: 2.2, textTransform: 'uppercase' }}>A global artery</div>
        <div style={{ marginTop: 15, width: 48, height: 2, background: '#e5a93c' }} />
        <div style={{ marginTop: 16, fontSize: 21, lineHeight: 1.45, color: '#c4d0d5' }}>One narrow passage links the Indian Ocean to the busiest trade routes of the Pacific.</div>
        <div style={{ marginTop: 21, fontSize: 12, color: '#73858f', letterSpacing: 1.5, textTransform: 'uppercase' }}>Indian Ocean <span style={{ color: '#e5a93c', padding: '0 7px' }}>→</span> Pacific</div>
      </div>

      <div style={{ position: 'absolute', left: 476, top: 232, width: 850, height: 690, opacity: intro, transform: `translateY(${(1 - intro) * 10}px)` }}>
        <svg width="100%" height="100%" viewBox="0 0 800 660" preserveAspectRatio="none" role="img" aria-label="Schematic map of the Strait of Malacca">
          <rect x="0" y="0" width="800" height="660" rx="18" fill="#10232c" />
          <path d="M0 0 H282 C286 76 298 132 313 190 C329 255 348 318 360 376 C372 433 383 480 397 518 C387 565 373 615 365 660 H0 Z" fill="#1b2b2d" />
          <path d="M555 0 H800 V660 H475 C461 611 451 564 447 518 C456 476 464 432 474 376 C485 318 504 255 519 190 C534 132 547 76 555 0 Z" fill="#1b2b2d" />
          <path d="M282 0 C286 76 298 132 313 190 C329 255 348 318 360 376 C372 433 383 480 397 518 C387 565 373 615 365 660" fill="none" stroke="#71817b" strokeWidth="2" opacity="0.75" />
          <path d="M555 0 C547 76 534 132 519 190 C504 255 485 318 474 376 C464 432 456 476 447 518 C451 564 461 611 475 660" fill="none" stroke="#71817b" strokeWidth="2" opacity="0.75" />
          <path d="M420 28 C422 160 417 275 419 390 C420 468 423 540 420 628" fill="none" stroke="#e5a93c" strokeWidth="2" strokeDasharray="8 12" strokeDashoffset={routeDash} opacity="0.72" />
          <path d="M420 28 C422 160 417 275 419 390 C420 468 423 540 420 628" fill="none" stroke="#e5a93c" strokeWidth="13" strokeDasharray="1 30" strokeDashoffset={routeDash} opacity="0.16" />
          <text x="92" y="84" fill="#a7b5ae" fontSize="13" letterSpacing="2">SUMATRA</text>
          <text x="586" y="84" fill="#a7b5ae" fontSize="13" letterSpacing="2">MALAY PENINSULA</text>
          <text x="420" y="40" fill="#94a6ad" fontSize="11" textAnchor="middle" letterSpacing="2">NORTH</text>
          <text x="420" y="642" fill="#94a6ad" fontSize="11" textAnchor="middle" letterSpacing="2">SINGAPORE</text>
          {ships.map((ship, i) => (
            <g key={i} transform={`translate(${ship.x} ${ship.y})`} opacity="0.95">
              <path d="M0 -9 L6 6 L0 3 L-6 6 Z" fill={ship.gold ? '#e5a93c' : '#d7e1e3'} />
              <path d="M0 -5 L0 2" stroke="#10232c" strokeWidth="1" />
            </g>
          ))}
          <g opacity={0.45 + focus * 0.55}>
            <circle cx="420" cy="518" r={interpolate(frame, [55, 110], [21, 38], { extrapolateRight: 'clamp' })} fill="none" stroke="#e5a93c" strokeWidth="1.5" opacity={0.35 + focus * 0.5} />
            <line x1="397" y1="518" x2="447" y2="518" stroke="#e5a93c" strokeWidth="2" />
            <line x1="397" y1="506" x2="397" y2="530" stroke="#e5a93c" strokeWidth="2" />
            <line x1="447" y1="506" x2="447" y2="530" stroke="#e5a93c" strokeWidth="2" />
            <rect x="356" y="462" width="128" height="31" rx="5" fill="#071117" stroke="#e5a93c" strokeWidth="1" />
            <text x="420" y="483" fill="#f0bd55" fontSize="15" textAnchor="middle" fontWeight="700" letterSpacing="1.4">1.7 MILES</text>
          </g>
          <rect x="18" y="18" width="764" height="624" rx="14" fill="none" stroke="rgba(208,224,228,0.13)" strokeWidth="1" />
        </svg>
      </div>

      <div style={{ ...cardStyle, top: 232, height: 224, borderColor: `rgba(229,169,60,${0.24 + focus * 0.48})`, transform: `scale(${0.97 + intro * 0.03})`, transformOrigin: 'top left' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ color: '#e5a93c', fontSize: 12, letterSpacing: 2, fontWeight: 700 }}>THE TIGHTEST PASSAGE</div>
          <div style={{ width: 8, height: 8, borderRadius: 8, background: '#e63946', boxShadow: `0 0 0 ${3 + focus * 5}px rgba(230,57,70,${0.08 + focus * 0.12})` }} />
        </div>
        <div style={{ marginTop: 19, display: 'flex', alignItems: 'baseline', gap: 12 }}>
          <span style={{ fontSize: 76, lineHeight: 0.95, fontWeight: 700, letterSpacing: -4, color: '#f4f5f2' }}>1.7</span>
          <span style={{ fontSize: 22, fontWeight: 700, color: '#e5a93c', letterSpacing: 1 }}>MILES</span>
        </div>
        <div style={{ marginTop: 15, fontSize: 15, color: '#9eafb8' }}>Navigable width at the choke point</div>
        <div style={{ position: 'absolute', left: 24, right: 24, bottom: 18, height: 3, borderRadius: 3, background: '#263943' }}>
          <div style={{ width: `${35 + focus * 65}%`, height: '100%', borderRadius: 3, background: '#e5a93c' }} />
        </div>
      </div>

      <div style={{ ...cardStyle, top: 477, height: 128, opacity: interpolate(frame, [10, 32], [0, 1], { extrapolateRight: 'clamp' }) }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
          <div><div style={{ color: '#8fa2ac', fontSize: 12, letterSpacing: 1.6, fontWeight: 700 }}>VESSELS EVERY YEAR</div><div style={{ marginTop: 10, fontSize: 36, fontWeight: 700, letterSpacing: -1 }}>{shipCount.toLocaleString('en-US')}</div></div>
          <div style={{ marginTop: 4, color: '#e5a93c', fontSize: 20 }}>↘</div>
        </div>
      </div>
      <div style={{ ...cardStyle, top: 620, height: 128, opacity: interpolate(frame, [18, 42], [0, 1], { extrapolateRight: 'clamp' }) }}>
        <div style={{ color: '#8fa2ac', fontSize: 12, letterSpacing: 1.6, fontWeight: 700 }}>WORLD'S TRADED OIL</div>
        <div style={{ marginTop: 9, fontSize: 37, fontWeight: 700, color: '#e5a93c' }}>25<span style={{ fontSize: 22 }}>%</span></div>
        <div style={{ marginTop: 2, fontSize: 13, color: '#9eafb8' }}>moves through this corridor</div>
      </div>
      <div style={{ ...cardStyle, top: 763, height: 128, opacity: interpolate(frame, [26, 50], [0, 1], { extrapolateRight: 'clamp' }) }}>
        <div style={{ color: '#8fa2ac', fontSize: 12, letterSpacing: 1.6, fontWeight: 700 }}>TRADED GOODS VALUE</div>
        <div style={{ marginTop: 12, fontSize: 34, fontWeight: 700, letterSpacing: -0.8 }}>$3.5 <span style={{ color: '#e5a93c' }}>Trillion</span></div>
      </div>

      <div style={{ position: 'absolute', left: 100, bottom: 54, width: 1720, height: 1, background: 'rgba(174,195,204,0.15)' }} />
      <div style={{ position: 'absolute', left: 100, bottom: 29, fontSize: 11, letterSpacing: 1.8, color: '#71838c', textTransform: 'uppercase' }}>Strait of Malacca <span style={{ color: '#e5a93c', padding: '0 8px' }}>•</span> Global shipping corridor</div>
      <div style={{ position: 'absolute', right: 100, bottom: 29, fontSize: 11, letterSpacing: 1.8, color: '#71838c', textTransform: 'uppercase' }}>Schematic map <span style={{ color: '#e5a93c', padding: '0 8px' }}>•</span> 01 / 01</div>
    </AbsoluteFill>
  );
}
