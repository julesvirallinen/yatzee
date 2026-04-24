<template>
  <div class="results">
    <div class="content">
      <div class="header">
        <h1>Game over</h1>
        <p class="subtitle">Final scores</p>
      </div>

      <div class="scores">
        <div
          v-for="(player, i) in ranked"
          :key="player.id"
          class="score-card"
          :class="{ winner: i === 0 }"
          :style="i === 0 ? { borderColor: player.color, background: player.color + '0f' } : {}"
        >
          <div class="rank" :style="i === 0 ? { color: player.color } : {}">
            {{ i === 0 ? '🏆' : `#${i + 1}` }}
          </div>
          <div class="player-info">
            <div class="player-name" :style="{ color: player.color }">{{ player.name }}</div>
            <div class="score-breakdown">
              <span>Upper {{ store.upperTotal(player.id) }}</span>
              <span v-if="store.bonusEarned(player.id)" class="bonus-badge" :style="{ color: player.color }">+{{ store.ruleSet.bonusPoints }}</span>
              <span>Lower {{ store.lowerTotal(player.id) }}</span>
            </div>
          </div>
          <div class="total" :style="{ color: player.color }">
            {{ store.grandTotal(player.id) }}
          </div>
        </div>
      </div>

      <button class="new-game-btn" @click="store.newGame()">
        New Game
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '../stores/game'

const store = useGameStore()

const ranked = computed(() =>
  [...store.players].sort((a, b) => store.grandTotal(b.id) - store.grandTotal(a.id))
)
</script>

<style scoped>
.results {
  flex: 1;
  overflow-y: auto;
  background: var(--bg);
}

.content {
  display: flex;
  flex-direction: column;
  gap: 32px;
  padding: 48px 24px 40px;
  min-height: 100%;
}

h1 {
  font-size: 32px;
  font-weight: 800;
  letter-spacing: -0.5px;
}

.subtitle {
  color: var(--text-muted);
  font-size: 14px;
  margin-top: 4px;
}

.scores {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.score-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: var(--surface-3);
  border: 1px solid var(--border-2);
  border-radius: 16px;
  padding: 18px 20px;
}

.score-card.winner {
  border-width: 1px;
}

.rank {
  font-size: 20px;
  font-weight: 800;
  color: var(--text-muted);
  width: 32px;
  text-align: center;
}

.player-info {
  flex: 1;
}

.player-name {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 4px;
}

.score-breakdown {
  display: flex;
  gap: 10px;
  font-size: 12px;
  color: var(--text-muted);
}

.bonus-badge {
  font-weight: 700;
}

.total {
  font-size: 28px;
  font-weight: 800;
}

.new-game-btn {
  width: 100%;
  background: var(--surface-3);
  border: 1px solid var(--border-2);
  border-radius: 14px;
  color: var(--text-primary);
  padding: 18px;
  font-size: 16px;
  font-weight: 700;
  margin-top: auto;
}
</style>
