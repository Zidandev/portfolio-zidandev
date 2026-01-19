import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface LoadingScreenProps {
  onComplete: () => void;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const { t } = useLanguage();
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');

  const statusMessages = [
    'Connecting to Nexus...',
    'Loading star systems...',
    'Initializing spaceship...',
    'Calibrating navigation...',
    'Syncing coordinates...',
    'Ready for launch!',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + Math.random() * 15;
        if (newProgress >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 500);
          return 100;
        }
        return newProgress;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [onComplete]);

  useEffect(() => {
    const messageIndex = Math.min(
      Math.floor((progress / 100) * statusMessages.length),
      statusMessages.length - 1
    );
    setStatusText(statusMessages[messageIndex]);
  }, [progress]);

  return (
    <div className="fixed inset-0 space-bg flex flex-col items-center justify-center z-50">
      {/* Animated Stars Background */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary rounded-full animate-twinkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              opacity: Math.random() * 0.7 + 0.3,
            }}
          />
        ))}
      </div>

      {/* Main Loading Content */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-4">
        {/* Logo/Title */}
        <div className="text-center">
          <h1 className="font-pixel text-2xl md:text-4xl text-primary neon-text mb-4 animate-float">
            NEXUS SPACE
          </h1>
          <p className="font-pixel text-xs md:text-sm text-secondary neon-text-magenta">
            PORTFOLIO
          </p>
        </div>

        {/* Spinning Loader */}
        <div className="relative w-32 h-32">
          <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
          <div 
            className="absolute inset-0 border-4 border-transparent border-t-primary rounded-full animate-spin"
            style={{ animationDuration: '1s' }}
          />
          <div 
            className="absolute inset-2 border-2 border-transparent border-b-secondary rounded-full animate-spin"
            style={{ animationDuration: '1.5s', animationDirection: 'reverse' }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-pixel text-sm text-primary">
              {Math.floor(progress)}%
            </span>
          </div>
        </div>

        {/* Loading Bar */}
        <div className="w-64 md:w-80">
          <div className="loading-bar">
            <div
              className="loading-bar-fill transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Status Text */}
        <div className="text-center">
          <p className="font-pixel text-xs text-primary/80 mb-2">
            {t('loading')}
          </p>
          <p className="font-orbitron text-sm text-muted-foreground">
            {statusText}
          </p>
        </div>

        {/* Decorative Elements */}
        <div className="flex gap-2 mt-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 bg-primary rounded-full"
              style={{
                animation: 'star-pulse 0.5s ease-in-out infinite',
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
