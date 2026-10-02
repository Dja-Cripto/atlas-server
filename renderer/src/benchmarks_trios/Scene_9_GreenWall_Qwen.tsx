import { AbsoluteFill, useCurrentFrame, interpolate, spring, Easing } from 'remotion';

export default function MotionScene({scene, context}: {scene: any; context: any}) {
  const frame = useCurrentFrame();
  const { fps } = scene;

  const titleOp = interpolate(frame, [10, 25], [0, 1], { extrapolateRight: 'clamp' });
  const titleY = spring({ frame: frame - 10, fps, config: { damping: 12, mass: 0.8 } });
  const subOp = interpolate(frame, [25, 40], [0, 1], { extrapolateRight: 'clamp' });

  const wallLength = 2500;
  const wallDraw = interpolate(frame, [40, 90], [wallLength, 0], { extrapolateRight: 'clamp' });

  const desertAdvanceY = interpolate(frame, [90, 120], [0, 35], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic)
  });

  const impactOp = interpolate(frame, [120, 125, 140], [0, 0.6, 0], { extrapolateRight: 'clamp' });

  const cards = [
    { val: '8,000', unit: 'KM', label: 'WALL LENGTH' },
    { val: '15', unit: 'KM', label: 'WALL WIDTH' },
    { val: '11', unit: 'NATIONS', label: 'PARTICIPATING' },
    { val: '1.5', unit: 'KM/YR', label: 'DESERT ADVANCE' },
  ];

  const pathD = 'M 80 450 L 250 420 L 400 440 L 600 380 L 800 390 L 1000 350 L 1200 370 L 1400 340 L 1600 380 L 1840 360';
  const desertPathD = `M 80 60 L 1840 60 L 1840 ${360 + desertAdvanceY} L 1600 ${380 + desertAdvanceY} L 1400 ${340 + desertAdvanceY} L 1200 ${370 + desertAdvanceY} L 1000 ${350 + desertAdvanceY} L 800 ${390 + desertAdvanceY} L 600 ${380 + desertAdvanceY} L 400 ${440 + desertAdvanceY} L 250 ${420 + desertAdvanceY} L 80 ${450 + desertAdvanceY} Z`;
  const fertilePathD = `M 80 ${450} L 250 ${420} L 400 ${440} L 600 ${380} L 800 ${390} L 1000 ${350} L 1200 ${370} L 1400 ${340} L 1600 ${380} L 1840 ${360} L 1840 1020 L 80 1020 Z`;

  return (
    <AbsoluteFill style={{ backgroundColor: '#070e14', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <svg width='1920' height='1080' style={{ position: 'absolute', top: 0, left: 0, opacity: 0.05 }}>
        <pattern id='grid' width='40' height='40' patternUnits='userSpaceOnUse'>
          <path d='M 40 0 L 0 0 0 40' fill='none' stroke='#ffffff' strokeWidth='1' />
        </pattern>
        <rect width='100%' height='100%' fill='url(#grid)' />
      </svg>

      <svg width='1920' height='1080' style={{ position: 'absolute', top: 0, left: 0 }}>
        <path d={fertilePathD} fill='#0f1c24' opacity={0.8} />
        <path d={desertPathD} fill='#e63946' opacity={0.12} />
        <path d={desertPathD} fill='none' stroke='#e63946' strokeWidth='2' opacity={0.4} />

        <path d={pathD} fill='none' stroke='#e5a93c' strokeWidth='16' opacity={0.1} strokeDasharray={wallLength} strokeDashoffset={wallDraw} />
        <path d={pathD} fill='none' stroke='#e5a93c' strokeWidth='8' opacity={0.3} strokeDasharray={wallLength} strokeDashoffset={wallDraw} />
        <path d={pathD} fill='none' stroke='#e5a93c' strokeWidth='3' opacity={1} strokeDasharray={wallLength} strokeDashoffset={wallDraw} />

        <path d={pathD} fill='none' stroke='#ffffff' strokeWidth='12' opacity={impactOp} strokeDasharray={wallLength} strokeDashoffset={0} />
      </svg>

      <div style={{
        position: 'absolute',
        left: 120,
        top: 100,
        opacity: titleOp,
        transform: `translateY(${titleY}px)`
      }}>
        <div style={{ fontSize: 64, fontWeight: 800, color: '#ffffff', letterSpacing: '-1px', lineHeight: 1.1 }}>
          THE 8,000-KILOMETER<br />
          <span style={{ color: '#e5a93c' }}>LIVING BARRIER</span>
        </div>
        <div style={{ fontSize: 24, fontWeight: 400, color: '#8a9ba8', marginTop: 16, opacity: subOp }}>
          Africa's Massive Wall of Trees Against the Sahara
        </div>
      </div>

      {cards.map((card, i) => {
        const delay = 80 + i * 12;
        const cOp = interpolate(frame, [delay, delay + 15], [0, 1], { extrapolateRight: 'clamp' });
        const cY = spring({ frame: frame - delay, fps, config: { damping: 14, mass: 0.8 } });
        return (
          <div key={i} style={{
            position: 'absolute',
            left: 120 + i * 410,
            top: 740,
            width: 370,
            height: 160,
            backgroundColor: 'rgba(15, 28, 36, 0.9)',
            border: '1px solid rgba(229, 169, 60, 0.2)',
            borderRadius: 12,
            padding: 24,
            opacity: cOp,
            transform: `translateY(${cY}px)`
          }}>
            <div style={{ fontSize: 48, fontWeight: 700, color: '#e5a93c', fontFamily: 'monospace' }}>
              {card.val}<span style={{ fontSize: 24, marginLeft: 8, color: '#8a9ba8' }}>{card.unit}</span>
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#ffffff', marginTop: 12, letterSpacing: '2px' }}>
              {card.label}
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
}