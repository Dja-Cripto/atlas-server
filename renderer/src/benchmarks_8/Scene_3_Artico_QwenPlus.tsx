import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring, Easing, useVideoConfig } from 'remotion';

export default function MotionScene({ scene, context }: { scene: any; context: any }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Springs
  const titleSpring = spring({ frame, fps, from: 0, to: 1, durationInFrames: 25 });
  const mapOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });
  const pinSpring = spring({ frame: Math.max(0, frame - 15), fps, from: 0, to: 1, durationInFrames: 20 });
  const suezDraw = interpolate(frame, [20, 80], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const arcticDraw = interpolate(frame, [60, 120], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const badgeSpring = spring({ frame: Math.max(0, frame - 75), fps, from: 0, to: 1, durationInFrames: 25 });
  const card1Spring = spring({ frame: Math.max(0, frame - 120), fps, from: 0, to: 1, durationInFrames: 25, config: { damping: 14 } });
  const card2Spring = spring({ frame: Math.max(0, frame - 130), fps, from: 0, to: 1, durationInFrames: 25, config: { damping: 14 } });
  const card3Spring = spring({ frame: Math.max(0, frame - 140), fps, from: 0, to: 1, durationInFrames: 25, config: { damping: 14 } });
  const barAnim = interpolate(frame, [130, 170], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  const tempDrop = interpolate(frame, [70, 110], [20, -40], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Pin pulse
  const pinPulse = interpolate(Math.sin(frame * 0.15), [-1, 1], [0.8, 1.2]);

  // Suez route path (simplified)
  const suezPath = 'M 1450 520 Q 1400 580 1350 620 Q 1250 700 1100 720 Q 950 740 800 700 Q 700 660 650 600 Q 620 560 580 540 Q 540 520 500 500 Q 460 480 420 440 Q 390 410 370 380 Q 350 350 340 320 Q 330 290 350 270 Q 380 250 420 240 Q 460 230 500 220 Q 540 210 580 200 Q 620 190 660 180 Q 700 170 740 165 Q 780 160 820 160 Q 860 160 900 170 Q 940 180 960 200 Q 970 220 960 250 Q 940 280 900 300';
  const suezLength = 3200;

  // Arctic route path
  const arcticPath = 'M 1450 520 Q 1430 460 1400 400 Q 1370 350 1340 310 Q 1300 270 1250 240 Q 1200 210 1140 190 Q 1080 175 1020 165 Q 960 158 900 155 Q 840 153 780 155 Q 720 158 660 165 Q 600 175 550 190 Q 500 210 460 240 Q 430 270 410 300 Q 390 330 370 360 Q 350 390 340 420 Q 330 450 340 470 Q 360 490 400 500 Q 450 510 500 500 Q 550 490 600 470 Q 650 450 700 430 Q 750 410 800 400 Q 850 395 900 400 Q 940 410 960 430';
  const arcticLength = 3200;

  // Simplified continent paths
  const continents = (
    <g opacity={mapOpacity}>
      {/* North America */}
      <path d="M 200 200 Q 250 180 300 190 Q 350 200 380 230 Q 400 260 390 300 Q 380 340 350 370 Q 320 390 280 400 Q 240 405 210 390 Q 180 370 170 340 Q 160 300 170 260 Q 180 230 200 200Z" fill="#1a2d3a" stroke="#2a4050" strokeWidth="1" />
      {/* South America */}
      <path d="M 320 500 Q 340 480 360 490 Q 380 510 390 550 Q 395 600 385 650 Q 370 700 350 740 Q 330 770 310 780 Q 290 775 280 750 Q 270 720 275 680 Q 280 640 290 600 Q 300 560 310 530 Q 315 510 320 500Z" fill="#1a2d3a" stroke="#2a4050" strokeWidth="1" />
      {/* Europe */}
      <path d="M 450 180 Q 480 170 520 175 Q 560 180 590 200 Q 610 220 600 250 Q 585 275 560 290 Q 530 300 500 295 Q 470 285 455 265 Q 440 240 445 215 Q 448 195 450 180Z" fill="#1a2d3a" stroke="#2a4050" strokeWidth="1" />
      {/* Africa */}
      <path d="M 500 380 Q 530 360 570 365 Q 610 375 640 400 Q 660 430 665 470 Q 665 520 650 570 Q 630 620 600 660 Q 570 690 540 700 Q 510 695 490 670 Q 475 640 470 600 Q 468 550 475 500 Q 485 450 495 410 Q 498 390 500 380Z" fill="#1a2d3a" stroke="#2a4050" strokeWidth="1" />
      {/* Asia / Russia */}
      <path d="M 600 160 Q 680 140 780 135 Q 880 132 980 135 Q 1080 140 1180 150 Q 1280 165 1360 190 Q 1420 210 1460 240 Q 1490 270 1500 310 Q 1505 350 1490 390 Q 1470 430 1440 460 Q 1400 490 1350 510 Q 1300 525 1250 530 Q 1200 532 1150 525 Q 1100 515 1060 495 Q 1020 470 990 440 Q 960 410 940 380 Q 920 350 910 320 Q 900 290 895 260 Q 890 230 880 210 Q 860 190 830 180 Q 790 170 750 168 Q 710 167 670 170 Q 640 173 620 170 Q 605 167 600 160Z" fill="#1a2d3a" stroke="#2a4050" strokeWidth="1" />
      {/* Australia */}
      <path d="M 1250 650 Q 1290 640 1330 645 Q 1370 655 1390 680 Q 1400 710 1390 740 Q 1370 765 1340 775 Q 1300 780 1270 770 Q 1245 755 1235 730 Q 1230 700 1240 675 Q 1245 660 1250 650Z" fill="#1a2d3a" stroke="#2a4050" strokeWidth="1" />
    </g>
  );

  // Grid lines
  const gridLines = (
    <g opacity={mapOpacity * 0.15}>
      {Array.from({ length: 10 }, (_, i) => (
        <line key={`h${i}`} x1={100} y1={100 + i * 90} x2={1820} y2={100 + i * 90} stroke="#4cc9f0" strokeWidth="0.5" />
      ))}
      {Array.from({ length: 18 }, (_, i) => (
        <line key={`v${i}`} x1={100 + i * 100} y1={80} x2={100 + i * 100} y2={1000} stroke="#4cc9f0" strokeWidth="0.5" />
      ))}
    </g>
  );

  // Shanghai position
  const shanghaiX = 1450;
  const shanghaiY = 520;
  // Rotterdam position
  const rotterdamX = 480;
  const rotterdamY = 220;

  return (
    <AbsoluteFill style={{ backgroundColor: '#070e14', fontFamily: "'Inter', 'Helvetica Neue', sans-serif" }}>
      {/* Background gradient overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse at 50% 30%, rgba(76,201,240,0.04) 0%, transparent 60%)',
      }} />

      {/* Grid */}
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        {gridLines}
        {continents}

        {/* Suez Route */}
        <path
          d={suezPath}
          fill="none"
          stroke="#e5a93c"
          strokeWidth={3}
          strokeDasharray={suezLength}
          strokeDashoffset={suezLength * (1 - suezDraw)}
          strokeLinecap="round"
          opacity={interpolate(frame, [60, 90], [1, 0.4], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}
        />
        {/* Suez glow */}
        <path
          d={suezPath}
          fill="none"
          stroke="#e5a93c"
          strokeWidth={8}
          strokeDasharray={suezLength}
          strokeDashoffset={suezLength * (1 - suezDraw)}
          strokeLinecap="round"
          opacity={interpolate(frame, [60, 90], [0.15, 0.05], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}
        />

        {/* Arctic Route */}
        <path
          d={arcticPath}
          fill="none"
          stroke="#4cc9f0"
          strokeWidth={3.5}
          strokeDasharray={arcticLength}
          strokeDashoffset={arcticLength * (1 - arcticDraw)}
          strokeLinecap="round"
          opacity={arcticDraw > 0 ? 1 : 0}
        />
        {/* Arctic glow */}
        <path
          d={arcticPath}
          fill="none"
          stroke="#4cc9f0"
          strokeWidth={10}
          strokeDasharray={arcticLength}
          strokeDashoffset={arcticLength * (1 - arcticDraw)}
          strokeLinecap="round"
          opacity={arcticDraw > 0 ? 0.2 : 0}
        />

        {/* Shanghai Pin */}
        <g transform={`translate(${shanghaiX}, ${shanghaiY})`} opacity={pinSpring}>
          <circle r={8 * pinPulse} fill="#e63946" opacity={0.3} />
          <circle r={5} fill="#e63946" />
          <circle r={2} fill="#fff" />
          <text x={15} y={-10} fill="#fff" fontSize={14} fontWeight={700} letterSpacing={1}>SHANGHAI</text>
        </g>

        {/* Rotterdam Pin */}
        <g transform={`translate(${rotterdamX}, ${rotterdamY})`} opacity={pinSpring}>
          <circle r={8 * pinPulse} fill="#e63946" opacity={0.3} />
          <circle r={5} fill="#e63946" />
          <circle r={2} fill="#fff" />
          <text x={-110} y={-10} fill="#fff" fontSize={14} fontWeight={700} letterSpacing={1}>ROTTERDAM</text>
        </g>

        {/* Suez label */}
        <g opacity={interpolate(frame, [40, 55], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}>
          <rect x={750} y={700} width={180} height={28} rx={4} fill="rgba(229,169,60,0.15)" stroke="#e5a93c" strokeWidth={1} />
          <text x={840} y={719} fill="#e5a93c" fontSize={12} fontWeight={600} textAnchor="middle" letterSpacing={1.5}>SUEZ CANAL ROUTE</text>
        </g>

        {/* Arctic label */}
        <g opacity={interpolate(frame, [90, 105], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}>
          <rect x={850} y={120} width={220} height={28} rx={4} fill="rgba(76,201,240,0.15)" stroke="#4cc9f0" strokeWidth={1} />
          <text x={960} y={139} fill="#4cc9f0" fontSize={12} fontWeight={600} textAnchor="middle" letterSpacing={1.5}>NORTHERN SEA ROUTE</text>
        </g>

        {/* 40% Badge */}
        <g transform={`translate(960, 200)`} opacity={badgeSpring}>
          <g transform={`scale(${badgeSpring})`}>
            <rect x={-80} y={-30} width={160} height={60} rx={30} fill="rgba(76,201,240,0.12)" stroke="#4cc9f0" strokeWidth={2} />
            <text x={0} y={-5} fill="#4cc9f0" fontSize={22} fontWeight={800} textAnchor="middle" letterSpacing={1}>40%</text>
            <text x={0} y={16} fill="#fff" fontSize={11} fontWeight={600} textAnchor="middle" letterSpacing={2}>SHORTER</text>
          </g>
        </g>

        {/* Temperature indicator */}
        <g opacity={interpolate(frame, [70, 85], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}>
          <rect x={1620} y={300} width={140} height={80} rx={8} fill="rgba(7,14,20,0.8)" stroke="#4cc9f0" strokeWidth={1} />
          <text x={1690} y={330} fill="#4cc9f0" fontSize={11} fontWeight={600} textAnchor="middle" letterSpacing={1.5}>ARCTIC TEMP</text>
          <text x={1690} y={365} fill="#fff" fontSize={28} fontWeight={800} textAnchor="middle">{Math.round(tempDrop)}°C</text>
        </g>
      </svg>

      {/* Title */}
      <div style={{
        position: 'absolute',
        top: 70,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        opacity: titleSpring,
        transform: `translateY(${interpolate(titleSpring, [0, 1], [-20, 0])}px)`,
      }}>
        <div style={{
          fontSize: 36,
          fontWeight: 800,
          color: '#fff',
          letterSpacing: 4,
          textTransform: 'uppercase',
        }}>
          <span style={{ color: '#4cc9f0' }}>THE ARCTIC</span>{' '}
          <span style={{ color: '#e5a93c' }}>SHORTCUT</span>
        </div>
      </div>

      {/* Subtitle */}
      <div style={{
        position: 'absolute',
        top: 115,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        opacity: interpolate(frame, [10, 30], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
      }}>
        <div style={{
          fontSize: 14,
          fontWeight: 500,
          color: 'rgba(255,255,255,0.5)',
          letterSpacing: 3,
          textTransform: 'uppercase',
        }}>
          Shanghai → Rotterdam  •  Polar Silk Road vs Suez Canal
        </div>
      </div>

      {/* Metric Cards */}
      <div style={{
        position: 'absolute',
        bottom: 80,
        left: 80,
        right: 80,
        display: 'flex',
        justifyContent: 'center',
        gap: 40,
      }}>
        {/* Card 1: Days Saved */}
        <div style={{
          width: 340,
          height: 120,
          borderRadius: 12,
          background: 'rgba(15,28,36,0.9)',
          border: '1px solid rgba(76,201,240,0.3)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: card1Spring,
          transform: `translateY(${interpolate(card1Spring, [0, 1], [40, 0])}px) scale(${interpolate(card1Spring, [0, 1], [0.9, 1])})`,
        }}>
          <div style={{ fontSize: 12, color: '#4cc9f0', letterSpacing: 2, fontWeight: 600, marginBottom: 8 }}>TIME SAVED</div>
          <div style={{ fontSize: 42, fontWeight: 800, color: '#fff' }}>14 <span style={{ fontSize: 20, color: 'rgba(255,255,255,0.6)' }}>DAYS</span></div>
        </div>

        {/* Card 2: Nautical Miles */}
        <div style={{
          width: 340,
          height: 120,
          borderRadius: 12,
          background: 'rgba(15,28,36,0.9)',
          border: '1px solid rgba(229,169,60,0.3)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: card2Spring,
          transform: `translateY(${interpolate(card2Spring, [0, 1], [40, 0])}px) scale(${interpolate(card2Spring, [0, 1], [0.9, 1])})`,
        }}>
          <div style={{ fontSize: 12, color: '#e5a93c', letterSpacing: 2, fontWeight: 600, marginBottom: 8 }}>DISTANCE SAVED</div>
          <div style={{ fontSize: 42, fontWeight: 800, color: '#fff' }}>3,000 <span style={{ fontSize: 20, color: 'rgba(255,255,255,0.6)' }}>NM</span></div>
        </div>

        {/* Card 3: Comparison Bar */}
        <div style={{
          width: 340,
          height: 120,
          borderRadius: 12,
          background: 'rgba(15,28,36,0.9)',
          border: '1px solid rgba(76,201,240,0.2)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '12px 20px',
          opacity: card3Spring,
          transform: `translateY(${interpolate(card3Spring, [0, 1], [40, 0])}px) scale(${interpolate(card3Spring, [0, 1], [0.9, 1])})`,
        }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', letterSpacing: 1.5, fontWeight: 600, marginBottom: 10, alignSelf: 'flex-start' }}>ROUTE COMPARISON</div>
          {/* Suez bar */}
          <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <div style={{ width: 40, fontSize: 9, color: '#e5a93c', fontWeight: 600, letterSpacing: 1 }}>SUEZ</div>
            <div style={{ flex: 1, height: 10, borderRadius: 5, background: 'rgba(229,169,60,0.15)', overflow: 'hidden' }}>
              <div style={{ width: `${barAnim * 100}%`, height: '100%', borderRadius: 5, background: '#e5a93c' }} />
            </div>
          </div>
          {/* Arctic bar */}
          <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 40, fontSize: 9, color: '#4cc9f0', fontWeight: 600, letterSpacing: 1 }}>ARCTIC</div>
            <div style={{ flex: 1, height: 10, borderRadius: 5, background: 'rgba(76,201,240,0.15)', overflow: 'hidden' }}>
              <div style={{ width: `${barAnim * 60}%`, height: '100%', borderRadius: 5, background: '#4cc9f0' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom source line */}
      <div style={{
        position: 'absolute',
        bottom: 65,
        left: 80,
        right: 80,
        display: 'flex',
        justifyContent: 'center',
        opacity: interpolate(frame, [150, 170], [0, 0.4], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
      }}>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: 2, textTransform: 'uppercase' }}>
          Source: Arctic Institute  •  Northern Sea Route Administration
        </div>
      </div>
    </AbsoluteFill>
  );
}