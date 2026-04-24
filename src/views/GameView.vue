<template>
  <div class="game">
    <!-- App header -->
    <header class="app-header">
      <span class="app-title">{{ store.ruleSet.name.split('—')[0].trim() }}</span>
      <div class="header-right">
        <div class="turn-pill" :style="turnPillStyle">
          <div class="turn-dot" :style="{ background: activePlayer.color, boxShadow: `0 0 6px ${activePlayer.color}` }" />
          <span>{{ activePlayer.name }}</span>
        </div>
        <div class="round-badge">{{ roundDisplay }}</div>
        <button
          v-if="store.canUndo"
          class="undo-btn"
          @click="store.undoLast()"
          aria-label="Undo last score"
        >↩</button>
      </div>
    </header>

    <!-- Column headers -->
    <div class="col-headers">
      <div class="cat-col" />
      <div
        v-for="(player, pi) in store.players"
        :key="player.id"
        class="player-col-header"
        :class="{ inactive: pi !== store.activePlayerIndex }"
      >
        <div v-if="pi === store.activePlayerIndex" class="active-dot" :style="{ background: player.color, boxShadow: `0 0 5px ${player.color}` }" />
        <span :style="{ color: player.color }">{{ player.name.toUpperCase() }}</span>
      </div>
    </div>

    <!-- Scorecard body -->
    <div class="scorecard">

      <!-- UPPER section label -->
      <div class="section-label">UPPER — pace delta</div>

      <!-- Upper rows -->
      <div
        v-for="cat in upperCats"
        :key="cat.id"
        class="row upper-row"
      >
        <div class="cat-name-cell">{{ cat.name }}</div>
        <div
          v-for="(player, pi) in store.players"
          :key="player.id"
          class="score-cell"
          :class="{ inactive: pi !== store.activePlayerIndex }"
        >
          <template v-if="player.scores[cat.id] !== null">
            <span
              :style="deltaStyle(player, cat)"
              v-bind="useLongPress(() => { editTarget = { player, category: cat } })"
              style="touch-action: none;"
            >{{ formatDelta(player, cat) }}</span>
          </template>
          <template v-else>
            <div
              class="open-slot"
              :class="{ tappable: pi === store.activePlayerIndex }"
              :style="pi === store.activePlayerIndex ? openSlotStyle(player) : {}"
              @click="pi === store.activePlayerIndex && openModal(cat)"
            >+</div>
          </template>
        </div>
      </div>

      <!-- Bonus row -->
      <div class="row bonus-row">
        <div class="cat-name-cell bonus-label">
          <div class="bonus-title">BONUS</div>
          <div class="bonus-threshold">≥ {{ store.ruleSet.bonusThreshold }} → +{{ store.ruleSet.bonusPoints }}</div>
        </div>
        <div
          v-for="(player, pi) in store.players"
          :key="player.id"
          class="score-cell bonus-score"
          :class="{ inactive: pi !== store.activePlayerIndex }"
        >
          <div
            class="bonus-delta"
            :style="{ color: store.upperDelta(player.id) >= 0 ? 'var(--positive)' : 'var(--negative)' }"
          >{{ store.upperDelta(player.id) >= 0 ? '+' : '' }}{{ store.upperDelta(player.id) }}</div>
          <div class="bonus-progress">{{ store.upperTotal(player.id) }} / {{ store.ruleSet.bonusThreshold }}</div>
        </div>
      </div>

      <!-- LOWER section label -->
      <div class="section-label">LOWER</div>

      <!-- Lower rows -->
      <div
        v-for="cat in lowerCats"
        :key="cat.id"
        class="row lower-row"
      >
        <div class="cat-name-cell">{{ cat.name }}</div>
        <div
          v-for="(player, pi) in store.players"
          :key="player.id"
          class="score-cell"
          :class="{ inactive: pi !== store.activePlayerIndex }"
        >
          <template v-if="player.scores[cat.id] !== null">
            <span
              :style="{ color: player.color, fontWeight: 600 }"
              v-bind="useLongPress(() => { editTarget = { player, category: cat } })"
              style="touch-action: none;"
            >{{ player.scores[cat.id] }}</span>
          </template>
          <template v-else>
            <div
              class="open-slot"
              :class="{ tappable: pi === store.activePlayerIndex }"
              :style="pi === store.activePlayerIndex ? openSlotStyle(player) : {}"
              @click="pi === store.activePlayerIndex && openModal(cat)"
            >+</div>
          </template>
        </div>
      </div>

      <!-- Total row -->
      <div class="row total-row">
        <div class="cat-name-cell total-label">TOTAL</div>
        <div
          v-for="(player, pi) in store.players"
          :key="player.id"
          class="score-cell total-score"
          :class="{ inactive: pi !== store.activePlayerIndex }"
          :style="{ color: player.color }"
        >
          {{ store.grandTotal(player.id) }}
        </div>
      </div>

    </div>

    <!-- Score modal -->
    <ScoreModal
      v-if="activeCategory"
      :category="activeCategory"
      :player="activePlayer"
      :numDice="store.ruleSet.numDice"
      @confirm="handleConfirm"
      @close="activeCategory = null"
    />

    <!-- Edit modal (long-press on filled score) -->
    <ScoreModal
      v-if="editTarget"
      :category="editTarget.category"
      :player="editTarget.player"
      :numDice="store.ruleSet.numDice"
      @confirm="(score) => { store.editScore(editTarget!.player.id, editTarget!.category.id, score); editTarget = null }"
      @close="editTarget = null"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useGameStore } from '../stores/game'
import type { Category } from '../rulesets/types'
import type { Player } from '../stores/game'
import ScoreModal from '../components/ScoreModal.vue'

const store = useGameStore()

