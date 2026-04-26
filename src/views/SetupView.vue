<template>
  <div class="setup">
    <div class="content">
      <div class="header">
        <h1>Yatzy</h1>
        <p class="subtitle">New game</p>
      </div>

      <section>
        <div class="section-label">RULE SET</div>
        <div class="ruleset-options">
          <label
            v-for="rs in RULESETS"
            :key="rs.id"
            class="ruleset-card"
            :class="{ active: selectedRuleSetId === rs.id }"
          >
            <input
              type="radio"
              :value="rs.id"
              v-model="selectedRuleSetId"
            />
            <div class="radio-dot">
              <div v-if="selectedRuleSetId === rs.id" class="radio-inner" />
            </div>
            <div class="ruleset-info">
              <div class="ruleset-name">{{ rs.name }}</div>
              <div class="ruleset-desc">{{ rs.categories.length }} categories</div>
            </div>
          </label>
        </div>
      </section>

      <section>
        <div class="section-label">PLAYERS</div>
        <div class="player-list">
          <div
            v-for="(name, i) in playerNames"
            :key="i"
            class="player-row"
          >
            <div class="color-dot" :style="{ background: PLAYER_COLORS[i] }" />
            <input
              v-model="playerNames[i]"
              type="text"
              :placeholder="`Player ${i + 1}`"
              maxlength="16"
              class="name-input"
            />
            <button
              v-if="playerNames.length > 2"
              class="remove-btn"
              @click="playerNames.splice(i, 1)"
              aria-label="Remove player"
            >✕</button>
          </div>

          <button
            v-if="playerNames.length < 4"
            class="add-btn"
            @click="playerNames.push('')"
          >
            <span>+</span> Add player
          </button>
        </div>
      </section>

      <button
        class="start-btn"
        :disabled="!canStart"
        @click="startGame"
      >
        Start Game →
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useGameStore } from '../stores/game'
import { RULESETS } from '../rulesets'

const PLAYER_COLORS = ['#a78bfa', '#34d399', '#fb923c', '#f87171']
const STORAGE_KEY = 'yatzy-player-names'

const store = useGameStore()
const selectedRuleSetId = ref('yatzy')

const saved = (() => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
})()
const playerNames = ref<string[]>(saved.length >= 2 ? saved : ['', ''])

const canStart = computed(() =>
  playerNames.value.filter(n => n.trim().length > 0).length >= 2
)

function startGame() {
  const validNames = playerNames.value.filter(n => n.trim().length > 0)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(playerNames.value))
  store.setRuleSet(selectedRuleSetId.value)
  store.setPlayers(validNames)
  store.startGame()
}
</script>

<style scoped>
.setup {
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
  color: var(--text-primary);
}

.subtitle {
  color: var(--text-muted);
  font-size: 14px;
  margin-top: 4px;
}

.section-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: var(--text-muted);
  margin-bottom: 10px;
}

.ruleset-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ruleset-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--surface-3);
  border: 1px solid var(--border-2);
  border-radius: 12px;
  padding: 14px 16px;
  cursor: pointer;
  transition: border-color 0.15s;
}

.ruleset-card.active {
  border-color: #a78bfa;
  background: #1a1428;
}

.ruleset-card input[type="radio"] {
  display: none;
}

.radio-dot {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid var(--border-2);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: border-color 0.15s;
}

.ruleset-card.active .radio-dot {
  border-color: #a78bfa;
  background: #a78bfa;
}

.radio-inner {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--bg);
}

.ruleset-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.ruleset-card:not(.active) .ruleset-name {
  color: var(--text-secondary);
}

.ruleset-desc {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 2px;
}

.player-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.player-row {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--surface-3);
  border: 1px solid var(--border-2);
  border-radius: 12px;
  padding: 14px 16px;
}

.color-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.name-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--text-primary);
  font-size: 15px;
  font-weight: 500;
}

.name-input::placeholder {
  color: var(--text-muted);
}

.remove-btn {
  color: var(--text-muted);
  font-size: 14px;
  padding: 4px;
}

.add-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  background: transparent;
  border: 1px dashed var(--border-2);
  border-radius: 12px;
  padding: 14px 16px;
  color: var(--text-muted);
  font-size: 14px;
  width: 100%;
}

.add-btn span {
  font-size: 18px;
}

.start-btn {
  width: 100%;
  background: #a78bfa;
  border-radius: 14px;
  color: var(--bg);
  padding: 18px;
  font-size: 16px;
  font-weight: 800;
  letter-spacing: -0.2px;
  margin-top: auto;
  transition: opacity 0.15s;
}

.start-btn:disabled {
  opacity: 0.3;
}
</style>
