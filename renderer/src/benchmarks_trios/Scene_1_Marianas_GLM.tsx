import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate, spring, Easing} from 'remotion';

const FPS = 30;
const DUR = 180;

// beats (frames)
const SURFACE_HOLD = 25;
const LIGHT_DEATH = 62;
const BOTTOM_FRAME = 96;
const JET_STACK_START = 98;
const JET_STACK_END = 132;
const CAPTION_START = 128;

const FONT = "'Helvetica Neue', Helvetica, Arial, sans-serif";

function fmt(n: number) {
  return Math.round(n).toLocaleString('en-US');
}

const JetGlyph: React.FC<{x: number; y: number; s: number; o: number}> = ({x, y, s, o}) => (
  <svg width={64 * s} height={24 * s} viewBox="0 0 64 24" style={{position: 'absolute', left: x, top: y, opacity: o, transform: 'translate(-50%,-50%)'}}>
    {/* fuselage */}
    <rect x={4} y={10} width={56} height={5} rx={2.5} fill="#e5a93c" />
    {/* nose */}
    <polygon points="60,10.5 64,12.5 60,14.5" fill="#e5a93c" />
    {/* tail fin */}
    <polygon points="4,10 10,10 8,3 5,3" fill="#e5a93c" />
    {/* wings */}
    <polygon points="26,10 34,10 42,2 38,2" fill="#e5a93c" opacity={0.85} />
    <polygon points="26,15 34,15 40,21 36,21" fill="#e5a93c" opacity={0.55} />
  </svg>
);

