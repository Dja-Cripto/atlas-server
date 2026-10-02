import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring, Easing } from 'remotion';

type Props = { scene: any; context: any };

export default function MotionScene({ scene, context }: Props) {
  const frame = useCurrentFrame();
  const fps = scene.fps || 30;
  const intro = spring({ frame, fps, config: { damping: 22, stiffness: 90, mass: 0.9 } });
  const mapReveal = spring({ frame: frame - 8, fps, config: { damping: 24, stiffness: 75 } });
  const routeProgress = interpolate(frame, [32, 108], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  const titleOpacity = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: 'clamp' });
  const metrics = [
    { value: '8,000', unit: 'KM', label: 'LIVING BARRIER', note: 'planned across the Sahel' },
    { value: '15', unit: 'KM', label: 'TARGET WIDTH', note: 'a broad green corridor' },
    { value: '11', unit: 'NATIONS', label: 'ONE CONTINENTAL EFFORT', note: 'working across borders' },
    { value: '1.5', unit: 'KM / YEAR', label: 'DESERT ADVANCE', note: 'annual expansion to resist' }
  ];
  const markers = [
    [105, 302], [145, 291], [187, 297], [229, 305], [271, 299], [313, 306],
    [355, 299], [397, 292], [439, 297], [481, 287], [523, 278]
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: '#070e14', color: '#f1f3f2', fontFamily: 'Arial, Helvetica, sans-serif', overflow: 'hidden' }}>
      <AbsoluteFill style={{ opacity: 0.23, backgroundImage: 'linear-gradient(rgba(149,171,180,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(149,171,180,0.08) 1px, transparent 1px)', backgroundSize: '64px 64px' }} />
      <div style={{ position: 'absolute', left: 110, top: 54, width: 36, height: 3, backgroundColor: '#e5a93c', opacity: titleOpacity }} />
      <div style={{ position: 'absolute', left: 158, top: 45, color: '#93a4aa', fontSize: 14, letterSpacing: 3.2, fontWeight: 700, opacity: titleOpacity }}>FIELD NOTE  /  AFRICA</div>
      <div style={{ position: 'absolute', left: 110, top: 78, width: 900, opacity: titleOpacity, transform: `translateY(${(1 - intro) * 14}px)` }}>
        <div style={{ fontSize: 44, lineHeight: 1.08, fontWeight: 800, letterSpacing: 1.6, color: '#f3f5f3' }}>THE 8,000-KILOMETER</div>
        <div style={{ marginTop: 2, fontSize: 54, lineHeight: 1.04, fontWeight: 800, letterSpacing: 0.7, color: '#e5a93c' }}>LIVING BARRIER</div>
      </div>
      <div style={{ position: 'absolute', right: 112, top: 72, color: '#71848d', fontSize: 13, letterSpacing: 2.4, textAlign: 'right', opacity: titleOpacity }}>A CONTINENTAL FRONTIER<br /><span style={{ color: '#d6dcda', letterSpacing: 1.2 }}>TREES AGAINST THE SAHARA</span></div>

      <div style={{ position: 'absolute', left: 96, top: 208, width: 970, height: 770, opacity: mapReveal, transform: `translateY(${(1 - mapReveal) * 16}px) scale(${0.985 + mapReveal * 0.015})`, transformOrigin: 'center center' }}>
        <svg width='970' height='770' viewBox='0 0 700 800' role='img' aria-label='Map of Africa showing the Sahel tree barrier'>
          <path d='M154 33 L330 25 L430 44 L504 83 L548 137 L532 191 L574 239 L605 279 L565 315 L549 360 L567 407 L537 451 L510 505 L486 563 L449 617 L418 670 L389 720 L350 773 L314 752 L292 704 L276 649 L247 601 L218 548 L185 502 L151 453 L125 399 L102 348 L81 297 L92 244 L73 196 L99 146 L111 99 Z' fill='#14242b' stroke='#45606a' strokeWidth='2.2' />
          <path d='M579 279 L604 267 L621 282 L601 299 L579 302 Z' fill='#14242b' stroke='#45606a' strokeWidth='2' />
          <path d='M628 538 L646 566 L653 606 L642 649 L630 625 L625 585 Z' fill='#14242b' stroke='#45606a' strokeWidth='2' />
          <path d='M94 252 C184 224 258 230 332 240 C411 249 473 230 558 236 L577 280 C493 287 427 313 350 308 C257 301 183 314 105 338 Z' fill='rgba(229,169,60,0.08)' />
          <text x='272' y='190' fill='#9ba9a9' fontSize='17' letterSpacing='4' fontWeight='700'>SAHARA</text>
          <text x='302' y='368' fill='#91a09f' fontSize='14' letterSpacing='3' fontWeight='700'>SAHEL</text>
          <path d='M105 302 C194 277 251 296 321 302 C397 309 460 281 548 276' fill='none' stroke='rgba(229,169,60,0.19)' strokeWidth='16' strokeLinecap='round' />
          <path d='M105 302 C194 277 251 296 321 302 C397 309 460 281 548 276' fill='none' stroke='#e5a93c' strokeWidth='3.5' strokeLinecap='round' strokeDasharray='700' strokeDashoffset={700 * (1 - routeProgress)} />
          {markers.map(([x, y], i) => {
            const alpha = interpolate(frame, [34 + i * 5, 47 + i * 5], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
            const scale = spring({ frame: frame - (34 + i * 5), fps, config: { damping: 13, stiffness: 130 } });
            return <g key={i} opacity={alpha} transform={`translate(${x} ${y}) scale(${0.7 + scale * 0.3})`}>
              <circle r='10' fill='rgba(229,169,60,0.15)' />
              <circle r='4.4' fill='#f2bd55' stroke='#fff0c9' strokeWidth='1.2' />
              <path d='M0 7 L0 15' stroke='#e5a93c' strokeWidth='1.5' />
            </g>;
          })}
          <g opacity={routeProgress}>
            <circle cx='107' cy='329' r='2.5' fill='#e5a93c' />
            <circle cx='548' cy='303' r='2.5' fill='#e5a93c' />
          </g>
        </svg>
        <div style={{ position: 'absolute', left: 210, top: 554, color: '#9aabad', fontSize: 12, letterSpacing: 2.4, opacity: routeProgress }}>11 COUNTRIES  <span style={{ color: '#e5a93c' }}>•</span>  SAHEL GREEN BELT</div>
        <div style={{ position: 'absolute', left: 105, bottom: 10, width: 670, height: 1, backgroundColor: 'rgba(154,171,173,0.22)' }} />
        <div style={{ position: 'absolute', left: 105, bottom: -12, color: '#71848b', fontSize: 11, letterSpacing: 1.8 }}>WEST</div>
        <div style={{ position: 'absolute', left: 730, bottom: -12, color: '#71848b', fontSize: 11, letterSpacing: 1.8 }}>EAST</div>
      </div>

      <div style={{ position: 'absolute', left: 1110, top: 258, color: '#e5a93c', fontSize: 13, fontWeight: 700, letterSpacing: 2.8, opacity: titleOpacity }}>THE SCALE OF THE CHALLENGE</div>
      <div style={{ position: 'absolute', left: 1110, top: 282, width: 680, height: 1, backgroundColor: 'rgba(145,164,169,0.27)', opacity: titleOpacity }} />
      {metrics.map((item, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const x = 1110 + col * 345;
        const y = 310 + row * 218;
        const reveal = spring({ frame: frame - (42 + i * 8), fps, config: { damping: 21, stiffness: 95, mass: 0.85 } });
        return <div key={item.label} style={{ position: 'absolute', left: x, top: y, width: 320, height: 190, boxSizing: 'border-box', padding: '22px 23px', backgroundColor: '#0e1a21', border: '1px solid rgba(133,156,163,0.27)', borderTop: `2px solid ${i === 3 ? '#e63946' : '#e5a93c'}`, opacity: reveal, transform: `translateY(${(1 - reveal) * 18}px)` }}>
          <div style={{ color: '#8fa0a5', fontSize: 11, letterSpacing: 2.1, fontWeight: 700 }}>{item.label}</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 17 }}>
            <span style={{ color: i === 3 ? '#f06a70' : '#f1f3f2', fontSize: 46, lineHeight: 1, fontWeight: 800, letterSpacing: -1.5 }}>{item.value}</span>
            <span style={{ color: i === 3 ? '#f06a70' : '#e5a93c', fontSize: 13, fontWeight: 700, letterSpacing: 1.2 }}>{item.unit}</span>
          </div>
          <div style={{ marginTop: 17, width: 44, height: 2, backgroundColor: i === 3 ? '#e63946' : '#e5a93c', opacity: 0.8 }} />
          <div style={{ marginTop: 11, color: '#a1afb2', fontSize: 13, letterSpacing: 0.2 }}>{item.note}</div>
          {i === 3 && <div style={{ position: 'absolute', right: 22, top: 77, width: 48, height: 32, color: '#e63946', opacity: interpolate(frame, [95, 125, 155, 179], [0.35, 1, 0.55, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }), fontSize: 24, fontWeight: 700, textAlign: 'center' }}>↗</div>}
        </div>;
      })}

      <div style={{ position: 'absolute', left: 1110, top: 774, width: 665, color: '#b8c1c1', fontSize: 15, lineHeight: 1.55, opacity: interpolate(frame, [90, 120], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>
        A living line of trees is being grown to slow the desert and help protect fertile land for millions.
      </div>
      <div style={{ position: 'absolute', left: 1110, top: 859, width: 665, height: 1, backgroundColor: 'rgba(145,164,169,0.22)' }} />
      <div style={{ position: 'absolute', left: 1110, top: 879, color: '#778a90', fontSize: 11, letterSpacing: 2 }}>LAND RESTORATION  /  SAHEL REGION</div>
      <div style={{ position: 'absolute', right: 112, top: 879, color: '#778a90', fontSize: 11, letterSpacing: 1.6 }}>01 — 01</div>
      <div style={{ position: 'absolute', left: 110, right: 110, bottom: 54, height: 2, backgroundColor: 'rgba(145,164,169,0.17)' }} />
      <div style={{ position: 'absolute', left: 110, bottom: 54, height: 2, width: `${interpolate(frame, [0, 179], [0, 100], { extrapolateRight: 'clamp' })}%`, backgroundColor: '#e5a93c', opacity: 0.75 }} />
    </AbsoluteFill>
  );
}