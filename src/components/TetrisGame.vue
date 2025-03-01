<template>
  <div class="tetris-container">
    <div class="game-area">
      <canvas ref="gameCanvas" :width="width" :height="height"></canvas>
    </div>
    <div class="info-panel">
      <div class="next-block">
        <h3>Next Block</h3>
        <canvas ref="nextBlockCanvas" width="120" height="120"></canvas>
      </div>
      <div class="score-board">
        <p>Score: {{ score }}</p>
        <p>Level: {{ level }}</p>
      </div>
      <div class="controls">
        <button @click="toggleGame">{{ gameStatus === 'PLAYING' ? 'Pause' : 'Start' }}</button>
        <button @click="resetGame">Reset</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { GameCore } from '../core/GameCore';
import { Renderer } from '../core/Renderer';
import { GameStatus, Direction } from '../types/game';
import { INITIAL_CONFIG } from '../config/tetrominos';

// 状态和引用
const gameCanvas = ref<HTMLCanvasElement | null>(null);
const nextBlockCanvas = ref<HTMLCanvasElement | null>(null);
const gameCore = ref<GameCore | null>(null);
const mainRenderer = ref<Renderer | null>(null);
const nextBlockRenderer = ref<Renderer | null>(null);
const gameLoop = ref<number | null>(null);

// 计算属性
const width = INITIAL_CONFIG.width * INITIAL_CONFIG.blockSize;
const height = INITIAL_CONFIG.height * INITIAL_CONFIG.blockSize;
const score = ref(0);
const level = ref(1);
const gameStatus = ref<GameStatus>(GameStatus.READY);

// 初始化
onMounted(() => {
  if (gameCanvas.value && nextBlockCanvas.value) {
    gameCore.value = new GameCore(INITIAL_CONFIG);
    mainRenderer.value = new Renderer(gameCanvas.value, INITIAL_CONFIG.blockSize);
    nextBlockRenderer.value = new Renderer(nextBlockCanvas.value, 30);
    
    window.addEventListener('keydown', handleKeyPress);
    render();
  }
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyPress);
  if (gameLoop.value) {
    cancelAnimationFrame(gameLoop.value);
  }
});

// 游戏控制
const toggleGame = () => {
  if (!gameCore.value) return;

  if (gameStatus.value === GameStatus.PLAYING) {
    gameCore.value.pause();
    gameStatus.value = GameStatus.PAUSED;
  } else {
    gameCore.value.start();
    gameStatus.value = GameStatus.PLAYING;
    startGameLoop();
  }
};

const resetGame = () => {
  if (!gameCore.value) return;
  gameCore.value.reset();
  score.value = 0;
  level.value = 1;
  gameStatus.value = GameStatus.READY;
};

const handleKeyPress = (event: KeyboardEvent) => {
  if (gameStatus.value !== GameStatus.PLAYING || !gameCore.value) return;

  switch (event.key) {
    case 'ArrowLeft':
      gameCore.value.moveBlock(Direction.LEFT);
      break;
    case 'ArrowRight':
      gameCore.value.moveBlock(Direction.RIGHT);
      break;
    case 'ArrowDown':
      gameCore.value.moveBlock(Direction.DOWN);
      break;
    case 'ArrowUp':
      gameCore.value.rotateBlock();
      break;
    case ' ':
      gameCore.value.dropBlock();
      break;
  }
};

// 渲染和游戏循环
const render = () => {
  if (!gameCore.value || !mainRenderer.value || !nextBlockRenderer.value) return;

  const state = gameCore.value.getGameState();
  
  // 更新状态
  gameStatus.value = state.gameStatus;
  score.value = state.score;
  level.value = state.level;

  // 渲染主游戏区域
  mainRenderer.value.clear();
  mainRenderer.value.drawGrid();
  mainRenderer.value.drawBoard(state.board);
  if (state.currentBlock) {
    mainRenderer.value.drawActiveBlock(state.currentBlock);
  }

  // 渲染下一个方块预览
  nextBlockRenderer.value.clear();
  if (state.nextBlock) {
    nextBlockRenderer.value.drawActiveBlock({
      ...state.nextBlock,
      x: 1,
      y: 1
    });
  }
};

const startGameLoop = () => {
  let lastTime = 0;
  const gameSpeed = 1000 / (level.value * 2);

  const update = (timestamp: number) => {
    if (gameStatus.value !== GameStatus.PLAYING) return;

    const deltaTime = timestamp - lastTime;
    if (deltaTime > gameSpeed && gameCore.value) {
      gameCore.value.moveBlock(Direction.DOWN);
      lastTime = timestamp;
    }

    render();
    gameLoop.value = requestAnimationFrame(update);
  };

  gameLoop.value = requestAnimationFrame(update);
};
</script>

<style scoped>
.tetris-container {
  display: flex;
  gap: 20px;
  padding: 20px;
  background-color: #1a1a1a;
  color: white;
}

.game-area {
  border: 2px solid #333;
}

.info-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.next-block {
  border: 1px solid #333;
  padding: 10px;
}

.score-board {
  font-size: 1.2em;
  margin: 10px 0;
}

.controls button {
  margin: 5px;
  padding: 8px 16px;
  background-color: #333;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.controls button:hover {
  background-color: #444;
}
</style> 