import React from 'react';
import { X } from 'lucide-react';
import { SpinResult } from '../types';

interface WinModalProps {
  isOpen: boolean;
  result: SpinResult | null;
  onClose: () => void;
}

const WinModal: React.FC<WinModalProps> = ({ isOpen, result, onClose }) => {
  if (!isOpen || !result) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl p-8 text-center shadow-2xl transform transition-all scale-100 animate-in zoom-in-95 duration-300">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        
        <div className="mb-6">
          <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-yellow-500/50">
            <span className="text-4xl">🏆</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">CONGRATULATIONS!</h2>
          <p className="text-slate-400">You have won</p>
        </div>

        <div className="py-6 bg-slate-950/50 rounded-xl border border-slate-800 mb-8">
          <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 filter drop-shadow-lg">
            {result.prizeLabel}
          </span>
        </div>

        <button
          onClick={onClose}
          className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          CLAIM PRIZE
        </button>
      </div>
    </div>
  );
};

export default WinModal;