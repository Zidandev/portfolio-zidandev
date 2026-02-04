import React, { useState, useEffect, useCallback } from 'react';
import { useAudio } from '@/contexts/AudioContext';
import { usePotatoMode } from '@/contexts/PotatoModeContext';

// Spaceship color/style variants
interface SpaceshipVariant {
  primaryColor: string;
  secondaryColor: string;
  glowColor: string;
  engineColor: string;
  name: string;
  floatDelay: number;
  pulseSpeed: number;
}

const SPACESHIP_VARIANTS: SpaceshipVariant[] = [
  { primaryColor: 'hsl(180, 100%, 50%)', secondaryColor: 'hsl(180, 100%, 70%)', glowColor: 'hsl(180, 100%, 60%)', engineColor: 'hsl(35, 100%, 60%)', name: 'Cyan Striker', floatDelay: 0, pulseSpeed: 2 },
  { primaryColor: 'hsl(320, 100%, 55%)', secondaryColor: 'hsl(320, 100%, 75%)', glowColor: 'hsl(320, 100%, 65%)', engineColor: 'hsl(50, 100%, 60%)', name: 'Magenta Fury', floatDelay: 0.3, pulseSpeed: 1.8 },
  { primaryColor: 'hsl(45, 100%, 50%)', secondaryColor: 'hsl(45, 100%, 70%)', glowColor: 'hsl(45, 100%, 60%)', engineColor: 'hsl(15, 100%, 55%)', name: 'Gold Phoenix', floatDelay: 0.6, pulseSpeed: 2.2 },
  { primaryColor: 'hsl(150, 100%, 45%)', secondaryColor: 'hsl(150, 100%, 65%)', glowColor: 'hsl(150, 100%, 55%)', engineColor: 'hsl(180, 100%, 50%)', name: 'Emerald Viper', floatDelay: 0.9, pulseSpeed: 1.6 },
  { primaryColor: 'hsl(270, 100%, 60%)', secondaryColor: 'hsl(270, 100%, 80%)', glowColor: 'hsl(270, 100%, 70%)', engineColor: 'hsl(300, 100%, 60%)', name: 'Violet Storm', floatDelay: 1.2, pulseSpeed: 2.4 },
  { primaryColor: 'hsl(0, 100%, 55%)', secondaryColor: 'hsl(0, 100%, 75%)', glowColor: 'hsl(0, 100%, 65%)', engineColor: 'hsl(30, 100%, 55%)', name: 'Crimson Blaze', floatDelay: 1.5, pulseSpeed: 2 },
];

interface Spaceship {
  id: number;
  position: 'left' | 'right' | 'top' | 'bottom';
  offsetPercent: number;
  isLaunching: boolean;
  launchProgress: number;
  variantIndex: number;
}

interface HangarBorderProps {
  children: React.ReactNode;
  className?: string;
}

