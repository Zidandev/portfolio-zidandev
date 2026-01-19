import React, { createContext, useContext, useRef, useState, useCallback, useEffect } from 'react';

interface AudioContextType {
  isMuted: boolean;
  volume: number;
  toggleMute: () => void;
  setVolume: (vol: number) => void;
  playHoverSound: () => void;
  playClickSound: () => void;
  playCollisionSound: () => void;
  playEngineSound: (intensity: number) => void;
  stopEngineSound: () => void;
  playLaserSound: () => void;
  playExplosionSound: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolumeState] = useState(1);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const ambientNodesRef = useRef<OscillatorNode[]>([]);
  const engineOscRef = useRef<OscillatorNode | null>(null);
  const engineGainRef = useRef<GainNode | null>(null);

  const initAudio = useCallback(() => {
    if (isInitialized || audioContextRef.current) return;

    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = ctx;

      // Master gain
      const masterGain = ctx.createGain();
      masterGain.gain.value = volume;
      masterGain.connect(ctx.destination);
      masterGainRef.current = masterGain;

      // Create ambient space drone
      const createDrone = (freq: number, gain: number) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        
        osc.type = 'sine';
        osc.frequency.value = freq;
        
        filter.type = 'lowpass';
        filter.frequency.value = 200;
        filter.Q.value = 1;
        
        oscGain.gain.value = gain;
        
        osc.connect(filter);
        filter.connect(oscGain);
        oscGain.connect(masterGain);
        
        osc.start();
        ambientNodesRef.current.push(osc);

        // Add subtle frequency modulation for movement
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.type = 'sine';
        lfo.frequency.value = 0.1 + Math.random() * 0.2;
        lfoGain.gain.value = freq * 0.02;
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        lfo.start();
      };

      // Deep space ambient layers
      createDrone(40, 0.08);   // Sub bass
      createDrone(55, 0.05);   // Low drone
      createDrone(82, 0.03);   // Mid drone
      createDrone(110, 0.02);  // Higher harmonics
      createDrone(165, 0.01);  // Subtle high

      // Add some noise for texture
      const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
      const noiseData = noiseBuffer.getChannelData(0);
      for (let i = 0; i < noiseData.length; i++) {
        noiseData[i] = (Math.random() * 2 - 1) * 0.02;
      }
      
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;
      
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'lowpass';
      noiseFilter.frequency.value = 500;
      
      const noiseGain = ctx.createGain();
      noiseGain.gain.value = 0.1;
      
      noiseSource.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(masterGain);
      noiseSource.start();

      setIsInitialized(true);
    } catch (e) {
      console.log('Audio not supported');
    }
  }, [isInitialized, volume]);

  // Initialize on first user interaction
  useEffect(() => {
    const handleInteraction = () => {
      initAudio();
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };

    window.addEventListener('click', handleInteraction);
    window.addEventListener('keydown', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);

    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };
  }, [initAudio]);

  // Update master volume
  useEffect(() => {
    if (masterGainRef.current) {
      masterGainRef.current.gain.value = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  const setVolume = useCallback((vol: number) => {
    setVolumeState(Math.max(0, Math.min(1, vol)));
  }, []);

  const playHoverSound = useCallback(() => {
    if (!audioContextRef.current || isMuted) return;
    const ctx = audioContextRef.current;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.value = 800;
    gain.gain.value = 0.05 * volume;
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    osc.stop(ctx.currentTime + 0.1);
  }, [isMuted, volume]);

  const playClickSound = useCallback(() => {
    if (!audioContextRef.current || isMuted) return;
    const ctx = audioContextRef.current;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'square';
    osc.frequency.value = 200;
    gain.gain.value = 0.1 * volume;
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.05);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.stop(ctx.currentTime + 0.15);
  }, [isMuted, volume]);

  const playCollisionSound = useCallback(() => {
    if (!audioContextRef.current || isMuted) return;
    const ctx = audioContextRef.current;
    
    // Magical chime sound
    const frequencies = [523, 659, 784, 1047];
    
    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.value = 0.1 * volume;
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(ctx.currentTime + i * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.05 + 0.5);
      osc.stop(ctx.currentTime + i * 0.05 + 0.5);
    });
  }, [isMuted, volume]);

  const playEngineSound = useCallback((intensity: number) => {
    if (!audioContextRef.current || isMuted) return;
    const ctx = audioContextRef.current;
    
    if (!engineOscRef.current) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.value = 60;
      gain.gain.value = 0;
      
      osc.connect(gain);
      gain.connect(masterGainRef.current || ctx.destination);
      
      osc.start();
      engineOscRef.current = osc;
      engineGainRef.current = gain;
    }
    
    if (engineGainRef.current) {
      engineGainRef.current.gain.value = Math.min(intensity * 0.05, 0.1) * volume;
    }
    if (engineOscRef.current) {
      engineOscRef.current.frequency.value = 60 + intensity * 40;
    }
  }, [isMuted, volume]);

  const stopEngineSound = useCallback(() => {
    if (engineGainRef.current) {
      engineGainRef.current.gain.value = 0;
    }
  }, []);

  const playLaserSound = useCallback(() => {
    if (!audioContextRef.current || isMuted) return;
    const ctx = audioContextRef.current;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1000, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.15);
    gain.gain.value = 0.08 * volume;
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.stop(ctx.currentTime + 0.15);
  }, [isMuted, volume]);

  const playExplosionSound = useCallback(() => {
    if (!audioContextRef.current || isMuted) return;
    const ctx = audioContextRef.current;
    
    // Create noise buffer for explosion
    const bufferSize = ctx.sampleRate * 0.3;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
    }
    
    const source = ctx.createBufferSource();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    
    source.buffer = buffer;
    filter.type = 'lowpass';
    filter.frequency.value = 800;
    
    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    
    gain.gain.value = 0.15 * volume;
    source.start();
  }, [isMuted, volume]);

  return (
    <AudioContext.Provider value={{
      isMuted,
      volume,
      toggleMute,
      setVolume,
      playHoverSound,
      playClickSound,
      playCollisionSound,
      playEngineSound,
      stopEngineSound,
      playLaserSound,
      playExplosionSound,
    }}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};
