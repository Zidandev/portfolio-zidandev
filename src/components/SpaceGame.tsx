import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAudio } from '@/contexts/AudioContext';
import Joystick from './Joystick';
import ContentPanel from './ContentPanel';

interface Star {
  id: string;
  x: number;
  y: number;
  contentType: string;
  label: string;
  color: string;
}

interface SpaceGameProps {
  onBack: () => void;
}

const SpaceGame: React.FC<SpaceGameProps> = ({ onBack }) => {
  const { t } = useLanguage();
  const { playCollisionSound, playEngineSound, stopEngineSound, playClickSound } = useAudio();
  const gameRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [velocity, setVelocity] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [activeContent, setActiveContent] = useState<string | null>(null);
  const [canInteract, setCanInteract] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const animationRef = useRef<number>();
  const keysPressed = useRef<Set<string>>(new Set());

  const WORLD_SIZE = 2000;
  const SHIP_SIZE = 40;
  const SPEED = 5;
  const FRICTION = 0.95;
  const STAR_RADIUS = 60;
  const INTERACTION_COOLDOWN = 1500;

  const stars: Star[] = [
    { id: 'about', x: -300, y: -200, contentType: 'about', label: t('aboutMe'), color: 'hsl(180, 100%, 50%)' },
    { id: 'skills', x: 300, y: -300, contentType: 'skills', label: t('skills'), color: 'hsl(320, 100%, 60%)' },
    { id: 'games', x: -400, y: 200, contentType: 'games', label: t('gameProjects'), color: 'hsl(35, 100%, 55%)' },
    { id: 'web', x: 400, y: 100, contentType: 'web', label: t('webProjects'), color: 'hsl(270, 80%, 50%)' },
    { id: 'certificates', x: 0, y: 400, contentType: 'certificates', label: t('certificates'), color: 'hsl(150, 100%, 45%)' },
    { id: 'social', x: -200, y: -450, contentType: 'social', label: t('socialMedia'), color: 'hsl(200, 100%, 50%)' },
  ];

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (['w', 'a', 's', 'd', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      keysPressed.current.add(e.key.toLowerCase());
    }
    if (e.key === 'Escape' && activeContent) {
      handleCloseContent();
    }
  }, [activeContent]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    keysPressed.current.delete(e.key.toLowerCase());
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  const updateMovement = useCallback(() => {
    if (activeContent) return;

    let dx = 0;
    let dy = 0;

    if (keysPressed.current.has('w') || keysPressed.current.has('arrowup')) dy -= 1;
    if (keysPressed.current.has('s') || keysPressed.current.has('arrowdown')) dy += 1;
    if (keysPressed.current.has('a') || keysPressed.current.has('arrowleft')) dx -= 1;
    if (keysPressed.current.has('d') || keysPressed.current.has('arrowright')) dx += 1;

    if (dx !== 0 || dy !== 0) {
      const length = Math.sqrt(dx * dx + dy * dy);
      dx /= length;
      dy /= length;

      setVelocity((prev) => ({
        x: prev.x + dx * SPEED * 0.1,
        y: prev.y + dy * SPEED * 0.1,
      }));

      setRotation(Math.atan2(dy, dx) * (180 / Math.PI) + 90);
      
      // Play engine sound
      const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
      playEngineSound(speed);
    } else {
      stopEngineSound();
    }
  }, [activeContent, velocity, playEngineSound, stopEngineSound]);

  const handleJoystickMove = useCallback((direction: { x: number; y: number }) => {
    if (activeContent) return;

    const { x, y } = direction;
    
    if (Math.abs(x) > 0.1 || Math.abs(y) > 0.1) {
      setVelocity((prev) => ({
        x: prev.x + x * SPEED * 0.15,
        y: prev.y + y * SPEED * 0.15,
      }));

      setRotation(Math.atan2(y, x) * (180 / Math.PI) + 90);
      
      const speed = Math.sqrt(x * x + y * y);
      playEngineSound(speed);
    } else {
      stopEngineSound();
    }
  }, [activeContent, playEngineSound, stopEngineSound]);

  const handleJoystickStop = useCallback(() => {
    stopEngineSound();
    // Velocity will naturally decay due to friction
  }, [stopEngineSound]);

  const checkCollisions = useCallback(() => {
    if (!canInteract || activeContent) return;

    for (const star of stars) {
      const dx = position.x - star.x;
      const dy = position.y - star.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < STAR_RADIUS) {
        setActiveContent(star.contentType);
        setCanInteract(false);
        
        // Play collision sound
        playCollisionSound();
        break;
      }
    }
  }, [position, canInteract, activeContent, stars, playCollisionSound]);

  const handleCloseContent = useCallback(() => {
    playClickSound();
    setActiveContent(null);
    
    // Set cooldown before allowing next interaction
    setTimeout(() => {
      setCanInteract(true);
    }, INTERACTION_COOLDOWN);
  }, []);

  const gameLoop = useCallback(() => {
    updateMovement();

    setVelocity((prev) => ({
      x: prev.x * FRICTION,
      y: prev.y * FRICTION,
    }));

    setPosition((prev) => {
      const newX = Math.max(-WORLD_SIZE / 2, Math.min(WORLD_SIZE / 2, prev.x + velocity.x));
      const newY = Math.max(-WORLD_SIZE / 2, Math.min(WORLD_SIZE / 2, prev.y + velocity.y));
      return { x: newX, y: newY };
    });

    checkCollisions();

    animationRef.current = requestAnimationFrame(gameLoop);
  }, [updateMovement, velocity, checkCollisions]);

  useEffect(() => {
    animationRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameLoop]);

  // Generate background stars
  const backgroundStars = React.useMemo(() => {
    return [...Array(200)].map((_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * WORLD_SIZE * 1.5,
      y: (Math.random() - 0.5) * WORLD_SIZE * 1.5,
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.5 + 0.2,
      delay: Math.random() * 3,
    }));
  }, [playClickSound]);

  return (
    <div ref={gameRef} className="fixed inset-0 space-bg overflow-hidden">
      {/* World Container */}
      <div
        className="absolute"
        style={{
          width: WORLD_SIZE,
          height: WORLD_SIZE,
          left: '50%',
          top: '50%',
          transform: `translate(calc(-50% - ${position.x}px), calc(-50% - ${position.y}px))`,
        }}
      >
        {/* Background Stars */}
        {backgroundStars.map((star) => (
          <div
            key={star.id}
            className="absolute rounded-full bg-foreground animate-twinkle"
            style={{
              left: star.x + WORLD_SIZE / 2,
              top: star.y + WORLD_SIZE / 2,
              width: star.size,
              height: star.size,
              opacity: star.opacity,
              animationDelay: `${star.delay}s`,
            }}
          />
        ))}

        {/* Content Stars */}
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute flex flex-col items-center"
            style={{
              left: star.x + WORLD_SIZE / 2 - 50,
              top: star.y + WORLD_SIZE / 2 - 50,
            }}
          >
            {/* Star Glow */}
            <div
              className="w-24 h-24 rounded-full star-glow flex items-center justify-center"
              style={{
                background: `radial-gradient(circle, ${star.color} 0%, transparent 70%)`,
                boxShadow: `0 0 30px ${star.color}, 0 0 60px ${star.color}40`,
              }}
            >
              <div
                className="w-12 h-12 rounded-full"
                style={{
                  background: star.color,
                  boxShadow: `0 0 20px ${star.color}`,
                }}
              />
            </div>
            {/* Label */}
            <span className="mt-2 font-pixel text-xs text-foreground whitespace-nowrap">
              {star.label}
            </span>
          </div>
        ))}

        {/* World Border Indicators */}
        <div className="absolute inset-0 border-2 border-primary/20 rounded-lg pointer-events-none">
          <div className="absolute top-2 left-1/2 -translate-x-1/2 font-pixel text-xs text-primary/50">
            ▲ WORLD BORDER
          </div>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 font-pixel text-xs text-primary/50">
            ▼ WORLD BORDER
          </div>
          <div className="absolute left-2 top-1/2 -translate-y-1/2 font-pixel text-xs text-primary/50 writing-mode-vertical">
            ◄ BORDER
          </div>
          <div className="absolute right-2 top-1/2 -translate-y-1/2 font-pixel text-xs text-primary/50">
            BORDER ►
          </div>
        </div>
      </div>

      {/* Spaceship (Fixed at center) */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
        style={{
          transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
          transition: 'transform 0.1s ease-out',
        }}
      >
        <div className="relative">
          {/* Engine Glow */}
          <div
            className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-4 h-8 rounded-full blur-sm"
            style={{
              background: 'linear-gradient(to bottom, hsl(35, 100%, 55%), transparent)',
              opacity: Math.abs(velocity.x) + Math.abs(velocity.y) > 0.5 ? 1 : 0.3,
            }}
          />
          {/* Ship Body */}
          <svg width={SHIP_SIZE} height={SHIP_SIZE} viewBox="0 0 40 40">
            <polygon
              points="20,5 35,35 20,28 5,35"
              fill="hsl(180, 100%, 50%)"
              stroke="hsl(180, 100%, 70%)"
              strokeWidth="2"
            />
            <polygon
              points="20,10 30,32 20,26 10,32"
              fill="hsl(230, 30%, 15%)"
            />
          </svg>
        </div>
      </div>

      {/* HUD */}
      <div className="fixed top-4 left-4 z-30">
        <button
          onClick={onBack}
          className="neon-button text-xs px-4 py-2"
        >
          ← MENU
        </button>
      </div>

      <div className="fixed top-4 right-4 z-30 font-pixel text-xs text-primary/70">
        <div>X: {Math.floor(position.x)}</div>
        <div>Y: {Math.floor(position.y)}</div>
      </div>

      {/* Controls Hint */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 font-pixel text-xs text-muted-foreground text-center">
        {isMobile ? t('touchControls') : t('controls')}
      </div>

      {/* Mobile Joystick */}
      {isMobile && (
        <div className="fixed bottom-8 left-8 z-30">
          <Joystick onMove={handleJoystickMove} onStop={handleJoystickStop} />
        </div>
      )}

      {/* Content Panel */}
      {activeContent && (
        <ContentPanel contentType={activeContent} onClose={handleCloseContent} />
      )}
    </div>
  );
};

export default SpaceGame;
