import React, { useEffect, useState, useMemo, useRef } from 'react';
import { PrizeTier, WheelConfig } from '../types';

interface RouletteWheelProps {
  tiers: PrizeTier[];
  config: WheelConfig;
  isSpinning: boolean;
  targetIndex: number | null;
  onSpinEnd: () => void;
}

const RouletteWheel: React.FC<RouletteWheelProps> = ({ 
  tiers, 
  config, 
  isSpinning, 
  targetIndex, 
  onSpinEnd 
}) => {
  const [rotation, setRotation] = useState(0);
  // Use ref to track animation status without triggering re-renders that clear effects
  const isAnimatingRef = useRef(false);
  
  // Calculate slice angles based on probability
  const tierAngles = useMemo(() => {
    let currentAngle = 0;
    return tiers.map(tier => {
      const angleSize = tier.probability * 360;
      const start = currentAngle;
      const end = currentAngle + angleSize;
      currentAngle += angleSize;
      return { start, end, size: angleSize, tier };
    });
  }, [tiers]);
  
  // SVG helpers
  const getCoordinatesForPercent = (percent: number) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  useEffect(() => {
    // Only trigger if spinning, we have a target, and we aren't already animating this specific spin
    if (isSpinning && targetIndex !== null && !isAnimatingRef.current) {
      isAnimatingRef.current = true;
      
      const targetSlice = tierAngles[targetIndex];
      
      // We want to land on the center of the target slice
      const centerAngle = targetSlice.start + (targetSlice.size / 2);
      
      // Add randomness within the slice (avoiding edges by 20% on each side to be safe)
      const jitter = (Math.random() - 0.5) * (targetSlice.size * 0.6);
      const targetAngleLocal = centerAngle + jitter;
      
      const fullSpins = 360 * config.minSpins;
      
      // Update rotation using functional state update to avoid dependency on 'rotation' variable
      setRotation(prevRotation => {
        // Calculate rotation needed to bring targetAngleLocal to the top (0 degrees in our logic)
        const currentMod = prevRotation % 360;
        const targetMod = (360 - targetAngleLocal) % 360;
        
        let distance = targetMod - currentMod;
        if (distance <= 0) distance += 360;
        
        return prevRotation + fullSpins + distance;
      });

      const timer = setTimeout(() => {
        isAnimatingRef.current = false;
        onSpinEnd();
      }, config.rotationDuration * 1000);

      // Cleanup function only runs if component unmounts or dependencies change significantly
      return () => clearTimeout(timer);
    }
  }, [isSpinning, targetIndex, config, tierAngles, onSpinEnd]);

  return (
    <div className="relative w-full max-w-[400px] aspect-square mx-auto">
      {/* Pointer */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 z-20">
        <div className="w-8 h-10 bg-slate-100 clip-triangle shadow-lg drop-shadow-xl" 
             style={{ clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }}></div>
      </div>

      {/* Wheel */}
      <div 
        className="w-full h-full rounded-full shadow-2xl border-4 border-slate-800 overflow-hidden relative transition-transform ease-[cubic-bezier(0.2,0.8,0.2,1)] will-change-transform"
        style={{ 
          transform: `rotate(${rotation}deg)`,
          transitionDuration: `${config.rotationDuration}s`
        }}
      >
        <svg viewBox="-1 -1 2 2" style={{ transform: 'rotate(-90deg)' }} className="w-full h-full">
          {tierAngles.map(({ start, end, size, tier }) => {
            // Draw slice
            const startPercent = start / 360;
            const endPercent = end / 360;
            
            const [startX, startY] = getCoordinatesForPercent(startPercent);
            const [endX, endY] = getCoordinatesForPercent(endPercent);
            
            // Large arc flag
            const largeArcFlag = size > 180 ? 1 : 0;
            
            const pathData = [
              `M 0 0`,
              `L ${startX} ${startY}`,
              `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`,
              `Z`
            ].join(' ');

            // Determine text orientation based on slice size
            // For small slices, align radially to fit text
            const isSmallSlice = size < 20;
            const textRotation = isSmallSlice ? 0 : 90;
            const textTranslateX = isSmallSlice ? 0.75 : 0.65;

            return (
              <g key={tier.value}>
                <path d={pathData} fill={tier.color} stroke="#1e293b" strokeWidth="0.01" />
                {/* Text Label */}
                <g transform={`rotate(${start + size / 2}) translate(${textTranslateX}, 0)`}>
                  <text 
                    x="0" 
                    y="0" 
                    fill={tier.textColor} 
                    fontSize={isSmallSlice ? "0.10" : "0.12"} 
                    fontWeight="bold" 
                    textAnchor="middle" 
                    alignmentBaseline="middle"
                    style={{ transform: `rotate(${textRotation}deg)` }}
                  >
                    {tier.label}
                  </text>
                </g>
              </g>
            );
          })}
        </svg>
      </div>
      
      {/* Center Cap */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-slate-900 rounded-full border-4 border-slate-700 flex items-center justify-center z-10 shadow-lg">
        <span className="text-yellow-500 font-bold text-xl">★</span>
      </div>
    </div>
  );
};

export default RouletteWheel;