import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring, Easing } from 'remotion';

export default function MotionScene({ scene, context }: { scene: any; context: any }) {
  const frame = useCurrentFrame();
  const { heading, topic, keyMetrics } = scene || {};

  const shanghai = { x: 1440, y: 480 };
  const rotterdam = { x: 940, y: 360 };
  const suez = { x: 1100, y: 600 };

  const fadeIn = (start: number, end: number) =>
    interpolate(frame, [start, end], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.bezier(0.4, 0, 0.2, 1),
    });

  const titleSpring = spring({
    frame: frame - 5,
    fps: 30,
    config: { damping: 14, stiffness: 90, mass: 1 },
  });

  const routeDraw = interpolate(frame, [30, 95], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.4, 0, 0.2, 1),
  });

  const shipTravel = interpolate(frame, [55, 145], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.linear,
  });

  const pulse = 1 + 0.06 * Math.sin(frame * 0.25);

  const cubicBezier = (t: number, p0: {x:number;y:number}, p1: {x:number;y:number}, p2: {x:number;y:number}, p3: {x:number;y:number}) => {
    const u = 1 - t;
    const tt = t * t;
    const uu = u * u;
    const uuu = uu * u;
    const ttt = tt * t;
    return {
      x: uuu * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + ttt * p3.x,
      y: uuu * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + ttt * p3.y,
    };
  };

  const suezPosition = (t: number) => {
    if (t <= 0.5) {
      return cubicBezier(t * 2, shanghai, { x: 1320, y: 760 }, { x: 1220, y: 780 }, suez);
    }
    return cubicBezier((t - 0.5) * 2, suez, { x: 1060, y: 520 }, { x: 1010, y: 430 }, rotterdam);
  };

  const arcticPos = cubicBezier(shipTravel, shanghai, { x: 1440, y: 130 }, { x: 940, y: 130 }, rotterdam);
  const suezPos = suezPosition(shipTravel);

  const metricBase = 105;
  const metricSpring = (i: number) =>
    spring({
      frame: frame - (metricBase + i * 12),
      fps: 30,
      config: { damping: 13, stiffness: 80, mass: 0.9 },
    });

  const daysNumber = Math.round(
    interpolate(frame, [120, 152], [0, keyMetrics?.timeSavedDays || 14], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })
  );

  const milesNumber = Math.round(
    interpolate(frame, [128, 160], [0, keyMetrics?.nauticalMilesSaved || 3000], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })
  );

  const bgStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    background: 'radial-gradient(circle at 50% 40%, #0f1b31 0%, #070c18 70%, #02040a 100%)',
  };

  const overlayStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    background: 'radial-gradient(circle at 50% 50%, transparent 40%, rgba(0,0,0,0.55) 100%)',
    pointerEvents: 'none',
  };

  const titleStyle: React.CSSProperties = {
    position: 'absolute',
    top: 70,
    left: 0,
    right: 0,
    textAlign: 'center',
    opacity: titleSpring,
    transform: `translateY(${(1 - titleSpring) * -30}px)`,
  };

  const metricWrapStyle: React.CSSProperties = {
    position: 'absolute',
    left: 90,
    bottom: 90,
    display: 'flex',
    flexDirection: 'column',
    gap: 18,
  };

  const cardBase: React.CSSProperties = {
    width: 340,
    padding: '18px 22px',
    borderRadius: 8,
    background: 'rgba(15, 27, 49, 0.72)',
    borderLeft: '4px solid',
    backdropFilter: 'blur(8px)',
    color: '#e2e8f0',
    fontFamily: 'Inter, system-ui, sans-serif',
  };

  const tempBadgeStyle: React.CSSProperties = {
    position: 'absolute',
    right: 100,
    bottom: 100,
    width: 150,
    height: 150,
    borderRadius: '50%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(34, 211, 238, 0.12)',
    border: '2px solid rgba(34, 211, 238, 0.45)',
    color: '#22d3ee',
    opacity: fadeIn(140, 170),
    transform: `scale(${pulse * fadeIn(140, 170)})`,
  };

  const MetricCard = ({
    label,
    value,
    sub,
    accent,
    index,
  }: {
    label: string;
    value: string | number;
    sub: string;
    accent: string;
    index: number;
  }) => {
    const s = metricSpring(index);
    return (
      <div
        style={{
          ...cardBase,
          borderLeftColor: accent,
          opacity: s,
          transform: `translateY(${(1 - s) * 40}px)`,
        }}
      >
        <div style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: 1.2, color: '#94a3b8', marginBottom: 6 }}>
          {label}
        </div>
        <div style={{ fontSize: 34, fontWeight: 700, lineHeight: 1, marginBottom: 6 }}>{value}</div>
        <div style={{ fontSize: 14, color: '#cbd5e1' }}>{sub}</div>
      </div>
    );
  };

  return (
    <AbsoluteFill style={bgStyle}>
      <div style={overlayStyle} />

      <svg width="100%" height="100%" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', opacity: 0.18 }}>
        <defs>
          <pattern id="grid" width="120" height="120" patternUnits="userSpaceOnUse">
            <path d="M 120 0 L 0 0 0 120" fill="none" stroke="#94a3b8" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="1920" height="1080" fill="url(#grid)" />
        <line x1="0" y1="540" x2="1920" y2="540" stroke="#94a3b8" strokeWidth="1" strokeDasharray="8 8" />
        <line x1="960" y1="0" x2="960" y2="1080" stroke="#94a3b8" strokeWidth="1" strokeDasharray="8 8" />
      </svg>

      <div style={titleStyle}>
        <div style={{ fontSize: 52, fontWeight: 800, color: '#f8fafc', letterSpacing: 1.5, textTransform: 'uppercase' }}>
          {heading || 'The Arctic Shortcut'}
        </div>
        <div style={{ marginTop: 12, fontSize: 22, color: '#22d3ee', fontWeight: 500, letterSpacing: 0.5 }}>
          {topic || 'Northern Sea Route vs Suez Canal Route'}
        </div>
      </div>

      <svg width="100%" height="100%" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid meet" style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          <marker id="arcticDot" markerWidth="8" markerHeight="8" refX="4" refY="4">
            <circle cx="4" cy="4" r="3" fill="#22d3ee" />
          </marker>
          <marker id="suezDot" markerWidth="8" markerHeight="8" refX="4" refY="4">
            <circle cx="4" cy="4" r="3" fill="#f59e0b" />
          </marker>
        </defs>

        <path
          d={`M ${shanghai.x} ${shanghai.y} C ${shanghai.x} 130, ${rotterdam.x} 130, ${rotterdam.x} ${rotterdam.y}`}
          fill="none"
          stroke="#22d3ee"
          strokeWidth="5"
          strokeLinecap="round"
          pathLength="1"
          strokeDasharray="1"
          strokeDashoffset={1 - routeDraw}
          style={{ filter: 'drop-shadow(0 0 8px rgba(34,211,238,0.5))' }}
        />

        <path
          d={`M ${shanghai.x} ${shanghai.y} C 1320 760, 1220 780, ${suez.x} ${suez.y} C 1060 520, 1010 430, ${rotterdam.x} ${rotterdam.y}`}
          fill="none"
          stroke="#f59e0b"
          strokeWidth="5"
          strokeLinecap="round"
          pathLength="1"
          strokeDasharray="1"
          strokeDashoffset={1 - routeDraw}
          style={{ filter: 'drop-shadow(0 0 8px rgba(245,158,11,0.45))' }}
        />

        <g opacity={fadeIn(20, 45)}>
          <circle cx={shanghai.x} cy={shanghai.y} r="9" fill="#0ea5e9" stroke="#fff" strokeWidth="2" />
          <text x={shanghai.x + 18} y={shanghai.y + 5} fill="#e2e8f0" fontSize="18" fontFamily="Inter, system-ui, sans-serif" fontWeight="600">Shanghai</text>

          <circle cx={rotterdam.x} cy={rotterdam.y} r="9" fill="#0ea5e9" stroke="#fff" strokeWidth="2" />
          <text x={rotterdam.x - 110} y={rotterdam.y + 5} fill="#e2e8f0" fontSize="18" fontFamily="Inter, system-ui, sans-serif" fontWeight="600" textAnchor="end">Rotterdam</text>

          <circle cx={suez.x} cy={suez.y} r="6" fill="#f59e0b" stroke="#fff" strokeWidth="2" />
          <text x={suez.x + 14} y={suez.y + 5} fill="#f59e0b" fontSize="16" fontFamily="Inter, system-ui, sans-serif" fontWeight="600">Suez</text>
        </g>

        <g opacity={fadeIn(75, 95)}>
          <text x="1190" y="180" fill="#22d3ee" fontSize="20" fontFamily="Inter, system-ui, sans-serif" fontWeight="700" letterSpacing="1">
            NORTHERN SEA ROUTE
          </text>
          <text x="1220" y="720" fill="#f59e0b" fontSize="20" fontFamily="Inter, system-ui, sans-serif" fontWeight="700" letterSpacing="1">
            SUEZ CANAL ROUTE
          </text>
        </g>

        {frame >= 55 && (
          <>
            <g transform={`translate(${arcticPos.x}, ${arcticPos.y})`} opacity={fadeIn(55, 70)}>
              <circle r="10" fill="#22d3ee" stroke="#fff" strokeWidth="2" style={{ filter: 'drop-shadow(0 0 10px rgba(34,211,238,0.9))' }} />
            </g>
            <g transform={`translate(${suezPos.x}, ${suezPos.y})`} opacity={fadeIn(55, 70)}>
              <circle r="10" fill="#f59e0b" stroke="#fff" strokeWidth="2" style={{ filter: 'drop-shadow(0 0 10px rgba(245,158,11,0.9))' }} />
            </g>
          </>
        )}
      </svg>

      <div style={metricWrapStyle}>
        <MetricCard
          label="Distance"
          value={keyMetrics?.distanceSavedPct || '40% Shorter'}
          sub="via the Northern Sea Route"
          accent="#22d3ee"
          index={0}
        />
        <MetricCard
          label="Time Saved"
          value={`${daysNumber} Days`}
          sub="faster than the Suez passage"
          accent="#f59e0b"
          index={1}
        />
        <MetricCard
          label="Distance Saved"
          value={`${milesNumber.toLocaleString()} NM`}
          sub="nautical miles cut from the voyage"
          accent="#a78bfa"
          index={2}
        />
      </div>

      <div style={tempBadgeStyle}>
        <div style={{ fontSize: 38, fontWeight: 800 }}>{keyMetrics?.polarTemperatureC || -40}°C</div>
        <div style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 }}>Polar Cold</div>
      </div>
    </AbsoluteFill>
  );
}