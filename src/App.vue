<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from './stores/game'
import SetupView from './views/SetupView.vue'
import GameView from './views/GameView.vue'
import ResultsView from './views/ResultsView.vue'

const store = useGameStore()

const currentComponent = computed(() => ({
  setup: SetupView,
  game: GameView,
  results: ResultsView,
}[store.currentView]))
</script>

<template>
  <component :is="currentComponent" />
</template>
