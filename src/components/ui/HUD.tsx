import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import { Volume2, VolumeX, Zap, Flame, Trophy, Sun, Moon } from 'lucide-react';

export const HUD: React.FC = () => {
  const score = useGameStore((state) => state.score);
  const highScore = useGameStore((state) => state.highScore);
  const distance = useGameStore((state) => state.distance);
  const speed = useGameStore((state) => state.speed);
  const nitro = useGameStore((state) => state.nitro);
  const isBoosting = useGameStore((state) => state.isBoosting);
  const isMuted = useGameStore((state) => state.isMuted);
  const toggleSound = useGameStore((state) => state.toggleSound);
  const theme = useGameStore((state) => state.theme);
  const toggleTheme = useGameStore((state) => state.toggleTheme);

  const isLight = theme === 'light';
  const displaySpeed = Math.round(speed * 2.8);
  const displayDistance =
    distance >= 1000 ? `${(distance / 1000).toFixed(2)} KM` : `${Math.round(distance)} M`;

  return (
    <div className="absolute inset-0 z-20 flex flex-col justify-between p-3 sm:p-5 pointer-events-none select-none">
      {/* Top Cockpit Header Bar */}
      <div className="flex justify-between items-start w-full gap-2">
        {/* Left: Score & Distance Panel */}
        <div className="flex flex-col gap-1 pointer-events-auto">
          <div
            className={`flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl border backdrop-blur-md shadow-xl ${
              isLight ? 'bg-white/85 border-slate-200 text-slate-900' : 'bg-slate-950/85 border-slate-800/90 text-white'
            }`}
          >
            <span className="text-[10px] sm:text-xs uppercase tracking-widest font-bold opacity-60">Score</span>
            <span
              className={`font-arcade text-lg sm:text-2xl font-black ${
                isLight ? 'text-cyan-700' : 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-sky-200 text-glow-cyan'
              }`}
            >
              {score.toLocaleString()}
            </span>
          </div>

          <div
            className={`flex items-center gap-2 px-2.5 py-1 rounded-lg border w-fit backdrop-blur-sm ${
              isLight ? 'bg-white/70 border-slate-200 text-slate-700' : 'bg-slate-950/70 border-slate-900 text-slate-300'
            }`}
          >
            <span className="text-[9px] uppercase tracking-wider font-semibold opacity-60">Dist</span>
            <span className="font-arcade text-xs font-bold">{displayDistance}</span>
          </div>
        </div>

        {/* Center: Cockpit Speedometer & Record */}
        <div className="flex flex-col items-center pointer-events-auto">
          <div
            className={`flex flex-col items-center px-4 py-1.5 rounded-2xl border backdrop-blur-md shadow-2xl ${
              isLight ? 'bg-white/85 border-slate-200' : 'bg-slate-950/85 border-slate-800/90'
            }`}
          >
            <div className="flex items-baseline gap-1">
              <span
                className={`font-arcade text-2xl sm:text-3xl font-black italic tracking-tight transition-colors duration-200 ${
                  isBoosting
                    ? 'text-pink-600 text-glow-pink'
                    : isLight
                    ? 'text-cyan-700'
                    : 'text-cyan-400 text-glow-cyan'
                }`}
              >
                {displaySpeed}
              </span>
              <span className={`font-arcade text-[10px] font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                KM/H
              </span>
            </div>

            {/* Tachometer mini tick marks */}
            <div className="flex items-center gap-0.5 mt-0.5">
              {Array.from({ length: 10 }).map((_, i) => {
                const active = displaySpeed > 60 + i * 18;
                return (
                  <div
                    key={i}
                    className={`h-1.5 w-1.5 rounded-xs transition-colors duration-150 ${
                      active
                        ? isBoosting
                          ? 'bg-pink-500 shadow-[0_0_6px_#ec4899]'
                          : 'bg-cyan-500 shadow-[0_0_6px_#06b6d4]'
                        : isLight
                        ? 'bg-slate-300'
                        : 'bg-slate-800'
                    }`}
                  />
                );
              })}
            </div>
          </div>

          {/* Record Display */}
          <div
            className={`hidden sm:flex items-center gap-1.5 mt-1 px-2.5 py-0.5 rounded-full border text-[10px] ${
              isLight ? 'bg-white/70 border-slate-200 text-slate-600' : 'bg-slate-950/60 border-slate-800 text-slate-400'
            }`}
          >
            <Trophy className="w-3 h-3 text-amber-500" />
            <span className="font-arcade text-amber-500 font-semibold">{highScore.toLocaleString()}</span>
          </div>
        </div>

        {/* Right: Controls (Theme + Sound) */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer shadow-xl active:scale-90 ${
              isLight
                ? 'bg-white/85 border-slate-200 text-amber-600 hover:border-amber-400'
                : 'bg-slate-950/85 border-slate-800 text-sky-400 hover:border-cyan-500'
            }`}
            title={`Switch to ${isLight ? 'Dark' : 'Light'} Mode`}
            aria-label="Toggle Theme"
          >
            {isLight ? <Sun className="w-4 h-4 sm:w-5 sm:h-5" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer shadow-xl active:scale-90 ${
              isLight
                ? 'bg-white/85 border-slate-200 text-slate-700 hover:border-cyan-500'
                : 'bg-slate-950/85 border-slate-800 text-slate-300 hover:border-cyan-500'
            }`}
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            aria-label="Toggle Sound"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
            ) : (
              <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-500" />
            )}
          </button>
        </div>
      </div>

      {/* Bottom Nitro Gauge (Centered, elevated above mobile touch buttons) */}
      <div className="flex justify-center w-full mb-24 sm:mb-4 pointer-events-auto">
        <div
          className={`w-full max-w-xs sm:max-w-sm flex flex-col gap-1.5 px-4 py-2 rounded-2xl border backdrop-blur-md shadow-2xl ${
            isLight ? 'bg-white/85 border-slate-200 text-slate-800' : 'bg-slate-950/85 border-slate-800/90 text-white'
          }`}
        >
          <div className="flex justify-between items-center text-xs">
            <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px] sm:text-xs opacity-70">
              {isBoosting ? (
                <Flame className="w-4 h-4 text-pink-500 animate-bounce" />
              ) : (
                <Zap className="w-4 h-4 text-cyan-500" />
              )}
              Nitro Tank
            </span>
            <span
              className={`font-arcade font-bold text-xs ${
                isBoosting ? 'text-pink-500 animate-pulse' : 'text-cyan-500'
              }`}
            >
              {Math.round(nitro)}%
            </span>
          </div>

          {/* Progress Track */}
          <div
            className={`relative w-full h-2.5 rounded-full overflow-hidden border ${
              isLight ? 'bg-slate-200 border-slate-300' : 'bg-slate-900 border-slate-800'
            }`}
          >
            <div
              className={`h-full transition-all duration-75 rounded-full ${
                isBoosting
                  ? 'bg-gradient-to-r from-pink-500 to-rose-400 neon-glow-pink'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-500 neon-glow-cyan'
              }`}
              style={{ width: `${nitro}%` }}
            />
          </div>

          {/* Status info */}
          <div className="flex justify-between items-center text-[9px] font-semibold tracking-wider uppercase opacity-60">
            <span>{isBoosting ? 'BURNING BOOST' : nitro > 20 ? 'READY' : 'DEPLETED'}</span>
            <span className="hidden sm:inline">[W] OR [SPACE] TO BOOST</span>
          </div>
        </div>
      </div>
    </div>
  );
};
