import { AbsoluteFill, interpolate, spring, useCurrentFrame } from 'remotion';

export default function SceneGPT6LunaGPT6Luna({ scene, context }: { scene: any; context: any }) {
  const frame = useCurrentFrame();
  const fps = scene?.fps ?? 30;
  const reveal = (start: number, end: number) => interpolate(frame, [start, end], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const titleIn = spring({ frame, fps, config: { damping: 22, stiffness: 90, mass: 0.8 } });
  const metricIn = spring({ frame: Math.max(0, frame - 72), fps, config: { damping: 24, stiffness: 80, mass: 0.9 } });
  const compareIn = spring({ frame: Math.max(0, frame - 118), fps, config: { damping: 24, stiffness: 85, mass: 0.85 } });
  const dryIn = reveal(65, 106);
  const cloudOpacity = interpolate(frame, [18, 32, 60, 78], [0, 0.92, 0.82, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const cloudShift = interpolate(frame, [20, 70], [0, -54], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const rainOpacity = interpolate(frame, [28, 42, 63, 76], [0, 0.9, 0.75, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const mapPath = 'M79 94 L103 68 L132 66 L151 49 L189 43 L212 52 L240 42 L274 49 L303 37 L341 44 L373 35 L404 45 L436 38 L465 51 L490 43 L522 55 L548 52 L569 68 L582 77 L590 105 L578 132 L585 165 L600 195 L611 228 L615 263 L630 292 L622 323 L609 354 L596 385 L584 416 L567 442 L542 457 L519 470 L493 477 L463 482 L437 476 L408 481 L379 472 L350 479 L319 469 L290 475 L260 463 L233 461 L208 445 L184 430 L161 410 L141 388 L123 364 L108 339 L96 313 L84 285 L76 257 L69 230 L65 202 L67 175 L63 149 L69 122 Z';
  const cloudX = cloudShift;

  return (
    <AbsoluteFill style={{ backgroundColor: '#0b1412', color: '#f1eee5', fontFamily: 'Arial, Helvetica, sans-serif', overflow: 'hidden' }}>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 38% 52%, rgba(44,67,55,0.30) 0%, rgba(11,20,18,0) 62%)' }} />
      <AbsoluteFill style={{ opacity: 0.18, backgroundImage: 'linear-gradient(rgba(184,197,176,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(184,197,176,0.08) 1px, transparent 1px)', backgroundSize: '80px 80px' }} />

      <div style={{ position: 'absolute', left: 104, top: 64, opacity: titleIn, transform: `translateY(${interpolate(titleIn, [0, 1], [12, 0])}px)` }}>
        <div style={{ color: '#e5a93c', fontSize: 14, fontWeight: 700, letterSpacing: 3.2, textTransform: 'uppercase' }}>AUSTRALIA · CLIMATE &amp; LAND</div>
        <div style={{ marginTop: 13, fontSize: 54, lineHeight: 1.04, fontWeight: 800, letterSpacing: -1.8 }}>THE 82% DEAD ZONE</div>
        <div style={{ marginTop: 10, color: '#a8b2aa', fontSize: 18, letterSpacing: 0.35 }}>Why 90% of Australia Is Completely Empty</div>
      </div>
      <div style={{ position: 'absolute', left: 104, top: 204, width: 1712, height: 1, background: 'linear-gradient(90deg, rgba(229,169,60,0.65), rgba(229,169,60,0.05) 62%, transparent)', opacity: reveal(8, 35) }} />

      <svg width='970' height='630' viewBox='0 0 800 520' style={{ position: 'absolute', left: 90, top: 222, overflow: 'visible', opacity: reveal(8, 38) }}>
        <defs>
          <linearGradient id='landBase' x1='0' y1='0' x2='1' y2='1'><stop offset='0%' stopColor='#647565' /><stop offset='100%' stopColor='#354b40' /></linearGradient>
          <linearGradient id='dryFill' x1='0' y1='0' x2='1' y2='0'><stop offset='0%' stopColor='#b75a32' /><stop offset='68%' stopColor='#9d482a' /><stop offset='100%' stopColor='#713c2b' /></linearGradient>
          <pattern id='terrainLines' width='52' height='38' patternUnits='userSpaceOnUse'><path d='M0 25 C12 14 25 34 52 12' fill='none' stroke='#e9a55f' strokeOpacity='0.20' strokeWidth='1.2' /><path d='M-8 8 C12 0 26 17 42 3' fill='none' stroke='#e9a55f' strokeOpacity='0.12' strokeWidth='1' /></pattern>
          <clipPath id='australiaClip'><path d={mapPath} /></clipPath>
          <filter id='softGlow' x='-50%' y='-50%' width='200%' height='200%'><feGaussianBlur stdDeviation='5' result='blur' /><feMerge><feMergeNode in='blur' /><feMergeNode in='SourceGraphic' /></feMerge></filter>
        </defs>
        <path d={mapPath} fill='url(#landBase)' stroke='#c3c7ac' strokeWidth='2.4' strokeLinejoin='round' />
        <g clipPath='url(#australiaClip)'>
          <path d='M45 25 H584 L596 520 H35 Z' fill='url(#dryFill)' opacity={dryIn} />
          <rect x='40' y='28' width='575' height='470' fill='url(#terrainLines)' opacity={dryIn * 0.8} />
          <path d='M89 155 C190 126 237 165 330 133 S470 123 565 108' fill='none' stroke='#f2b176' strokeOpacity={0.25 * dryIn} strokeWidth='2' />
          <path d='M82 294 C191 258 260 300 356 270 S484 250 594 234' fill='none' stroke='#f2b176' strokeOpacity={0.22 * dryIn} strokeWidth='2' />
          <path d='M108 383 C218 355 274 391 374 360 S489 343 582 320' fill='none' stroke='#f2b176' strokeOpacity={0.18 * dryIn} strokeWidth='2' />
          <path d='M621 65 C596 142 612 199 627 258 C636 313 615 383 579 454' fill='none' stroke='#e5a93c' strokeOpacity='0.2' strokeWidth='17' filter='url(#softGlow)' />
        </g>
        <path d='M621 65 C596 142 612 199 627 258 C636 313 615 383 579 454' fill='none' stroke='#e5a93c' strokeWidth='4' strokeLinecap='round' />
        <g fill='#f0bd5a' opacity='0.96'>
          <path d='M606 103 l14 -18 l4 25 Z' /><path d='M603 151 l15 -19 l4 25 Z' /><path d='M609 205 l15 -19 l4 25 Z' /><path d='M618 260 l15 -19 l4 25 Z' /><path d='M618 316 l15 -19 l4 25 Z' /><path d='M604 373 l15 -19 l4 25 Z' /><path d='M584 425 l15 -19 l4 25 Z' />
        </g>
        <g transform={`translate(${cloudX} 0)`} opacity={cloudOpacity}>
          <g fill='#c6d0c6' stroke='#e0e5db' strokeWidth='1.5'>
            <path d='M683 117 C681 107 689 99 700 100 C704 87 722 85 730 98 C743 94 754 103 752 115 C762 119 759 132 747 133 H694 C683 132 678 125 683 117 Z' />
            <path d='M704 226 C702 217 709 210 719 210 C724 197 741 197 748 209 C760 206 769 215 766 226 C775 230 771 241 761 242 H713 C703 241 699 234 704 226 Z' />
            <path d='M690 340 C688 332 695 325 704 325 C709 313 725 312 732 324 C744 321 752 330 750 340 C759 344 756 354 746 355 H699 C690 354 686 347 690 340 Z' />
          </g>
        </g>
        <g opacity={rainOpacity} stroke='#b9d5d4' strokeWidth='2.2' strokeLinecap='round'>
          <path d='M716 143 l-12 22' /><path d='M739 146 l-12 23' /><path d='M760 143 l-12 22' />
          <path d='M729 251 l-12 22' /><path d='M750 254 l-12 23' /><path d='M772 251 l-12 22' />
          <path d='M715 363 l-12 22' /><path d='M737 365 l-12 23' /><path d='M758 362 l-12 22' />
          <path d='M681 166 H641' strokeDasharray='5 7' opacity='0.65' /><path d='M690 274 H645' strokeDasharray='5 7' opacity='0.65' /><path d='M675 389 H625' strokeDasharray='5 7' opacity='0.65' />
        </g>
        <text x='665' y='477' fill='#e5a93c' fontSize='13' fontWeight='700' letterSpacing='1.5' transform='rotate(-66 665 477)'>GREAT DIVIDING RANGE</text>
        <text x='213' y='262' fill='#f5d4b2' fontSize='17' fontWeight='700' letterSpacing='2' opacity={dryIn}>ARID INTERIOR</text>
        <text x='213' y='286' fill='#f1c5a0' fontSize='13' letterSpacing='1.3' opacity={dryIn}>RAIN SHADOW</text>
        <text x='675' y='70' fill='#aebdb5' fontSize='12' letterSpacing='1.5'>PACIFIC</text>
        <text x='675' y='86' fill='#aebdb5' fontSize='12' letterSpacing='1.5'>MOISTURE</text>
        <g opacity={dryIn}>
          <circle cx='190' cy='340' r='3' fill='#f4c17b' /><circle cx='256' cy='396' r='2' fill='#f4c17b' /><circle cx='410' cy='192' r='2.5' fill='#f4c17b' /><circle cx='470' cy='329' r='2' fill='#f4c17b' />
        </g>
      </svg>

      <div style={{ position: 'absolute', left: 1115, top: 250, width: 690, opacity: metricIn, transform: `translateY(${interpolate(metricIn, [0, 1], [18, 0])}px)` }}>
        <div style={{ color: '#e5a93c', fontSize: 14, fontWeight: 700, letterSpacing: 2.5 }}>CONTINENTAL ARIDITY</div>
        <div style={{ display: 'flex', alignItems: 'baseline', marginTop: 8 }}>
          <span style={{ fontSize: 126, lineHeight: 0.98, fontWeight: 800, letterSpacing: -7, color: '#f4eee2' }}>82</span>
          <span style={{ fontSize: 63, fontWeight: 700, color: '#e5a93c', marginLeft: 7 }}>%</span>
        </div>
        <div style={{ marginTop: 8, fontSize: 22, lineHeight: 1.35, color: '#c3cbc3', maxWidth: 600 }}>of the continent receives less than</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 13, marginTop: 7 }}>
          <span style={{ color: '#e5a93c', fontSize: 49, lineHeight: 1.1, fontWeight: 800, letterSpacing: -1 }}>500</span>
          <span style={{ color: '#f1eee5', fontSize: 22, fontWeight: 700 }}>mm</span>
          <span style={{ color: '#94a097', fontSize: 15, letterSpacing: 1.1, textTransform: 'uppercase' }}>rain per year</span>
        </div>
        <div style={{ width: 650, height: 1, marginTop: 19, background: 'linear-gradient(90deg, rgba(229,169,60,0.65), rgba(229,169,60,0.05))' }} />
      </div>

      <div style={{ position: 'absolute', left: 1115, top: 701, width: 690, height: 244, boxSizing: 'border-box', padding: '22px 25px', border: '1px solid rgba(194,203,188,0.22)', background: 'linear-gradient(135deg, rgba(32,48,40,0.88), rgba(16,29,25,0.80))', opacity: compareIn, transform: `translateY(${interpolate(compareIn, [0, 1], [16, 0])}px)` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ color: '#e5a93c', fontSize: 13, fontWeight: 700, letterSpacing: 2 }}>THE SCALE OF THE OUTBACK</div>
          <div style={{ color: '#a5b0a6', fontSize: 12, letterSpacing: 1.2 }}>AREA COMPARISON</div>
        </div>
        <div style={{ marginTop: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 125, color: '#e9e3d7', fontSize: 13, fontWeight: 700, letterSpacing: 1 }}>ARID ZONE</div>
            <div style={{ height: 22, width: 440, maxWidth: 440, background: 'linear-gradient(90deg, #bd5e34, #e5a93c)', boxShadow: '0 0 18px rgba(229,169,60,0.14)' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 11 }}>
            <div style={{ width: 125, color: '#aeb9b0', fontSize: 13, fontWeight: 700, letterSpacing: 0.5 }}>WESTERN EUROPE</div>
            <div style={{ height: 13, width: 292, background: '#738379', opacity: 0.78 }} />
          </div>
        </div>
        <div style={{ marginTop: 16, color: '#f1eee5', fontSize: 20, fontWeight: 700, letterSpacing: 0.1 }}>Larger than Western Europe</div>
      </div>

      <div style={{ position: 'absolute', left: 104, right: 104, bottom: 58, display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#78867d', fontSize: 11, letterSpacing: 1.8, opacity: reveal(112, 145) }}>
        <span>THE RAIN SHADOW EFFECT</span>
        <span>AUSTRALIA · ANNUAL RAINFALL</span>
      </div>
    </AbsoluteFill>
  );
}