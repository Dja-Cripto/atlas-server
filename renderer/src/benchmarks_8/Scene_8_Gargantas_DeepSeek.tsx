import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring, Easing } from 'remotion';

const FONT_SANS = 'Inter, Helvetica Neue, Helvetica, Arial, sans-serif';
const FONT_MONO = 'SF Mono, Roboto Mono, ui-monospace, Menlo, monospace';

const W = 1920;
const H = 1080;

const CX = 400;
const CY = 700;
const R = 200;
const TILT = 16;

const COL_X = 700;
const COL_W = 78;
const COL_BOT = 920;
const COL_H = 320;

const INK = '#EAF2FA';
const DIM = '#8FA6BC';
const DIM2 = '#6E8BA8';
const ACCENT = '#5AD2FF';

type MetricCardProps = {
  top: number;
  p: number;
  value: string;
  unit: string;
  label: string;
  sub: string;
  accent: string;
};

function MetricCard({ top, p, value, unit, label, sub, accent }: MetricCardProps) {
  const c = Math.min(Math.max(p, 0), 1);
  return (
    <div
      style={{
        position: 'absolute',
        left: 1000,
        top,
        width: 800,
        opacity: c,
        transform: `translateY(${(1 - c) * 26}px)`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
        <span
          style={{
            fontSize: 72,
            fontWeight: 600,
            lineHeight: 1,
            letterSpacing: '-0.03em',
            color: INK,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {value}
        </span>
        <span style={{ fontSize: 26, fontWeight: 500, color: accent }}>{unit}</span>
      </div>
      <div
        style={{
          marginTop: 16,
          fontFamily: FONT_MONO,
          fontSize: 13,
          letterSpacing: '0.26em',
          textTransform: 'uppercase',
          color: DIM2,
        }}
      >
        {label}
      </div>
      <div style={{ marginTop: 8, fontSize: 16, color: DIM }}>{sub}</div>
      <div
        style={{
          marginTop: 20,
          height: 1,
          background: 'linear-gradient(90deg, rgba(120,160,200,0.34), rgba(120,160,200,0.02))',
        }}
      />
    </div>
  );
}

export default function MotionScene({ scene, context }: { scene: any; context: any }) {
  const frame = useCurrentFrame();
  const fps = 30;

  const heading: string = scene?.heading ?? "Altering Earth's Spin";
  const topic: string =
    scene?.topic ?? "How the Three Gorges Dam Shifted Earth's Axis";
  const km = scene?.keyMetrics ?? {};
  const waterVol: number = km.waterVolumeBillionM3 ?? 39.3;
  const elevationM: number = km.elevationMeters ?? 175;
  const slowUs: number = km.rotationSlowMicroseconds ?? 0.06;
  const shiftCm: number = km.axisShiftCentimeters ?? 2;

  // ---------- beats ----------
  const pKicker = interpolate(frame, [2, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const pTitle = spring({ frame: frame - 6, fps, config: { damping: 20, stiffness: 85, mass: 1 } });
  const pSub = interpolate(frame, [18, 40], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const pRule = interpolate(frame, [24, 56], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  const pGlobe = interpolate(frame, [26, 60], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const sGlobe = spring({ frame: frame - 26, fps, config: { damping: 22, stiffness: 60, mass: 1 } });

  const pFill = interpolate(frame, [44, 112], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });
  const pShift = interpolate(frame, [96, 156], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });

  const cSlow = interpolate(frame, [104, 146], [0, slowUs], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const cShift = interpolate(frame, [134, 172], [0, shiftCm], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  const sCard1 = spring({ frame: frame - 60, fps, config: { damping: 20, stiffness: 80, mass: 1 } });
  const sCard2 = spring({ frame: frame - 104, fps, config: { damping: 20, stiffness: 80, mass: 1 } });
  const sCard3 = spring({ frame: frame - 134, fps, config: { damping: 20, stiffness: 80, mass: 1 } });

  // ---------- globe maths ----------
  const rotationLag = frame > 118 ? 5 * (1 - Math.exp(-(frame - 118) / 40)) : 0;
  const spin = frame * 1.15 - rotationLag;

  const meridianEls = [0, 1, 2, 3, 4, 5].map((i) => {
    const lam = ((i * 30 + spin) * Math.PI) / 180;
    const cosv = Math.cos(lam);
    const rx = Math.max(Math.abs(cosv) * R, 1);
    const front = cosv > 0;
    return (
      <ellipse
        key={i}
        cx={CX}
        cy={CY}
        rx={rx}
        ry={R}
        fill='none'
        stroke={front ? 'rgba(122,205,255,0.55)' : 'rgba(122,205,255,0.16)'}
        strokeWidth={front ? 1.3 : 1}
      />
    );
  });

  const latEls = [-60, -30, 0, 30, 60].map((deg) => {
    const phi = (deg * Math.PI) / 180;
    const r = R * Math.cos(phi);
    const y = CY - R * Math.sin(phi);
    return (
      <ellipse
        key={deg}
        cx={CX}
        cy={y}
        rx={r}
        ry={r * 0.26}
        fill='none'
        stroke='rgba(122,205,255,0.26)'
        strokeWidth={1}
      />
    );
  });

  const tiltRad = (TILT * Math.PI) / 180;
  const dirX = Math.sin(tiltRad);
  const dirY = -Math.cos(tiltRad);
  const axisHalf = R * 1.3;
  const axisShift = 16 * pShift;

  const topX = CX + dirX * axisHalf;
  const topY = CY + dirY * axisHalf;
  const botX = CX - dirX * axisHalf;
  const botY = CY - dirY * axisHalf;

  // ---------- reservoir maths ----------
  const surfaceY = COL_BOT - COL_H * pFill;
  const elevationNow = elevationM * pFill;
  const volumeNow = waterVol * pFill;

  const titleWords = heading.split(' ');
  const titleLead = titleWords.slice(0, -1).join(' ');
  const titleAccent = titleWords.slice(-1).join(' ');

  return (
    <AbsoluteFill style={{ backgroundColor: '#05070C', fontFamily: FONT_SANS, overflow: 'hidden' }}>
      {/* background wash */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 36% 58%, #16273E 0%, #0A1119 46%, #04060A 100%)',
        }}
      />
      {/* grid */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(120,170,220,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(120,170,220,0.05) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
          maskImage: 'radial-gradient(ellipse at 44% 56%, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0) 72%)',
          WebkitMaskImage:
            'radial-gradient(ellipse at 44% 56%, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0) 72%)',
        }}
      />

      {/* ---------- GLOBE ---------- */}
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <radialGradient id='sphereGrad' cx='35%' cy='30%' r='85%'>
            <stop offset='0%' stopColor='#1E3A57' />
            <stop offset='55%' stopColor='#0E1D2E' />
            <stop offset='100%' stopColor='#060B13' />
          </radialGradient>
          <radialGradient id='glowGrad' cx='50%' cy='50%' r='50%'>
            <stop offset='50%' stopColor='rgba(90,210,255,0.20)' />
            <stop offset='100%' stopColor='rgba(90,210,255,0)' />
          </radialGradient>
          <linearGradient id='axisGrad' x1='0' y1='0' x2='0' y2='1'>
            <stop offset='0%' stopColor='rgba(90,210,255,0)' />
            <stop offset='18%' stopColor='rgba(90,210,255,0.95)' />
            <stop offset='82%' stopColor='rgba(90,210,255,0.95)' />
            <stop offset='100%' stopColor='rgba(90,210,255,0)' />
          </linearGradient>
          <clipPath id='globeClip'>
            <circle cx={CX} cy={CY} r={R - 1} />
          </clipPath>
        </defs>

        <g
          opacity={pGlobe}
          transform={`translate(${CX} ${CY}) scale(${0.88 + 0.12 * sGlobe}) translate(${-CX} ${-CY})`}
        >
          <circle cx={CX} cy={CY} r={R * 1.6} fill='url(#glowGrad)' />
          <circle cx={CX} cy={CY} r={R} fill='url(#sphereGrad)' />

          <g clipPath='url(#globeClip)'>
            <g transform={`rotate(${TILT} ${CX} ${CY})`}>
              {meridianEls}
              {latEls}
            </g>
          </g>

          <circle
            cx={CX}
            cy={CY}
            r={R}
            fill='none'
            stroke='rgba(120,190,240,0.45)'
            strokeWidth={1.4}
          />

          {/* ghost (original) axis */}
          <line
            x1={botX}
            y1={botY}
            x2={topX}
            y2={topY}
            stroke='rgba(140,180,215,0.35)'
            strokeWidth={1}
            strokeDasharray='5 7'
          />

          {/* current axis */}
          <line
            x1={botX - axisShift}
            y1={botY}
            x2={topX + axisShift}
            y2={topY}
            stroke='url(#axisGrad)'
            strokeWidth={2.2}
            strokeLinecap='round'
          />

          {/* pole marker */}
          <circle cx={topX + axisShift} cy={topY} r={5} fill={ACCENT} />
          <circle
            cx={topX + axisShift}
            cy={topY}
            r={5 + 9 * pShift}
            fill='none'
            stroke='rgba(90,210,255,0.5)'
            strokeWidth={1}
            opacity={1 - 0.6 * pShift}
          />

          <g opacity={Math.max(0, (pShift - 0.25) / 0.75)}>
            <line
              x1={topX + 10}
              y1={topY - 16}
              x2={topX + axisShift + 10}
              y2={topY - 6}
              stroke='rgba(90,210,255,0.7)'
              strokeWidth={1}
            />
            <text
              x={topX + 26}
              y={topY - 22}
              fill={DIM2}
              fontFamily={FONT_MONO}
              fontSize={11}
              letterSpacing='0.24em'
            >
              POLE SHIFT
            </text>
            <text
              x={topX + 26}
              y={topY + 6}
              fill={INK}
              fontFamily={FONT_SANS}
              fontSize={22}
              fontWeight={600}
            >
              {cShift.toFixed(1)} cm
            </text>
          </g>
        </g>

        <text
          x={CX}
          y={CY + R + 96}
          textAnchor='middle'
          fill='rgba(140,175,210,0.55)'
          fontFamily={FONT_MONO}
          fontSize={11}
          letterSpacing='0.22em'
          opacity={pShift * 0.9}
        >
          AXIS DISPLACEMENT EXAGGERATED FOR SCALE
        </text>
      </svg>

      {/* ---------- RESERVOIR COLUMN ---------- */}
      <div
        style={{
          position: 'absolute',
          left: COL_X,
          top: COL_BOT - COL_H,
          width: COL_W,
          height: COL_H,
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: COL_H * pFill,
            background:
              'linear-gradient(180deg, rgba(120,225,255,0.95) 0%, rgba(60,150,220,0.78) 45%, rgba(24,80,140,0.62) 100%)',
            boxShadow: '0 0 60px rgba(90,200,255,0.30)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: -6,
            right: -6,
            top: COL_H - COL_H * pFill - 1,
            height: 2,
            background: 'rgba(190,245,255,0.95)',
            boxShadow: '0 0 18px rgba(120,225,255,0.9)',
            opacity: pFill > 0.005 ? 1 : 0,
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderLeft: '1px solid rgba(130,175,215,0.40)',
            borderRight: '1px solid rgba(130,175,215,0.40)',
            borderBottom: '1px solid rgba(130,175,215,0.55)',
          }}
        />
        {[50, 100, 150].map((m) => (
          <div
            key={m}
            style={{
              position: 'absolute',
              left: -20,
              top: COL_H - (m / elevationM) * COL_H,
              width: 12,
              height: 1,
              background: 'rgba(130,175,215,0.45)',
            }}
          />
        ))}
        <div
          style={{
            position: 'absolute',
            left: -34,
            right: -8,
            top: 0,
            borderTop: '1px dashed rgba(130,175,215,0.5)',
          }}
        />
      </div>

      {/* riding elevation readout */}
      <div
        style={{
          position: 'absolute',
          left: COL_X + COL_W + 24,
          top: surfaceY - 40,
          opacity: pFill > 0.02 ? 1 : 0,
        }}
      >
        <div
          style={{
            fontFamily: FONT_MONO,
            fontSize: 11,
            letterSpacing: '0.26em',
            color: DIM2,
          }}
        >
          ELEVATION
        </div>
        <div
          style={{
            marginTop: 4,
            fontSize: 34,
            fontWeight: 600,
            color: INK,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {elevationNow.toFixed(0)}
          <span style={{ fontSize: 18, color: ACCENT, marginLeft: 6 }}>m</span>
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          left: COL_X + COL_W / 2 - 140,
          top: COL_BOT + 20,
          width: 280,
          textAlign: 'center',
          fontFamily: FONT_MONO,
          fontSize: 11,
          letterSpacing: '0.22em',
          color: DIM2,
        }}
      >
        THREE GORGES RESERVOIR / FULL POOL
      </div>

      {/* ---------- HEADER ---------- */}
      <div style={{ position: 'absolute', left: 120, top: 92, width: 1200 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, opacity: pKicker }}>
          <div style={{ width: 34, height: 1, background: 'rgba(90,210,255,0.85)' }} />
          <div
            style={{
              fontFamily: FONT_MONO,
              fontSize: 13,
              letterSpacing: '0.34em',
              textTransform: 'uppercase',
              color: ACCENT,
            }}
          >
            Planetary Mechanics / 03
          </div>
        </div>

        <h1
          style={{
            margin: '22px 0 0',
            fontSize: 76,
            lineHeight: 1.02,
            fontWeight: 600,
            letterSpacing: '-0.03em',
            color: INK,
            opacity: pTitle,
            transform: `translateY(${(1 - pTitle) * 28}px)`,
          }}
        >
          {titleLead} <span style={{ color: ACCENT }}>{titleAccent}</span>
        </h1>

        <div
          style={{
            marginTop: 18,
            fontSize: 26,
            color: DIM,
            opacity: pSub,
            transform: `translateY(${(1 - pSub) * 16}px)`,
          }}
        >
          {topic}
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          left: 120,
          top: 330,
          height: 1,
          width: 1680 * pRule,
          background: 'linear-gradient(90deg, rgba(90,210,255,0.55), rgba(120,160,200,0.08))',
        }}
      />

      {/* ---------- METRICS ---------- */}
      <MetricCard
        top={470}
        p={sCard1}
        value={volumeNow.toFixed(1)}
        unit={'\u00D710\u2079 m\u00B3'}
        label='Water Held Back'
        sub='reservoir capacity at full pool'
        accent={ACCENT}
      />
      <MetricCard
        top={650}
        p={sCard2}
        value={cSlow.toFixed(2)}
        unit={'\u00B5s'}
        label='Rotation Slowed'
        sub='added to the length of an Earth day'
        accent={'#7AF0D0'}
      />
      <MetricCard
        top={830}
        p={sCard3}
        value={cShift.toFixed(0)}
        unit='cm'
        label='Axis Displacement'
        sub='movement of the geographic pole'
        accent={'#FFB454'}
      />

      {/* ---------- GRADE ---------- */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 38%, rgba(0,0,0,0.58) 100%)',
          pointerEvents: 'none',
        }}
      />
      <svg
        width={W}
        height={H}
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.05,
          mixBlendMode: 'overlay',
          pointerEvents: 'none',
        }}
      >
        <filter id='grain'>
          <feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves={3} stitchTiles='stitch' />
        </filter>
        <rect width={W} height={H} filter='url(#grain)' />
      </svg>
    </AbsoluteFill>
  );
}