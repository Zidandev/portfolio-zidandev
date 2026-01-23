import React from 'react';
import { Switch } from '@/components/ui/switch';
import { usePotatoMode } from '@/contexts/PotatoModeContext';
import { useAudio } from '@/contexts/AudioContext';
import { Cpu, Zap } from 'lucide-react';

const PotatoModeSwitch: React.FC = () => {
  const { isPotatoMode, isTransitioning, togglePotatoMode } = usePotatoMode();
  const { playClickSound, playHoverSound } = useAudio();

  const handleToggle = () => {
    if (!isTransitioning) {
      playClickSound();
      togglePotatoMode();
    }
  };

  return (
    <div 
      className={`
        flex items-center gap-3 px-4 py-3 rounded-lg
        ${isPotatoMode 
          ? 'bg-accent/20 border border-accent/50' 
          : 'bg-muted/50 border border-primary/30'
        }
        transition-all duration-300
        ${isTransitioning ? 'animate-pulse' : ''}
      `}
      onMouseEnter={playHoverSound}
    >
      {/* Performance Icon */}
      <div className={`
        p-2 rounded-full transition-colors duration-300
        ${isPotatoMode 
          ? 'bg-accent/30 text-accent' 
          : 'bg-primary/30 text-primary'
        }
      `}>
        {isPotatoMode ? (
          <Cpu className="w-4 h-4 sm:w-5 sm:h-5" />
        ) : (
          <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
        )}
      </div>

      {/* Label */}
      <div className="flex flex-col">
        <span className={`
          font-pixel text-[10px] sm:text-xs uppercase tracking-wider
          ${isPotatoMode ? 'text-accent' : 'text-primary'}
        `}>
          {isPotatoMode ? 'Potato Mode' : 'Full Power'}
        </span>
        <span className="text-[8px] sm:text-[10px] text-muted-foreground">
          {isPotatoMode ? 'Low-end friendly' : 'Maximum effects'}
        </span>
      </div>

      {/* Switch */}
      <Switch
        checked={!isPotatoMode}
        onCheckedChange={handleToggle}
        disabled={isTransitioning}
        className={`
          ml-auto
          ${isPotatoMode 
            ? 'data-[state=unchecked]:bg-accent/50' 
            : 'data-[state=checked]:bg-primary'
          }
        `}
      />
    </div>
  );
};

export default PotatoModeSwitch;
