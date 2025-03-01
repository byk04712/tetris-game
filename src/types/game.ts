// 方块类型定义
export interface Block {
  shape: number[][];
  color: string;
  x: number;
  y: number;
}

// 游戏状态
export enum GameStatus {
  READY = 'READY',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  OVER = 'OVER'
}

// 方向键类型
export enum Direction {
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
  DOWN = 'DOWN'
}

// 游戏配置
export interface GameConfig {
  width: number;      // 游戏区域宽度
  height: number;     // 游戏区域高度
  blockSize: number;  // 方块大小
  speed: number;      // 下落速度
} 