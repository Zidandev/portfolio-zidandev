import React, { useRef, useState, useCallback, useEffect } from 'react';

interface JoystickProps {
  onMove: (direction: { x: number; y: number }) => void;
  onStop: () => void;
}

const Joystick: React.FC<JoystickProps> = ({ onMove, onStop }) => {
  const baseRef = useRef<HTMLDivElement>(null);
  const [stickPosition, setStickPosition] = useState({ x: 0, y: 0 });
  const [isActive, setIsActive] = useState(false);

  const maxDistance = 40;

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!baseRef.current) return;

    const rect = baseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let deltaX = clientX - centerX;
    let deltaY = clientY - centerY;

    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (distance > maxDistance) {
      deltaX = (deltaX / distance) * maxDistance;
      deltaY = (deltaY / distance) * maxDistance;
    }

    setStickPosition({ x: deltaX, y: deltaY });

    // Normalize to -1 to 1
    const normalizedX = deltaX / maxDistance;
    const normalizedY = deltaY / maxDistance;

    onMove({ x: normalizedX, y: normalizedY });
  }, [onMove]);

  const handleStart = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    setIsActive(true);

    if ('touches' in e) {
      handleMove(e.touches[0].clientX, e.touches[0].clientY);
    } else {
      handleMove(e.clientX, e.clientY);
    }
  }, [handleMove]);

  const handleEnd = useCallback(() => {
    setIsActive(false);
    setStickPosition({ x: 0, y: 0 });
    onStop();
  }, [onStop]);

  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => {
      if (isActive && e.touches.length > 0) {
        e.preventDefault();
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isActive) {
        handleMove(e.clientX, e.clientY);
      }
    };

    const handleTouchEnd = () => {
      if (isActive) handleEnd();
    };

    const handleMouseUp = () => {
      if (isActive) handleEnd();
    };

    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isActive, handleMove, handleEnd]);

  return (
    <div
      ref={baseRef}
      className="joystick-base flex items-center justify-center touch-none select-none"
      onTouchStart={handleStart}
      onMouseDown={handleStart}
    >
      <div
        className="joystick-stick transition-transform duration-75"
        style={{
          transform: `translate(${stickPosition.x}px, ${stickPosition.y}px)`,
        }}
      />
    </div>
  );
};

export default Joystick;
