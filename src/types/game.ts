export type GameStatus = 'MENU' | 'PLAYING' | 'GAMEOVER';

export type LaneIndex = -1 | 0 | 1;

export const LANE_POSITIONS: Record<LaneIndex, number> = {
  [-1]: -3.0,
  [0]: 0,
  [1]: 3.0,
};

export type ObstacleType = 'sedan' | 'truck' | 'barrier';

export interface Obstacle {
  id: string;
  type: ObstacleType;
  lane: LaneIndex;
  z: number;
  speed: number;
  size: [number, number, number]; // width, height, length
  color: string;
}

export interface Collectible {
  id: string;
  lane: LaneIndex;
  z: number;
  type: 'coin' | 'nitro';
  collected: boolean;
}
