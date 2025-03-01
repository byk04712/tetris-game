<template>
  <div class="app">
    <TetrisGame />
  </div>
</template>

<script setup lang="ts">
import TetrisGame from './components/TetrisGame.vue';
</script>

<style>
body {
  margin: 0;
  padding: 0;
  background-color: #1a1a1a;
}

.app {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}
</style> 