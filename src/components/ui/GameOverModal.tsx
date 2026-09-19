import React, { useEffect } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { Trophy, RotateCcw, AlertTriangle, Coins, Gauge } from 'lucide-react';
import confetti from 'canvas-confetti';

export const GameOverModal: React.FC = () => {
  const score = useGameStore((state) => state.score);
  const highScore = useGameStore((state) => state.highScore);
  const distance = useGameStore((state) => state.distance);
  const coinsCollected = useGameStore((state) => state.coinsCollected);
  const resetGame = useGameStore((state) => state.resetGame);

  const isNewHighScore = score >= highScore && score > 0;

  useEffect(() => {
    if (isNewHighScore) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#06b6d4', '#ec4899', '#facc15'],
        });
      } catch {
        // Fallback safe
      }
    }
  }, [isNewHighScore]);

  // Restart on Enter or Space
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        resetGame();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [resetGame]);

  const displayDistance =
    distance >= 1000 ? `${(distance / 1000).toFixed(2)} KM` : `${Math.round(distance)} M`;

  const theme = useGameStore((state) => state.theme);
  const isLight = theme === 'light';

  return (
    <div
      className={`absolute inset-0 z-30 flex items-center justify-center p-4 sm:p-6 pointer-events-auto backdrop-blur-md animate-fade-in ${
        isLight ? 'bg-slate-900/40' : 'bg-black/75'
      }`}
    >
      <div
        className={`relative w-full max-w-md flex flex-col items-center p-6 sm:p-8 rounded-3xl border shadow-2xl text-center overflow-hidden backdrop-blur-xl ${
          isLight
            ? 'bg-white/95 border-red-200 text-slate-900 shadow-red-500/15'
            : 'bg-slate-950/95 border-red-900/60 text-white shadow-[0_0_50px_rgba(239,68,68,0.25)]'
        }`}
      >
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-pink-500 to-red-600" />

        {/* Crash Icon */}
        <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-500 mb-4 shadow-lg animate-bounce">
          <AlertTriangle className="w-8 h-8" />
        </div>

        {/* Title */}
        <h2 className="font-arcade text-3xl sm:text-4xl font-black italic tracking-wide text-red-500 mb-1">
          TOTAL WRECK
        </h2>
        <p className={`text-xs sm:text-sm font-medium mb-6 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
          High-speed collision on Sector 7 Highway
        </p>

        {/* New High Score Callout */}
        {isNewHighScore && (
          <div className="w-full flex items-center justify-center gap-2 py-2 px-4 mb-6 rounded-xl bg-gradient-to-r from-amber-500/20 via-pink-500/20 to-amber-500/20 border border-amber-500/40 text-amber-500 font-arcade text-xs font-bold uppercase tracking-wider">
            <Trophy className="w-4 h-4 fill-amber-500 text-amber-500" />
            New High Score Record!
          </div>
        )}

        {/* Stats Grid */}
        <div className="w-full grid grid-cols-2 gap-3 mb-8">
          <div
            className={`flex flex-col items-center p-3 rounded-xl border ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/80 border-slate-800'
            }`}
          >
            <span className="text-[11px] uppercase tracking-wider font-semibold mb-0.5 opacity-60">
              Score
            </span>
            <span className="font-arcade text-xl sm:text-2xl text-cyan-600 dark:text-cyan-400 font-black">
              {score.toLocaleString()}
            </span>
          </div>

          <div
            className={`flex flex-col items-center p-3 rounded-xl border ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/80 border-slate-800'
            }`}
          >
            <span className="text-[11px] uppercase tracking-wider font-semibold mb-0.5 flex items-center gap-1 opacity-60">
              <Trophy className="w-3 h-3 text-amber-500" /> High Score
            </span>
            <span className="font-arcade text-xl sm:text-2xl text-amber-500 font-black">
              {highScore.toLocaleString()}
            </span>
          </div>

          <div
            className={`flex flex-col items-center p-3 rounded-xl border ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/80 border-slate-800'
            }`}
          >
            <span className="text-[11px] uppercase tracking-wider font-semibold mb-0.5 flex items-center gap-1 opacity-60">
              <Gauge className="w-3 h-3" /> Distance
            </span>
            <span className={`font-arcade text-base sm:text-lg font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
              {displayDistance}
            </span>
          </div>

          <div
            className={`flex flex-col items-center p-3 rounded-xl border ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/80 border-slate-800'
            }`}
          >
            <span className="text-[11px] uppercase tracking-wider font-semibold mb-0.5 flex items-center gap-1 opacity-60">
              <Coins className="w-3 h-3 text-yellow-500" /> Coins
            </span>
            <span className="font-arcade text-base sm:text-lg text-yellow-500 font-bold">
              {coinsCollected}
            </span>
          </div>
        </div>

        {/* Restart Button */}
        <button
          onClick={resetGame}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-red-600 via-pink-600 to-red-600 hover:from-red-500 hover:to-pink-500 text-white font-arcade text-base sm:text-lg font-bold uppercase tracking-wider flex items-center justify-center gap-3 cursor-pointer shadow-xl active:scale-95 transition-all duration-150"
        >
          <RotateCcw className="w-5 h-5" />
          Play Again
        </button>
        <span className="text-[10px] uppercase tracking-widest text-slate-500 mt-2 font-semibold">
          Press Space or Enter to restart
        </span>
      </div>
    </div>
  );
};
