import { create } from 'zustand';
import { GameStatus, LaneIndex } from '../types/game';
import { soundEngine } from '../audio/soundEngine';

interface GameState {
  status: GameStatus;
  lane: LaneIndex;
  speed: number;
  baseSpeed: number;
  maxBaseSpeed: number;
  isBoosting: boolean;
  nitro: number; // 0 to 100
  score: number;
  distance: number; // in meters
  highScore: number;
  coinsCollected: number;
  isMuted: boolean;
  theme: 'dark' | 'light';
  trauma: number; // Camera shake intensity (0 to 1)

  // Actions
  startGame: () => void;
  steerLeft: () => void;
  steerRight: () => void;
  setBoosting: (boosting: boolean) => void;
  addScore: (points: number) => void;
  collectCoin: () => void;
  collectNitro: () => void;
  triggerCrash: () => void;
  resetGame: () => void;
  toggleSound: () => void;
  toggleTheme: () => void;
  tick: (delta: number) => void;
}

const INITIAL_BASE_SPEED = 32;
const MAX_BASE_SPEED = 68;
const BOOST_SPEED_BONUS = 36;

let lastSteerTime = 0;
const STEER_COOLDOWN_MS = 120;

export const useGameStore = create<GameState>((set, get) => {
  const savedHighScore = parseInt(localStorage.getItem('pocket_racer_highscore') || '0', 10);
  const savedTheme = (localStorage.getItem('pocket_racer_theme') as 'dark' | 'light') || 'dark';

  return {
    status: 'MENU',
    lane: 0,
    speed: INITIAL_BASE_SPEED,
    baseSpeed: INITIAL_BASE_SPEED,
    maxBaseSpeed: MAX_BASE_SPEED,
    isBoosting: false,
    nitro: 100,
    score: 0,
    distance: 0,
    highScore: savedHighScore,
    coinsCollected: 0,
    isMuted: soundEngine.getMuted(),
    theme: savedTheme,
    trauma: 0,

    startGame: () => {
      lastSteerTime = 0;
      soundEngine.startEngine();
      set({
        status: 'PLAYING',
        lane: 0,
        speed: INITIAL_BASE_SPEED,
        baseSpeed: INITIAL_BASE_SPEED,
        isBoosting: false,
        nitro: 100,
        score: 0,
        distance: 0,
        coinsCollected: 0,
        trauma: 0,
      });
    },

    steerLeft: () => {
      const now = performance.now();
      if (now - lastSteerTime < STEER_COOLDOWN_MS) return;
      const { status, lane } = get();
      if (status !== 'PLAYING') return;
      if (lane === 1) {
        lastSteerTime = now;
        set({ lane: 0 });
        soundEngine.playWhooshSound();
      } else if (lane === 0) {
        lastSteerTime = now;
        set({ lane: -1 });
        soundEngine.playWhooshSound();
      }
    },

    steerRight: () => {
      const now = performance.now();
      if (now - lastSteerTime < STEER_COOLDOWN_MS) return;
      const { status, lane } = get();
      if (status !== 'PLAYING') return;
      if (lane === -1) {
        lastSteerTime = now;
        set({ lane: 0 });
        soundEngine.playWhooshSound();
      } else if (lane === 0) {
        lastSteerTime = now;
        set({ lane: 1 });
        soundEngine.playWhooshSound();
      }
    },

    setBoosting: (boosting: boolean) => {
      const { status, nitro, isBoosting } = get();
      if (status !== 'PLAYING') return;

      if (boosting && nitro > 10) {
        if (!isBoosting) soundEngine.playNitroSound();
        set({ isBoosting: true });
      } else if (!boosting) {
        set({ isBoosting: false });
      }
    },

    addScore: (points: number) => {
      set((state) => {
        const newScore = state.score + points;
        const newHigh = Math.max(newScore, state.highScore);
        if (newHigh > state.highScore) {
          localStorage.setItem('pocket_racer_highscore', String(newHigh));
        }
        return { score: newScore, highScore: newHigh };
      });
    },

    collectCoin: () => {
      soundEngine.playCoinSound();
      get().addScore(250);
      set((state) => ({
        coinsCollected: state.coinsCollected + 1,
        nitro: Math.min(100, state.nitro + 8),
      }));
    },

    collectNitro: () => {
      soundEngine.playNitroSound();
      get().addScore(150);
      set((state) => ({
        nitro: Math.min(100, state.nitro + 35),
      }));
    },

    triggerCrash: () => {
      const { status, score, highScore } = get();
      if (status !== 'PLAYING') return;

      soundEngine.stopEngine();
      soundEngine.playCrashSound();

      const finalHigh = Math.max(score, highScore);
      localStorage.setItem('pocket_racer_highscore', String(finalHigh));

      set({
        status: 'GAMEOVER',
        isBoosting: false,
        speed: 0,
        trauma: 1.0,
        highScore: finalHigh,
      });
    },

    resetGame: () => {
      get().startGame();
    },

    toggleSound: () => {
      const newMuted = soundEngine.toggleMute();
      set({ isMuted: newMuted });
    },

    toggleTheme: () => {
      const currentTheme = get().theme;
      const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('pocket_racer_theme', nextTheme);
      set({ theme: nextTheme });
    },

    tick: (delta: number) => {
      const { status, baseSpeed, maxBaseSpeed, isBoosting, nitro, distance, score, trauma } = get();
      if (status !== 'PLAYING') {
        if (trauma > 0) {
          set({ trauma: Math.max(0, trauma - delta * 1.8) });
        }
        return;
      }

      // Accelerate base speed gradually as player survives longer
      const newBaseSpeed = Math.min(maxBaseSpeed, baseSpeed + delta * 0.45);

      // Handle Nitro consumption & recovery
      let currentNitro = nitro;
      let effectiveBoosting = isBoosting;

      if (effectiveBoosting) {
        currentNitro = Math.max(0, currentNitro - delta * 32);
        if (currentNitro <= 0) {
          effectiveBoosting = false;
        }
      } else {
        currentNitro = Math.min(100, currentNitro + delta * 4); // Slow recharge
      }

      const activeSpeed = effectiveBoosting ? newBaseSpeed + BOOST_SPEED_BONUS : newBaseSpeed;
      const speedRatio = activeSpeed / (maxBaseSpeed + BOOST_SPEED_BONUS);

      // Update procedural engine pitch
      soundEngine.updateEnginePitch(speedRatio, effectiveBoosting);

      // Distance & score calculation
      const distanceDelta = (activeSpeed * delta * 2.2);
      const newDistance = distance + distanceDelta;
      const scoreGain = Math.round(distanceDelta * (effectiveBoosting ? 2.5 : 1.0));
      const newScore = score + scoreGain;
      const newHighScore = Math.max(newScore, get().highScore);
      if (newHighScore > get().highScore) {
        localStorage.setItem('pocket_racer_highscore', String(newHighScore));
      }

      // Camera shake decay
      const newTrauma = Math.max(0, trauma - delta * 2.2);

      set({
        baseSpeed: newBaseSpeed,
        speed: activeSpeed,
        nitro: currentNitro,
        isBoosting: effectiveBoosting,
        distance: newDistance,
        score: newScore,
        highScore: newHighScore,
        trauma: newTrauma,
      });
    },
  };
});
