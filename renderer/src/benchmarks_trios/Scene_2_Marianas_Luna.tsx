import { AbsoluteFill, useCurrentFrame, interpolate, spring, Easing } from 'remotion';

const clamp = { extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const };
const ink = '#070e14';
const panel = '#0f1c24';
const amber = '#e5a93c';
const pale = '#e8edf0';
const muted = '#8ea0aa';

export default function MotionScene({ scene, context }: { scene: any; context: any }) {
  const frame = useCurrentFrame();
  const fps = scene.fps || 30;
  const descent = spring({ frame: frame - 8, fps, config: { damping: 22, stiffness: 52, mass: 1.2 } });
  const podY = interpolate(descent, [0, 1], [268, 765], clamp);
  const depthValue = Math.round(interpolate(frame, [14, 108], [0, 10994], { ...clamp, easing: Easing.out(Easing.cubic) }));
  const pressureValue = Math.round(interpolate(frame, [54, 137], [0, 1086], { ...clamp, easing: Easing.out(Easing.cubic) }));
  const lightOpacity = interpolate(frame, [0, 16, 46, 67], [0.72, 0.6, 0.13, 0], clamp);
  const thresholdOpacity = interpolate(frame, [0, 18, 32], [0.25, 1, 1], clamp);
  const pressureIn = spring({ frame: frame - 42, fps, config: { damping: 20, stiffness: 70 } });
  const comparisonIn = spring({ frame: frame - 112, fps, config: { damping: 18, stiffness: 65 } });
  const needleAngle = interpolate(pressureValue, [0, 1086], [-128, 128], clamp);
  const titleIn = spring({ frame, fps, config: { damping: 20, stiffness: 90 } });
  const depthText = depthValue.toLocaleString('en-US');
  const pressureText = pressureValue.toLocaleString('en-US');
  const tickAngles = Array.from({ length: 25 }, (_, i) => -135 + i * 11.25);
  const jetGroups = Array.from({ length: 10 }, (_, i) => i);

  return (
    <AbsoluteFill style={{ background: 'linear-gradient(180deg, #0b1821 0%, #071018 45%, #050a0e 100%)', color: pale, fontFamily: 'Arial, Helvetica, sans-serif', overflow: 'hidden' }}>
      <AbsoluteFill style={{ opacity: 0.16, backgroundImage: 'linear-gradient(rgba(120,150,165,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(120,150,165,0.08) 1px, transparent 1px)', backgroundSize: '80px 80px', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', left: 110, top: 68, width: 1700, height: 1, background: 'rgba(180,200,210,0.22)' }} />
      <div style={{ position: 'absolute', left: 110, top: 42, color: amber, fontSize: 17, fontWeight: 700, letterSpacing: 4 }}>OCEAN / EXTREME ENVIRONMENTS</div>
      <div style={{ position: 'absolute', left: 108, top: 88, fontSize: 43, fontWeight: 700, letterSpacing: 1, opacity: titleIn, transform: `translateY(${(1 - titleIn) * 12}px)` }}>THE 1,000-ATMOSPHERE ABYSS</div>
      <div style={{ position: 'absolute', right: 110, top: 101, color: muted, fontSize: 16, letterSpacing: 2 }}>MARIANA TRENCH  /  11°22′ N, 142°36′ E</div>

      <div style={{ position: 'absolute', left: 108, top: 183, color: muted, fontSize: 15, letterSpacing: 3, fontWeight: 700 }}>DESCENT PROFILE</div>
      <div style={{ position: 'absolute', left: 178, top: 232, width: 390, height: 638, border: '1px solid rgba(153,185,199,0.24)', background: 'linear-gradient(180deg, rgba(32,75,95,0.42) 0%, rgba(12,30,41,0.76) 22%, rgba(5,11,16,0.92) 100%)' }} />
      <div style={{ position: 'absolute', left: 179, top: 233, width: 388, height: 56, background: `rgba(111,190,221,${lightOpacity * 0.25})` }} />
      <div style={{ position: 'absolute', left: 192, top: 246, color: '#d5e9ef', fontSize: 13, letterSpacing: 2, opacity: lightOpacity }}>SUNLIT SURFACE</div>
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} style={{ position: 'absolute', left: 265 + i * 58, top: 232, width: 2, height: 58, background: `rgba(170,220,238,${lightOpacity * (0.55 - i * 0.06)})`, transform: `skewX(${i % 2 ? -9 : 8}deg)` }} />
      ))}
      <div style={{ position: 'absolute', left: 179, top: 286, width: 388, height: 2, background: `rgba(229,169,60,${thresholdOpacity})` }} />
      <div style={{ position: 'absolute', left: 586, top: 273, color: amber, fontSize: 15, fontWeight: 700, letterSpacing: 1, opacity: thresholdOpacity }}>1,000 m — SUNLIGHT ENDS</div>
      <div style={{ position: 'absolute', left: 213, top: 232, height: 638, width: 1, background: 'rgba(180,200,210,0.55)' }} />
      {[0, 1000, 3000, 5000, 7000, 9000, 10994].map((m, i) => {
        const y = 232 + (m / 10994) * 638;
        return <div key={m} style={{ position: 'absolute', left: 202, top: y, width: i === 0 || i === 6 ? 22 : 13, height: 1, background: i === 1 ? amber : 'rgba(190,210,220,0.65)' }} />;
      })}
      <div style={{ position: 'absolute', left: 110, top: 224, color: muted, fontSize: 14 }}>0 m</div>
      <div style={{ position: 'absolute', left: 110, top: 858, color: muted, fontSize: 14 }}>11,000 m</div>
      <div style={{ position: 'absolute', left: 584, top: 236, color: muted, fontSize: 13, letterSpacing: 1 }}>0 m</div>
      <div style={{ position: 'absolute', left: 584, top: 849, color: muted, fontSize: 13, letterSpacing: 1 }}>HADAL ZONE</div>

      <div style={{ position: 'absolute', left: 381, top: podY, width: 112, height: 44, transform: 'translate(-50%, -50%)' }}>
        <svg width='112' height='44' viewBox='0 0 112 44' aria-label='Submersible descending'>
          <path d='M10 24 L22 16 L77 16 L92 22 L102 22 L102 29 L92 29 L80 35 L25 35 L11 29 Z' fill='#d9e2e5' />
          <path d='M34 16 L42 7 L67 7 L75 16 Z' fill='#9cabb1' />
          <circle cx='47' cy='21' r='5' fill='#172832' /><circle cx='64' cy='21' r='5' fill='#172832' />
          <path d='M8 20 L2 16 M8 31 L2 35 M104 22 L110 19 M104 29 L110 32' stroke='#e5a93c' strokeWidth='2' />
        </svg>
      </div>
      <div style={{ position: 'absolute', left: 586, top: 484, color: muted, fontSize: 14, letterSpacing: 2, opacity: interpolate(frame, [42, 64], [0, 1], clamp) }}>DESCENT VEHICLE</div>

      <div style={{ position: 'absolute', left: 680, top: 310, width: 390, height: 330, borderLeft: '1px solid rgba(160,185,196,0.2)', paddingLeft: 34 }}>
        <div style={{ color: muted, fontSize: 15, letterSpacing: 3, fontWeight: 700 }}>CHALLENGER DEEP</div>
        <div style={{ marginTop: 20, fontSize: 79, lineHeight: 1, fontWeight: 700, letterSpacing: -3, fontVariantNumeric: 'tabular-nums' }}>{depthText}<span style={{ color: amber, fontSize: 34, letterSpacing: 0, marginLeft: 10 }}>m</span></div>
        <div style={{ marginTop: 18, color: '#c1cbd0', fontSize: 20, lineHeight: 1.45 }}>Maximum recorded depth<br />beneath the ocean surface</div>
        <div style={{ marginTop: 32, width: 280, height: 1, background: 'rgba(180,200,210,0.25)' }} />
        <div style={{ marginTop: 19, color: '#9cb0ba', fontSize: 15, letterSpacing: 1.5 }}>SUNLIGHT: 0 BELOW 1,000 m</div>
      </div>

      <div style={{ position: 'absolute', left: 1110, top: 184, width: 700, height: 480, border: '1px solid rgba(177,199,208,0.23)', background: 'rgba(15,28,36,0.76)', opacity: pressureIn, transform: `translateY(${(1 - pressureIn) * 16}px)` }} />
      <div style={{ position: 'absolute', left: 1150, top: 211, color: muted, fontSize: 15, letterSpacing: 3, fontWeight: 700, opacity: pressureIn }}>PRESSURE AT THE FLOOR</div>
      <div style={{ position: 'absolute', left: 1170, top: 265, width: 350, height: 350, opacity: pressureIn }}>
        <svg width='350' height='350' viewBox='0 0 350 350' aria-label='Pressure gauge'>
          <circle cx='175' cy='175' r='138' fill='none' stroke='rgba(180,200,210,0.16)' strokeWidth='1' />
          <circle cx='175' cy='175' r='119' fill='none' stroke='rgba(180,200,210,0.2)' strokeWidth='1' />
          {tickAngles.map((a, i) => {
            const r1 = i % 4 === 0 ? 122 : 129;
            const rad = (a * Math.PI) / 180;
            const x1 = 175 + Math.cos(rad) * r1;
            const y1 = 175 + Math.sin(rad) * r1;
            const x2 = 175 + Math.cos(rad) * 137;
            const y2 = 175 + Math.sin(rad) * 137;
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={i > 18 ? amber : 'rgba(213,226,231,0.7)'} strokeWidth={i % 4 === 0 ? 2 : 1} />;
          })}
          <g transform={`rotate(${needleAngle} 175 175)`}>
            <path d='M171 181 L175 72 L179 181 Z' fill={amber} />
          </g>
          <circle cx='175' cy='175' r='9' fill='#e8edf0' />
          <text x='175' y='237' fill='#8ea0aa' fontSize='13' textAnchor='middle' letterSpacing='2'>ATM</text>
        </svg>
      </div>
      <div style={{ position: 'absolute', left: 1513, top: 321, width: 250, opacity: pressureIn }}>
        <div style={{ fontSize: 89, lineHeight: 0.95, fontWeight: 700, fontVariantNumeric: 'tabular-nums', letterSpacing: -4 }}>{pressureText}</div>
        <div style={{ marginTop: 13, color: amber, fontSize: 22, fontWeight: 700, letterSpacing: 2 }}>ATMOSPHERES</div>
        <div style={{ marginTop: 26, color: '#afbdc4', fontSize: 17, lineHeight: 1.45 }}>Nearly 1,100 times<br />surface pressure</div>
        <div style={{ marginTop: 20, color: muted, fontSize: 13, letterSpacing: 1 }}>1 atm ≈ 101.3 kPa</div>
      </div>

      <div style={{ position: 'absolute', left: 680, top: 711, width: 1130, height: 186, borderTop: '1px solid rgba(180,200,210,0.28)', opacity: comparisonIn, transform: `translateY(${(1 - comparisonIn) * 18}px)` }}>
        <div style={{ position: 'absolute', left: 0, top: 24, color: muted, fontSize: 14, letterSpacing: 3, fontWeight: 700 }}>THE CRUSHING EQUIVALENT</div>
        <div style={{ position: 'absolute', left: 0, top: 54, fontSize: 43, fontWeight: 700, letterSpacing: -1 }}><span style={{ color: amber }}>50</span> JUMBO JETS</div>
        <div style={{ position: 'absolute', left: 3, top: 111, color: '#bdc9ce', fontSize: 18, letterSpacing: 1 }}>/ cm²  —  stacked above you</div>
        <div style={{ position: 'absolute', left: 475, top: 44, display: 'flex', flexWrap: 'wrap', width: 590, gap: '11px 14px' }}>
          {jetGroups.map((i) => (
            <div key={i} style={{ width: 100, height: 40, display: 'flex', alignItems: 'center', gap: 7, border: '1px solid rgba(229,169,60,0.28)', background: 'rgba(229,169,60,0.045)', padding: '0 8px', boxSizing: 'border-box' }}>
              <svg width='54' height='24' viewBox='0 0 54 24' aria-hidden='true'>
                <path d='M4 12 L22 10 L30 3 L34 3 L32 10 L45 11 L51 9 L53 11 L51 13 L45 12 L32 14 L34 21 L30 21 L22 14 L4 13 L1 12 Z' fill='#d7e0e4' />
              </svg>
              <span style={{ color: amber, fontSize: 13, fontWeight: 700, letterSpacing: 1 }}>×5</span>
            </div>
          ))}
        </div>
        <div style={{ position: 'absolute', right: 0, top: 56, color: '#8799a2', fontSize: 13, letterSpacing: 2, textAlign: 'right' }}>EACH ICON = 5 AIRCRAFT</div>
      </div>
      <div style={{ position: 'absolute', left: 110, bottom: 35, color: 'rgba(152,171,181,0.62)', fontSize: 12, letterSpacing: 2 }}>HADAL DEPTH  /  EXTREME PRESSURE  /  DOCUMENTARY FIELD NOTE</div>
      <div style={{ position: 'absolute', right: 110, bottom: 35, color: 'rgba(152,171,181,0.62)', fontSize: 12, letterSpacing: 2 }}>10,994 m  •  1,086 atm</div>
    </AbsoluteFill>
  );
}