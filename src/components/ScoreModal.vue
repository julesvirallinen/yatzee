<template>
  <div class="overlay" @click.self="$emit('close')">
    <div class="sheet">
      <div class="handle-bar" />

      <div class="sheet-header">
        <div class="sheet-title">
          <span class="player-name" :style="{ color: player.color }">{{ player.name }}</span>
          <span class="cat-name"> — {{ category.name }}</span>
        </div>
        <span class="cat-hint">{{ hint }}</span>
      </div>

      <!-- Fixed-score category: just confirm or cross out -->
      <template v-if="category.scoring.type === 'fixed'">
        <div class="fixed-score-display">
          {{ (category.scoring as { type: 'fixed'; points: number }).points }} pts
        </div>
        <div class="actions">
          <button class="confirm-btn" :style="confirmStyle" @click="confirm((category.scoring as { type: 'fixed'; points: number }).points)">
            Confirm {{ (category.scoring as { type: 'fixed'; points: number }).points }}
          </button>
          <button class="cross-btn" @click="confirm(0)">✕ Cross out</button>
        </div>
      </template>

      <!-- sum-of-value: quick buttons + stepper -->
      <template v-else-if="category.scoring.type === 'sum-of-value'">
        <div class="quick-label">QUICK SELECT</div>
        <div class="quick-buttons">
          <button
            v-for="n in quickValues"
            :key="n"
            class="quick-btn"
            :class="{ selected: manualValue === n }"
            :style="quickBtnStyle(n)"
            @click="manualValue = n"
          >{{ n }}</button>
        </div>
        <div class="divider"><span>or enter manually</span></div>
        <div class="stepper">
          <button class="step-btn" @click="manualValue = Math.max(0, manualValue - stepSize)">−</button>
          <input
            type="number"
            v-model.number="manualValue"
            min="0"
            :max="maxValue"
            class="step-input"
          />
          <button class="step-btn" @click="manualValue = Math.min(maxValue, manualValue + stepSize)">+</button>
        </div>
        <div class="actions">
          <button class="confirm-btn" :style="confirmStyle" @click="confirm(manualValue)">
            Confirm {{ manualValue }}
          </button>
          <button class="cross-btn" @click="confirm(0)">✕ Cross out</button>
        </div>
      </template>

      <!-- sum-all: stepper only -->
      <template v-else>
        <div class="stepper" style="margin-top: 20px;">
          <button class="step-btn" @click="manualValue = Math.max(0, manualValue - 1)">−</button>
          <input
            type="number"
            v-model.number="manualValue"
            min="0"
            class="step-input"
          />
          <button class="step-btn" @click="manualValue++">+</button>
        </div>
        <div class="actions">
          <button class="confirm-btn" :style="confirmStyle" @click="confirm(manualValue)">
            Confirm {{ manualValue }}
          </button>
          <button class="cross-btn" @click="confirm(0)">✕ Cross out</button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Category } from '../rulesets/types'
import type { Player } from '../stores/game'

const props = defineProps<{
  category: Category
  player: Player
  numDice: number
}>()

const emit = defineEmits<{
  confirm: [score: number]
  close: []
}>()

const manualValue = ref(0)

const hint = computed(() => {
  if (props.category.scoring.type === 'sum-of-value') return `sum of all ${props.category.name.toLowerCase()} rolled`
  if (props.category.scoring.type === 'fixed') return `fixed score`
  return 'sum of dice used'
})

const stepSize = computed(() => {
  if (props.category.scoring.type === 'sum-of-value') {
    return (props.category.scoring as { type: 'sum-of-value'; value: number }).value
  }
  return 1
})

const maxValue = computed(() => {
  if (props.category.scoring.type === 'sum-of-value') {
    const v = (props.category.scoring as { type: 'sum-of-value'; value: number }).value
    return v * props.numDice
  }
  return 999
})

const quickValues = computed(() => {
  if (props.category.scoring.type !== 'sum-of-value') return []
  const v = (props.category.scoring as { type: 'sum-of-value'; value: number }).value
  return Array.from({ length: props.numDice }, (_, i) => (i + 1) * v)
})

const confirmStyle = computed(() => ({
  background: props.player.color + '22',
  border: `1px solid ${props.player.color}`,
  color: props.player.color,
}))

function quickBtnStyle(n: number) {
  const selected = manualValue.value === n
  return {
    background: selected ? props.player.color + '33' : props.player.color + '11',
    border: `1px solid ${props.player.color}${selected ? '88' : '33'}`,
    color: props.player.color,
  }
}

function confirm(score: number) {
  emit('confirm', score)
}
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: flex-end;
  z-index: 100;
}

.sheet {
  width: 100%;
  background: #141414;
  border-radius: 24px 24px 0 0;
  border-top: 1px solid var(--border-2);
  padding-bottom: env(safe-area-inset-bottom, 24px);
}

.handle-bar {
  width: 36px;
  height: 4px;
  background: var(--border-2);
  border-radius: 2px;
  margin: 12px auto 4px;
}

.sheet-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding: 8px 20px 12px;
  border-bottom: 1px solid var(--border-1);
}

.sheet-title { font-size: 15px; }
.player-name { font-weight: 700; }
.cat-name { color: var(--text-muted); }
.cat-hint { font-size: 12px; color: var(--neutral); }

.fixed-score-display {
  text-align: center;
  font-size: 36px;
  font-weight: 800;
  color: var(--text-primary);
  padding: 28px 0 20px;
}

.quick-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: var(--text-muted);
  padding: 18px 20px 10px;
}

.quick-buttons {
  display: flex;
  gap: 8px;
  padding: 0 20px;
  flex-wrap: wrap;
}

.quick-btn {
  flex: 1;
  border-radius: 10px;
  padding: 12px 0;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.1s;
}

.divider {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 20px;
  color: var(--text-faint);
  font-size: 11px;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border-1);
}

.stepper {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 20px 18px;
}

.step-btn {
  width: 44px;
  height: 44px;
  background: var(--surface-3);
  border: 1px solid var(--border-2);
  border-radius: 10px;
  color: var(--text-secondary);
  font-size: 20px;
  flex-shrink: 0;
}

.step-input {
  flex: 1;
  background: var(--surface-3);
  border: 1px solid var(--border-2);
  border-radius: 10px;
  color: var(--text-primary);
  padding: 10px;
  font-size: 20px;
  font-weight: 700;
  text-align: center;
}

.step-input::-webkit-inner-spin-button,
.step-input::-webkit-outer-spin-button { -webkit-appearance: none; }

.actions {
  display: flex;
  gap: 10px;
  padding: 0 20px 4px;
}

.confirm-btn {
  flex: 1;
  border-radius: 12px;
  padding: 14px;
  font-size: 15px;
  font-weight: 700;
  transition: opacity 0.1s;
}

.cross-btn {
  background: var(--surface-3);
  border: 1px solid var(--border-2);
  border-radius: 12px;
  color: var(--text-muted);
  padding: 14px 16px;
  font-size: 13px;
}
</style>
