import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring, Easing } from 'remotion';

export default function MotionScene({ scene, context }: { scene: any; context: any }) {
  const frame = useCurrentFrame();
  const fps = scene.fps ?? 30;

  // Springs & interpolations
  const earthIn = spring({ frame, fps, from: 0, to: 1, durationInFrames: 30, config: { damping: 14 } });
  const damIn = spring({ frame: frame - 15, fps, from: 0, to: 1, durationInFrames: 30, config: { damping: 14 } });
  const waterFill = interpolate(frame, [60, 110], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic) });
  const axisTilt = interpolate(frame, [70, 130], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  const rotation = interpolate(frame, [0, 180], [0, 360], { extrapolateRight: 'extend' });
  const rotationSlow = interpolate(frame, [70, 130], [1, 0.92], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const massArc = interpolate(frame, [75, 140], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic) });

  const headingIn = spring({ frame: frame - 5, fps, from: 0, to: 1, durationInFrames: 25 });
  const captionIn = spring({ frame: frame - 140, fps, from: 0, to: 1, durationInFrames: 25 });

  const card1 = spring({ frame: frame - 135, fps, from: 0, to: 1, durationInFrames: 20 });
  const card2 = spring({ frame: frame - 142, fps, from: 0, to: 1, durationInFrames: 20 });
  const card3 = spring({ frame: frame - 149, fps, from: 0, to: 1, durationInFrames: 20 });
  const card4 = spring({ frame: frame - 156, fps, from: 0, to: 1, durationInFrames: 20 });

  // Earth center
  const earthCx = 560;
  const earthCy = 560;
  const earthR = 260;

  // Axis tilt: 2cm scaled. We'll tilt the axis line by ~3 degrees visually, with a 2cm offset marker.
  const tiltDeg = axisTilt * 3.2;

  // Dam profile (right side)
  const damX = 1280;
  const damTopY = 380;
  const damBottomY = 780;
  const damWidth = 260;
  const damHeight = damBottomY - damTopY;
  const waterTopY = damBottomY - damHeight * waterFill;

  // Rotation indicator ring
  const ringR = 300;

  return (
    <AbsoluteFill style={{ background: '#070e14', fontFamily: 'Inter, Helvetica, Arial, sans-serif', color: '#e8eef3' }}>
      {/* Subtle grid */}
      <svg width="1920" height="1080" style={{ position: 'absolute', opacity: 0.08 }}>
        <defs>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#4cc9f0" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="1920" height="1080" fill="url(#grid)" />
      </svg>

      {/* Heading */}
      <div style={{
        position: 'absolute',
        top: 90,
        left: 0,
        right: 0,
        textAlign: 'center',
        opacity: headingIn,
        transform: `translateY(${interpolate(headingIn, [0, 1], [20, 0])}px)`
      }}>
        <div style={{ fontSize: 18, letterSpacing: 6, color: '#e5a93c', fontWeight: 600, marginBottom: 10 }}>
          GEOPHYSICS · MOMENT OF INERTIA
        </div>
        <div style={{ fontSize: 58, fontWeight: 800, letterSpacing: -1 }}>
          Altering Earth's Spin
        </div>
        <div style={{ fontSize: 20, color: '#8aa0ae', marginTop: 8, fontWeight: 400 }}>
          How the Three Gorges Dam Shifted Earth's Axis
        </div>
      </div>

      {/* Earth + axis */}
      <svg width="1920" height="1080" style={{ position: 'absolute', top: 0, left: 0 }}>
        <g transform={`translate(${earthCx} ${earthCy})`}
           style={{ opacity: earthIn, transform: `scale(${0.85 + 0.15 * earthIn})` }}>
          {/* Rotation ring */}
          <circle cx="0" cy="0" r={ringR} fill="none" stroke="#1a2f3a" strokeWidth="1" strokeDasharray="2 6" />
          <g style={{ transform: `rotate(${rotation * rotationSlow}deg)`, transformOrigin: '0 0' }}>
            <circle cx="0" cy="0" r={ringR} fill="none" stroke="#4cc9f0" strokeWidth="1.5" strokeDasharray="4 180" opacity="0.7" />
          </g>

          {/* Earth sphere */}
          <defs>
            <radialGradient id="earthGrad" cx="35%" cy="35%" r="75%">
              <stop offset="0%" stopColor="#1b3a4a" />
              <stop offset="60%" stopColor="#0f1c24" />
              <stop offset="100%" stopColor="#070e14" />
            </radialGradient>
            <clipPath id="earthClip">
              <circle cx="0" cy="0" r={earthR} />
            </clipPath>
          </defs>
          <circle cx="0" cy="0" r={earthR} fill="url(#earthGrad)" stroke="#2a4a5c" strokeWidth="1.5" />

          {/* Meridians rotating */}
          <g clipPath="url(#earthClip)" style={{ transform: `rotate(${rotation * rotationSlow * 0.5}deg)`, transformOrigin: '0 0' }}>
            {[-60, -30, 0, 30, 60].map((m, i) => (
              <ellipse key={i} cx="0" cy="0" rx={Math.abs(Math.cos((m * Math.PI) / 180)) * earthR}
                ry={earthR} fill="none" stroke="#4cc9f0" strokeWidth="0.8" opacity="0.25"
                transform={`translate(${Math.sin((m * Math.PI) / 180) * earthR * 0.0} 0)`} />
            ))}
            {[-60, -30, 0, 30, 60].map((p, i) => (
              <line key={`p${i}`} x1={-earthR} y1={Math.sin((p * Math.PI) / 180) * earthR}
                x2={earthR} y2={Math.sin((p * Math.PI) / 180) * earthR}
                stroke="#4cc9f0" strokeWidth="0.8" opacity="0.2" />
            ))}
            {/* Stylized continent hint */}
            <path d="M -120 -40 Q -80 -90 -20 -70 Q 40 -60 80 -100 Q 140 -80 120 -20 Q 90 30 40 20 Q -20 40 -80 10 Q -140 -10 -120 -40 Z"
              fill="#1f4a3a" opacity="0.55" />
          </g>

          {/* Axis line — tilts */}
          <g style={{ transform: `rotate(${tiltDeg}deg)`, transformOrigin: '0 0' }}>
            <line x1="0" y1={-earthR - 80} x2="0" y2={earthR + 80}
              stroke="#e5a93c" strokeWidth="2" strokeDasharray="6 4" />
            <circle cx="0" cy={-earthR - 80} r="6" fill="#e5a93c" />
            <circle cx="0" cy={earthR + 80} r="6" fill="#e5a93c" />
            <text x="14" y={-earthR - 75} fill="#e5a93c" fontSize="14" fontWeight="700" letterSpacing="2">N POLE</text>
          </g>

          {/* Reference axis (original, no tilt) shown faintly */}
          {axisTilt > 0.05 && (
            <line x1="0" y1={-earthR - 80} x2="0" y2={earthR + 80}
              stroke="#e5a93c" strokeWidth="1" strokeDasharray="2 6" opacity={0.35} />
          )}

          {/* 2cm offset marker */}
          {axisTilt > 0.3 && (
            <g style={{ opacity: interpolate(axisTilt, [0.3, 1], [0, 1]) }}>
              <line x1="0" y1={-earthR - 80} x2={Math.sin((tiltDeg * Math.PI) / 180) * 80}
                y2={-earthR - 80 - Math.cos((tiltDeg * Math.PI) / 180) * 80 + 80}
                stroke="#e63946" strokeWidth="1" strokeDasharray="3 3" />
              <g transform={`translate(${Math.sin((tiltDeg * Math.PI) / 180) * 90} ${-earthR - 110})`}>
                <rect x="-60" y="-18" width="120" height="28" fill="#e63946" rx="3" />
                <text x="0" y="2" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="700">2 cm shift</text>
              </g>
            </g>
          )}
        </g>
      </svg>

      {/* Mass transfer arc from dam reservoir to pole */}
      <svg width="1920" height="1080" style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
        <defs>
          <linearGradient id="arcGrad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#4cc9f0" stopOpacity="0" />
            <stop offset="50%" stopColor="#4cc9f0" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#e5a93c" stopOpacity="0.9" />
          </linearGradient>
        </defs>
        {massArc > 0 && (
          <path
            d={`M ${damX} ${damTopY + 40} Q ${(damX + earthCx) / 2} ${200} ${earthCx} ${earthCy - earthR - 80}`}
            fill="none" stroke="url(#arcGrad)" strokeWidth="2"
            strokeDasharray="200"
            strokeDashoffset={200 - 200 * massArc}
            opacity={0.8}
          />
        )}
        {massArc > 0.5 && (
          <g style={{ opacity: interpolate(massArc, [0.5, 1], [0, 1]) }}>
            <text x={(damX + earthCx) / 2 - 40} y="190" fill="#4cc9f0" fontSize="13" fontWeight="600" letterSpacing="2">
              MASS REDISTRIBUTED ↑
            </text>
          </g>
        )}
      </svg>

      {/* Dam cross-section */}
      <svg width="1920" height="1080" style={{ position: 'absolute', top: 0, left: 0 }}>
        <g style={{ opacity: damIn }}>
          {/* Ground */}
          <line x1={damX - 80} y1={damBottomY} x2={damX + damWidth + 80} y2={damBottomY}
            stroke="#2a4a5c" strokeWidth="2" />
          {/* Dam trapezoid */}
          <polygon
            points={`${damX},${damTopY} ${damX + damWidth * 0.2},${damTopY} ${damX + damWidth},${damBottomY} ${damX - damWidth * 0.15},${damBottomY}`}
            fill="#1a2f3a" stroke="#4cc9f0" strokeWidth="1.5" opacity="0.9" />
          {/* Water */}
          <clipPath id="damClip">
            <polygon points={`${damX},${damTopY} ${damX + damWidth * 0.2},${damTopY} ${damX + damWidth},${damBottomY} ${damX - damWidth * 0.15},${damBottomY}`} />
          </clipPath>
          <g clipPath="url(#damClip)">
            <rect x={damX - 100} y={waterTopY} width={damWidth + 200} height={damBottomY - waterTopY}
              fill="#4cc9f0" opacity="0.55" />
            {/* Water surface shimmer */}
            <line x1={damX - 80} y1={waterTopY} x2={damX + damWidth + 60} y2={waterTopY}
              stroke="#e8eef3" strokeWidth="1.5" opacity={waterFill} />
          </g>

          {/* Elevation marker */}
          <g style={{ opacity: interpolate(waterFill, [0.2, 0.6], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>
            <line x1={damX + damWidth + 20} y1={damBottomY} x2={damX + damWidth + 20} y2={damTopY}
              stroke="#e5a93c" strokeWidth="1" strokeDasharray="3 3" />
            <line x1={damX + damWidth + 10} y1={damBottomY} x2={damX + damWidth + 30} y2={damBottomY}
              stroke="#e5a93c" strokeWidth="1" />
            <line x1={damX + damWidth + 10} y1={damTopY} x2={damX + damWidth + 30} y2={damTopY}
              stroke="#e5a93c" strokeWidth="1" />
            <text x={damX + damWidth + 40} y={(damTopY + damBottomY) / 2 + 5}
              fill="#e5a93c" fontSize="16" fontWeight="700">175 m</text>
            <text x={damX + damWidth + 40} y={(damTopY + damBottomY) / 2 + 24}
              fill="#8aa0ae" fontSize="11" letterSpacing="2">ELEVATION</text>
          </g>

          {/* Dam label */}
          <text x={damX + damWidth / 2} y={damBottomY + 30} textAnchor="middle"
            fill="#e8eef3" fontSize="15" fontWeight="700" letterSpacing="3">
            THREE GORGES DAM
          </text>
          <text x={damX + damWidth / 2} y={damBottomY + 50} textAnchor="middle"
            fill="#8aa0ae" fontSize="11" letterSpacing="2">
            YANGTZE RIVER · CHINA
          </text>
        </g>
      </svg>

      {/* Rotation slowdown indicator */}
      <g style={{ position: 'absolute', left: 180, top: 880, opacity: interpolate(frame, [60, 90], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>
        <svg width="300" height="80">
          <text x="0" y="20" fill="#8aa0ae" fontSize="11" letterSpacing="3">ROTATION Δ</text>
          <rect x="0" y="30" width="260" height="8" fill="#1a2f3a" rx="2" />
          <rect x="0" y="30" width={260 * rotationSlow} height="8" fill="#e5a93c" rx="2" />
          <text x="0" y="60" fill="#e8eef3" fontSize="14" fontWeight="700">
            −0.06 μs / day
          </text>
        </svg>
      </g>

      {/* Metric cards */}
      <div style={{ position: 'absolute', right: 100, top: 820, display: 'flex', gap: 14 }}>
        {[
          { v: '39.3', u: 'B m³', l: 'WATER VOLUME', c: card1, color: '#4cc9f0' },
          { v: '175', u: 'm', l: 'ELEVATION', c: card2, color: '#4cc9f0' },
          { v: '0.06', u: 'μs', l: 'SLOWDOWN', c: card3, color: '#e5a93c' },
          { v: '2', u: 'cm', l: 'POLE SHIFT', c: card4, color: '#e63946' },
        ].map((m, i) => (
          <div key={i} style={{
            opacity: m.c,
            transform: `translateY(${interpolate(m.c, [0, 1], [20, 0])}px)`,
            background: 'rgba(15, 28, 36, 0.85)',
            border: `1px solid ${m.color}`,
            borderRadius: 4,
            padding: '12px 18px',
            minWidth: 110,
          }}>
            <div style={{ fontSize: 10, color: '#8aa0ae', letterSpacing: 2, marginBottom: 4 }}>{m.l}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: m.color, lineHeight: 1 }}>
              {m.v}<span style={{ fontSize: 14, color: '#e8eef3', marginLeft: 4 }}>{m.u}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Caption */}
      <div style={{
        position: 'absolute',
        bottom: 90,
        left: 180,
        right: 180,
        opacity: captionIn,
        transform: `translateY(${interpolate(captionIn, [0, 1], [15, 0])}px)`,
        borderTop: '1px solid #2a4a5c',
        paddingTop: 16,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ fontSize: 18, fontWeight: 500, color: '#e8eef3', maxWidth: 1100 }}>
          <span style={{ color: '#4cc9f0' }}>39.3 billion m³</span> raised <span style={{ color: '#4cc9f0' }}>175 m</span>\ —
          moment of inertia increased — rotation slowed <span style={{ color: '#e5a93c' }}>0.06 μs</span> — pole shifted <span style={{ color: '#e63946' }}>2 cm</span>.
        </div>
        <div style={{ fontSize: 11, color: '#8aa0ae', letterSpacing: 3 }}>SOURCE · NASA JPL / SCIENCE 2008</div>
      </div>

      {/* Corner frame markers */}
      {[[90, 70], [1830, 70], [90, 1010], [1830, 1010]].map((p, i) => (
        <div key={i} style={{
          position: 'absolute', left: p[0], top: p[1],
          width: 20, height: 20,
          borderTop: i < 2 ? '2px solid #e5a93c' : 'none',
          borderBottom: i >= 2 ? '2px solid #e5a93c' : 'none',
          borderLeft: i % 2 === 0 ? '2px solid #e5a93c' : 'none',
          borderRight: i % 2 === 1 ? '2px solid #e5a93c' : 'none',
        }} />
      ))}
    </AbsoluteFill>
  );
}