import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring, Easing } from 'remotion';

export default function Scene_4_Qwen_Max({ scene, context }: { scene: any; context: any }) {
  const frame = useCurrentFrame();
  const fps = scene.fps || 30;
  const duration = scene.durationInFrames || 180;

  // --- Global reveals ---
  const titleIn = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: 'clamp' });
  const diagramIn = interpolate(frame, [6, 30], [0, 1], { extrapolateRight: 'clamp' });

  // --- Water level drains from 100% to 60% between frames 50 and 130 ---
  const waterFill = interpolate(frame, [50, 130], [1, 0.6], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });

  // --- Ship queue growth 0 -> 14 ships per side ---
  const shipsPerSide = Math.round(interpolate(frame, [60, 150], [0, 14], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  }));

  // --- Metric card springs (staggered) ---
  const card1 = spring({ frame: frame - 24, fps, config: { damping: 14, stiffness: 90 } });
  const card2 = spring({ frame: frame - 70, fps, config: { damping: 14, stiffness: 90 } });
  const card3 = spring({ frame: frame - 100, fps, config: { damping: 14, stiffness: 90 } });
  const card4 = spring({ frame: frame - 125, fps, config: { damping: 14, stiffness: 90 } });

  // --- Counter animations ---
  const strandedCount = Math.round(interpolate(frame, [100, 155], [0, 130], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  }));
  const waitDays = Math.round(interpolate(frame, [125, 165], [0, 21], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  }));
  const dropPct = Math.round(interpolate(frame, [70, 115], [0, 40], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  }));

  // --- Warning pulse on drop indicator ---
  const pulse = 0.6 + 0.4 * Math.sin(frame * 0.25);

  // --- Subtle end-frame camera breath ---
  const breath = interpolate(frame, [150, 180], [1, 1.015], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Diagram geometry (inside safe area)
  const diagramX = 160;
  const diagramY = 260;
  const diagramW = 1600;
  const diagramH = 520;
  const lakeLeft = 560;
  const lakeRight = 1360;
  const lakeWidth = lakeRight - lakeLeft;
  const basinTop = diagramY + 80;
  const basinBottom = diagramY + diagramH - 60;
  const fullWaterH = basinBottom - basinTop;
  const waterH = fullWaterH * waterFill;
  const waterTop = basinBottom - waterH;

  // Ship icon as simple rect with bridge
  const renderShip = (x: number, y: number, flip: number, opacity: number, index: number) => {
    const shipSpring = spring({ frame: frame - (60 + index * 6), fps, config: { damping: 12, stiffness: 80 } });
    return (
      <g key={`s-${flip}-${index}`} transform={`translate(${x}, ${y}) scale(${shipSpring}, ${shipSpring})`} opacity={opacity}>
        <rect x={-22 * flip} y={-6} width={44} height={12} rx={2} fill="#c9d6df" stroke="#070e14" strokeWidth={1} />
        <rect x={-14 * flip} y={-14} width={10} height={8} fill="#8ea6b6" />
        <rect x={2 * flip} y={-18} width={6} height={12} fill="#e5a93c" />
      </g>
    );
  };

  // Build ship positions
  const pacificShips = [];
  const atlanticShips = [];
  for (let i = 0; i < shipsPerSide; i++) {
    // Pacific (left side) - stacked in two lanes
    const lane = i % 2;
    const col = Math.floor(i / 2);
    const px = 260 + col * 60;
    const py = waterTop + 30 + lane * 50 + (1 - waterFill) * 40;
    pacificShips.push(renderShip(px, py, 1, 1, i));
    // Atlantic (right side)
    const ax = 1660 - col * 60;
    const ay = waterTop + 30 + lane * 50 + (1 - waterFill) * 40;
    atlanticShips.push(renderShip(ax, ay, -1, 1, i + 20));
  }

  // Water surface ripple lines
  const ripples = [0, 1, 2].map((i) => {
    const offset = ((frame * 0.8) + i * 80) % 240;
    return (
      <line
        key={`r-${i}`}
        x1={lakeLeft + 20 + offset}
        y1={waterTop + 6}
        x2={lakeLeft + 20 + offset + 60}
        y2={waterTop + 6}
        stroke="rgba(201, 230, 255, 0.5)"
        strokeWidth={1.5}
        opacity={Math.max(0, 1 - offset / 240)}
      />
    );
  });

  return (
    <AbsoluteFill style={{ background: '#070e14', fontFamily: 'Inter, Helvetica, Arial, sans-serif', color: '#e8eef3' }}>
      <div style={{ position: 'absolute', inset: 0, transform: `scale(${breath})`, transformOrigin: 'center center' }}>
        {/* Subtle grid background */}
        <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, opacity: 0.18 }}>
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M60 0 L0 0 0 60" fill="none" stroke="#1b4965" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="1920" height="1080" fill="url(#grid)" />
        </svg>

        {/* Radial vignette using solid radial gradient via div */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at center, rgba(27,73,101,0.25) 0%, rgba(7,14,20,0) 60%)',
        }} />

        {/* TOP BAR */}
        <div style={{
          position: 'absolute', left: 80, right: 80, top: 60, height: 120,
          opacity: titleIn, transform: `translateY(${(1 - titleIn) * -20}px)`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        }}>
          <div>
            <div style={{ fontSize: 14, letterSpacing: 4, color: '#e5a93c', fontWeight: 600, marginBottom: 10 }}>
              CHAPTER 02 · WATER CRISIS
            </div>
            <div style={{ fontSize: 64, fontWeight: 800, lineHeight: 1, letterSpacing: -1 }}>
              The Gatun Lake Bottleneck
            </div>
            <div style={{ fontSize: 22, color: '#8ea6b6', marginTop: 12, fontWeight: 400 }}>
              Why the Panama Canal Is Running Out of Water
            </div>
          </div>
          <div style={{ textAlign: 'right', paddingTop: 8 }}>
            <div style={{ fontSize: 12, letterSpacing: 2, color: '#8ea6b6' }}>LAT 9.08°N · LON 79.72°W</div>
            <div style={{ fontSize: 12, letterSpacing: 2, color: '#8ea6b6', marginTop: 4 }}>FRAME {String(frame).padStart(3, '0')} / {duration}</div>
          </div>
        </div>

        {/* CANAL DIAGRAM SVG */}
        <svg
          width={1920} height={1080}
          style={{ position: 'absolute', inset: 0, opacity: diagramIn }}
        >
          {/* Ocean basins */}
          <rect x={diagramX} y={basinTop} width={lakeLeft - diagramX} height={fullWaterH} fill="#0f1c24" stroke="#1b4965" strokeWidth={1.5} />
          <rect x={lakeRight} y={basinTop} width={diagramX + diagramW - lakeRight} height={fullWaterH} fill="#0f1c24" stroke="#1b4965" strokeWidth={1.5} />

          {/* Lake basin (deeper outline) */}
          <rect x={lakeLeft} y={basinTop} width={lakeWidth} height={fullWaterH} fill="#0a141c" stroke="#1b4965" strokeWidth={2} />

          {/* Ocean water (full) */}
          <rect x={diagramX + 2} y={basinTop + 20} width={lakeLeft - diagramX - 4} height={fullWaterH - 22} fill="#1b4965" />
          <rect x={lakeRight + 2} y={basinTop + 20} width={diagramX + diagramW - lakeRight - 4} height={fullWaterH - 22} fill="#1b4965" />

          {/* Lake water (shrinking) */}
          <rect x={lakeLeft + 2} y={waterTop} width={lakeWidth - 4} height={waterH - 2} fill="#1b4965" />
          <rect x={lakeLeft + 2} y={waterTop} width={lakeWidth - 4} height={waterH - 2} fill="rgba(201,230,255,0.08)" />

          {/* Ripples */}
          {ripples}

          {/* Full-level ghost line */}
          <line x1={lakeLeft + 10} y1={basinTop + 20} x2={lakeRight - 10} y2={basinTop + 20}
            stroke="#e5a93c" strokeWidth={1} strokeDasharray="6 6" opacity={0.55} />
          <text x={lakeRight - 8} y={basinTop + 16} textAnchor="end" fill="#e5a93c" fontSize={11} fontFamily="Inter" letterSpacing={2}>
            HISTORIC LEVEL
          </text>

          {/* Current water line indicator */}
          <line x1={lakeLeft} y1={waterTop} x2={lakeRight} y2={waterTop}
            stroke="#e63946" strokeWidth={2} opacity={pulse} />
          <circle cx={lakeLeft + 8} cy={waterTop} r={5} fill="#e63946" opacity={pulse} />
          <circle cx={lakeRight - 8} cy={waterTop} r={5} fill="#e63946" opacity={pulse} />

          {/* Lock gates */}
          <rect x={lakeLeft - 6} y={basinTop + 10} width={12} height={fullWaterH - 20} fill="#2a3b47" stroke="#e5a93c" strokeWidth={1} />
          <rect x={lakeRight - 6} y={basinTop + 10} width={12} height={fullWaterH - 20} fill="#2a3b47" stroke="#e5a93c" strokeWidth={1} />

          {/* Ships */}
          {pacificShips}
          {atlanticShips}

          {/* Labels */}
          <text x={diagramX + 40} y={basinTop - 16} fill="#8ea6b6" fontSize={14} fontFamily="Inter" letterSpacing={3} fontWeight={600}>
            PACIFIC APPROACH
          </text>
          <text x={diagramX + diagramW - 40} y={basinTop - 16} fill="#8ea6b6" fontSize={14} fontFamily="Inter" letterSpacing={3} fontWeight={600} textAnchor="end">
            ATLANTIC APPROACH
          </text>
          <text x={(lakeLeft + lakeRight) / 2} y={basinTop - 16} fill="#c9d6df" fontSize={16} fontFamily="Inter" letterSpacing={4} fontWeight={700} textAnchor="middle">
            LAKE GATUN
          </text>

          {/* Drop arrow */}
          {frame > 55 && (
            <g opacity={interpolate(frame, [55, 75], [0, 1], { extrapolateRight: 'clamp' })}>
              <line x1={(lakeLeft + lakeRight) / 2} y1={basinTop + 30} x2={(lakeLeft + lakeRight) / 2} y2={waterTop - 10}
                stroke="#e63946" strokeWidth={2} strokeDasharray="4 4" />
              <polygon
                points={`${(lakeLeft + lakeRight) / 2 - 8},${waterTop - 14} ${(lakeLeft + lakeRight) / 2 + 8},${waterTop - 14} ${(lakeLeft + lakeRight) / 2},${waterTop - 2}`}
                fill="#e63946" opacity={pulse}
              />
              <text x={(lakeLeft + lakeRight) / 2 + 14} y={(basinTop + 30 + waterTop) / 2} fill="#e63946" fontSize={18} fontFamily="Inter" fontWeight={700}>
                −{dropPct}%
              </text>
            </g>
          )}

          {/* Per-ship water annotation arrow (beat 1) */}
          {frame < 80 && (
            <g opacity={interpolate(frame, [28, 45], [0, 1], { extrapolateRight: 'clamp' }) * interpolate(frame, [65, 80], [1, 0], { extrapolateLeft: 'clamp' })}>
              <path d={`M ${(lakeLeft + lakeRight) / 2} ${waterTop + 30} Q ${(lakeLeft + lakeRight) / 2 + 120} ${waterTop + 60} ${(lakeLeft + lakeRight) / 2 + 240} ${waterTop + 90}`}
                fill="none" stroke="#e5a93c" strokeWidth={1.5} />
              <text x={(lakeLeft + lakeRight) / 2 + 248} y={waterTop + 94} fill="#e5a93c" fontSize={14} fontFamily="Inter" fontWeight={600}>
                50,000,000 gal drained per transit
              </text>
            </g>
          )}
        </svg>

        {/* METRIC CARDS */}
        <div style={{
          position: 'absolute', left: 80, right: 80, bottom: 60, height: 180,
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20,
        }}>
          {/* Card 1 - Water per ship */}
          <MetricCard
            scale={card1}
            label="FRESH WATER PER TRANSIT"
            value="52M"
            unit="GAL"
            accent="#1b9aaa"
            sub="≈ 190 million liters"
            delay={0}
          />
          {/* Card 2 - Lake drop */}
          <MetricCard
            scale={card2}
            label="LAKE GATUN LEVEL"
            value={`−${dropPct}`}
            unit="%"
            accent="#e63946"
            sub="vs. 10-year average"
            pulse={pulse}
            delay={0}
          />
          {/* Card 3 - Stranded ships */}
          <MetricCard
            scale={card3}
            label="VESSELS STRANDED"
            value={String(strandedCount)}
            unit="SHIPS"
            accent="#e5a93c"
            sub="both ocean approaches"
            delay={0}
          />
          {/* Card 4 - Wait time */}
          <MetricCard
            scale={card4}
            label="MAXIMUM QUEUE WAIT"
            value={String(waitDays)}
            unit="DAYS"
            accent="#e63946"
            sub="priority lanes excluded"
            pulse={pulse}
            delay={0}
          />
        </div>

        {/* Bottom ticker */}
        <div style={{
          position: 'absolute', left: 80, right: 80, bottom: 24,
          display: 'flex', justifyContent: 'space-between',
          fontSize: 11, letterSpacing: 2, color: '#4a6170',
        }}>
          <span>DATA: PANAMA CANAL AUTHORITY · ACP DAILY REPORT</span>
          <span>SCENE 02 / 06 — HYDROLOGICAL STRESS INDEX</span>
        </div>
      </div>
    </AbsoluteFill>
  );
}