const activeCategory = ref<Category | null>(null)

function useLongPress(onLongPress: () => void, duration = 500) {
  let timer: ReturnType<typeof setTimeout> | null = null
  return {
    onPointerdown() { timer = setTimeout(onLongPress, duration) },
    onPointerup() { if (timer) { clearTimeout(timer); timer = null } },
    onPointercancel() { if (timer) { clearTimeout(timer); timer = null } },
  }
}

const editTarget = ref<{ player: Player; category: Category } | null>(null)

const activePlayer = computed(() => store.players[store.activePlayerIndex])

const upperCats = computed(() => store.ruleSet.categories.filter(c => c.section === 'upper'))
const lowerCats = computed(() => store.ruleSet.categories.filter(c => c.section === 'lower'))

const totalCategories = computed(() => store.ruleSet.categories.length)

const roundDisplay = computed(() => {
  const filled = store.players.reduce((sum, p) =>
    sum + store.ruleSet.categories.filter(c => p.scores[c.id] !== null).length, 0)
  const turn = Math.floor(filled / store.players.length) + 1
  return `${Math.min(turn, totalCategories.value)} / ${totalCategories.value}`
})

const turnPillStyle = computed(() => ({
  background: activePlayer.value.color + '18',
  border: `1px solid ${activePlayer.value.color}44`,
}))

function openSlotStyle(player: Player) {
  return {
    background: player.color + '22',
    border: `1px solid ${player.color}55`,
    color: player.color,
  }
}

function openModal(cat: Category) {
  activeCategory.value = cat
}

function handleConfirm(score: number) {
  if (!activeCategory.value) return
  store.enterScore(activeCategory.value.id, score)
  activeCategory.value = null
}

function formatDelta(player: Player, cat: Category): string {
  const score = player.scores[cat.id]
  if (score === null) return ''
  const pace = 3 * (cat.scoring as { type: 'sum-of-value'; value: number }).value
  const delta = score - pace
  return delta > 0 ? `+${delta}` : `${delta}`
}

function deltaStyle(player: Player, cat: Category) {
  const score = player.scores[cat.id]
  if (score === null) return {}
  const pace = 3 * (cat.scoring as { type: 'sum-of-value'; value: number }).value
  const delta = score - pace
  return {
    color: delta > 0 ? 'var(--positive)' : delta < 0 ? 'var(--negative)' : 'var(--neutral)',
    fontWeight: 700,
    fontSize: '15px',
  }
}
</script>

<style scoped>
.game {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--bg);
}

.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  background: var(--bg);
  border-bottom: 1px solid var(--border-1);
  flex-shrink: 0;
}

.app-title {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.5px;
  color: var(--text-primary);
}

.header-right {
  display: flex;
  gap: 7px;
  align-items: center;
}

.turn-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  border-radius: 20px;
  padding: 5px 11px;
  font-size: 11px;
  font-weight: 600;
  color: v-bind('activePlayer.color');
}

.turn-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.round-badge {
  background: var(--surface-3);
  border-radius: 20px;
  padding: 5px 11px;
  color: var(--neutral);
  font-size: 11px;
}

.col-headers {
  display: flex;
  background: var(--surface-1);
  border-bottom: 1px solid var(--border-1);
  flex-shrink: 0;
}

.cat-col {
  flex: 1;
}

.player-col-header {
  width: 84px;
  padding: 8px 0;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  font-size: 11px;
  font-weight: 700;
  transition: opacity 0.2s;
}

.player-col-header.inactive {
  opacity: 0.4;
}

.active-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
}

/* Scorecard: flex column, fills all remaining height */
.scorecard {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.section-label {
  flex-shrink: 0;
  background: #0d0d0d;
  padding: 0 16px;
  height: 20px;
  display: flex;
  align-items: center;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: var(--text-faint);
}

.row {
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--border-1);
  min-height: 0;
}

.upper-row { flex: 1; }
.lower-row { flex: 1; }

.bonus-row {
  flex: 1.8;
  background: var(--surface-1);
  border-top: 1px solid var(--border-2);
  border-bottom: 2px solid var(--border-2);
}

.total-row {
  flex: 1.4;
  background: var(--surface-1);
  border-top: 2px solid var(--border-1);
  border-bottom: none;
}

/* Highlight rows with active open slots */
.upper-row:has(.tappable) {
  background: #1a1428;
}
.lower-row:has(.tappable) {
  background: #1a1428;
}

.cat-name-cell {
  flex: 1;
  padding: 0 16px;
  font-size: 14px;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bonus-label {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.bonus-title {
  font-size: 10px;
  letter-spacing: 0.06em;
  color: var(--text-muted);
}

.bonus-threshold {
  font-size: 10px;
  color: var(--text-faint);
}

.total-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--neutral);
}

.score-cell {
  width: 84px;
  text-align: center;
  font-size: 14px;
  transition: opacity 0.2s;
}

.score-cell.inactive {
  opacity: 0.4;
}

.bonus-score {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.bonus-delta {
  font-size: 20px;
  font-weight: 800;
  line-height: 1;
}

.bonus-progress {
  font-size: 10px;
  color: var(--neutral);
}

.total-score {
  font-size: 19px;
  font-weight: 800;
}

.open-slot {
  margin: 0 8px;
  border-radius: 6px;
  padding: 4px 0;
  font-size: 12px;
  font-weight: 600;
  text-align: center;
  color: var(--border-2);
  background: var(--surface-2);
}

.open-slot.tappable {
  cursor: pointer;
}

.undo-btn {
  background: var(--surface-3);
  border: 1px solid var(--border-2);
  border-radius: 8px;
  color: var(--text-secondary);
  width: 32px;
  height: 32px;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
