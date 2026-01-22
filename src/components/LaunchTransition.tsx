import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAudio } from '@/contexts/AudioContext';

interface LaunchTransitionProps {
  onComplete: () => void;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
  delay: number;
}

const LaunchTransition: React.FC<LaunchTransitionProps> = ({ onComplete }) => {
  const { playEngineSound, stopEngineSound, playExplosionSound } = useAudio();
  const [phase, setPhase] = useState<'countdown' | 'ignition' | 'launch' | 'hyperspace' | 'complete'>('countdown');
  const [countdown, setCountdown] = useState(3);
  const [shipY, setShipY] = useState(0);
  const [thrustIntensity, setThrustIntensity] = useState(0);
  const [shakeIntensity, setShakeIntensity] = useState(0);

  // Generate exhaust particles
  const exhaustParticles = useMemo(() => 
    Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: 50 + (Math.random() - 0.5) * 20,
      y: 60 + Math.random() * 40,
      vx: (Math.random() - 0.5) * 2,
      vy: Math.random() * 8 + 4,
      size: Math.random() * 8 + 4,
      opacity: Math.random() * 0.8 + 0.2,
      color: Math.random() > 0.5 ? 'hsl(35, 100%, 55%)' : 'hsl(20, 100%, 50%)',
      delay: Math.random() * 0.5,
    })),
  []);

  // Generate star trail particles
  const starTrailParticles = useMemo(() =>
    Array.from({ length: 100 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      delay: Math.random() * 2,
    })),
  []);

  // Countdown phase
  useEffect(() => {
    if (phase !== 'countdown') return;

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setPhase('ignition');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase]);

  // Ignition phase
  useEffect(() => {
    if (phase !== 'ignition') return;

    playExplosionSound();
    
    // Ramp up thrust
    let intensity = 0;
    const thrustInterval = setInterval(() => {
      intensity += 0.1;
      setThrustIntensity(Math.min(intensity, 1));
      setShakeIntensity(Math.min(intensity * 0.5, 0.3));
      playEngineSound(intensity * 2);
      
      if (intensity >= 1) {
        clearInterval(thrustInterval);
        setTimeout(() => setPhase('launch'), 500);
      }
    }, 100);

    return () => clearInterval(thrustInterval);
  }, [phase, playEngineSound, playExplosionSound]);

  // Launch phase
  useEffect(() => {
    if (phase !== 'launch') return;

    let y = 0;
    const launchInterval = setInterval(() => {
      y += 5;
      setShipY(-y);
      setShakeIntensity(0.5);
      playEngineSound(3);
      
      if (y >= 150) {
        clearInterval(launchInterval);
        setPhase('hyperspace');
      }
    }, 16);

    return () => clearInterval(launchInterval);
  }, [phase, playEngineSound]);

  // Hyperspace phase
  useEffect(() => {
    if (phase !== 'hyperspace') return;

    stopEngineSound();
    
    setTimeout(() => {
      setPhase('complete');
      onComplete();
    }, 1500);
  }, [phase, onComplete, stopEngineSound]);

  const getShakeStyle = useCallback(() => {
    if (shakeIntensity === 0) return {};
    const x = (Math.random() - 0.5) * shakeIntensity * 20;
    const y = (Math.random() - 0.5) * shakeIntensity * 20;
    return { transform: `translate(${x}px, ${y}px)` };
  }, [shakeIntensity]);

  return (
    <div 
      className="fixed inset-0 bg-background z-50 overflow-hidden"
      style={getShakeStyle()}
    >
      {/* Star background */}
      <div className="absolute inset-0">
        {starTrailParticles.map((star) => (
          <div
            key={star.id}
            className={`absolute rounded-full bg-white transition-all duration-300 ${
              phase === 'hyperspace' ? 'animate-hyperspace-star' : ''
            }`}
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: star.size,
              height: phase === 'hyperspace' ? star.size * 50 : star.size,
              opacity: phase === 'hyperspace' ? 1 : 0.5,
              animationDelay: `${star.delay}s`,
              transition: 'height 0.5s ease-out',
            }}
          />
        ))}
      </div>

      {/* Hyperspace tunnel effect */}
      {phase === 'hyperspace' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 bg-white rounded-full animate-hyperspace-center" />
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 bg-gradient-to-b from-primary via-secondary to-transparent animate-hyperspace-ray"
              style={{
                height: '50vh',
                transformOrigin: 'center bottom',
                transform: `rotate(${i * 45}deg)`,
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Scanlines */}
      <div className="absolute inset-0 pointer-events-none bg-scanlines opacity-30" />

      {/* Countdown display */}
      {phase === 'countdown' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center animate-fade-in">
          <div className="font-pixel text-sm text-primary mb-4 animate-pulse">
            [ LAUNCH SEQUENCE INITIATED ]
          </div>
          <div 
            className="font-pixel text-8xl md:text-9xl text-primary neon-text animate-pulse"
            style={{ textShadow: '0 0 40px hsl(var(--primary)), 0 0 80px hsl(var(--primary))' }}
          >
            {countdown}
          </div>
          <div className="font-pixel text-xs text-muted-foreground mt-8">
            PREPARE FOR DEPARTURE
          </div>
        </div>
      )}

      {/* Spaceship */}
      {(phase === 'ignition' || phase === 'launch') && (
        <div 
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
          style={{ 
            transform: `translate(-50%, calc(-50% + ${shipY}px))`,
            transition: phase === 'launch' ? 'none' : 'transform 0.1s ease-out',
          }}
        >
          {/* Exhaust particles */}
          {thrustIntensity > 0 && exhaustParticles.map((particle) => (
            <div
              key={particle.id}
              className="absolute animate-exhaust-particle"
              style={{
                left: `${particle.x - 50}%`,
                top: `${particle.y}%`,
                width: particle.size * thrustIntensity,
                height: particle.size * thrustIntensity * 1.5,
                background: `radial-gradient(ellipse, ${particle.color}, transparent)`,
                opacity: particle.opacity * thrustIntensity,
                animationDelay: `${particle.delay}s`,
                animationDuration: `${0.3 + Math.random() * 0.3}s`,
              }}
            />
          ))}

          {/* Main thrust flame */}
          <div 
            className="absolute left-1/2 -translate-x-1/2 animate-thrust-flicker"
            style={{
              top: '100%',
              width: 30 + thrustIntensity * 40,
              height: 60 + thrustIntensity * 100,
              background: `linear-gradient(to bottom, 
                hsl(55, 100%, 80%) 0%, 
                hsl(45, 100%, 60%) 20%, 
                hsl(35, 100%, 55%) 40%, 
                hsl(25, 100%, 50%) 60%, 
                hsl(15, 100%, 45%) 80%, 
                transparent 100%)`,
              borderRadius: '50% 50% 50% 50% / 20% 20% 80% 80%',
              filter: `blur(${2 + thrustIntensity * 3}px)`,
              boxShadow: `0 0 ${20 + thrustIntensity * 40}px hsl(35, 100%, 55%), 
                          0 0 ${40 + thrustIntensity * 60}px hsl(25, 100%, 50%)`,
            }}
          />

          {/* Secondary thrust flames */}
          {[-20, 20].map((offset, i) => (
            <div
              key={i}
              className="absolute animate-thrust-flicker"
              style={{
                left: `calc(50% + ${offset}px)`,
                top: '90%',
                width: 15 + thrustIntensity * 15,
                height: 30 + thrustIntensity * 50,
                background: `linear-gradient(to bottom, 
                  hsl(45, 100%, 70%) 0%, 
                  hsl(35, 100%, 55%) 50%, 
                  transparent 100%)`,
                borderRadius: '50% 50% 50% 50% / 30% 30% 70% 70%',
                filter: `blur(${1 + thrustIntensity * 2}px)`,
                transform: 'translateX(-50%)',
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}

          {/* Ship body */}
          <svg width="80" height="100" viewBox="0 0 80 100" className="relative z-10">
            {/* Ship glow */}
            <defs>
              <filter id="shipGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              <linearGradient id="shipBody" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(200, 80%, 60%)" />
                <stop offset="100%" stopColor="hsl(220, 70%, 40%)" />
              </linearGradient>
            </defs>
            
            {/* Main body */}
            <polygon
              points="40,5 70,85 40,70 10,85"
              fill="url(#shipBody)"
              stroke="hsl(180, 100%, 70%)"
              strokeWidth="2"
              filter="url(#shipGlow)"
            />
            
            {/* Cockpit */}
            <polygon
              points="40,15 55,60 40,50 25,60"
              fill="hsl(180, 100%, 50%)"
              opacity="0.8"
            />
            
            {/* Wings highlight */}
            <polygon
              points="40,25 65,80 40,68"
              fill="hsl(210, 60%, 50%)"
              opacity="0.5"
            />
            <polygon
              points="40,25 15,80 40,68"
              fill="hsl(210, 60%, 50%)"
              opacity="0.5"
            />
          </svg>

          {/* Engine glow */}
          <div 
            className="absolute left-1/2 -translate-x-1/2 w-16 h-8 rounded-full"
            style={{
              top: '85%',
              background: `radial-gradient(ellipse, hsl(35, 100%, 70%) 0%, transparent 70%)`,
              opacity: thrustIntensity,
              boxShadow: `0 0 ${30 * thrustIntensity}px hsl(35, 100%, 55%)`,
            }}
          />
        </div>
      )}

      {/* Status text */}
      {phase === 'ignition' && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 text-center animate-pulse">
          <div className="font-pixel text-sm text-orange-400">
            [ ENGINE IGNITION ]
          </div>
          <div className="font-mono text-xs text-muted-foreground mt-2">
            THRUST: {Math.round(thrustIntensity * 100)}%
          </div>
        </div>
      )}

      {phase === 'launch' && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 text-center animate-pulse">
          <div className="font-pixel text-sm text-primary neon-text">
            [ LIFTOFF ]
          </div>
        </div>
      )}

      {phase === 'hyperspace' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="font-pixel text-2xl md:text-4xl text-white animate-pulse text-center">
            ENTERING NEXUS SPACE
          </div>
        </div>
      )}

      {/* Bottom decoration */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent"
        style={{ opacity: thrustIntensity > 0 ? 1 : 0.5 }}
      />
    </div>
  );
};

export default LaunchTransition;
