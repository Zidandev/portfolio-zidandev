import React, { useEffect, useState } from 'react';
import { usePotatoMode } from '@/contexts/PotatoModeContext';

const PotatoModeTransition: React.FC = () => {
  const { isTransitioning, isPotatoMode } = usePotatoMode();
  const [phase, setPhase] = useState<'idle' | 'glitch' | 'flash' | 'dissolve'>('idle');
  const [glitchBars, setGlitchBars] = useState<Array<{ top: number; height: number; delay: number }>>([]);

  useEffect(() => {
    if (isTransitioning) {
      // Generate random glitch bars
      setGlitchBars(
        Array.from({ length: 20 }, () => ({
          top: Math.random() * 100,
          height: Math.random() * 5 + 1,
          delay: Math.random() * 0.3
        }))
      );

      setPhase('glitch');
      
      const flashTimeout = setTimeout(() => setPhase('flash'), 800);
      const dissolveTimeout = setTimeout(() => setPhase('dissolve'), 1200);
      const endTimeout = setTimeout(() => setPhase('idle'), 2000);

      return () => {
        clearTimeout(flashTimeout);
        clearTimeout(dissolveTimeout);
        clearTimeout(endTimeout);
      };
    }
  }, [isTransitioning]);

  if (phase === 'idle') return null;

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none overflow-hidden">
      {/* Glitch Phase */}
      {phase === 'glitch' && (
        <>
          {/* Horizontal glitch bars */}
          {glitchBars.map((bar, i) => (
            <div
              key={i}
              className="absolute left-0 right-0 animate-glitch-bar"
              style={{
                top: `${bar.top}%`,
                height: `${bar.height}%`,
                background: i % 2 === 0 
                  ? 'linear-gradient(90deg, transparent, hsl(var(--primary) / 0.8), transparent)'
                  : 'linear-gradient(90deg, transparent, hsl(var(--secondary) / 0.8), transparent)',
                animationDelay: `${bar.delay}s`,
                transform: `translateX(${Math.sin(i) * 20}px)`
              }}
            />
          ))}

          {/* RGB Split overlay */}
          <div className="absolute inset-0 animate-rgb-split">
            <div 
              className="absolute inset-0 opacity-50 mix-blend-screen"
              style={{ 
                background: 'hsl(var(--primary))',
                transform: 'translateX(-5px)'
              }}
            />
            <div 
              className="absolute inset-0 opacity-50 mix-blend-screen"
              style={{ 
                background: 'hsl(var(--secondary))',
                transform: 'translateX(5px)'
              }}
            />
          </div>

          {/* Scanlines intensified */}
          <div 
            className="absolute inset-0"
            style={{
              background: 'repeating-linear-gradient(0deg, transparent 0px, transparent 2px, rgba(0,0,0,0.5) 2px, rgba(0,0,0,0.5) 4px)'
            }}
          />

          {/* Mode text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="font-pixel text-2xl sm:text-4xl text-primary animate-glitch-text">
              {isPotatoMode ? 'MAXIMUM POWER' : 'POTATO MODE'}
            </div>
          </div>
        </>
      )}

      {/* Flash Phase */}
      {phase === 'flash' && (
        <div 
          className="absolute inset-0 animate-mode-flash"
          style={{
            background: isPotatoMode 
              ? 'radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)'
              : 'radial-gradient(circle, hsl(var(--accent)) 0%, transparent 70%)'
          }}
        />
      )}

      {/* Dissolve Phase */}
      {phase === 'dissolve' && (
        <div className="absolute inset-0 animate-dissolve-out">
          {/* Particle burst effect */}
          {Array.from({ length: 30 }).map((_, i) => {
            const angle = (i / 30) * Math.PI * 2;
            const distance = 50 + Math.random() * 50;
            return (
              <div
                key={i}
                className="absolute left-1/2 top-1/2 w-2 h-2 rounded-full animate-particle-burst"
                style={{
                  background: i % 2 === 0 ? 'hsl(var(--primary))' : 'hsl(var(--secondary))',
                  '--angle': `${angle}rad`,
                  '--distance': `${distance}vmin`,
                  animationDelay: `${Math.random() * 0.2}s`
                } as React.CSSProperties}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PotatoModeTransition;
