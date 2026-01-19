import React from 'react';
import { useAudio } from '@/contexts/AudioContext';
import { Volume2, VolumeX } from 'lucide-react';

const AudioControls: React.FC = () => {
  const { isMuted, volume, toggleMute, setVolume } = useAudio();

  return (
    <div className="fixed bottom-4 right-4 z-40 flex items-center gap-3 bg-card/80 backdrop-blur-sm rounded-lg p-3 border border-primary/30">
      <button
        onClick={toggleMute}
        className="p-2 rounded-full hover:bg-primary/20 transition-colors"
        aria-label={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted ? (
          <VolumeX className="w-5 h-5 text-muted-foreground" />
        ) : (
          <Volume2 className="w-5 h-5 text-primary" />
        )}
      </button>
      
      <input
        type="range"
        min="0"
        max="1"
        step="0.1"
        value={volume}
        onChange={(e) => setVolume(parseFloat(e.target.value))}
        className="w-20 h-1 bg-muted rounded-full appearance-none cursor-pointer
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:w-3
          [&::-webkit-slider-thumb]:h-3
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:bg-primary
          [&::-webkit-slider-thumb]:shadow-[0_0_10px_hsl(var(--primary))]"
      />
    </div>
  );
};

export default AudioControls;
