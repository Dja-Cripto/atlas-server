import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate, spring, Easing, useVideoConfig} from 'remotion';

const GOLD = '#e5a93c';
const LIME = '#8fc14a';
const RED = '#e63946';

const WALL_PTS: [number, number][] = [
  [95, 470], [170, 455], [250, 445], [330, 440], [410, 445],
  [490, 455], [570, 470], [650, 492], [730, 516], [800, 545],
  [865, 578], [920, 616], [962, 660],
];

const wallPath = WALL_PTS.map((p, i) => (i === 0 ? `M ${p[0]} ${p[1]}` : `L ${p[0]} ${p[1]}`)).join(' ');

const NationPip: React.FC<{x: number; y: number; delay: number}> = ({x, y, delay}) => {
  const frame = useCurrentFrame();
  const s = spring({frame: frame - delay, fps: 30, config: {damping: 10, mass: 0.5}});
  const pulse = 1 + 0.12 * Math.sin((frame - delay) * 0.12);
  const op = interpolate(s, [0, 1], [0, 1]);
  return (
    <div style={{position: 'absolute', left: x - 16, top: y - 16, opacity: op, transform: `scale(${s * pulse})`}}>
      <div style={{width: 32, height: 32, borderRadius: 16, border: `2px solid ${GOLD}`, background: 'rgba(229,169,60,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{width: 8, height: 8, borderRadius: 4, background: LIME}} />
      </div>
    </div>
  );
};

const MetricStat: React.FC<{value: string; label: string; delay: number}> = ({value, label, delay}) => {
  const frame = useCurrentFrame();
  const s = spring({frame: frame - delay, fps: 30, config: {damping: 12, mass: 0.8}});
  return (
    <div style={{
      transform: `translateY(${interpolate(s, [0, 1], [40, 0])}px)`, opacity: s,
      background: '#0f1c24', border: `1px solid rgba(229,169,60,0.35)`,
      borderRadius: 10, padding: '16px 26px', minWidth: 190, textAlign: 'center',
      boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
    }}>
      <div style={{fontFamily: 'Helvetica, Arial, sans-serif', fontSize: 44, fontWeight: 700, color: GOLD, letterSpacing: 1}}>{value}</div>
      <div style={{fontFamily: 'Helvetica, Arial, sans-serif', fontSize: 15, color: '#9db3bd', letterSpacing: 3, marginTop: 2}}>{label}</div>
    </div>
  );
};

const MotionScene: React.FC<{scene: any; context: any}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const D = scene?.durationInFrames ?? 180;

  // draw-on progress for wall
  const draw = interpolate(frame, [5, 65], [0, 1], {easing: Easing.out(Easing.cubic), extrapolateRight: 'clamp'});
  const wallGlow = 0.35 + 0.25 * Math.sin(frame * 0.06);

  // heading
  const headIn = interpolate(frame, [4, 40], [0, 1], {easing: Easing.out(Easing.cubic)});
  const headY = interpolate(frame, [4, 40], [22, 0], {easing: Easing.out(Easing.cubic)});

  // subtitle
  const subIn = interpolate(frame, [30, 65], [0, 1], {easing: Easing.out(Easing.cubic)});

  // red desert front: sweeps down within map area between x of wall curve
  const frontP = interpolate(frame, [70, 155], [0, 1], {easing: Easing.inOut(Easing.cubic), extrapolateRight: 'clamp'});
  const frontY = interpolate(frontP, [0, 1], [240, 460]);

  // desert advance text
  const advIn = interpolate(frame, [90, 120], [0, 1], {easing: Easing.out(Easing.cubic)});
  const kmCount = interpolate(frame, [90, 140], [0, 1.5], {easing: Easing.out(Easing.cubic)});

  // map opacity
  const mapIn = interpolate(frame, [0, 25], [0, 1]);

  // end fade guard (last 10 frames)
  const endFade = interpolate(frame, [D - 10, D], [0, 0.25]);

  const pips = [
    [105, 468], [200, 450], [300, 442], [400, 444], [500, 455],
    [600, 468], [700, 488], [795, 515], [880, 550], [945, 590], [1000, 640],
  ];

  return (
    <AbsoluteFill style={{background: '#070e14', overflow: 'hidden'}}>
      {/* meridian grid */}
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, opacity: 0.35 * mapIn, transition: 'none'}}>
        {Array.from({length: 12}).map((_, i) => (
          <line key={'v' + i} x1={120 + i * 145} y1={60} x2={120 + i * 145} y2={1020} stroke="#173042" strokeWidth={1} />
        ))}
        {Array.from({length: 7}).map((_, i) => (
          <line key={'h' + i} x1={120} y1={80 + i * 160} x2={1800} y2={80 + i * 160} stroke="#173042" strokeWidth={1} />
        ))}
      </svg>

      {/* headline */}
      <div style={{position: 'absolute', left: 80, top: 66, right: 80, opacity: headIn * (1 - endFade), transform: `translateY(${headY}px)`}}>
        <div style={{fontFamily: 'Helvetica, Arial, sans-serif', fontSize: 52, fontWeight: 800, color: '#f3f6f7', letterSpacing: 0.5, lineHeight: 1.05}}>
          The <span style={{color: GOLD}}>8,000-Kilometer</span> Living Barrier
        </div>
        <div style={{fontFamily: 'Helvetica, Arial, sans-serif', fontSize: 19, color: '#8ea4ae', letterSpacing: 4, marginTop: 8, opacity: subIn}}>
          AFRICA'S MASSIVE WALL OF TREES AGAINST THE SAHARA
        </div>
      </div>

      {/* map stage */}
      <div style={{position: 'absolute', left: 0, top: 0, opacity: mapIn}}>
        <svg width={1920} height={1080}>
          <defs>
            <linearGradient id="wallGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={LIME} />
              <stop offset="100%" stopColor={GOLD} />
            </linearGradient>
          </defs>
          {/* desert shading above the front (within map) */}
          <rect x={95} y={60} width={880} height={Math.max(0, frontY - 60)} fill="rgba(230,57,70,0.07)" />
          <line x1={95} y1={frontY} x2={975} y2={frontY + 190 * 0} stroke={RED} strokeWidth={0} opacity={0} />
          {/* desert front wavy line */}
          <path
            d={`M 95 ${frontY} Q 300 ${frontY - 26} 480 ${frontY} T 860 ${frontY} L 960 ${frontY + 5}`}
            fill="none" stroke={RED} strokeWidth={3} strokeDasharray="14 10" opacity={0.9 * frontP}
          />
          {/* wall ghost track */}
          <path d={wallPath} fill="none" stroke="rgba(229,169,60,0.18)" strokeWidth={18} strokeDasharray="2 10" strokeLinecap="round" />
          {/* drawn wall */}
          <path
            d={wallPath} fill="none" stroke="url(#wallGrad)" strokeWidth={9} strokeLinecap="round"
            strokeDasharray={2600} strokeDashoffset={2600 * (1 - draw)}
          />
          {/* glow pass */}
          <path
            d={wallPath} fill="none" stroke={GOLD} strokeWidth={2} strokeDasharray={2600} strokeDashoffset={2600 * (1 - draw)}
            opacity={wallGlow}
          />
        </svg>
      </div>

      {/* node pips on wall */}
      {pips.map(([x, y], i) => <NationPip key={i} x={x} y={y} delay={20 + i * 4} />)}

      {/* nations counter next to wall start */}
      <div style={{position: 'absolute', left: 820, top: 470, opacity: advIn < 1 ? 1 : 1}}>
      </div>
      <div style={{
        position: 'absolute', left: 1120, top: 560, opacity: interpolate(frame, [30, 62], [0, 1]),
        transform: `translateX(${interpolate(frame, [30, 62], [24, 0], {easing: Easing.out(Easing.cubic)})}px)`,
      }}>
        <div style={{fontFamily: 'Helvetica, Arial, sans-serif', fontSize: 96, fontWeight: 800, color: LIME, lineHeight: 1}}>11</div>
        <div style={{fontFamily: 'Helvetica, Arial, sans-serif', fontSize: 17, color: '#9db3bd', letterSpacing: 4}}>NATIONS ON THE FRONT LINE</div>
      </div>

      {/* desert advance callout, right of the red front */}
      <div style={{
        position: 'absolute', left: 1150, top: 330, opacity: advIn * (1 - endFade),
        transform: `translateX(${interpolate(advIn, [0, 1], [30, 0])}px)`,
      }}>
        <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
          <div style={{width: 44, height: 4, background: RED}} />
          <div style={{fontFamily: 'Helvetica, Arial, sans-serif', fontSize: 34, fontWeight: 700, color: RED}}>Sahara expanding</div>
        </div>
        <div style={{fontFamily: 'Helvetica, Arial, sans-serif', fontSize: 26, color: '#e8edf0', marginTop: 8}}>
          <span style={{color: RED, fontWeight: 700, fontSize: 40}}>{kmCount.toFixed(1)} km</span> per year — southward
        </div>
        <div style={{fontFamily: 'Helvetica, Arial, sans-serif', fontSize: 16, color: '#8ea4ae', letterSpacing: 2, marginTop: 6}}>MILLIONS OF HECTARES OF FARMLAND AT RISK</div>
      </div>

      {/* metric bar bottom */}
      <div style={{position: 'absolute', left: 80, bottom: 100, display: 'flex', gap: 22}}>
        <MetricStat value="8,000 km" label="WALL LENGTH" delay={110} />
        <MetricStat value="15 km" label="WALL WIDTH" delay={122} />
        <MetricStat value={"11"} label="PARTICIPATING NATIONS" delay={134} />
      </div>

      {/* progress arc accent, top right (safe) */}
      <svg width={140} height={140} style={{position: 'absolute', right: 130, top: 80, transform: `rotate(${-90 + 360 * (frame / D)}deg)`, opacity: 0.8}}>
        <circle cx={70} cy={70} r={58} fill="none" stroke="#173042" strokeWidth={5} />
        <circle cx={70} cy={70} r={58} fill="none" stroke={GOLD} strokeWidth={5} strokeDasharray={365} strokeDashoffset={365 * (1 - frame / D)} strokeLinecap="round" />
      </svg>
    </AbsoluteFill>
  );
};

export default MotionScene;
