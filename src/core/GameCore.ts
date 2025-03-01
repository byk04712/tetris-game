import { GameStatus, Direction, type Block, type GameConfig } from '../types/game';
import { TETROMINOS } from '../config/tetrominos';

export class GameCore {
  private board: number[][];
  private currentBlock: Block | null = null;
  private nextBlock: Block | null = null;
  private config: GameConfig;
  private score = 0;
  private level = 1;
  private gameStatus: GameStatus = GameStatus.READY;

  constructor(config: GameConfig) {
    this.config = config;
    this.board = Array(config.height).fill(null).map(() => Array(config.width).fill(0));
    this.generateNewBlock();
  }

  // 生成新方块
  private generateNewBlock(): void {
    const shapes = Object.keys(TETROMINOS);
    const randomShape = shapes[Math.floor(Math.random() * shapes.length)] as keyof typeof TETROMINOS;
    
    if (!this.currentBlock) {
      this.currentBlock = {
        ...TETROMINOS[randomShape],
        x: Math.floor(this.config.width / 2) - 2,
        y: 0
      };
    } else {
      this.currentBlock = this.nextBlock;
    }

    this.nextBlock = {
      ...TETROMINOS[randomShape],
      x: Math.floor(this.config.width / 2) - 2,
      y: 0
    };

    if (this.checkCollision(this.currentBlock)) {
      this.gameStatus = GameStatus.OVER;
    }
  }

  // 碰撞检测
  private checkCollision(block: Block, offsetX = 0, offsetY = 0): boolean {
    return block.shape.some((row, y) =>
      row.some((cell, x) => {
        if (cell === 0) return false;
        const newX = block.x + x + offsetX;
        const newY = block.y + y + offsetY;
        return (
          newX < 0 ||
          newX >= this.config.width ||
          newY >= this.config.height ||
          (newY >= 0 && this.board[newY][newX])
        );
      })
    );
  }

  // 方块移动
  public moveBlock(direction: Direction): boolean {
    if (!this.currentBlock || this.gameStatus !== GameStatus.PLAYING) return false;

    let offsetX = 0;
    let offsetY = 0;

    switch (direction) {
      case Direction.LEFT:
        offsetX = -1;
        break;
      case Direction.RIGHT:
        offsetX = 1;
        break;
      case Direction.DOWN:
        offsetY = 1;
        break;
    }

    if (!this.checkCollision(this.currentBlock, offsetX, offsetY)) {
      this.currentBlock.x += offsetX;
      this.currentBlock.y += offsetY;
      return true;
    }

    if (direction === Direction.DOWN) {
      this.freezeBlock();
      this.clearLines();
      this.generateNewBlock();
    }

    return false;
  }

  // 旋转方块
  public rotateBlock(): void {
    if (!this.currentBlock || this.gameStatus !== GameStatus.PLAYING) return;

    const rotated = {
      ...this.currentBlock,
      shape: this.currentBlock.shape[0].map((_, i) =>
        this.currentBlock!.shape.map(row => row[i]).reverse()
      )
    };

    if (!this.checkCollision(rotated)) {
      this.currentBlock = rotated;
    }
  }

  // 固定方块
  private freezeBlock(): void {
    if (!this.currentBlock) return;

    this.currentBlock.shape.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell) {
          const boardY = this.currentBlock!.y + y;
          const boardX = this.currentBlock!.x + x;
          if (boardY >= 0 && boardY < this.config.height) {
            this.board[boardY][boardX] = 1;
          }
        }
      });
    });
  }

  // 消行处理
  private clearLines(): void {
    let linesCleared = 0;

    for (let y = this.board.length - 1; y >= 0; y--) {
      if (this.board[y].every(cell => cell)) {
        this.board.splice(y, 1);
        this.board.unshift(Array(this.config.width).fill(0));
        linesCleared++;
        y++;
      }
    }

    if (linesCleared > 0) {
      this.updateScore(linesCleared);
    }
  }

  // 更新分数
  private updateScore(lines: number): void {
    const points = [40, 100, 300, 1200];
    this.score += points[lines - 1] * this.level;
    this.level = Math.floor(this.score / 1000) + 1;
  }

  // 快速下落
  public dropBlock(): void {
    if (!this.currentBlock || this.gameStatus !== GameStatus.PLAYING) return;
    while (this.moveBlock(Direction.DOWN)) {}
  }

  // 获取游戏状态
  public getGameState() {
    return {
      board: this.board,
      currentBlock: this.currentBlock,
      nextBlock: this.nextBlock,
      score: this.score,
      level: this.level,
      gameStatus: this.gameStatus
    };
  }

  // 游戏控制
  public start(): void {
    this.gameStatus = GameStatus.PLAYING;
  }

  public pause(): void {
    this.gameStatus = GameStatus.PAUSED;
  }

  public reset(): void {
    this.board = Array(this.config.height).fill(null).map(() => Array(this.config.width).fill(0));
    this.score = 0;
    this.level = 1;
    this.gameStatus = GameStatus.READY;
    this.currentBlock = null;
    this.generateNewBlock();
  }
} 