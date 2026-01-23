import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface PotatoModeContextType {
  isPotatoMode: boolean;
  isTransitioning: boolean;
  togglePotatoMode: () => void;
}

const PotatoModeContext = createContext<PotatoModeContextType | undefined>(undefined);

interface PotatoModeProviderProps {
  children: ReactNode;
}

export const PotatoModeProvider: React.FC<PotatoModeProviderProps> = ({ children }) => {
  const [isPotatoMode, setIsPotatoMode] = useState(() => {
    // Check localStorage for saved preference (with safety check)
    try {
      const saved = localStorage.getItem('potatoMode');
      return saved === 'true';
    } catch {
      return false;
    }
  });
  const [isTransitioning, setIsTransitioning] = useState(false);

  const togglePotatoMode = useCallback(() => {
    setIsTransitioning(true);
    
    // Epic transition duration
    setTimeout(() => {
      setIsPotatoMode(prev => {
        const newValue = !prev;
        try {
          localStorage.setItem('potatoMode', String(newValue));
        } catch {
          // Ignore localStorage errors
        }
        return newValue;
      });
    }, 1000);

    // End transition after animation completes
    setTimeout(() => {
      setIsTransitioning(false);
    }, 2000);
  }, []);

  return (
    <PotatoModeContext.Provider value={{ isPotatoMode, isTransitioning, togglePotatoMode }}>
      {children}
    </PotatoModeContext.Provider>
  );
};

export const usePotatoMode = (): PotatoModeContextType => {
  const context = useContext(PotatoModeContext);
  if (context === undefined) {
    throw new Error('usePotatoMode must be used within a PotatoModeProvider');
  }
  return context;
};
