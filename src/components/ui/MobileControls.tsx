import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import { ChevronLeft, ChevronRight, Zap } from 'lucide-react';

export const MobileControls: React.FC = () => {
  const status = useGameStore((state) => state.status);
  const steerLeft = useGameStore((state) => state.steerLeft);
  const steerRight = useGameStore((state) => state.steerRight);
  const setBoosting = useGameStore((state) => state.setBoosting);
  const isBoosting = useGameStore((state) => state.isBoosting);

  if (status !== 'PLAYING') return null;

  return (
    <div className="absolute inset-x-0 bottom-4 z-20 flex justify-between items-end px-4 sm:px-8 pointer-events-none select-none">
      {/* Steering Controls (Left & Right) */}
      <div className="flex items-center gap-3 pointer-events-auto">
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            steerLeft();
          }}
          onMouseDown={steerLeft}
          className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-slate-900/80 active:bg-cyan-500/40 border border-slate-700/80 active:border-cyan-400 text-cyan-400 active:scale-90 flex items-center justify-center backdrop-blur-md shadow-2xl transition-transform cursor-pointer touch-none"
          aria-label="Steer Left"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>

        <button
          onTouchStart={(e) => {
            e.preventDefault();
            steerRight();
          }}
          onMouseDown={steerRight}
          className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-slate-900/80 active:bg-cyan-500/40 border border-slate-700/80 active:border-cyan-400 text-cyan-400 active:scale-90 flex items-center justify-center backdrop-blur-md shadow-2xl transition-transform cursor-pointer touch-none"
          aria-label="Steer Right"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
      </div>

      {/* Nitro Boost Action Button */}
      <div className="pointer-events-auto">
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            setBoosting(true);
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            setBoosting(false);
          }}
          onMouseDown={() => setBoosting(true)}
          onMouseUp={() => setBoosting(false)}
          onMouseLeave={() => setBoosting(false)}
          className={`w-20 h-20 sm:w-22 sm:h-22 rounded-full border flex flex-col items-center justify-center backdrop-blur-md shadow-2xl transition-all cursor-pointer touch-none active:scale-90 ${
            isBoosting
              ? 'bg-pink-600/80 border-pink-400 text-white neon-glow-pink scale-95'
              : 'bg-slate-900/80 border-slate-700/80 text-pink-400 hover:border-pink-500/60'
          }`}
          aria-label="Nitro Boost"
        >
          <Zap className={`w-8 h-8 ${isBoosting ? 'fill-white animate-bounce' : 'fill-pink-400'}`} />
          <span className="font-arcade text-[10px] uppercase font-bold tracking-wider mt-0.5">
            Boost
          </span>
        </button>
      </div>
    </div>
  );
};