function MetricCard({
  scale, label, value, unit, accent, sub, pulse, delay,
}: {
  scale: number; label: string; value: string; unit: string;
  accent: string; sub: string; pulse?: number; delay: number;
}) {
  const p = pulse ?? 1;
  return (
    <div style={{
      transform: `scale(${scale})`,
      transformOrigin: 'bottom center',
      background: 'linear-gradient(180deg, rgba(15,28,36,0.95) 0%, rgba(10,20,28,0.95) 100%)',
      border: `1px solid ${accent}33`,
      borderLeft: `3px solid ${accent}`,
      padding: '22px 26px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Corner tick */}
      <div style={{ position: 'absolute', top: 10, right: 10, width: 10, height: 10, border: `1px solid ${accent}`, opacity: 0.6 }} />
      <div style={{
        fontSize: 11, letterSpacing: 2.5, color: '#8ea6b6', fontWeight: 600, marginBottom: 14,
      }}>
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <div style={{
          fontSize: 56, fontWeight: 800, color: accent, lineHeight: 1, letterSpacing: -1.5,
          opacity: 0.55 + 0.45 * p,
        }}>
          {value}
        </div>
        <div style={{ fontSize: 16, color: '#c9d6df', fontWeight: 600, letterSpacing: 2 }}>
          {unit}
        </div>
      </div>
      <div style={{ fontSize: 12, color: '#6b8290', marginTop: 12, letterSpacing: 0.5 }}>
        {sub}
      </div>
      {/* Bottom progress bar */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 2,
        background: `${accent}`, opacity: 0.8 * scale,
      }} />
    </div>
  );
}