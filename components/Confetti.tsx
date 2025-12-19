import React, { useEffect, useState } from 'react';

const Confetti: React.FC = () => {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; color: string; delay: string }>>([]);

  useEffect(() => {
    const colors = ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7'];
    const newParticles = Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: `${Math.random() * 0.5}s`
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute top-[-20px] w-3 h-3 rounded-full animate-fall"
          style={{
            left: `${p.x}%`,
            backgroundColor: p.color,
            animationDelay: p.delay,
            animationDuration: '3s',
            animationTimingFunction: 'linear'
          }}
        />
      ))}
      <style>{`
        @keyframes fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        .animate-fall {
          animation-name: fall;
          animation-fill-mode: forwards;
        }
      `}</style>
    </div>
  );
};

export default Confetti;