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
  playDialogSound: (speaker: 'system' | 'ai' | 'narrator') => void;
  playTypingSound: (speaker: 'system' | 'ai' | 'narrator') => void;
  playAlienSpeech: (speaker: 'system' | 'ai' | 'narrator', char: string) => void;
  playCountdownBeep: (number: number) => void;
  playLaunchRumble: () => void;
  playHyperspaceWhoosh: () => void;
}

const AudioCtx = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolumeState] = useState(1);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const webAudioContextRef = useRef<globalThis.AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const ambientNodesRef = useRef<OscillatorNode[]>([]);
  const engineOscRef = useRef<OscillatorNode | null>(null);
  const engineGainRef = useRef<GainNode | null>(null);

  const initAudio = useCallback(() => {
    if (isInitialized || webAudioContextRef.current) return;

    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      webAudioContextRef.current = ctx;

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
    if (!webAudioContextRef.current || isMuted) return;
    const ctx = webAudioContextRef.current;
    
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
    if (!webAudioContextRef.current || isMuted) return;
    const ctx = webAudioContextRef.current;
    
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
    if (!webAudioContextRef.current || isMuted) return;
    const ctx = webAudioContextRef.current;
    
    // Soft magical chime with gradual fade - like arriving at a destination
    const frequencies = [523, 659, 784, 1047];
    
    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      
      osc.type = 'sine';
      osc.frequency.value = freq;
      
      // Lowpass filter to soften the sound
      filter.type = 'lowpass';
      filter.frequency.value = 2000;
      filter.Q.value = 0.5;
      
      // Start quieter and fade out smoothly
      const startTime = ctx.currentTime + i * 0.08;
      const initialGain = 0.06 * volume * (1 - i * 0.15); // Each note slightly quieter
      
      gain.gain.setValueAtTime(initialGain, startTime);
      // Gradual fade out over longer duration
      gain.gain.linearRampToValueAtTime(initialGain * 0.5, startTime + 0.15);
      gain.gain.linearRampToValueAtTime(initialGain * 0.2, startTime + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.5);
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(startTime);
      osc.stop(startTime + 0.55);
    });
    
    // Add soft sub-bass thump for impact feel
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    
    subOsc.type = 'sine';
    subOsc.frequency.value = 80;
    subGain.gain.setValueAtTime(0.08 * volume, ctx.currentTime);
    subGain.gain.linearRampToValueAtTime(0.04 * volume, ctx.currentTime + 0.1);
    subGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    
    subOsc.connect(subGain);
    subGain.connect(ctx.destination);
    
    subOsc.start();
    subOsc.stop(ctx.currentTime + 0.3);
  }, [isMuted, volume]);

  const playEngineSound = useCallback((intensity: number) => {
    if (!webAudioContextRef.current || isMuted) return;
    const ctx = webAudioContextRef.current;
    
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
    if (!webAudioContextRef.current || isMuted) return;
    const ctx = webAudioContextRef.current;
    
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
    if (!webAudioContextRef.current || isMuted) return;
    const ctx = webAudioContextRef.current;
    
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

  // Dialog sound for each character - plays when dialog starts
  const playDialogSound = useCallback((speaker: 'system' | 'ai' | 'narrator') => {
    if (!webAudioContextRef.current || isMuted) return;
    const ctx = webAudioContextRef.current;
    
    switch (speaker) {
      case 'system': {
        // System: Digital beep sequence (like a computer boot)
        const frequencies = [880, 1100, 880, 1320];
        frequencies.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          
          osc.type = 'square';
          osc.frequency.value = freq;
          gain.gain.value = 0.06 * volume;
          
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          const startTime = ctx.currentTime + i * 0.08;
          osc.start(startTime);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.07);
          osc.stop(startTime + 0.08);
        });
        break;
      }
      case 'ai': {
        // AI Navigator: Warm, melodic chime (friendly AI)
        const frequencies = [523, 659, 784, 1047, 1319];
        frequencies.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          
          osc.type = 'sine';
          osc.frequency.value = freq;
          gain.gain.value = 0.08 * volume * (1 - i * 0.15);
          
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          const startTime = ctx.currentTime + i * 0.06;
          osc.start(startTime);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);
          osc.stop(startTime + 0.3);
        });
        break;
      }
      case 'narrator': {
        // Guide: Soft, mystical whoosh with reverb feel
        const osc = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        
        osc.type = 'sine';
        osc.frequency.value = 220;
        osc2.type = 'sine';
        osc2.frequency.value = 330;
        
        filter.type = 'lowpass';
        filter.frequency.value = 800;
        filter.Q.value = 2;
        
        gain.gain.value = 0.1 * volume;
        
        osc.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        
        osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);
        osc2.frequency.exponentialRampToValueAtTime(550, ctx.currentTime + 0.3);
        
        osc.start();
        osc2.start();
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.stop(ctx.currentTime + 0.45);
        osc2.stop(ctx.currentTime + 0.45);
        break;
      }
    }
  }, [isMuted, volume]);

  // Typing sound effect for each character
  const playTypingSound = useCallback((speaker: 'system' | 'ai' | 'narrator') => {
    if (!webAudioContextRef.current || isMuted) return;
    const ctx = webAudioContextRef.current;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    switch (speaker) {
      case 'system': {
        // System: Sharp digital tick
        osc.type = 'square';
        osc.frequency.value = 1200 + Math.random() * 400;
        gain.gain.value = 0.02 * volume;
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
        osc.stop(ctx.currentTime + 0.03);
        break;
      }
      case 'ai': {
        // AI: Soft melodic blip
        osc.type = 'sine';
        osc.frequency.value = 600 + Math.random() * 200;
        gain.gain.value = 0.025 * volume;
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start();
        osc.frequency.exponentialRampToValueAtTime(osc.frequency.value * 1.2, ctx.currentTime + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        osc.stop(ctx.currentTime + 0.05);
        break;
      }
      case 'narrator': {
        // Guide: Gentle whisper tick
        osc.type = 'triangle';
        osc.frequency.value = 300 + Math.random() * 100;
        gain.gain.value = 0.03 * volume;
        
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 600;
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
        osc.stop(ctx.currentTime + 0.06);
        break;
      }
    }
  }, [isMuted, volume]);

  // Alien speech sound - unique voice for each character
  const playAlienSpeech = useCallback((speaker: 'system' | 'ai' | 'narrator', char: string) => {
    if (!webAudioContextRef.current || isMuted) return;
    // Skip spaces and punctuation for cleaner sound
    if (/[\s.,!?;:'"()\[\]{}]/.test(char)) return;
    
    const ctx = webAudioContextRef.current;
    const charCode = char.charCodeAt(0);
    
    switch (speaker) {
      case 'system': {
        // System: Robotic digital voice - sharp square waves with pitch variation
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        
        // Base frequency varies with character
        const baseFreq = 150 + (charCode % 10) * 30;
        osc.type = 'square';
        osc.frequency.value = baseFreq;
        
        filter.type = 'bandpass';
        filter.frequency.value = 800;
        filter.Q.value = 5;
        
        gain.gain.value = 0.04 * volume;
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        
        // Pitch jump for robotic effect
        osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
        osc.frequency.setValueAtTime(baseFreq * 1.5, ctx.currentTime + 0.02);
        osc.frequency.setValueAtTime(baseFreq * 0.8, ctx.currentTime + 0.04);
        
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
        osc.stop(ctx.currentTime + 0.07);
        break;
      }
      case 'ai': {
        // AI Navigator: Friendly melodic alien voice - sine waves with harmonics
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        
        // Create vowel-like frequencies based on character
        const vowelFreqs = [270, 390, 530, 660, 730]; // Formant-like frequencies
        const baseFreq = vowelFreqs[charCode % 5];
        const harmonic = baseFreq * (1.5 + (charCode % 3) * 0.25);
        
        osc1.type = 'sine';
        osc1.frequency.value = baseFreq;
        osc2.type = 'sine';
        osc2.frequency.value = harmonic;
        
        gain.gain.value = 0.035 * volume;
        
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);
        
        // Smooth pitch glide for friendly feel
        osc1.frequency.exponentialRampToValueAtTime(baseFreq * 1.1, ctx.currentTime + 0.03);
        osc2.frequency.exponentialRampToValueAtTime(harmonic * 0.95, ctx.currentTime + 0.03);
        
        osc1.start();
        osc2.start();
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07);
        osc1.stop(ctx.currentTime + 0.08);
        osc2.stop(ctx.currentTime + 0.08);
        break;
      }
      case 'narrator': {
        // Guide: Mystical ethereal whisper - breathy with reverb-like layering
        const osc = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        
        // Lower, mystical frequencies
        const baseFreq = 180 + (charCode % 8) * 20;
        
        osc.type = 'triangle';
        osc.frequency.value = baseFreq;
        osc2.type = 'sine';
        osc2.frequency.value = baseFreq * 1.5;
        
        filter.type = 'lowpass';
        filter.frequency.value = 600;
        filter.Q.value = 3;
        
        gain.gain.value = 0.045 * volume;
        
        osc.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        
        // Ethereal wavering
        osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(baseFreq * 1.08, ctx.currentTime + 0.04);
        osc.frequency.linearRampToValueAtTime(baseFreq * 0.95, ctx.currentTime + 0.08);
        
        osc.start();
        osc2.start();
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        osc.stop(ctx.currentTime + 0.11);
        osc2.stop(ctx.currentTime + 0.11);
        break;
      }
    }
  }, [isMuted, volume]);

  // Launch countdown beep - cinematic countdown sound
  const playCountdownBeep = useCallback((number: number) => {
    if (!webAudioContextRef.current || isMuted) return;
    const ctx = webAudioContextRef.current;
    
    // Deep resonant beep that gets higher as countdown progresses
    const baseFreq = 200 + (3 - number) * 100; // Higher pitch as we approach 0
    
    // Main tone
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = baseFreq;
    gain.gain.value = 0.15 * volume;
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.stop(ctx.currentTime + 0.5);
    
    // Harmonic overtone
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.value = baseFreq * 2;
    gain2.gain.value = 0.08 * volume;
    
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    
    osc2.start();
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc2.stop(ctx.currentTime + 0.4);
    
    // Sub bass thump
    const oscSub = ctx.createOscillator();
    const gainSub = ctx.createGain();
    oscSub.type = 'sine';
    oscSub.frequency.value = 60;
    gainSub.gain.value = 0.2 * volume;
    
    oscSub.connect(gainSub);
    gainSub.connect(ctx.destination);
    
    oscSub.start();
    gainSub.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    oscSub.stop(ctx.currentTime + 0.3);
  }, [isMuted, volume]);

  // Launch rumble - intense low frequency vibration
  const playLaunchRumble = useCallback(() => {
    if (!webAudioContextRef.current || isMuted) return;
    const ctx = webAudioContextRef.current;
    
    // Create rumble noise
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1);
    }
    
    const source = ctx.createBufferSource();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    
    source.buffer = buffer;
    filter.type = 'lowpass';
    filter.frequency.value = 150;
    filter.Q.value = 1;
    
    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.25 * volume, ctx.currentTime + 0.5);
    gain.gain.setValueAtTime(0.25 * volume, ctx.currentTime + 1.5);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.5);
    
    source.start();
    source.stop(ctx.currentTime + 2.5);
    
    // Add oscillating sub bass
    const oscLow = ctx.createOscillator();
    const gainLow = ctx.createGain();
    oscLow.type = 'sine';
    oscLow.frequency.value = 40;
    gainLow.gain.value = 0.3 * volume;
    
    oscLow.connect(gainLow);
    gainLow.connect(ctx.destination);
    
    oscLow.frequency.setValueAtTime(40, ctx.currentTime);
    oscLow.frequency.linearRampToValueAtTime(80, ctx.currentTime + 1);
    oscLow.frequency.linearRampToValueAtTime(120, ctx.currentTime + 2);
    
    oscLow.start();
    gainLow.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.5);
    oscLow.stop(ctx.currentTime + 2.5);
  }, [isMuted, volume]);

  // Hyperspace whoosh - epic transition sound
  const playHyperspaceWhoosh = useCallback(() => {
    if (!webAudioContextRef.current || isMuted) return;
    const ctx = webAudioContextRef.current;
    
    // Rising sweep
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(2000, ctx.currentTime + 0.8);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 1.5);
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(500, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(8000, ctx.currentTime + 0.6);
    filter.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 1.5);
    
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.15 * volume, ctx.currentTime + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 1.5);
    
    // Add white noise whoosh
    const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 1.5, ctx.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseData.length; i++) {
      noiseData[i] = (Math.random() * 2 - 1);
    }
    
    const noiseSource = ctx.createBufferSource();
    const noiseGain = ctx.createGain();
    const noiseFilter = ctx.createBiquadFilter();
    
    noiseSource.buffer = noiseBuffer;
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(1000, ctx.currentTime);
    noiseFilter.frequency.exponentialRampToValueAtTime(4000, ctx.currentTime + 0.5);
    noiseFilter.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + 1.5);
    noiseFilter.Q.value = 0.5;
    
    noiseGain.gain.setValueAtTime(0, ctx.currentTime);
    noiseGain.gain.linearRampToValueAtTime(0.12 * volume, ctx.currentTime + 0.4);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
    
    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    
    noiseSource.start();
    noiseSource.stop(ctx.currentTime + 1.5);
    
    // Cinematic boom at the end
    setTimeout(() => {
      if (!webAudioContextRef.current || isMuted) return;
      const boomOsc = ctx.createOscillator();
      const boomGain = ctx.createGain();
      
      boomOsc.type = 'sine';
      boomOsc.frequency.value = 50;
      boomGain.gain.value = 0.3 * volume;
      
      boomOsc.connect(boomGain);
      boomGain.connect(ctx.destination);
      
      boomOsc.start();
      boomGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      boomOsc.stop(ctx.currentTime + 0.5);
    }, 600);
  }, [isMuted, volume]);

  return (
    <AudioCtx.Provider value={{
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
      playDialogSound,
      playTypingSound,
      playAlienSpeech,
      playCountdownBeep,
      playLaunchRumble,
      playHyperspaceWhoosh,
    }}>
      {children}
    </AudioCtx.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioCtx);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};
