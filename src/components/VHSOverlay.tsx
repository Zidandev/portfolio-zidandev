import React from 'react';
import { usePotatoMode } from '@/contexts/PotatoModeContext';

const VHSOverlay: React.FC = () => {
  const { isPotatoMode } = usePotatoMode();
  
  // Skip VHS effects entirely in potato mode
  if (isPotatoMode) return null;
  
  return (
    <>
      <div className="vhs-overlay" />
      <div className="scanlines" />
    </>
  );
};

export default VHSOverlay;