const HangarBorder: React.FC<HangarBorderProps> = ({ children, className = '' }) => {
  const { isPotatoMode } = usePotatoMode();
  const { playClickSound } = useAudio();
  
  // Generate random spaceships on edges - fewer in potato mode
  const [spaceships, setSpaceships] = useState<Spaceship[]>(() => {
    const shipCount = isPotatoMode ? 2 : 6;
    const positions: Array<'left' | 'right' | 'top' | 'bottom'> = ['left', 'right', 'top', 'bottom'];
    
    return Array.from({ length: shipCount }, (_, i) => ({
      id: i,
      position: positions[i % 4],
      offsetPercent: 20 + Math.random() * 60,
      isLaunching: false,
      launchProgress: 0,
      variantIndex: i % SPACESHIP_VARIANTS.length,
    }));
  });

  // Takeoff sound effect
  const playTakeoffSound = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (!audioContext) return;
      
      // Engine startup whine
      const osc1 = audioContext.createOscillator();
      const gain1 = audioContext.createGain();
      const filter = audioContext.createBiquadFilter();
      
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(80, audioContext.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.3);
      osc1.frequency.exponentialRampToValueAtTime(2000, audioContext.currentTime + 0.8);
      
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(200, audioContext.currentTime);
      filter.frequency.exponentialRampToValueAtTime(4000, audioContext.currentTime + 0.6);
      
      gain1.gain.setValueAtTime(0, audioContext.currentTime);
      gain1.gain.linearRampToValueAtTime(0.12, audioContext.currentTime + 0.1);
      gain1.gain.linearRampToValueAtTime(0.06, audioContext.currentTime + 0.5);
      gain1.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 1.2);
      
      osc1.connect(filter);
      filter.connect(gain1);
      gain1.connect(audioContext.destination);
      
      osc1.start();
      osc1.stop(audioContext.currentTime + 1.2);
      
      // Thrust rumble
      const noiseBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 1, audioContext.sampleRate);
      const noiseData = noiseBuffer.getChannelData(0);
      for (let i = 0; i < noiseData.length; i++) {
        noiseData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / noiseData.length, 0.5);
      }
      
      const noiseSource = audioContext.createBufferSource();
      const noiseGain = audioContext.createGain();
      const noiseFilter = audioContext.createBiquadFilter();
      
      noiseSource.buffer = noiseBuffer;
      noiseFilter.type = 'lowpass';
      noiseFilter.frequency.value = 800;
      
      noiseGain.gain.setValueAtTime(0.08, audioContext.currentTime);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.8);
      
      noiseSource.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(audioContext.destination);
      
      noiseSource.start();
      noiseSource.stop(audioContext.currentTime + 1);
      
      // Sonic boom at end
      setTimeout(() => {
        try {
          const boomOsc = audioContext.createOscillator();
          const boomGain = audioContext.createGain();
          
          boomOsc.type = 'sine';
          boomOsc.frequency.value = 60;
          boomGain.gain.value = 0.15;
          
          boomOsc.connect(boomGain);
          boomGain.connect(audioContext.destination);
          
          boomOsc.start();
          boomGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
          boomOsc.stop(audioContext.currentTime + 0.3);
        } catch (e) {
          // Ignore if audio context closed
        }
      }, 700);
    } catch (e) {
      console.log('Audio not available');
    }
  }, []);

  // Handle spaceship click - launch it!
  const handleSpaceshipClick = useCallback((e: React.MouseEvent, shipId: number) => {
    e.stopPropagation();
    playClickSound();
    if (!isPotatoMode) {
      playTakeoffSound();
    }
    
    setSpaceships(prev => prev.map(ship => 
      ship.id === shipId ? { ...ship, isLaunching: true, launchProgress: 0 } : ship
    ));
  }, [playClickSound, playTakeoffSound, isPotatoMode]);

  // Animation loop for launching ships
  useEffect(() => {
    const launchingShips = spaceships.filter(s => s.isLaunching && s.launchProgress < 100);
    if (launchingShips.length === 0) return;

    const interval = setInterval(() => {
      setSpaceships(prev => prev.map(ship => {
        if (!ship.isLaunching) return ship;
        
        const newProgress = ship.launchProgress + (isPotatoMode ? 8 : 4);
        
        if (newProgress >= 100) {
          // Respawn after destroyed with new random variant
          return {
            ...ship,
            isLaunching: false,
            launchProgress: 0,
            offsetPercent: 20 + Math.random() * 60,
            variantIndex: Math.floor(Math.random() * SPACESHIP_VARIANTS.length),
          };
        }
        
        return { ...ship, launchProgress: newProgress };
      }));
    }, isPotatoMode ? 30 : 16);

    return () => clearInterval(interval);
  }, [spaceships, isPotatoMode]);

  // Get spaceship position styles based on its edge position
  const getShipStyles = (ship: Spaceship): React.CSSProperties => {
    const launchOffset = ship.isLaunching ? ship.launchProgress * 15 : 0;
    const opacity = ship.isLaunching ? Math.max(0, 1 - ship.launchProgress / 70) : 1;
    const scale = ship.isLaunching ? 1 + ship.launchProgress * 0.015 : 1;
    
    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      cursor: ship.isLaunching ? 'default' : 'pointer',
      transition: ship.isLaunching ? 'none' : 'transform 0.2s ease',
      opacity,
      zIndex: 100,
    };

    switch (ship.position) {
      case 'left':
        return {
          ...baseStyle,
          left: -20 - launchOffset,
          top: `${ship.offsetPercent}%`,
          transform: `scale(${scale}) rotate(270deg)`,
        };
      case 'right':
        return {
          ...baseStyle,
          right: -20 - launchOffset,
          top: `${ship.offsetPercent}%`,
          transform: `scale(${scale}) rotate(90deg)`,
        };
      case 'top':
        return {
          ...baseStyle,
          top: -20 - launchOffset,
          left: `${ship.offsetPercent}%`,
          transform: `scale(${scale}) rotate(0deg)`,
        };
      case 'bottom':
        return {
          ...baseStyle,
          bottom: -20 - launchOffset,
          left: `${ship.offsetPercent}%`,
          transform: `scale(${scale}) rotate(180deg)`,
        };
    }
  };

  // Render spaceship SVG with unique colors and animations
  const renderSpaceship = (ship: Spaceship) => {
    const size = isPotatoMode ? 20 : 28;
    const isLaunching = ship.isLaunching;
    const variant = SPACESHIP_VARIANTS[ship.variantIndex];
    
    return (
      <div
        key={ship.id}
        style={{
          ...getShipStyles(ship),
          animation: !isLaunching && !isPotatoMode 
            ? `shipFloat ${variant.pulseSpeed}s ease-in-out infinite` 
            : undefined,
          animationDelay: !isLaunching ? `${variant.floatDelay}s` : undefined,
        }}
        onClick={(e) => !ship.isLaunching && handleSpaceshipClick(e, ship.id)}
        className={`group ${!ship.isLaunching ? 'hover:scale-125' : ''}`}
        title={ship.isLaunching ? '' : `Launch ${variant.name}!`}
      >
        {/* Ambient glow when idle - not in potato mode */}
        {!isLaunching && !isPotatoMode && (
          <div 
            className="absolute -inset-2 rounded-full blur-md opacity-40 group-hover:opacity-70 transition-opacity"
            style={{
              background: `radial-gradient(circle, ${variant.glowColor}, transparent)`,
              animation: `shipGlow ${variant.pulseSpeed}s ease-in-out infinite`,
              animationDelay: `${variant.floatDelay}s`,
            }}
          />
        )}

        {/* Engine glow when launching */}
        {isLaunching && !isPotatoMode && (
          <div 
            className="absolute"
            style={{
              width: size * 0.5,
              height: size * 1.5,
              top: size * 0.7,
              left: '50%',
              transform: 'translateX(-50%)',
              background: `linear-gradient(to bottom, ${variant.engineColor}, hsl(15, 100%, 50%), transparent)`,
              borderRadius: '50%',
              filter: 'blur(4px)',
              animation: 'flicker 0.05s infinite alternate',
            }}
          />
        )}
        
        {/* Spaceship body */}
        <svg width={size} height={size} viewBox="0 0 32 32" style={{ filter: `drop-shadow(0 0 ${isLaunching ? 8 : 4}px ${variant.glowColor})` }}>
          {/* Main body */}
          <polygon
            points="16,2 26,26 16,22 6,26"
            fill={isLaunching ? variant.engineColor : variant.primaryColor}
            stroke={isLaunching ? 'hsl(35, 100%, 70%)' : variant.secondaryColor}
            strokeWidth="1.5"
            style={{ transition: 'fill 0.2s, stroke 0.2s' }}
          />
          {/* Cockpit */}
          <polygon
            points="16,6 22,22 16,18 10,22"
            fill="hsl(230, 30%, 15%)"
          />
          {/* Wing details */}
          <line x1="10" y1="18" x2="6" y2="26" stroke={variant.secondaryColor} strokeWidth="1" opacity="0.6" />
          <line x1="22" y1="18" x2="26" y2="26" stroke={variant.secondaryColor} strokeWidth="1" opacity="0.6" />
        </svg>
        
        {/* Hover indicator - not in potato mode */}
        {!isPotatoMode && !isLaunching && (
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            <span 
              className="font-pixel text-[7px] bg-background/90 px-1.5 py-0.5 rounded border"
              style={{ color: variant.primaryColor, borderColor: variant.primaryColor }}
            >
              LAUNCH
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`relative ${className}`}>
      {/* Main content - this is the actual panel */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Hangar frame - positioned OUTSIDE the content, pointer-events-none except for ships */}
      <div className="absolute -inset-6 pointer-events-none z-20">
        {/* Corner brackets - hangar docking clamps */}
        {!isPotatoMode && (
          <>
            {/* Top-left */}
            <div className="absolute top-0 left-0 w-12 h-12">
              <svg viewBox="0 0 48 48" className="w-full h-full">
                <path d="M4,4 L4,16 M4,4 L16,4" fill="none" stroke="hsl(var(--primary))" strokeWidth="3" strokeLinecap="round" />
                <circle cx="4" cy="4" r="2" fill="hsl(var(--primary))" className="animate-pulse" />
              </svg>
            </div>
            {/* Top-right */}
            <div className="absolute top-0 right-0 w-12 h-12">
              <svg viewBox="0 0 48 48" className="w-full h-full">
                <path d="M44,4 L44,16 M44,4 L32,4" fill="none" stroke="hsl(var(--primary))" strokeWidth="3" strokeLinecap="round" />
                <circle cx="44" cy="4" r="2" fill="hsl(var(--primary))" className="animate-pulse" />
              </svg>
            </div>
            {/* Bottom-left */}
            <div className="absolute bottom-0 left-0 w-12 h-12">
              <svg viewBox="0 0 48 48" className="w-full h-full">
                <path d="M4,44 L4,32 M4,44 L16,44" fill="none" stroke="hsl(var(--primary))" strokeWidth="3" strokeLinecap="round" />
                <circle cx="4" cy="44" r="2" fill="hsl(var(--primary))" className="animate-pulse" />
              </svg>
            </div>
            {/* Bottom-right */}
            <div className="absolute bottom-0 right-0 w-12 h-12">
              <svg viewBox="0 0 48 48" className="w-full h-full">
                <path d="M44,44 L44,32 M44,44 L32,44" fill="none" stroke="hsl(var(--primary))" strokeWidth="3" strokeLinecap="round" />
                <circle cx="44" cy="44" r="2" fill="hsl(var(--primary))" className="animate-pulse" />
              </svg>
            </div>
          </>
        )}

        {/* Hangar rail lines - thin lines on edges */}
        <div className="absolute top-5 left-12 right-12 h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <div className="absolute bottom-5 left-12 right-12 h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <div className="absolute left-5 top-12 bottom-12 w-0.5 bg-gradient-to-b from-transparent via-primary/30 to-transparent" />
        <div className="absolute right-5 top-12 bottom-12 w-0.5 bg-gradient-to-b from-transparent via-primary/30 to-transparent" />

        {/* Docking bay indicators - small lights */}
        {!isPotatoMode && (
          <>
            <div className="absolute top-4 left-1/4 w-6 h-1.5 rounded-full bg-primary/40 animate-pulse" style={{ animationDelay: '0s' }} />
            <div className="absolute top-4 right-1/4 w-6 h-1.5 rounded-full bg-secondary/40 animate-pulse" style={{ animationDelay: '0.5s' }} />
            <div className="absolute bottom-4 left-1/3 w-6 h-1.5 rounded-full bg-accent/40 animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute bottom-4 right-1/3 w-6 h-1.5 rounded-full bg-primary/40 animate-pulse" style={{ animationDelay: '1.5s' }} />
          </>
        )}

        {/* Spaceships - these need pointer-events */}
        <div className="pointer-events-auto">
          {spaceships.map(ship => renderSpaceship(ship))}
        </div>
      </div>

      {/* Animations for spaceships */}
      {!isPotatoMode && (
        <style>{`
          @keyframes flicker {
            0% { opacity: 0.8; transform: translateX(-50%) scaleY(1); }
            100% { opacity: 1; transform: translateX(-50%) scaleY(1.3); }
          }
          @keyframes shipFloat {
            0%, 100% { transform: scale(1) translateY(0); }
            50% { transform: scale(1.02) translateY(-2px); }
          }
          @keyframes shipGlow {
            0%, 100% { opacity: 0.3; transform: scale(1); }
            50% { opacity: 0.6; transform: scale(1.2); }
          }
        `}</style>
      )}
    </div>
  );
};

export default HangarBorder;
