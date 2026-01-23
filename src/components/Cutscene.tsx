import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAudio } from '@/contexts/AudioContext';
import { usePotatoMode } from '@/contexts/PotatoModeContext';

interface CutsceneProps {
  onComplete: () => void;
}

interface DialogLine {
  speaker: 'system' | 'ai' | 'narrator';
  textKey: string;
}

const Cutscene: React.FC<CutsceneProps> = ({ onComplete }) => {
  const { t } = useLanguage();
  const { playClickSound, playHoverSound, playDialogSound, playAlienSpeech } = useAudio();
  const { isPotatoMode } = usePotatoMode();
  
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [showContinue, setShowContinue] = useState(false);
  const [phase, setPhase] = useState<'intro' | 'tutorial' | 'ready'>('intro');
  const [glitchEffect, setGlitchEffect] = useState(false);
  const [showCharacter, setShowCharacter] = useState(false);

  // Memoize dialog lines to prevent recreation on every render
  const dialogLines: DialogLine[] = useMemo(() => [
    { speaker: 'system', textKey: 'cutscene_boot' },
    { speaker: 'system', textKey: 'cutscene_init' },
    { speaker: 'ai', textKey: 'cutscene_greeting' },
    { speaker: 'ai', textKey: 'cutscene_intro1' },
    { speaker: 'ai', textKey: 'cutscene_intro2' },
    { speaker: 'narrator', textKey: 'cutscene_tutorial1' },
    { speaker: 'narrator', textKey: 'cutscene_tutorial2' },
    { speaker: 'narrator', textKey: 'cutscene_tutorial3' },
    { speaker: 'ai', textKey: 'cutscene_ready' },
    { speaker: 'system', textKey: 'cutscene_launch' },
  ], []);

  // Memoize star positions so they don't change on re-render - reduced in potato mode
  const stars = useMemo(() => {
    const count = isPotatoMode ? 15 : 50;
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 2,
      opacity: Math.random() * 0.8 + 0.2,
    }));
  }, [isPotatoMode]);

  // Memoize floating particles positions - skip in potato mode
  const particles = useMemo(() => {
    if (isPotatoMode) return [];
    return Array.from({ length: 6 }, (_, i) => ({
      id: i,
      left: 50 + Math.cos((i / 6) * Math.PI * 2) * 60,
      top: 50 + Math.sin((i / 6) * Math.PI * 2) * 60,
      delay: i * 0.2,
    }));
  }, [isPotatoMode]);

  const currentLine = dialogLines[currentLineIndex];

  // Play dialog sound when speaker changes
  useEffect(() => {
    if (currentLine) {
      playDialogSound(currentLine.speaker);
    }
  }, [currentLineIndex, currentLine, playDialogSound]);

  // Typewriter effect with alien speech sounds
  useEffect(() => {
    if (!currentLine) return;
    
    setDisplayedText('');
    setIsTyping(true);
    setShowContinue(false);

    let charIndex = 0;
    const text = t(currentLine.textKey);
    const speed = currentLine.speaker === 'system' ? 30 : 50;
    
    const typeInterval = setInterval(() => {
      if (charIndex < text.length) {
        const currentChar = text[charIndex];
        setDisplayedText(text.slice(0, charIndex + 1));
        charIndex++;
        
        // Play alien speech sound for each character (gives voice effect)
        playAlienSpeech(currentLine.speaker, currentChar);
        
        // Random glitch during typing - skip in potato mode
        if (!isPotatoMode && Math.random() > 0.95) {
          setGlitchEffect(true);
          setTimeout(() => setGlitchEffect(false), 100);
        }
      } else {
        clearInterval(typeInterval);
        setIsTyping(false);
        setShowContinue(true);
      }
    }, speed);

    return () => clearInterval(typeInterval);
  }, [currentLineIndex, currentLine, t, playAlienSpeech]);

  // Update phase based on line index
  useEffect(() => {
    if (currentLineIndex >= 5 && currentLineIndex < 8) {
      setPhase('tutorial');
    } else if (currentLineIndex >= 8) {
      setPhase('ready');
    } else {
      setPhase('intro');
    }
  }, [currentLineIndex]);

  // Show character after first system messages
  useEffect(() => {
    if (currentLineIndex >= 2) {
      setShowCharacter(true);
    }
  }, [currentLineIndex]);

  const handleContinue = useCallback(() => {
    playClickSound();
    
    if (currentLineIndex < dialogLines.length - 1) {
      if (!isPotatoMode) {
        setGlitchEffect(true);
        setTimeout(() => {
          setGlitchEffect(false);
          setCurrentLineIndex(prev => prev + 1);
        }, 150);
      } else {
        setCurrentLineIndex(prev => prev + 1);
      }
    } else {
      // Final transition
      if (!isPotatoMode) {
        setGlitchEffect(true);
      }
      setTimeout(() => {
        onComplete();
      }, isPotatoMode ? 100 : 500);
    }
  }, [currentLineIndex, dialogLines.length, onComplete, playClickSound, isPotatoMode]);

  const handleSkip = useCallback(() => {
    playClickSound();
    onComplete();
  }, [playClickSound, onComplete]);

  const getSpeakerColor = (speaker: string) => {
    switch (speaker) {
      case 'system': return 'text-green-400';
      case 'ai': return 'text-primary';
      case 'narrator': return 'text-secondary';
      default: return 'text-foreground';
    }
  };

  const getSpeakerName = (speaker: string) => {
    switch (speaker) {
      case 'system': return '[NEXUS.SYS]';
      case 'ai': return '[NAVIGATOR.AI]';
      case 'narrator': return '[GUIDE]';
      default: return '';
    }
  };

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-hidden">
      {/* Animated starfield background */}
      <div className="absolute inset-0 overflow-hidden">
        {stars.map((star) => (
          <div
            key={star.id}
            className={`absolute w-1 h-1 bg-white rounded-full ${isPotatoMode ? '' : 'animate-pulse'}`}
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
              animationDelay: isPotatoMode ? undefined : `${star.delay}s`,
              opacity: star.opacity,
            }}
          />
        ))}
      </div>

      {/* Scanlines overlay - skip in potato mode */}
      {!isPotatoMode && (
        <div className="absolute inset-0 pointer-events-none bg-scanlines opacity-30" />
      )}

      {/* Glitch overlay - skip in potato mode */}
      {!isPotatoMode && glitchEffect && (
        <div className="absolute inset-0 pointer-events-none z-40">
          <div className="absolute inset-0 bg-primary/20 animate-glitch-panel" />
          <div className="absolute inset-0 bg-secondary/20 animate-chromatic" style={{ mixBlendMode: 'screen' }} />
        </div>
      )}

      {/* Skip button */}
      <button
        className="absolute top-4 right-4 z-50 font-pixel text-xs text-muted-foreground hover:text-primary transition-colors px-4 py-2 border border-muted-foreground/30 hover:border-primary/50"
        onClick={handleSkip}
        onMouseEnter={playHoverSound}
      >
        SKIP &gt;&gt;
      </button>

      {/* Phase indicator */}
      <div className="absolute top-4 left-4 z-50">
        <div className="font-pixel text-xs text-muted-foreground mb-2">
          {phase === 'intro' && '[ INITIALIZATION ]'}
          {phase === 'tutorial' && '[ TUTORIAL ]'}
          {phase === 'ready' && '[ LAUNCH SEQUENCE ]'}
        </div>
        <div className="flex gap-1">
          {dialogLines.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 transition-all duration-300 ${
                i < currentLineIndex ? 'bg-primary' : 
                i === currentLineIndex ? 'bg-primary animate-pulse' : 
                'bg-muted-foreground/30'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Main content area */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-4">
        
        {/* Character avatar */}
        {showCharacter && currentLine?.speaker === 'ai' && (
          <div className="mb-8 animate-fade-in">
            <div className="relative">
              {/* Hologram effect */}
              <div className="absolute inset-0 bg-primary/20 blur-xl animate-pulse" />
              
              {/* Avatar container */}
              <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full border-2 border-primary overflow-hidden bg-background/50 backdrop-blur">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="font-pixel text-4xl text-primary animate-pulse">AI</div>
                </div>
                
                {/* Scan line effect */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/10 to-transparent animate-scan" />
              </div>
              
              {/* Floating particles around avatar */}
              {particles.map((particle) => (
                <div
                  key={particle.id}
                  className="absolute w-2 h-2 bg-primary rounded-full animate-float"
                  style={{
                    left: `${particle.left}%`,
                    top: `${particle.top}%`,
                    animationDelay: `${particle.delay}s`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* System terminal style for system messages */}
        {currentLine?.speaker === 'system' && (
          <div className="mb-8 animate-fade-in">
            <div className="w-16 h-16 md:w-20 md:h-20 border border-green-400/50 flex items-center justify-center bg-green-400/10">
              <div className="font-mono text-green-400 text-2xl animate-pulse">&gt;_</div>
            </div>
          </div>
        )}

        {/* Narrator book icon */}
        {currentLine?.speaker === 'narrator' && (
          <div className="mb-8 animate-fade-in">
            <div className="w-16 h-16 md:w-20 md:h-20 border border-secondary/50 flex items-center justify-center bg-secondary/10 rotate-3">
              <div className="font-pixel text-secondary text-lg">📖</div>
            </div>
          </div>
        )}

        {/* Dialog box */}
        <div 
          className={`max-w-2xl w-full transition-all duration-300 ${glitchEffect ? 'translate-x-1' : ''}`}
        >
          {/* Speaker name */}
          <div className={`font-pixel text-sm mb-2 ${getSpeakerColor(currentLine?.speaker || '')} animate-fade-in`}>
            {getSpeakerName(currentLine?.speaker || '')}
          </div>

          {/* Dialog container */}
          <div className="relative border-2 border-primary/50 bg-background/80 backdrop-blur-sm p-6 md:p-8">
            {/* Corner decorations */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary" />

            {/* Text content */}
            <p className={`font-orbitron text-sm md:text-base leading-relaxed min-h-[60px] ${
              currentLine?.speaker === 'system' ? 'text-green-400 font-mono' : 'text-foreground'
            }`}>
              {displayedText}
              {isTyping && (
                <span className="inline-block w-2 h-4 bg-primary ml-1 animate-pulse" />
              )}
            </p>

            {/* Glitch text effect on system messages */}
            {currentLine?.speaker === 'system' && glitchEffect && (
              <p className="absolute inset-6 md:inset-8 font-mono text-sm md:text-base text-red-400 opacity-50 translate-x-0.5 pointer-events-none">
                {displayedText}
              </p>
            )}
          </div>

          {/* Continue prompt */}
          {showContinue && (
            <div className="mt-4 flex justify-center animate-fade-in">
              <button
                className="group flex items-center gap-2 font-pixel text-sm text-primary hover:text-secondary transition-colors px-6 py-3 border border-primary/30 hover:border-primary/60 bg-background/50"
                onClick={handleContinue}
                onMouseEnter={playHoverSound}
              >
                <span className="animate-pulse">
                  {currentLineIndex === dialogLines.length - 1 ? t('cutscene_start') : t('cutscene_continue')}
                </span>
                <span className="group-hover:translate-x-1 transition-transform">▶</span>
              </button>
            </div>
          )}
        </div>

        {/* Tutorial visual elements */}
        {phase === 'tutorial' && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-8 animate-fade-in">
            {/* Joystick hint */}
            {currentLineIndex === 5 && (
              <div className="flex flex-col items-center gap-2 animate-bounce">
                <div className="w-12 h-12 border-2 border-primary rounded-full flex items-center justify-center bg-background/50">
                  <div className="w-4 h-4 bg-primary rounded-full" />
                </div>
                <span className="font-pixel text-xs text-primary">JOYSTICK</span>
              </div>
            )}
            
            {/* Navigation hint */}
            {currentLineIndex === 6 && (
              <div className="flex gap-4">
                {['ABOUT', 'PROJECTS', 'SKILLS'].map((item, i) => (
                  <div 
                    key={item}
                    className="px-3 py-2 border border-secondary text-secondary font-pixel text-xs animate-pulse bg-background/50"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  >
                    {item}
                  </div>
                ))}
              </div>
            )}

            {/* Explore hint */}
            {currentLineIndex === 7 && (
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 border border-primary animate-spin-slow flex items-center justify-center bg-background/50">
                  <span className="text-primary">★</span>
                </div>
                <span className="font-pixel text-xs text-muted-foreground">COLLECT & EXPLORE</span>
              </div>
            )}
          </div>
        )}

        {/* Launch countdown for final phase */}
        {phase === 'ready' && currentLineIndex === dialogLines.length - 1 && showContinue && (
          <div className="absolute bottom-32 left-1/2 -translate-x-1/2 animate-fade-in">
            <div className="font-pixel text-xl md:text-2xl text-primary neon-text animate-pulse">
              [ READY TO LAUNCH ]
            </div>
          </div>
        )}
      </div>

      {/* Bottom decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse" />
    </div>
  );
};

export default Cutscene;
