import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring, Easing } from 'remotion';

export default function MotionScene({scene, context}: {scene: any; context: any}) {
  const frame = useCurrentFrame();
  const { fps } = scene;

  // Colors
  const bg = '#070e14';
  const land = '#0f1c24';
  const landStroke = '#1a2b38';
  const grid = '#121e29';
  const gold = '#e5a93c';
  const red = '#e63946';
  const textMain = '#ffffff';
  const textMuted = '#8b9bb4';

  // Animations
  const gridOpacity = interpolate(frame, [0, 20], [0, 0.5], { extrapolateRight: 'clamp' });
  const titleOpacity = interpolate(frame, [10, 30], [0, 1], { extrapolateRight: 'clamp' });
  const titleY = interpolate(frame, [10, 30], [20, 0], { extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) });
  
  const landOpacity = interpolate(frame, [20, 50], [0, 1], { extrapolateRight: 'clamp' });
  
  const dashOffset = interpolate(frame, [40, 180], [1200, 0]);
  const routeOpacity = interpolate(frame, [40, 60], [0, 0.8], { extrapolateRight: 'clamp' });
  const routePulse = interpolate(frame, [60, 90, 120, 150, 180], [0.8, 1, 0.8, 1, 0.8], { extrapolateRight: 'clamp' });

  // Springs for HUD
  const m1Spring = spring({ frame: frame - 40, fps, config: { damping: 12, stiffness: 100 } });
  const m2Spring = spring({ frame: frame - 70, fps, config: { damping: 12, stiffness: 100 } });
  const m3Spring = spring({ frame: frame - 90, fps, config: { damping: 12, stiffness: 100 } });
  const m4Spring = spring({ frame: frame - 120, fps, config: { damping: 15, stiffness: 80 } });
  
  const bracketSpring = spring({ frame: frame - 120, fps, config: { damping: 10, stiffness: 120 } });
  const bracketScaleY = interpolate(bracketSpring, [0, 1], [0.5, 1]);
  const bracketOpacity = interpolate(bracketSpring, [0, 1], [0, 1]);

  // Shared Styles
  const hudCardStyle: React.CSSProperties = {
    position: 'absolute',
    padding: '20px 24px',
    backgroundColor: 'rgba(15, 28, 36, 0.85)',
    border: '1px solid #1a2b38',
    borderRadius: '4px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  };

  return (
    <AbsoluteFill style={{ backgroundColor: bg }}>
      {/* Grid Background */}
      <div style={{
        position: 'absolute', width: '100%', height: '100%', opacity: gridOpacity,
        backgroundImage: `linear-gradient(${grid} 1px, transparent 1px), linear-gradient(90deg, ${grid} 1px, transparent 1px)`,
        backgroundSize: '60px 60px'
      }} />

      {/* Map Schematic */}
      <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{ position: 'absolute', top: 0, left: 0 }}>
        <g opacity={landOpacity}>
          {/* Top Landmass (Malay Peninsula) */}
          <path d="M 80 60 L 1840 60 L 1840 350 L 1100 450 L 800 420 L 80 250 Z" fill={land} stroke={landStroke} strokeWidth="2" />
          {/* Bottom Landmass (Sumatra) */}
          <path d="M 80 1020 L 1840 1020 L 1840 750 L 1150 600 L 850 630 L 80 800 Z" fill={land} stroke={landStroke} strokeWidth="2" />
          
          {/* Topographical Accents */}
          <path d="M 80 120 L 1840 120 M 80 180 L 1400 180" stroke={landStroke} strokeWidth="1" opacity="0.5" fill="none" />
          <path d="M 80 960 L 1840 960 M 300 900 L 1840 900" stroke={landStroke} strokeWidth="1" opacity="0.5" fill="none" />
        </g>

        {/* Traffic Routes */}
        <g opacity={routeOpacity * routePulse}>
          <path d="M 150 850 Q 600 650 1050 525 T 1750 250" fill="none" stroke={gold} strokeWidth="3" strokeDasharray="12 12" strokeDashoffset={dashOffset} />
          <path d="M 200 800 Q 650 600 1050 540 T 1700 300" fill="none" stroke={gold} strokeWidth="2" strokeDasharray="8 16" strokeDashoffset={dashOffset * 1.2} opacity="0.7" />
          <path d="M 100 900 Q 550 700 1050 510 T 1800 200" fill="none" stroke={gold} strokeWidth="4" strokeDasharray="20 20" strokeDashoffset={dashOffset * 0.8} opacity="0.9" />
        </g>

        {/* Chokepoint Brackets */}
        <g opacity={bracketOpacity} transform={`translate(1050, 525) scale(1, ${bracketScaleY}) translate(-1050, -525)`}>
          {/* Left Bracket */}
          <path d="M 980 440 L 960 440 L 960 610 L 980 610" fill="none" stroke={red} strokeWidth="4" />
          {/* Right Bracket */}
          <path d="M 1120 440 L 1140 440 L 1140 610 L 1120 610" fill="none" stroke={red} strokeWidth="4" />
          {/* Center Crosshair */}
          <circle cx="1050" cy="525" r="4" fill={red} />
          <line x1="1030" y1="525" x2="1070" y2="525" stroke={red} strokeWidth="1" opacity="0.5" />
          <line x1="1050" y1="505" x2="1050" y2="545" stroke={red} strokeWidth="1" opacity="0.5" />
        </g>
      </svg>

      {/* Title */}
      <div style={{
        position: 'absolute', top: 80, left: 0, width: '100%', textAlign: 'center',
        opacity: titleOpacity, transform: `translateY(${titleY}px)`,
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{ fontSize: '14px', fontWeight: 600, color: gold, letterSpacing: '4px', marginBottom: '8px' }}>STRAIT OF MALACCA</div>
        <div style={{ fontSize: '42px', fontWeight: 800, color: textMain, letterSpacing: '1px' }}>THE 1.7-MILE CHOKEPOINT</div>
      </div>

      {/* HUD: Top Left (Ships) */}
      <div style={{
        ...hudCardStyle, top: 140, left: 100,
        opacity: m1Spring, transform: `translateX(${interpolate(m1Spring, [0, 1], [-30, 0])}px)`
      }}>
        <div style={{ fontSize: '48px', fontWeight: 800, color: textMain, lineHeight: 1 }}>84,000</div>
        <div style={{ fontSize: '13px', fontWeight: 600, color: textMuted, letterSpacing: '2px', marginTop: '8px' }}>ANNUAL SHIP TRANSITS</div>
      </div>

      {/* HUD: Top Right (Oil) */}
      <div style={{
        ...hudCardStyle, top: 140, right: 100, textAlign: 'right',
        opacity: m2Spring, transform: `translateX(${interpolate(m2Spring, [0, 1], [30, 0])}px)`
      }}>
        <div style={{ fontSize: '48px', fontWeight: 800, color: gold, lineHeight: 1 }}>25%</div>
        <div style={{ fontSize: '13px', fontWeight: 600, color: textMuted, letterSpacing: '2px', marginTop: '8px' }}>GLOBAL OIL SHARE</div>
      </div>

      {/* HUD: Bottom Left (Value) */}
      <div style={{
        ...hudCardStyle, bottom: 140, left: 100,
        opacity: m3Spring, transform: `translateX(${interpolate(m3Spring, [0, 1], [-30, 0])}px)`
      }}>
        <div style={{ fontSize: '48px', fontWeight: 800, color: textMain, lineHeight: 1 }}>$3.5T</div>
        <div style={{ fontSize: '13px', fontWeight: 600, color: textMuted, letterSpacing: '2px', marginTop: '8px' }}>TRADED GOODS VALUE</div>
      </div>

      {/* Chokepoint Label */}
      <div style={{
        position: 'absolute', top: 420, left: 1050, transform: 'translateX(-50%)',
        opacity: m4Spring, fontFamily: 'system-ui, -apple-system, sans-serif', textAlign: 'center',
        textShadow: '0px 4px 12px rgba(0,0,0,0.8)'
      }}>
        <div style={{ fontSize: '56px', fontWeight: 900, color: red, lineHeight: 1, letterSpacing: '-1px' }}>1.7 MILES</div>
        <div style={{ fontSize: '14px', fontWeight: 700, color: red, letterSpacing: '3px', marginTop: '4px', opacity: 0.9 }}>MINIMUM WIDTH</div>
      </div>

      {/* Tech Accents */}
      <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
        {/* Corner Brackets */}
        <path d="M 80 100 L 80 60 L 120 60" fill="none" stroke={textMuted} strokeWidth="2" opacity="0.3" />
        <path d="M 1840 100 L 1840 60 L 1800 60" fill="none" stroke={textMuted} strokeWidth="2" opacity="0.3" />
        <path d="M 80 980 L 80 1020 L 120 1020" fill="none" stroke={textMuted} strokeWidth="2" opacity="0.3" />
        <path d="M 1840 980 L 1840 1020 L 1800 1020" fill="none" stroke={textMuted} strokeWidth="2" opacity="0.3" />
        
        {/* Coordinate Labels */}
        <text x="90" y="80" fill={textMuted} fontSize="10" fontFamily="monospace" opacity="0.5">LAT 1.2° N</text>
        <text x="1780" y="80" fill={textMuted} fontSize="10" fontFamily="monospace" opacity="0.5">LON 103.8° E</text>
      </svg>
    </AbsoluteFill>
  );
}