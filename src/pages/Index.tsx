import React, { useState } from 'react';
import VHSOverlay from '@/components/VHSOverlay';
import LoadingScreen from '@/components/LoadingScreen';
import MainMenu from '@/components/MainMenu';
import Cutscene from '@/components/Cutscene';
import LaunchTransition from '@/components/LaunchTransition';
import SpaceGame from '@/components/SpaceGame';
import AudioControls from '@/components/AudioControls';

type GameState = 'loading' | 'menu' | 'cutscene' | 'launching' | 'playing';

const Index: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('loading');

  const handleLoadingComplete = () => {
    setGameState('menu');
  };

  const handleStartJourney = () => {
    setGameState('cutscene');
  };

  const handleCutsceneComplete = () => {
    setGameState('launching');
  };

  const handleLaunchComplete = () => {
    setGameState('playing');
  };

  const handleBackToMenu = () => {
    setGameState('menu');
  };

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* VHS Effect Overlay - Always visible */}
      <VHSOverlay />

      {/* Audio Controls */}
      {gameState !== 'loading' && gameState !== 'cutscene' && gameState !== 'launching' && <AudioControls />}

      {/* Game States */}
      {gameState === 'loading' && (
        <LoadingScreen onComplete={handleLoadingComplete} />
      )}

      {gameState === 'menu' && (
        <MainMenu onStartJourney={handleStartJourney} />
      )}

      {gameState === 'cutscene' && (
        <Cutscene onComplete={handleCutsceneComplete} />
      )}

      {gameState === 'launching' && (
        <LaunchTransition onComplete={handleLaunchComplete} />
      )}

      {gameState === 'playing' && (
        <SpaceGame onBack={handleBackToMenu} />
      )}
    </div>
  );
};

export default Index;
