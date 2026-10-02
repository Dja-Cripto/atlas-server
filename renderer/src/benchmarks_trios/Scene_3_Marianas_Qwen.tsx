import { AbsoluteFill, useCurrentFrame, interpolate, spring, Easing } from 'remotion';

export default function MotionScene({scene, context}: {scene: any; context: any}) {
  const frame = useCurrentFrame();
  const fps = scene.fps || 30;
  const duration = scene.durationInFrames || 180;

  // Core animations
  const depthProgress = interpolate(frame, [0, 150], [0, 1], { extrapolateRight: 'clamp' });
  const currentDepth = Math.round(interpolate(depthProgress, [0, 1], [0, 10994]));
  const sunlightOpacity = interpolate(currentDepth, [0, 800], [1, 0], { extrapolateRight: 'clamp' });
  const pressureProgress = interpolate(frame, [50, 150], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const currentPressure = Math.round(interpolate(pressureProgress, [0, 1], [0, 1086]));

  // Spring animations
  const titleSpring = spring({ frame, fps, from: 0, to: 1, config: { damping: 12, stiffness: 80 } });
  const gaugeSpring = spring({ frame: frame - 10, fps, from: 0, to: 1, config: { damping: 14, stiffness: 60 } });
  const card1Spring = spring({ frame: frame - 45, fps, from: 0, to: 1, config: { damping: 12, stiffness: 90 } });
  const card2Spring = spring({ frame: frame - 70, fps, from: 0, to: 1, config: { damping: 12, stiffness: 90 } });
  const card3Spring = spring({ frame: frame - 90, fps, from: 0, to: 1, config: { damping: 12, stiffness: 90 } });
  const comparisonSpring = spring({ frame: frame - 110, fps, from: 0, to: 1, config: { damping: 10, stiffness: 70 } });
  const finalPulse = interpolate(frame, [150, 160, 170, 180], [0, 1, 0.8, 0.9], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Depth gauge position
  const gaugeY = interpolate(depthProgress, [0, 1], [180, 820]);
  const pastSunlight = currentDepth >= 1000;

  // Light rays
  const rays = Array.from({ length: 7 }, (_, i) => i);

  // Pressure bar segments
  const pressureSegments = 20;

  return (
    <AbsoluteFill style={{ backgroundColor: '#070e14', fontFamily: "'Inter', 'Helvetica Neue', sans-serif" }}>
      {/* Deep ocean gradient background */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        background: `linear-gradient(180deg, 
          rgba(10, 30, 50, ${0.3 * sunlightOpacity}) 0%, 
          #070e14 40%, 
          #050a0f 100%)`,
      }} />

      {/* Surface light rays */}
      {rays.map((i) => {
        const angle = -15 + i * 5;
        const x = 300 + i * 180;
        const rayOpacity = sunlightOpacity * interpolate(frame, [0, 15], [0, 0.6], { extrapolateRight: 'clamp' });
        return (
          <div key={i} style={{
            position: 'absolute',
            top: 0,
            left: x,
            width: 3,
            height: 500,
            background: `linear-gradient(180deg, rgba(229, 169, 60, ${rayOpacity}) 0%, rgba(229, 169, 60, 0) 100%)`,
            transform: `rotate(${angle}deg)`,
            transformOrigin: 'top center',
            opacity: rayOpacity,
          }} />
        );
      })}

      {/* Title */}
      <div style={{
        position: 'absolute',
        top: 80,
        left: 100,
        right: 100,
        opacity: titleSpring,
        transform: `translateY(${(1 - titleSpring) * 20}px)`,
      }}>
        <div style={{
          fontSize: 14,
          letterSpacing: '0.3em',
          color: '#e5a93c',
          textTransform: 'uppercase',
          marginBottom: 8,
          fontWeight: 600,
        }}>THE MARIANA TRENCH</div>
        <div style={{
          fontSize: 48,
          fontWeight: 800,
          color: '#ffffff',
          letterSpacing: '-0.02em',
          lineHeight: 1.1,
        }}>The 1,000-Atmosphere Abyss</div>
      </div>

      {/* Vertical depth gauge */}
      <div style={{
        position: 'absolute',
        left: 140,
        top: 180,
        bottom: 120,
        width: 4,
        opacity: gaugeSpring,
      }}>
        {/* Gauge track */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, width: 4, height: '100%',
          backgroundColor: 'rgba(229, 169, 60, 0.15)',
          borderRadius: 2,
        }} />
        {/* Gauge fill */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, width: 4,
          height: `${depthProgress * 100}%`,
          background: pastSunlight
            ? 'linear-gradient(180deg, #e5a93c 0%, #e63946 100%)'
            : '#e5a93c',
          borderRadius: 2,
        }} />
        {/* Current depth indicator */}
        <div style={{
          position: 'absolute',
          top: `${depthProgress * 100}%`,
          left: -8,
          width: 20,
          height: 20,
          borderRadius: '50%',
          backgroundColor: pastSunlight ? '#e63946' : '#e5a93c',
          border: '3px solid #070e14',
          transform: 'translateY(-50%)',
          boxShadow: `0 0 20px ${pastSunlight ? 'rgba(230, 57, 70, 0.6)' : 'rgba(229, 169, 60, 0.6)'}`,
        }} />

        {/* Depth markers */}
        {[0, 1000, 3000, 6000, 10994].map((marker, idx) => {
          const markerY = (marker / 10994) * 100;
          const isActive = currentDepth >= marker;
          return (
            <div key={idx} style={{
              position: 'absolute',
              top: `${markerY}%`,
              left: 24,
              transform: 'translateY(-50%)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              <div style={{
                width: 16,
                height: 2,
                backgroundColor: isActive ? '#e5a93c' : 'rgba(255,255,255,0.2)',
              }} />
              <span style={{
                fontSize: 13,
                color: isActive ? '#e5a93c' : 'rgba(255,255,255,0.35)',
                fontWeight: 500,
                fontVariantNumeric: 'tabular-nums',
                whiteSpace: 'nowrap',
              }}>{marker === 10994 ? '10,994m' : `${marker.toLocaleString()}m`}</span>
              {marker === 1000 && (
                <span style={{
                  fontSize: 11,
                  color: pastSunlight ? '#e63946' : 'rgba(229, 169, 60, 0.7)',
                  marginLeft: 8,
                  fontWeight: 600,
                }}>← SUNLIGHT THRESHOLD</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Current depth readout */}
      <div style={{
        position: 'absolute',
        left: 380,
        top: 220,
        opacity: gaugeSpring,
      }}>
        <div style={{
          fontSize: 12,
          letterSpacing: '0.2em',
          color: 'rgba(255,255,255,0.5)',
          textTransform: 'uppercase',
          marginBottom: 8,
        }}>Current Depth</div>
        <div style={{
          fontSize: 72,
          fontWeight: 800,
          color: '#ffffff',
          fontVariantNumeric: 'tabular-nums',
          letterSpacing: '-0.03em',
          lineHeight: 1,
        }}>{currentDepth.toLocaleString()}<span style={{ fontSize: 28, color: 'rgba(255,255,255,0.5)', marginLeft: 4, fontWeight: 500 }}>m</span></div>
        <div style={{
          marginTop: 12,
          fontSize: 15,
          color: pastSunlight ? '#e63946' : 'rgba(229, 169, 60, 0.8)',
          fontWeight: 500,
        }}>{pastSunlight ? '● TOTAL DARKNESS' : '○ SUNLIGHT ZONE'}</div>
      </div>

      {/* Pressure metric card */}
      <div style={{
        position: 'absolute',
        left: 380,
        top: 420,
        opacity: card1Spring,
        transform: `translateX(${(1 - card1Spring) * 40}px)`,
      }}>
        <div style={{
          backgroundColor: 'rgba(15, 28, 36, 0.9)',
          border: '1px solid rgba(230, 57, 70, 0.3)',
          borderRadius: 12,
          padding: '28px 36px',
          width: 480,
        }}>
          <div style={{
            fontSize: 12,
            letterSpacing: '0.2em',
            color: 'rgba(255,255,255,0.5)',
            textTransform: 'uppercase',
            marginBottom: 12,
          }}>Water Pressure</div>
          <div style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 8,
          }}>
            <span style={{
              fontSize: 56,
              fontWeight: 800,
              color: '#e63946',
              fontVariantNumeric: 'tabular-nums',
              letterSpacing: '-0.02em',
            }}>{currentPressure.toLocaleString()}</span>
            <span style={{ fontSize: 20, color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>atmospheres</span>
          </div>

          {/* Pressure bar */}
          <div style={{
            marginTop: 20,
            display: 'flex',
            gap: 3,
            height: 12,
          }}>
            {Array.from({ length: pressureSegments }).map((_, i) => {
              const segmentThreshold = (i + 1) / pressureSegments;
              const isFilled = pressureProgress >= segmentThreshold;
              const intensity = i / pressureSegments;
              return (
                <div key={i} style={{
                  flex: 1,
                  borderRadius: 2,
                  backgroundColor: isFilled
                    ? `rgba(230, 57, 70, ${0.4 + intensity * 0.6})`
                    : 'rgba(255,255,255,0.05)',
                  transition: 'none',
                }} />
              );
            })}
          </div>
          <div style={{
            marginTop: 10,
            fontSize: 13,
            color: 'rgba(255,255,255,0.4)',
          }}>Equivalent to 1,086× surface atmospheric pressure</div>
        </div>
      </div>

      {/* Sunlight threshold card */}
      <div style={{
        position: 'absolute',
        left: 920,
        top: 220,
        opacity: card2Spring,
        transform: `translateY(${(1 - card2Spring) * 30}px)`,
      }}>
        <div style={{
          backgroundColor: 'rgba(15, 28, 36, 0.9)',
          border: `1px solid ${pastSunlight ? 'rgba(230, 57, 70, 0.4)' : 'rgba(229, 169, 60, 0.3)'}`,
          borderRadius: 12,
          padding: '24px 32px',
          width: 360,
        }}>
          <div style={{
            fontSize: 12,
            letterSpacing: '0.2em',
            color: 'rgba(255,255,255,0.5)',
            textTransform: 'uppercase',
            marginBottom: 10,
          }}>Sunlight Penetration</div>
          <div style={{
            fontSize: 42,
            fontWeight: 800,
            color: pastSunlight ? '#e63946' : '#e5a93c',
            letterSpacing: '-0.02em',
          }}>1,000<span style={{ fontSize: 20, fontWeight: 500, marginLeft: 4 }}>m</span></div>
          <div style={{
            marginTop: 8,
            fontSize: 14,
            color: 'rgba(255,255,255,0.5)',
            lineHeight: 1.5,
          }}>Maximum depth sunlight reaches. Below this, permanent darkness.</div>
          {/* Mini depth indicator */}
          <div style={{
            marginTop: 16,
            height: 80,
            width: '100%',
            backgroundColor: 'rgba(0,0,0,0.3)',
            borderRadius: 6,
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute',
              top: 0, left: 0, right: 0,
              height: `${(1000 / 10994) * 100}%`,
              background: 'linear-gradient(180deg, rgba(229, 169, 60, 0.3) 0%, rgba(229, 169, 60, 0) 100%)',
            }} />
            <div style={{
              position: 'absolute',
              top: `${Math.min((currentDepth / 10994) * 100, 100)}%`,
              left: 0, right: 0,
              height: 2,
              backgroundColor: pastSunlight ? '#e63946' : '#e5a93c',
              boxShadow: `0 0 8px ${pastSunlight ? 'rgba(230, 57, 70, 0.8)' : 'rgba(229, 169, 60, 0.8)'}`,
            }} />
          </div>
        </div>
      </div>

      {/* Comparison card - 50 Jumbo Jets */}
      <div style={{
        position: 'absolute',
        left: 920,
        top: 500,
        opacity: card3Spring,
        transform: `translateY(${(1 - card3Spring) * 30}px)`,
      }}>
        <div style={{
          backgroundColor: 'rgba(15, 28, 36, 0.9)',
          border: '1px solid rgba(229, 169, 60, 0.3)',
          borderRadius: 12,
          padding: '24px 32px',
          width: 360,
        }}>
          <div style={{
            fontSize: 12,
            letterSpacing: '0.2em',
            color: 'rgba(255,255,255,0.5)',
            textTransform: 'uppercase',
            marginBottom: 10,
          }}>Weight Equivalent</div>
          <div style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 8,
          }}>
            <span style={{
              fontSize: 56,
              fontWeight: 800,
              color: '#e5a93c',
              letterSpacing: '-0.03em',
            }}>50</span>
            <span style={{ fontSize: 18, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>Jumbo Jets</span>
          </div>
          <div style={{
            marginTop: 6,
            fontSize: 14,
            color: 'rgba(255,255,255,0.4)',
          }}>stacked on every cm² of your body</div>
        </div>
      </div>

      {/* Bottom comparison visualization */}
      <div style={{
        position: 'absolute',
        left: 100,
        right: 100,
        bottom: 80,
        opacity: comparisonSpring,
        transform: `translateY(${(1 - comparisonSpring) * 30}px)`,
      }}>
        <div style={{
          backgroundColor: 'rgba(15, 28, 36, 0.7)',
          border: '1px solid rgba(229, 169, 60, 0.2)',
          borderRadius: 16,
          padding: '32px 48px',
          display: 'flex',
          alignItems: 'center',
          gap: 48,
        }}>
          {/* Jet stack visualization */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            opacity: 0.8 + finalPulse * 0.2,
          }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{
                width: 60 - i * 2,
                height: 8,
                backgroundColor: `rgba(229, 169, 60, ${0.3 + (i / 8) * 0.7})`,
                borderRadius: 2,
              }} />
            ))}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: 22,
              fontWeight: 700,
              color: '#ffffff',
              lineHeight: 1.4,
            }}>
              At 10,994 meters, the pressure is <span style={{ color: '#e63946' }}>1,086 atmospheres</span>
            </div>
            <div style={{
              fontSize: 16,
              color: 'rgba(255,255,255,0.5)',
              marginTop: 8,
              lineHeight: 1.5,
            }}>
              Sunlight vanishes within the first 1,000m. Below lies permanent darkness and crushing force equivalent to 50 jumbo jets per square centimeter.
            </div>
          </div>

          {/* Pressure icon */}
          <div style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            border: `3px solid rgba(230, 57, 70, ${0.4 + finalPulse * 0.4})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 0 30px rgba(230, 57, 70, ${finalPulse * 0.3})`,
          }}>
            <span style={{ fontSize: 28, fontWeight: 800, color: '#e63946' }}>↓</span>
          </div>
        </div>
      </div>

      {/* Depth zone labels on right edge */}
      <div style={{
        position: 'absolute',
        right: 100,
        top: 80,
        opacity: interpolate(frame, [20, 40], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
      }}>
        <div style={{
          fontSize: 11,
          letterSpacing: '0.15em',
          color: 'rgba(255,255,255,0.3)',
          textTransform: 'uppercase',
          textAlign: 'right',
        }}>DEPTH ZONE: {currentDepth < 200 ? 'EPIPELAGIC' : currentDepth < 1000 ? 'MESOPELAGIC' : currentDepth < 4000 ? 'BATHYPELAGIC' : currentDepth < 6000 ? 'ABYSSOPELAGIC' : 'HADOPELAGIC'}</div>
      </div>

      {/* Animated particles (subtle depth particles) */}
      {Array.from({ length: 12 }).map((_, i) => {
        const particleY = ((frame * (0.5 + i * 0.15) + i * 80) % 900) + 100;
        const particleX = 200 + (i * 137) % 1500;
        const particleOpacity = interpolate(particleY, [100, 200, 800, 900], [0, 0.3, 0.3, 0]) * (1 - sunlightOpacity * 0.5);
        return (
          <div key={i} style={{
            position: 'absolute',
            left: particleX,
            top: particleY,
            width: 3,
            height: 3,
            borderRadius: '50%',
            backgroundColor: pastSunlight ? 'rgba(230, 57, 70, 0.4)' : 'rgba(229, 169, 60, 0.5)',
            opacity: particleOpacity,
          }} />
        );
      })}
    </AbsoluteFill>
  );
}