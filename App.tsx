import React, { useState, useCallback } from 'react';
import RouletteWheel from './components/RouletteWheel';
import BusinessDashboard from './components/BusinessDashboard';
import Confetti from './components/Confetti';
import WinModal from './components/WinModal';
import { PRIZE_TIERS, WHEEL_CONFIG } from './constants';
import { SpinResult } from './types';
import { LayoutDashboard, Gamepad2, History, Volume2, VolumeX } from 'lucide-react';
import { audioService } from './services/audioService';

const App: React.FC = () => {
  const [view, setView] = useState<'game' | 'admin'>('game');
  const [isSpinning, setIsSpinning] = useState(false);
  const [targetIndex, setTargetIndex] = useState<number | null>(null);
  const [spinHistory, setSpinHistory] = useState<SpinResult[]>([]);
  const [lastWin, setLastWin] = useState<SpinResult | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showWinModal, setShowWinModal] = useState(false);
  const [isMuted, setIsMuted] = useState(audioService.getMuted());

  // Core Logic: Weighted Random Selection
  const selectPrizeIndex = useCallback(() => {
    const rand = Math.random();
    let cumulativeProbability = 0;
    
    for (let i = 0; i < PRIZE_TIERS.length; i++) {
      cumulativeProbability += PRIZE_TIERS[i].probability;
      if (rand < cumulativeProbability) {
        return i;
      }
    }
    return PRIZE_TIERS.length - 1; // Fallback to last item (lowest prob)
  }, []);

  const handleSpin = () => {
    if (isSpinning) return;
    
    // Trigger spin sound
    audioService.playSpin(WHEEL_CONFIG.rotationDuration);
    
    setShowCelebration(false);
    setShowWinModal(false);
    setLastWin(null);
    
    const index = selectPrizeIndex();
    setTargetIndex(index);
    setIsSpinning(true);
  };

  const handleSpinEnd = useCallback(() => {
    setIsSpinning(false);
    
    if (targetIndex !== null) {
      const prize = PRIZE_TIERS[targetIndex];
      const result: SpinResult = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        prizeValue: prize.value,
        prizeLabel: prize.label
      };
      
      // Trigger win sound
      audioService.playWin();
      
      setSpinHistory(prev => [result, ...prev]);
      setLastWin(result);
      setShowCelebration(true);
      setShowWinModal(true); // Open the win popup

      // Auto hide confetti after 5s
      setTimeout(() => setShowCelebration(false), 5000);
    }
  }, [targetIndex]);

  const toggleMute = () => {
    const newState = audioService.toggleMute();
    setIsMuted(newState);
    if (!newState) {
      audioService.playClick();
    }
  };

  const handleViewChange = (newView: 'game' | 'admin') => {
    audioService.playClick();
    setView(newView);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎰</span>
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              PrizeMaster
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
             <button 
              onClick={toggleMute}
              className="p-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-slate-800"
              aria-label={isMuted ? "Unmute" : "Mute"}
             >
               {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
             </button>

            <div className="flex bg-slate-800 p-1 rounded-lg">
              <button
                onClick={() => handleViewChange('game')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  view === 'game' 
                    ? 'bg-indigo-600 text-white shadow-lg' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Gamepad2 className="w-4 h-4" />
                Play
              </button>
              <button
                onClick={() => handleViewChange('admin')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  view === 'admin' 
                    ? 'bg-indigo-600 text-white shadow-lg' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Admin
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full p-4 md:p-8 relative">
        {view === 'game' ? (
          <div className="flex flex-col items-center justify-center gap-8 py-4">
            
            {showCelebration && <Confetti />}
            
            <WinModal 
              isOpen={showWinModal} 
              result={lastWin} 
              onClose={() => setShowWinModal(false)} 
            />

            {/* Wheel Container & Button */}
            <div className="flex flex-col items-center gap-12 w-full max-w-md">
               <RouletteWheel 
                 tiers={PRIZE_TIERS}
                 config={WHEEL_CONFIG}
                 isSpinning={isSpinning}
                 targetIndex={targetIndex}
                 onSpinEnd={handleSpinEnd}
               />
               
               {/* Spin Button - Moved here to ensure it is always visible in the flow */}
               <button
                 onClick={handleSpin}
                 disabled={isSpinning}
                 className={`
                   px-16 py-5 rounded-full text-2xl font-black tracking-widest uppercase shadow-2xl transition-all transform
                   ${isSpinning 
                     ? 'bg-slate-700 text-slate-500 cursor-not-allowed scale-95' 
                     : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white hover:scale-105 hover:shadow-indigo-500/50 active:scale-95'
                   }
                 `}
               >
                 {isSpinning ? 'Spinning...' : 'SPIN'}
               </button>
            </div>

            {/* Recent History */}
            <div className="mt-8 w-full max-w-md bg-slate-900/50 rounded-xl border border-slate-800 p-4 backdrop-blur-sm">
              <h3 className="text-slate-400 text-sm font-semibold mb-3 flex items-center gap-2">
                <History className="w-4 h-4" /> Recent Wins
              </h3>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {spinHistory.slice(0, 10).map((spin) => (
                  <div key={spin.id} className="flex-shrink-0 bg-slate-800 px-3 py-1 rounded-md border border-slate-700">
                    <span className="text-white font-bold">{spin.prizeLabel}</span>
                  </div>
                ))}
                {spinHistory.length === 0 && (
                  <span className="text-slate-600 text-sm">No spins yet. Good luck!</span>
                )}
              </div>
            </div>

          </div>
        ) : (
          <BusinessDashboard history={spinHistory} tiers={PRIZE_TIERS} />
        )}
      </main>
      
      {/* Footer */}
      <footer className="p-4 text-center text-slate-600 text-sm">
        &copy; {new Date().getFullYear()} PrizeMaster Systems.
      </footer>
    </div>
  );
};

export default App;