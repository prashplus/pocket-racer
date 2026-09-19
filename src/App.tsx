import React, { useEffect } from 'react';
import { useGameStore } from './store/useGameStore';
import { GameCanvas } from './components/3d/GameCanvas';
import { MainMenu } from './components/ui/MainMenu';
import { HUD } from './components/ui/HUD';
import { GameOverModal } from './components/ui/GameOverModal';
import { MobileControls } from './components/ui/MobileControls';

export const App: React.FC = () => {
  const status = useGameStore((state) => state.status);
  const steerLeft = useGameStore((state) => state.steerLeft);
  const steerRight = useGameStore((state) => state.steerRight);
  const setBoosting = useGameStore((state) => state.setBoosting);
  const startGame = useGameStore((state) => state.startGame);

  // Desktop keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;

      if (status === 'MENU') {
        if (e.code === 'Space' || e.code === 'Enter') {
          e.preventDefault();
          startGame();
        }
        return;
      }

      if (status === 'PLAYING') {
        if (e.code === 'KeyA' || e.code === 'ArrowLeft') {
          steerLeft();
        } else if (e.code === 'KeyD' || e.code === 'ArrowRight') {
          steerRight();
        } else if (e.code === 'KeyW' || e.code === 'ArrowUp' || e.code === 'Space') {
          e.preventDefault();
          setBoosting(true);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'KeyW' || e.code === 'ArrowUp' || e.code === 'Space') {
        setBoosting(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [status, steerLeft, steerRight, setBoosting, startGame]);

  const theme = useGameStore((state) => state.theme);
  const isLight = theme === 'light';

  return (
    <div
      className={`relative w-full h-full overflow-hidden font-sans select-none touch-none transition-colors duration-300 ${
        isLight ? 'bg-sky-200' : 'bg-slate-950'
      }`}
    >
      {/* 3D WebGL Canvas Layer */}
      <GameCanvas />

      {/* Subtle CRT Arcade Scanline Effect (Only in dark synthwave mode) */}
      {!isLight && (
        <div className="absolute inset-0 scanline-overlay pointer-events-none z-10 opacity-50" />
      )}

      {/* UI Overlays based on state */}
      {status === 'MENU' && <MainMenu />}
      {status === 'PLAYING' && (
        <>
          <HUD />
          <MobileControls />
        </>
      )}
      {status === 'GAMEOVER' && <GameOverModal />}
    </div>
  );
};

export default App;
