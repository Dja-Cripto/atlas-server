import { AbsoluteFill, useCurrentFrame, interpolate, spring, Easing } from 'remotion';

type Point = { x: number; y: number };

const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max);

const routePoint = (progress: number, points: Point[]) => {
  const p = clamp(progress, 0, 1);
  const total = points.length - 1;
  const scaled = p * total;
  const index = Math.min(Math.floor(scaled), total - 1);
  const local = scaled - index;
  const a = points[index];
  const b = points[index + 1];
  return { x: a.x + (b.x - a.x) * local, y: a.y + (b.y - a.y) * local };
};

export default function MotionScene({ scene, context }: { scene: any; context: any }) {
  void context;
  const frame = useCurrentFrame();
  const duration = scene?.durationInFrames ?? 180;
  const fps = scene?.fps ?? 30;

  const intro = spring({ frame, fps, config: { damping: 18, stiffness: 90 } });
  const titleOpacity = interpolate(frame, [0, 18, 150, 180], [0, 1, 1, 0.95], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const mapOpacity = interpolate(frame, [10, 40], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const iceRetreat = interpolate(frame, [30, 95], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic) });
  const polarDraw = interpolate(frame, [45, 125], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic) });
  const suezDraw = interpolate(frame, [15, 70], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const shipProgress = interpolate(frame, [55, 155], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic) });
  const ship = routePoint(shipProgress, [
    { x: 940, y: 540 },
    { x: 820, y: 330 },
    { x: 700, y: 220 },
    { x: 560, y: 190 },
    { x: 430, y: 230 },
    { x: 280, y: 360 },
  ]);

  const metrics = [
    { value: '40%', label: 'SHORTER DISTANCE', sub: 'vs Suez Canal Route', color: '#e5a93c' },
    { value: '14', label: 'DAYS SAVED', sub: 'Shanghai to Rotterdam', color: '#4cc9f0' },
    { value: '3,000', label: 'NAUTICAL MILES SAVED', sub: 'Polar Silk Road advantage', color: '#e5a93c' },
    { value: '-40°C', label: 'POLAR TEMPERATURE', sub: 'Arctic operating condition', color: '#4cc9f0' },
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: '#070e14', color: '#e8f4f8', fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif', overflow: 'hidden' }}>
      <AbsoluteFill style={{
        opacity: 0.25,
        backgroundImage: 'linear-gradient(rgba(76,201,240,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(76,201,240,0.08) 1px, transparent 1px)',
        backgroundSize: '80px 80px',
        transform: `translateY(${interpolate(frame, [0, duration], [0, -20])}px)`,
      }} />
      <div style={{ position: 'absolute', left: 120, top: 68, width: 1000 }}>
        <div style={{ fontSize: 72, lineHeight: 0.95, fontWeight: 800, letterSpacing: -2, color: '#e5a93c', opacity: titleOpacity, transform: `translateY(${(1 - intro) * 30}px)` }}>
          THE ARCTIC SHORTCUT
        </div>
        <div style={{ marginTop: 18, fontSize: 28, letterSpacing: 4, color: '#8fb7c8', opacity: titleOpacity, transform: `translateY(${(1 - intro) * 20}px)` }}>
          POLAR SILK ROAD VS. SUEZ CANAL ROUTE
        </div>
      </div>

      <div style={{ position: 'absolute', left: 110, top: 190, width: 1160, height: 780, opacity: mapOpacity, transform: `translateY(${(1 - intro) * 24}px)` }}>
        <svg viewBox='0 0 1200 800' width='1160' height='780' style={{ display: 'block' }}>
          <defs>
            <linearGradient id='suezGrad' x1='0%' y1='0%' x2='100%' y2='0%'>
              <stop offset='0%' stopColor='#e63946' stopOpacity='0.1' />
              <stop offset='50%' stopColor='#e63946' stopOpacity='0.9' />
              <stop offset='100%' stopColor='#e5a93c' stopOpacity='0.8' />
            </linearGradient>
            <linearGradient id='polarGrad' x1='0%' y1='0%' x2='100%' y2='0%'>
              <stop offset='0%' stopColor='#4cc9f0' stopOpacity='0.1' />
              <stop offset='50%' stopColor='#4cc9f0' stopOpacity='1' />
              <stop offset='100%' stopColor='#e5a93c' stopOpacity='0.9' />
            </linearGradient>
          </defs>
          <rect x='0' y='0' width='1200' height='800' rx='28' fill='#0b151c' stroke='rgba(76,201,240,0.18)' strokeWidth='2' />
          {Array.from({ length: 9 }).map((_, i) => (
            <line key={`v${i}`} x1={i * 150} y1='40' x2={i * 150} y2='760' stroke='rgba(76,201,240,0.08)' strokeWidth='1' />
          ))}
          {Array.from({ length: 6 }).map((_, i) => (
            <line key={`h${i}`} x1='40' y1={i * 152} x2='1160' y2={i * 152} stroke='rgba(76,201,240,0.08)' strokeWidth='1' />
          ))}
          <path d='M 160 420 C 240 330, 330 280, 430 270 C 520 260, 600 300, 700 280 C 800 260, 900 300, 1020 360 C 1080 390, 1120 430, 1140 490 C 1100 540, 1040 560, 960 550 C 900 540, 860 500, 790 500 C 720 500, 680 540, 600 560 C 520 580, 460 550, 380 560 C 300 570, 220 540, 160 500 Z' fill='#12232d' stroke='rgba(229,169,60,0.25)' strokeWidth='2' />
          <path d='M 420 560 C 500 560, 560 600, 600 660 C 620 700, 580 740, 520 750 C 450 760, 400 720, 390 660 C 380 620, 390 580, 420 560 Z' fill='#0f1c24' stroke='rgba(76,201,240,0.15)' strokeWidth='2' />
          <path d='M 180 300 C 260 220, 380 180, 500 190 C 620 200, 760 160, 880 190 C 1000 220, 1080 280, 1120 340 C 1040 310, 960 300, 880 310 C 800 320, 720 360, 620 350 C 520 340, 420 300, 320 320 C 260 330, 220 340, 180 300 Z' fill='#0f1c24' stroke='rgba(76,201,240,0.12)' strokeWidth='2' />
          <path d='M 940 540 C 920 660, 840 740, 720 720 C 620 700, 560 660, 540 610 C 520 560, 500 500, 460 450 C 420 400, 360 380, 280 360' fill='none' stroke='url(#suezGrad)' strokeWidth='10' strokeLinecap='round' strokeDasharray='1000' strokeDashoffset={(1 - suezDraw) * 1000} pathLength={1000} opacity={0.75} />
          <path d='M 940 540 C 920 660, 840 740, 720 720 C 620 700, 560 660, 540 610 C 520 560, 500 500, 460 450 C 420 400, 360 380, 280 360' fill='none' stroke='#e63946' strokeWidth='2' strokeLinecap='round' strokeDasharray='8 16' opacity={0.6 * suezDraw} />
          <path d='M 940 540 C 900 430, 820 300, 700 220 C 600 150, 480 170, 380 250 C 330 290, 300 330, 280 360' fill='none' stroke='url(#polarGrad)' strokeWidth='12' strokeLinecap='round' strokeDasharray='1000' strokeDashoffset={(1 - polarDraw) * 1000} pathLength={1000} />
          <path d='M 940 540 C 900 430, 820 300, 700 220 C 600 150, 480 170, 380 250 C 330 290, 300 330, 280 360' fill='none' stroke='#4cc9f0' strokeWidth='3' strokeLinecap='round' strokeDasharray='10 18' opacity={0.9 * polarDraw} />
          <g style={{ transformOrigin: '620px 220px', transform: `scale(${1 - iceRetreat * 0.28})`, opacity: 0.88 - iceRetreat * 0.78 }}>
            <ellipse cx='620' cy='220' rx='360' ry='140' fill='#dbeafe' />
            <ellipse cx='620' cy='220' rx='360' ry='140' fill='none' stroke='rgba(255,255,255,0.8)' strokeWidth='3' />
            <path d='M 360 210 L 430 190 L 500 230 L 560 180 L 640 230 L 710 190 L 780 240 L 860 210' fill='none' stroke='rgba(15,28,36,0.35)' strokeWidth='3' strokeLinecap='round' />
            <path d='M 440 280 L 520 250 L 600 290 L 680 240 L 760 280' fill='none' stroke='rgba(15,28,36,0.25)' strokeWidth='3' strokeLinecap='round' />
          </g>
          <g opacity={interpolate(frame, [20, 45], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}>
            <circle cx='940' cy='540' r='14' fill='#e5a93c' />
            <circle cx='940' cy='540' r='26' fill='none' stroke='#e5a93c' strokeWidth='2' opacity='0.6' />
            <text x='960' y='535' fill='#e8f4f8' fontSize='24' fontWeight='700'>SHANGHAI</text>
            <text x='960' y='565' fill='#8fb7c8' fontSize='18'>CHINA</text>
          </g>
          <g opacity={interpolate(frame, [28, 55], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}>
            <circle cx='280' cy='360' r='14' fill='#e5a93c' />
            <circle cx='280' cy='360' r='26' fill='none' stroke='#e5a93c' strokeWidth='2' opacity='0.6' />
            <text x='300' y='355' fill='#e8f4f8' fontSize='24' fontWeight='700'>ROTTERDAM</text>
            <text x='300' y='385' fill='#8fb7c8' fontSize='18'>NETHERLANDS</text>
          </g>
          <g opacity={interpolate(frame, [70, 100], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}>
            <rect x='700' y='120' width='250' height='46' rx='23' fill='rgba(7,14,20,0.85)' stroke='rgba(76,201,240,0.55)' />
            <text x='825' y='150' textAnchor='middle' fill='#4cc9f0' fontSize='22' fontWeight='700' letterSpacing='2'>POLAR SILK ROAD</text>
          </g>
          <g opacity={interpolate(frame, [80, 110], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}>
            <rect x='470' y='640' width='230' height='46' rx='23' fill='rgba(7,14,20,0.85)' stroke='rgba(230,57,70,0.55)' />
            <text x='585' y='670' textAnchor='middle' fill='#e63946' fontSize='22' fontWeight='700' letterSpacing='2'>SUEZ CANAL ROUTE</text>
          </g>
          <g opacity={interpolate(frame, [50, 70, 155, 175], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}>
            <circle cx={ship.x} cy={ship.y} r='18' fill='#e5a93c' />
            <circle cx={ship.x} cy={ship.y} r='30' fill='none' stroke='#e5a93c' strokeWidth='2' opacity='0.4' />
            <path d={`M ${ship.x - 12} ${ship.y + 4} L ${ship.x + 12} ${ship.y + 4} L ${ship.x + 7} ${ship.y - 8} L ${ship.x - 7} ${ship.y - 8} Z`} fill='#070e14' />
          </g>
          <g opacity={interpolate(frame, [105, 135], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}>
            <path d='M 580 430 L 580 490' stroke='#e5a93c' strokeWidth='2' strokeDasharray='4 6' />
            <rect x='480' y='395' width='200' height='42' rx='21' fill='rgba(229,169,60,0.12)' stroke='rgba(229,169,60,0.55)' />
            <text x='580' y='423' textAnchor='middle' fill='#e5a93c' fontSize='22' fontWeight='800'>-3,000 NM</text>
          </g>
        </svg>
      </div>

      <div style={{ position: 'absolute', left: 1320, top: 150, width: 500 }}>
        <div style={{ opacity: interpolate(frame, [0, 25], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }), transform: `translateX(${(1 - intro) * 40}px)` }}>
          <div style={{ fontSize: 20, letterSpacing: 4, color: '#8fb7c8', fontWeight: 600 }}>ROUTE COMPARISON</div>
          <div style={{ marginTop: 12, fontSize: 34, fontWeight: 800, color: '#e8f4f8', lineHeight: 1.1 }}>SHANGHAI → ROTTERDAM</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginTop: 42 }}>
          {metrics.map((m, i) => {
            const start = 95 + i * 14;
            const s = spring({ frame: Math.max(0, frame - start), fps, config: { damping: 16, stiffness: 110 } });
            const opacity = interpolate(frame, [start, start + 18], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
            return (
              <div key={m.label} style={{
                width: 500,
                minHeight: 128,
                boxSizing: 'border-box',
                padding: '22px 26px',
                borderRadius: 18,
                background: 'rgba(15,28,36,0.88)',
                border: `1px solid ${m.color}55`,
                boxShadow: `0 0 30px ${m.color}18`,
                opacity,
                transform: `translateY(${(1 - s) * 36}px) scale(${0.96 + s * 0.04})`,
              }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
                  <div style={{ fontSize: 62, lineHeight: 1, fontWeight: 900, color: m.color, letterSpacing: -2 }}>{m.value}</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#e8f4f8', letterSpacing: 1 }}>{m.label}</div>
                </div>
                <div style={{ marginTop: 10, fontSize: 18, color: '#8fb7c8' }}>{m.sub}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{
        position: 'absolute',
        left: 120,
        bottom: 60,
        width: 1680,
        height: 64,
        borderRadius: 32,
        background: 'rgba(7,14,20,0.9)',
        border: '1px solid rgba(229,169,60,0.28)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 28px',
        boxSizing: 'border-box',
        opacity: interpolate(frame, [120, 150], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
        transform: `translateY(${interpolate(frame, [120, 150], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}px)`,
      }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#e5a93c', letterSpacing: 2 }}>AS ARCTIC SEA ICE RETREATS</div>
        <div style={{ width: 2, height: 28, background: 'rgba(76,201,240,0.45)', margin: '0 24px' }} />
        <div style={{ fontSize: 22, color: '#e8f4f8', fontWeight: 600 }}>The Northern Sea Route cuts the maritime journey by 40% — saving 14 days and 3,000 nautical miles.</div>
      </div>
    </AbsoluteFill>
  );
}