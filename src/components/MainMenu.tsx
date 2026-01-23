import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAudio } from '@/contexts/AudioContext';
import { usePotatoMode } from '@/contexts/PotatoModeContext';
import LanguageSelector from './LanguageSelector';
import PotatoModeSwitch from './PotatoModeSwitch';

interface MainMenuProps {
  onStartJourney: () => void;
}

interface Spaceship {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  size: number;
  color: string;
  isChasing?: boolean;
  targetId?: number;
}

interface Meteor {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
}

interface Planet {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  orbitSpeed: number;
  orbitRadius: number;
  orbitAngle: number;
}

interface Laser {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
}

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  twinkleSpeed: number;
}

const MainMenu: React.FC<MainMenuProps> = ({ onStartJourney }) => {
  const { t } = useLanguage();
  const { playHoverSound, playClickSound, playLaserSound, playExplosionSound } = useAudio();
  const { isPotatoMode } = usePotatoMode();
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [showExitMessage, setShowExitMessage] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const spaceshipsRef = useRef<Spaceship[]>([]);
  const meteorsRef = useRef<Meteor[]>([]);
  const planetsRef = useRef<Planet[]>([]);
  const lasersRef = useRef<Laser[]>([]);
  const starsRef = useRef<Star[]>([]);
  const lastShotTimeRef = useRef<number>(0);

  // Initialize animation objects - reduced for potato mode
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    // Create stars - reduced count for potato mode
    const starCount = isPotatoMode ? 30 : 150;
    starsRef.current = Array.from({ length: starCount }, (_, i) => ({
      id: i,
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.8 + 0.2,
      twinkleSpeed: Math.random() * 0.02 + 0.01
    }));

    // Create spaceships - none in potato mode
    const colors = ['#00ffff', '#ff00ff', '#ffff00', '#00ff00', '#ff6600'];
    const shipCount = isPotatoMode ? 0 : 8;
    spaceshipsRef.current = Array.from({ length: shipCount }, (_, i) => ({
      id: i,
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 3,
      vy: (Math.random() - 0.5) * 3,
      rotation: Math.random() * Math.PI * 2,
      size: 15 + Math.random() * 10,
      color: colors[i % colors.length],
      isChasing: i % 2 === 0,
      targetId: i % 2 === 0 ? (i + 1) % 8 : undefined
    }));

    // Create meteors - reduced for potato mode
    const meteorCount = isPotatoMode ? 3 : 12;
    meteorsRef.current = Array.from({ length: meteorCount }, (_, i) => ({
      id: i,
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 2,
      vy: Math.random() * 1.5 + 0.5,
      size: 10 + Math.random() * 25,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.05
    }));

    // Create planets - reduced for potato mode
    const allPlanets = [
      { id: 0, x: width * 0.15, y: height * 0.2, size: 60, color: '#ff6b6b', orbitSpeed: 0.001, orbitRadius: 0, orbitAngle: 0 },
      { id: 1, x: width * 0.85, y: height * 0.3, size: 80, color: '#4ecdc4', orbitSpeed: 0.0008, orbitRadius: 0, orbitAngle: Math.PI },
      { id: 2, x: width * 0.1, y: height * 0.8, size: 50, color: '#ffe66d', orbitSpeed: 0.0012, orbitRadius: 0, orbitAngle: Math.PI / 2 },
      { id: 3, x: width * 0.9, y: height * 0.75, size: 70, color: '#95e1d3', orbitSpeed: 0.0006, orbitRadius: 0, orbitAngle: Math.PI * 1.5 }
    ];
    planetsRef.current = isPotatoMode ? allPlanets.slice(0, 1) : allPlanets;

    lasersRef.current = [];

    // Animation loop
    const animate = (time: number) => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const w = canvas.width;
      const h = canvas.height;

      // Clear canvas
      ctx.fillStyle = 'rgba(10, 10, 30, 0.3)';
      ctx.fillRect(0, 0, w, h);

      // Draw and update stars (simplified in potato mode)
      starsRef.current.forEach(star => {
        if (!isPotatoMode) {
          star.opacity = 0.3 + Math.sin(time * star.twinkleSpeed) * 0.5;
        }
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${isPotatoMode ? 0.6 : star.opacity})`;
        ctx.fill();
      });

      // Draw and update planets (simplified in potato mode)
      planetsRef.current.forEach(planet => {
        if (!isPotatoMode) {
          planet.orbitAngle += planet.orbitSpeed;
          
          // Draw planet glow (skip in potato mode)
          const gradient = ctx.createRadialGradient(planet.x, planet.y, 0, planet.x, planet.y, planet.size * 1.5);
          gradient.addColorStop(0, planet.color);
          gradient.addColorStop(0.5, planet.color + '80');
          gradient.addColorStop(1, 'transparent');
          ctx.beginPath();
          ctx.arc(planet.x, planet.y, planet.size * 1.5, 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.fill();
        }

        // Draw planet
        ctx.beginPath();
        ctx.arc(planet.x, planet.y, planet.size, 0, Math.PI * 2);
        ctx.fillStyle = planet.color;
        ctx.fill();

        // Draw planet rings for some (skip in potato mode)
        if (!isPotatoMode && planet.id % 2 === 0) {
          ctx.save();
          ctx.translate(planet.x, planet.y);
          ctx.rotate(0.3);
          ctx.scale(1, 0.3);
          ctx.beginPath();
          ctx.arc(0, 0, planet.size * 1.4, 0, Math.PI * 2);
          ctx.strokeStyle = planet.color + '80';
          ctx.lineWidth = 3;
          ctx.stroke();
          ctx.restore();
        }
      });

      // Update and draw meteors (simplified in potato mode)
      meteorsRef.current.forEach(meteor => {
        meteor.x += meteor.vx;
        meteor.y += meteor.vy;
        if (!isPotatoMode) {
          meteor.rotation += meteor.rotationSpeed;
        }

        // Wrap around screen
        if (meteor.x < -50) meteor.x = w + 50;
        if (meteor.x > w + 50) meteor.x = -50;
        if (meteor.y > h + 50) {
          meteor.y = -50;
          meteor.x = Math.random() * w;
        }

        ctx.save();
        ctx.translate(meteor.x, meteor.y);
        ctx.rotate(meteor.rotation);

        if (!isPotatoMode) {
          // Draw meteor with tail (full mode only)
          const tailGradient = ctx.createLinearGradient(0, 0, -meteor.size * 2, -meteor.size);
          tailGradient.addColorStop(0, '#ff6600');
          tailGradient.addColorStop(1, 'transparent');
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(-meteor.size * 2, -meteor.size * 0.5);
          ctx.lineTo(-meteor.size * 1.5, 0);
          ctx.closePath();
          ctx.fillStyle = tailGradient;
          ctx.fill();

          // Draw meteor body with gradient
          ctx.beginPath();
          ctx.arc(0, 0, meteor.size / 2, 0, Math.PI * 2);
          const meteorGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, meteor.size / 2);
          meteorGradient.addColorStop(0, '#ffcc00');
          meteorGradient.addColorStop(0.5, '#ff6600');
          meteorGradient.addColorStop(1, '#993300');
          ctx.fillStyle = meteorGradient;
          ctx.fill();
        } else {
          // Simple meteor in potato mode
          ctx.beginPath();
          ctx.arc(0, 0, meteor.size / 2, 0, Math.PI * 2);
          ctx.fillStyle = '#ff6600';
          ctx.fill();
        }

        ctx.restore();
      });

      // Update and draw spaceships
      spaceshipsRef.current.forEach(ship => {
        // Chase behavior
        if (ship.isChasing && ship.targetId !== undefined) {
          const target = spaceshipsRef.current.find(s => s.id === ship.targetId);
          if (target) {
            const dx = target.x - ship.x;
            const dy = target.y - ship.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 50) {
              ship.vx += (dx / dist) * 0.1;
              ship.vy += (dy / dist) * 0.1;
            }
            ship.rotation = Math.atan2(dy, dx);

            // Shoot lasers occasionally
            if (time - lastShotTimeRef.current > 500 && dist < 300 && Math.random() > 0.95) {
              lasersRef.current.push({
                id: Date.now() + Math.random(),
                x: ship.x,
                y: ship.y,
                vx: Math.cos(ship.rotation) * 8,
                vy: Math.sin(ship.rotation) * 8,
                color: ship.color
              });
              lastShotTimeRef.current = time;
              playLaserSound();
            }
          }
        } else {
          // Evade behavior
          const chaser = spaceshipsRef.current.find(s => s.targetId === ship.id);
          if (chaser) {
            const dx = ship.x - chaser.x;
            const dy = ship.y - chaser.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 200) {
              ship.vx += (dx / dist) * 0.15;
              ship.vy += (dy / dist) * 0.15;
            }
            ship.rotation = Math.atan2(ship.vy, ship.vx);
          }
        }

        // Limit speed
        const speed = Math.sqrt(ship.vx * ship.vx + ship.vy * ship.vy);
        if (speed > 4) {
          ship.vx = (ship.vx / speed) * 4;
          ship.vy = (ship.vy / speed) * 4;
        }

        ship.x += ship.vx;
        ship.y += ship.vy;

        // Wrap around screen
        if (ship.x < -50) ship.x = w + 50;
        if (ship.x > w + 50) ship.x = -50;
        if (ship.y < -50) ship.y = h + 50;
        if (ship.y > h + 50) ship.y = -50;

        // Draw spaceship
        ctx.save();
        ctx.translate(ship.x, ship.y);
        ctx.rotate(ship.rotation);

        // Engine glow
        const engineGlow = ctx.createRadialGradient(-ship.size, 0, 0, -ship.size, 0, ship.size);
        engineGlow.addColorStop(0, ship.color);
        engineGlow.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(-ship.size, 0, ship.size * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = engineGlow;
        ctx.fill();

        // Ship body
        ctx.beginPath();
        ctx.moveTo(ship.size, 0);
        ctx.lineTo(-ship.size * 0.7, -ship.size * 0.5);
        ctx.lineTo(-ship.size * 0.4, 0);
        ctx.lineTo(-ship.size * 0.7, ship.size * 0.5);
        ctx.closePath();
        ctx.fillStyle = ship.color;
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.restore();
      });

      // Update and draw lasers
      lasersRef.current = lasersRef.current.filter(laser => {
        laser.x += laser.vx;
        laser.y += laser.vy;

        // Remove if off screen
        if (laser.x < 0 || laser.x > w || laser.y < 0 || laser.y > h) {
          return false;
        }

        // Draw laser
        ctx.save();
        ctx.translate(laser.x, laser.y);
        ctx.rotate(Math.atan2(laser.vy, laser.vx));

        const laserGradient = ctx.createLinearGradient(-20, 0, 10, 0);
        laserGradient.addColorStop(0, 'transparent');
        laserGradient.addColorStop(0.5, laser.color);
        laserGradient.addColorStop(1, '#ffffff');

        ctx.beginPath();
        ctx.moveTo(-20, 0);
        ctx.lineTo(10, 0);
        ctx.strokeStyle = laserGradient;
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.restore();

        // Check collision with non-chasing ships
        spaceshipsRef.current.forEach(ship => {
          if (!ship.isChasing) {
            const dx = laser.x - ship.x;
            const dy = laser.y - ship.y;
            if (Math.sqrt(dx * dx + dy * dy) < ship.size) {
              // Create explosion effect (visual only)
              playExplosionSound();
              // Respawn ship at random location
              ship.x = Math.random() * w;
              ship.y = Math.random() * h;
            }
          }
        });

        return true;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    const handleResize = () => {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [playLaserSound, playExplosionSound, isPotatoMode]);

  const handleExit = () => {
    playClickSound();
    setShowExitMessage(true);
    setTimeout(() => {
      window.close();
      setShowExitMessage(false);
    }, 2000);
  };

  const handleButtonClick = (action: () => void) => {
    playClickSound();
    action();
  };

  const handleHover = () => {
    playHoverSound();
  };

  return (
    <div className="fixed inset-0 bg-[#0a0a1e] flex flex-col items-center justify-center z-40 overflow-hidden">
      {/* Animated Background Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ background: 'linear-gradient(180deg, #0a0a1e 0%, #1a1a3e 50%, #0a0a1e 100%)' }}
      />

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center gap-8 md:gap-12 px-4">
        {/* Title */}
        <div className={`text-center ${isPotatoMode ? '' : 'animate-fade-in'}`}>
          <h1 className={`font-pixel text-2xl sm:text-3xl md:text-5xl text-primary mb-4 tracking-wider ${isPotatoMode ? '' : 'neon-text'}`}>
            NEXUS SPACE
          </h1>
          <div className={`font-pixel text-base sm:text-lg md:text-2xl text-secondary mb-2 ${isPotatoMode ? '' : 'neon-text-magenta'}`}>
            PORTFOLIO
          </div>
          <p className="font-orbitron text-xs sm:text-sm md:text-base text-muted-foreground">
            ZIDANDEV
          </p>
        </div>

        {/* Decorative Line */}
        <div className={`w-32 sm:w-48 md:w-64 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent ${isPotatoMode ? '' : 'animate-pulse'}`} />

        {/* Potato Mode Switch */}
        <PotatoModeSwitch />

        {/* Menu Buttons */}
        <div className="flex flex-col gap-4 md:gap-6 w-full max-w-xs sm:max-w-sm md:max-w-md">
          <button
            className={`neon-button w-full text-sm sm:text-base ${isPotatoMode ? '' : 'animate-fade-in'}`}
            style={{ animationDelay: '0.2s' }}
            onClick={() => handleButtonClick(onStartJourney)}
            onMouseEnter={handleHover}
          >
            {t('startJourney')}
          </button>

          <button
            className={`neon-button neon-button-secondary w-full text-sm sm:text-base ${isPotatoMode ? '' : 'animate-fade-in'}`}
            style={{ animationDelay: '0.4s' }}
            onClick={() => handleButtonClick(() => setShowLanguageSelector(true))}
            onMouseEnter={handleHover}
          >
            {t('changeLanguage')}
          </button>

          <button
            className={`neon-button neon-button-accent w-full text-sm sm:text-base ${isPotatoMode ? '' : 'animate-fade-in'}`}
            style={{ animationDelay: '0.6s' }}
            onClick={handleExit}
            onMouseEnter={handleHover}
          >
            {t('exit')}
          </button>
        </div>

        {/* Version Info */}
        <p className="font-pixel text-[10px] sm:text-xs text-muted-foreground/50 mt-4 md:mt-8">
          v1.0.0 • NEXUS ENGINE
        </p>
      </div>

      {/* Language Selector Modal */}
      {showLanguageSelector && (
        <LanguageSelector onClose={() => setShowLanguageSelector(false)} />
      )}

      {/* Exit Message */}
      {showExitMessage && (
        <div className="fixed inset-0 bg-background/90 flex items-center justify-center z-50">
          <div className={`text-center ${isPotatoMode ? '' : 'animate-fade-in'}`}>
            <p className={`font-pixel text-lg sm:text-xl text-primary ${isPotatoMode ? '' : 'neon-text'}`}>
              {t('exitConfirm')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainMenu;
