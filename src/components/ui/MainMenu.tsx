import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import { Trophy, Volume2, VolumeX, Zap, ArrowLeft, ArrowRight, Sun, Moon } from 'lucide-react';

export const MainMenu: React.FC = () => {
  const startGame = useGameStore((state) => state.startGame);
  const highScore = useGameStore((state) => state.highScore);
  const isMuted = useGameStore((state) => state.isMuted);
  const toggleSound = useGameStore((state) => state.toggleSound);
  const theme = useGameStore((state) => state.theme);
  const toggleTheme = useGameStore((state) => state.toggleTheme);

  const isLight = theme === 'light';

  return (
    <div
      className={`absolute inset-0 z-30 flex flex-col items-center justify-between p-5 sm:p-10 pointer-events-auto backdrop-blur-[2px] transition-colors duration-300 ${
        isLight ? 'bg-white/30 text-slate-900' : 'bg-black/40 text-white'
      }`}
    >
      {/* Top Header / Actions */}
      <div className="w-full max-w-4xl flex justify-between items-center">
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-full border shadow-lg backdrop-blur-md ${
            isLight
              ? 'bg-white/85 border-slate-200 text-slate-800'
              : 'bg-slate-900/85 border-slate-800 text-slate-200'
          }`}
        >
          <Trophy className="w-5 h-5 text-amber-500" />
          <span className="text-xs uppercase tracking-wider font-semibold opacity-70">Record</span>
          <span className="font-arcade text-base text-amber-500 font-bold">
            {highScore.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Theme Switcher Toggle */}
          <button
            onClick={toggleTheme}
            className={`p-3 rounded-full border transition-all cursor-pointer shadow-lg active:scale-95 backdrop-blur-md ${
              isLight
                ? 'bg-white/85 border-slate-200 text-amber-600 hover:border-amber-400'
                : 'bg-slate-900/85 border-slate-800 text-sky-400 hover:border-cyan-500'
            }`}
            title={`Switch to ${isLight ? 'Dark' : 'Light'} Mode`}
            aria-label="Toggle Theme"
          >
            {isLight ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className={`p-3 rounded-full border transition-all cursor-pointer shadow-lg active:scale-95 backdrop-blur-md ${
              isLight
                ? 'bg-white/85 border-slate-200 text-slate-700 hover:border-cyan-500'
                : 'bg-slate-900/85 border-slate-800 text-slate-300 hover:border-cyan-500'
            }`}
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            aria-label="Toggle Sound"
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5 text-red-500" />
            ) : (
              <Volume2 className="w-5 h-5 text-cyan-500" />
            )}
          </button>
        </div>
      </div>

      {/* Main Title Banner & Play CTA */}
      <div className="flex flex-col items-center text-center max-w-lg my-auto">
        <div
          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest mb-4 border ${
            isLight
              ? 'bg-cyan-50 border-cyan-300 text-cyan-700'
              : 'bg-cyan-950/60 border-cyan-500/40 text-cyan-400'
          }`}
        >
          <Zap className="w-3.5 h-3.5 fill-current animate-pulse" />
          3D Endless Highway Runner
        </div>

        <h1
          className={`font-arcade text-5xl sm:text-7xl font-black italic tracking-wider mb-2 drop-shadow-2xl ${
            isLight
              ? 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 via-sky-600 to-rose-600'
              : 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-200 to-pink-500 text-glow-cyan'
          }`}
        >
          POCKET RACER
        </h1>
        <p
          className={`text-sm sm:text-base font-medium max-w-md mb-8 ${
            isLight ? 'text-slate-700' : 'text-slate-400'
          }`}
        >
          Take the wheel of an exotic supercar. Dodge heavy traffic, grab nitro canisters, and push the speedometer to its limit.
        </p>

        <button
          onClick={startGame}
          className={`group relative inline-flex items-center justify-center px-10 py-4 font-arcade text-lg sm:text-xl font-bold tracking-wider text-white uppercase transition-all duration-200 rounded-2xl active:scale-95 cursor-pointer shadow-2xl ${
            isLight
              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-cyan-500/30'
              : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 neon-glow-cyan'
          }`}
        >
          <span className="relative flex items-center gap-3">
            Start Race
            <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
          </span>
        </button>
      </div>

      {/* Controls Guide Footer */}
      <div
        className={`w-full max-w-xl flex flex-col sm:flex-row items-center justify-around gap-4 px-6 py-4 rounded-2xl border backdrop-blur-md shadow-2xl ${
          isLight
            ? 'bg-white/85 border-slate-200 text-slate-700'
            : 'bg-slate-950/85 border-slate-800 text-slate-300'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            <kbd
              className={`px-2 py-1 text-xs font-arcade rounded border ${
                isLight
                  ? 'bg-slate-100 border-slate-300 text-cyan-700'
                  : 'bg-slate-800 border-slate-700 text-cyan-400'
              }`}
            >
              A
            </kbd>
            <kbd
              className={`px-2 py-1 text-xs font-arcade rounded border ${
                isLight
                  ? 'bg-slate-100 border-slate-300 text-cyan-700'
                  : 'bg-slate-800 border-slate-700 text-cyan-400'
              }`}
            >
              D
            </kbd>
          </div>
          <span className="text-xs font-medium flex items-center gap-1 opacity-80">
            <ArrowLeft className="w-3.5 h-3.5" /> <ArrowRight className="w-3.5 h-3.5" /> Steer Lanes
          </span>
        </div>

        <div className={`h-4 w-px hidden sm:block ${isLight ? 'bg-slate-300' : 'bg-slate-800'}`} />

        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            <kbd
              className={`px-2 py-1 text-xs font-arcade rounded border ${
                isLight
                  ? 'bg-slate-100 border-slate-300 text-pink-700'
                  : 'bg-slate-800 border-slate-700 text-pink-400'
              }`}
            >
              W
            </kbd>
            <kbd
              className={`px-2 py-1 text-xs font-arcade rounded border ${
                isLight
                  ? 'bg-slate-100 border-slate-300 text-pink-700'
                  : 'bg-slate-800 border-slate-700 text-pink-400'
              }`}
            >
              SPACE
            </kbd>
          </div>
          <span className="text-xs font-medium flex items-center gap-1 opacity-80">
            <Zap className="w-3.5 h-3.5 text-pink-500" /> Nitro Boost
          </span>
        </div>
      </div>
    </div>
  );
};
