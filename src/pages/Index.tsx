import React, { useState } from 'react';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { AudioProvider } from '@/contexts/AudioContext';
import VHSOverlay from '@/components/VHSOverlay';
import LoadingScreen from '@/components/LoadingScreen';
import MainMenu from '@/components/MainMenu';
import SpaceGame from '@/components/SpaceGame';
import AudioControls from '@/components/AudioControls';

type GameState = 'loading' | 'menu' | 'playing';

const Index: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('loading');

  const handleLoadingComplete = () => {
    setGameState('menu');
  };

  const handleStartJourney = () => {
    setGameState('playing');
  };

  const handleBackToMenu = () => {
    setGameState('menu');
  };

  return (
    <LanguageProvider>
      <AudioProvider>
        <div className="relative min-h-screen bg-background overflow-hidden">
          {/* VHS Effect Overlay - Always visible */}
          <VHSOverlay />

          {/* Audio Controls */}
          {gameState !== 'loading' && <AudioControls />}

          {/* Game States */}
          {gameState === 'loading' && (
            <LoadingScreen onComplete={handleLoadingComplete} />
          )}

          {gameState === 'menu' && (
            <MainMenu onStartJourney={handleStartJourney} />
          )}

          {gameState === 'playing' && (
            <SpaceGame onBack={handleBackToMenu} />
          )}
        </div>
      </AudioProvider>
    </LanguageProvider>
  );
};

export default Index;
