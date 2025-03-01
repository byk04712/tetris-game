import { type Block } from '../types/game';

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private blockSize: number;

  constructor(canvas: HTMLCanvasElement, blockSize: number) {
    this.ctx = canvas.getContext('2d')!;
    this.blockSize = blockSize;
  }

  public clear(): void {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
  }

  public drawBoard(board: number[][]): void {
    board.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell) {
          this.drawBlock(x, y, '#808080');
        }
      });
    });
  }

  public drawBlock(x: number, y: number, color: string): void {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(
      x * this.blockSize,
      y * this.blockSize,
      this.blockSize - 1,
      this.blockSize - 1
    );
  }

  public drawActiveBlock(block: Block): void {
    block.shape.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell) {
          this.drawBlock(
            block.x + x,
            block.y + y,
            block.color
          );
        }
      });
    });
  }

  public drawGrid(): void {
    this.ctx.strokeStyle = '#333';
    this.ctx.lineWidth = 0.5;

    for (let x = 0; x <= this.ctx.canvas.width; x += this.blockSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.ctx.canvas.height);
      this.ctx.stroke();
    }

    for (let y = 0; y <= this.ctx.canvas.height; y += this.blockSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.ctx.canvas.width, y);
      this.ctx.stroke();
    }
  }
} 