export default function MotionScene({scene, context}: {scene: any; context: any}) {
  const frame = useCurrentFrame();
  const f = Math.min(frame, DUR - 1);

  // ---------- global helpers ----------
  const ease = (t: number) => 1 - Math.pow(1 - Math.min(Math.max(t, 0), 1), 3);

  // ---------- phase progress ----------
  // depth narrative: 0 -> 1000m during SURFACE_HOLD..LIGHT_DEATH; 1000 -> 10994 during LIGHT_DEATH..BOTTOM_FRAME
  const depth =
    f <= SURFACE_HOLD
      ? interpolate(f, [5, SURFACE_HOLD], [0, 1000], {easing: Easing.inOut(Easing.cubic)})
      : f <= BOTTOM_FRAME
      ? interpolate(f, [SURFACE_HOLD, BOTTOM_FRAME], [1000, 10994], {easing: Easing.inOut(Easing.cubic)})
      : 10994;

  const atm = Math.min(1086, depth * (1086 / 10994));

  // ---------- water column visuals ----------
  const sunOpacity = interpolate(f, [0, 40], [0.9, 0.15], {extrapolateRight: 'clamp'}) * interpolate(depth, [0, 300], [1, 0], {extrapolateRight: 'clamp'});

  // god rays retiring
  const rayPhase = interpolate(f, [0, LIGHT_DEATH], [0, 1], {extrapolateRight: 'clamp'});

  // darkness alpha rises with depth but flips full black at light-death beat
  const depthDark = interpolate(depth, [0, 1000], [0, 0.55], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const blackout = interpolate(f, [LIGHT_DEATH - 6, LIGHT_DEATH], [depthDark, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  // particles (deterministic)... drifting down only briefly in lit phase

  // ---------- title ----------
  const titleOp = interpolate(f, [4, 16], [0, 1], {extrapolateRight: 'clamp'}) * interpolate(f, [55, 70], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const titleY = interpolate(ease(f / 18), [0, 1], [-14, 0]) * interpolate(f, [55, 70], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  // ---------- sunlight-threshold flag ----------
  const flagOp = interpolate(f, [LIGHT_DEATH - 4, LIGHT_DEATH + 4], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const flagOpLate = flagOp * interpolate(f, [BOTTOM_FRAME, BOTTOM_FRAME + 12], [1, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) > 0 ? flagOp * (f < BOTTOM_FRAME + 10 ? 1 : interpolate(f, [BOTTOM_FRAME + 10, BOTTOM_FRAME + 20], [1, 0.25], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})) : flagOp;
  const flagX = -6 + 6 * ease((f - (LIGHT_DEATH - 4)) / 10);

  // ---------- left gauge marker ----------
  const gaugeP = depth / 10994; // 0..1
  const gaugeTop = 220;
  const gaugeH = 560;
  const markerY = gaugeTop + gaugeH * gaugeP;

  // submarine marker entering at start
  const subsOp = interpolate(f, [8, 18], [0, 1], {extrapolateRight: 'clamp'});

  // ---------- right pressure counter ----------
  const counterOp = interpolate(f, [10, 22], [0, 1], {extrapolateRight: 'clamp'});
  const counterPop = spring({frame: f - 10, fps: FPS, config: {damping: 14, stiffness: 110}});

  // ---------- jet stack ----------
  // 50 jets arranged as two columns stacked above the figure
  const jets: Array<{x: number; y: number; s: number; o: number}> = [];
  for (let i = 0; i < 50; i++) {
    const appear = JET_STACK_START + i * ((JET_STACK_END - JET_STACK_START) / 50);
    const sp = spring({frame: f - appear, fps: FPS, config: {damping: 11, stiffness: 130, mass: 0.7}});
    const col = i % 2; // 0 left col, 1 right col
    const row = Math.floor(i / 2); // 0..24 top-down row (col index 0 first)
    const dir = col === 0 ? -1 : 1;
    const cx = 1320 + dir * 190;
    const rowSpacing = 20;
    const cy = 560 - row * rowSpacing;
    const scale = 0.95 + 0.1 * Math.sin(i * 1.7);
    jets.push({x: cx + (1 - sp) * dir * 260, y: cy + (1 - sp) * 90, s: scale * (0.7 + 0.3 * sp), o: sp});
  }

  // constrain jets to safe area horizontally (clamp x)

  // ---------- figure ----------
  const figOp = interpolate(f, [JET_STACK_START - 8, JET_STACK_START], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  // ---------- final caption ----------
  const capOp = interpolate(f, [CAPTION_START, CAPTION_START + 10], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const capY = interpolate(ease((f - CAPTION_START) / 12), [0, 1], [16, 0]);

  // ---------- narration lower-third ----------
  const nOp1 = interpolate(f, [18, 28], [0, 1], {extrapolateRight: 'clamp'}) * interpolate(f, [88, 100], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const nOp2 = interpolate(f, [100, 110], [0, 1], {extrapolateRight: 'clamp'}) * interpolate(f, [128, 138], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const nOp3 = interpolate(f, [140, 150], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  // ---------- particles ----------
  const particles = [];
  for (let i = 0; i < 26; i++) {
    const sd = (i * 9301 + 49297) % 233280;
    const rx = sd / 233280;
    const px = 200 + rx * 1520;
    const speed = 1.2 + rx * 2.4;
    const py = () => 80 + ((i * 137 + f * speed * 3) % 900);
    const marianDark = interpolate(depth, [600, 1000], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    const o = marianDark * interpolate(f, [0, 12], [0, 0.5], {extrapolateRight: 'clamp'});
    const size = 1.5 + rx * 3.5;
    particles.push(<div key={i} style={{position: 'absolute', left: px, top: py(), width: size, height: size, borderRadius: '50%', background: `rgba(190,220,230,${o})`}} />);
  }

  return (
    <AbsoluteFill style={{background: '#070e14', fontFamily: FONT, overflow: 'hidden'}}>

      {/* ===== water column base ===== */}
      <AbsoluteFill style={{background: 'linear-gradient(180deg, #0f2a38 0%, #0d1f2b 40%, #0a1420 70%, #07101a 100%)', opacity: 1 - interpolate(f, [LIGHT_DEATH - 4, LIGHT_DEATH], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}} />
      {/* full-black abyss layer */}
      <AbsoluteFill style={{background: '#030508', opacity: f < LIGHT_DEATH ? depthDark * 0.9 : 1}} />

      {/* ===== sun sliver at surface ===== */}
      <div style={{position: 'absolute', top: 62, left: '50%', transform: 'translateX(-50%)', width: 260, height: 34, borderRadius: '0 0 130px 130px', background: 'radial-gradient(ellipse at 50% 0%, rgba(229,169,60,0.95) 0%, rgba(229,169,60,0.25) 55%, rgba(229,169,60,0) 75%)', opacity: sunOpacity, border: 'none', borderBottom: '2px solid rgba(229,169,60,0.8)'}} />

      {/* ===== god rays (plain polygons, no filters) ===== */}
      {[0, 1, 2, 3, 4].map((i) => {
        const op = (0.30 - i * 0.04) * (1 - rayPhase) * sunOpacity;
        const cxr = 700 + i * 130;
        const skew = -8 + i * 4;
        return <div key={'r' + i} style={{position: 'absolute', top: 90, left: cxr, width: 70, height: 620, background: 'linear-gradient(180deg, rgba(229,169,60,0.55) 0%, rgba(180,215,220,0.10) 60%, rgba(0,0,0,0) 100%)', transform: `skewX(${skew}deg)`, opacity: op, transformOrigin: 'top center'}} />;
      })}

      {/* ===== depth haze bands (simple tints) ===== */}
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0) 30%, rgba(6,14,20,0.55) 75%, rgba(3,6,9,0.9) 100%)', opacity: interpolate(depth, [150, 1000], [0.4, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}} />

      {particles}

      {/* ===== kicker ===== */}
      <div style={{position: 'absolute', top: 84, left: 90, opacity: interpolate(f, [6, 16], [0, 1], {extrapolateRight: 'clamp'}) * (f < BOTTOM_FRAME + 4 ? 1 : interpolate(f, [BOTTOM_FRAME + 4, BOTTOM_FRAME + 14], [1, 0.55], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}))}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
          <div style={{width: 34, height: 3, background: '#e5a93c'}} />
          <div style={{color: '#e5a93c', fontSize: 22, letterSpacing: 7, fontWeight: 700}}>MARIANA TRENCH · CHALLENGER DEEP</div>
        </div>
      </div>

      {/* ===== TITLE ===== */}
      <div style={{position: 'absolute', top: 150, left: 90, opacity: titleOp, transform: `translateY(${titleY}px)`}}>
        <div style={{color: '#f4f7f8', fontSize: 84, fontWeight: 800, letterSpacing: -1.5, lineHeight: 1.02, maxWidth: 1050}}>
          The 1,000-Atmosphere <span style={{color: '#e5a93c'}}>Abyss</span>
        </div>
      </div>

      {/* ===== narration lower-third ===== */}
      <div style={{position: 'absolute', bottom: 120, left: 90, right: 90, textAlign: 'left'}}>
        <div style={{color: 'rgba(200,216,224,0.92)', fontSize: 30, fontWeight: 400, lineHeight: 1.4, opacity: nOp1, maxWidth: 1300, borderLeft: '4px solid #e5a93c', paddingLeft: 24}}>
          Sunlight vanishes completely within the first thousand meters.
        </div>
        <div style={{color: 'rgba(200,216,224,0.92)', fontSize: 30, fontWeight: 400, lineHeight: 1.4, opacity: nOp2, position: 'absolute', top: 0, borderLeft: '4px solid #e5a93c', paddingLeft: 24, maxWidth: 1400}}>
          Nearly eleven hundred atmospheres of water pressure push down from every direction.
        </div>
        <div style={{color: 'rgba(200,216,224,0.92)', fontSize: 30, fontWeight: 400, lineHeight: 1.4, opacity: nOp3, position: 'absolute', top: 0, borderLeft: '4px solid #e5a93c', paddingLeft: 24, maxWidth: 1400}}>
          Eleven thousand meters below the Pacific surface, the crushing equivalent of fifty jumbo jets.
        </div>
      </div>

      {/* ===== SUNLIGHT ENDS flag ===== */}
      <div style={{position: 'absolute', top: 470, left: 80 + Math.max(flagX, 0), opacity: flagOpLate}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 14, transform: 'translateX(' + Math.max(flagX, 0) * 1.5 + 'px)'}}>
          <div style={{width: 0, height: 0, borderTop: '16px solid transparent', borderBottom: '16px solid transparent', borderLeft: '22px solid #e63946'}} />
          <div style={{background: 'rgba(230,57,70,0.14)', border: '2px solid #e63946', padding: '12px 26px'}}>
            <div style={{color: '#e63946', fontSize: 26, fontWeight: 800, letterSpacing: 4}}>SUNLIGHT ENDS · 1,000 M</div>
          </div>
        </div>
      </div>

      {/* ===== LEFT GAUGE RAIL ===== */}
      <div style={{position: 'absolute', left: 104, top: gaugeTop - 30, opacity: interpolate(f, [8, 18], [0, 1], {extrapolateRight: 'clamp'})}}>
        <div style={{color: '#7f96a3', fontSize: 16, letterSpacing: 3, marginBottom: 12, transform: `translateX(${(f < 24 ? interpolate(f, [8, 24], [-10, 0]) : 0)}px)`}}>DEPTH</div>
        <div style={{position: 'relative', width: 4, height: gaugeH, background: 'rgba(230,57,70,0.7)'}}>
          {/* lit segment above 1000m */}
          <div style={{position: 'absolute', top: 0, left: 0, width: 4, height: gaugeH * (1000 / 10994), background: 'rgba(229,169,60,0.9)'}} />
          {/* marker */}
          <div style={{position: 'absolute', top: markerY - gaugeTop, left: -9, width: 22, height: 22, borderRadius: '50%', border: '3px solid #f4f7f8', background: 'rgba(7,14,20,0.9)', transform: 'translateY(-50%)'}} />
          {/* tick labels */}
          <div style={{position: 'absolute', left: 26, top: -8, color: '#7f96a3', fontSize: 15, letterSpacing: 1}}>0 m</div>
          <div style={{position: 'absolute', left: 26, top: gaugeH * (1000 / 10994) - 8, color: '#e63946', fontSize: 15, fontWeight: 700}}>1,000 m</div>
          <div style={{position: 'absolute', left: 26, top: gaugeH * (3000 / 10994) - 8, color: '#5f7683', fontSize: 14}}>3,000 m</div>
          <div style={{position: 'absolute', left: 26, top: gaugeH * (6000 / 10994) - 8, color: '#5f7683', fontSize: 14}}>6,000 m</div>
          <div style={{position: 'absolute', left: 26, top: gaugeH - 8, color: '#e5a93c', fontSize: 15, fontWeight: 700}}>10,994 m</div>
        </div>
      </div>

      {/* ===== BIG DEPTH NUMBER (bottom-left of gauge zone) ===== */}
      <div style={{position: 'absolute', left: 104, top: 840, opacity: subsOp}}>
        <div style={{color: '#f4f7f8', fontSize: 64, fontWeight: 800, fontVariantNumeric: 'tabular-nums', letterSpacing: -1, lineHeight: 1}}>
          {fmt(depth)}<span style={{fontSize: 26, color: '#e5a93c', fontWeight: 700, marginLeft: 10}}>METERS</span>
        </div>
      </div>

      {/* ===== RIGHT PRESSURE COUNTER ===== */}
      <div style={{position: 'absolute', right: 96, top: 96, textAlign: 'right', opacity: counterOp, transform: `scale(${0.92 + counterPop * 0.08})`, transformOrigin: 'top right'}}>
        <div style={{color: '#7f96a3', fontSize: 16, letterSpacing: 3, marginBottom: 6}}>PRESSURE</div>
        <div style={{color: '#e5a93c', fontSize: 72, fontWeight: 800, fontVariantNumeric: 'tabular-nums', lineHeight: 1, letterSpacing: -1.5}}>
          {fmt(atm)}<span style={{fontSize: 30, color: '#f4f7f8', fontWeight: 700, marginLeft: 8, letterSpacing: 1}}>ATM</span>
        </div>
        <div style={{color: '#5f7683', fontSize: 16, letterSpacing: 2, marginTop: 6}}>≈ 1,100 kg ON EVERY CM²</div>
      </div>

      {/* ===== CENTER FIGURE ===== */}
      <div style={{position: 'absolute', left: 1320, top: 600, transform: 'translate(-50%,-50%)', opacity: figOp}}>
        <svg width={120} height={190} viewBox="0 0 120 190">
          <ellipse cx={60} cy={128} rx={40} ry={40} fill="none" stroke="#f4f7f8" strokeWidth={3} opacity={0.85} />
          <circle cx={60} cy={45} r={18} fill="none" stroke="#f4f7f8" strokeWidth={3} opacity={0.85} />
          <line x1={60} y1={63} x2={60} y2={88} stroke="#f4f7f8" strokeWidth={3} opacity={0.85} />
          <line x1={60} y1={88} x2={40} y2={108} stroke="#f4f7f8" strokeWidth={3} opacity={0.85} />
          <line x1={60} y1={88} x2={80} y2={108} stroke="#f4f7f8" strokeWidth={3} opacity={0.85} />
        </svg>
        <div style={{textAlign: 'center', color: '#7f96a3', fontSize: 15, letterSpacing: 2, marginTop: 4}}>A HUMAN BEING · 1 ATM OF AIR INSIDE</div>
      </div>

      {/* ===== JET STACK ===== */}
      {jets.filter((j) => j.x > 900 && j.x < 1840).map((j, i) => (
        <JetGlyph key={'j' + i} x={Math.min(Math.max(j.x, 150), 1790)} y={Math.min(Math.max(j.y, 80), 1000)} s={j.s} o={j.o * (0.55 + 0.45 * (i % 3 === 0 ? 1 : 0.8))} />
      ))}
      {/* stack containment hairline */}
      <div style={{position: 'absolute', left: 1010, top: 190, width: 2, height: 390, background: 'rgba(229,169,60,0.25)', opacity: interpolate(f, [JET_STACK_START, JET_STACK_START + 10], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}} />

      {/* ===== VERDICT CAPTION ===== */}      
      <div style={{position: 'absolute', bottom: 250, left: 1320, transform: `translate(-50%, ${capY}px)`, opacity: capOp, textAlign: 'center', whiteSpace: 'nowrap'}}>
        <div style={{background: 'rgba(229,169,60,0.10)', border: '2px solid #e5a93c', padding: '16px 34px'}}>
          <span style={{color: '#e5a93c', fontSize: 34, fontWeight: 800, letterSpacing: 2}}>50 JUMBO JETS · ON EVERY SQUARE CENTIMETER</span>
        </div>
      </div>

      {/* ===== DEPTH-CROSSING micro captions ===== */}
      <div style={{position: 'absolute', top: 200, left: 1180, opacity: interpolate(f, [24, 32], [0, 1], {extrapolateRight: 'clamp'}) * interpolate(f, [58, 64], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}}>
        <div style={{color: 'rgba(229,169,60,0.9)', fontSize: 20, letterSpacing: 3, fontWeight: 700}}>PHOTIC ZONE EXITING…</div>
      </div>
      <div style={{position: 'absolute', top: 208, left: 1180, opacity: interpolate(f, [86, 94], [0, 1], {extrapolateRight: 'clamp'}) * interpolate(f, [110, 120], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}}>
        <div style={{color: 'rgba(229,169,60,0.9)', fontSize: 20, letterSpacing: 3, fontWeight: 700}}>HADAL ZONE REACHED</div>
      </div>

      {/* ===== surface line (retiring) ===== */}
      <div style={{position: 'absolute', top: 88, left: 80, right: 80, height: 2, background: 'rgba(191,215,226,0.35)', opacity: interpolate(f, [0, LIGHT_DEATH], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}} />

      {/* ===== frame vignette (solid strokes) ===== */}
      <div style={{position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, border: '0px solid transparent', boxShadow: 'none', pointerEvents: 'none'}} />
    </AbsoluteFill>
  );
}