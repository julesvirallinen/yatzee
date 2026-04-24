<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{ modelValue: number; max?: number }>()
const emit = defineEmits<{ 'update:modelValue': [value: number] }>()

const display = ref(props.modelValue > 0 ? String(props.modelValue) : '')

watch(() => props.modelValue, val => {
  display.value = val > 0 ? String(val) : ''
})

function press(digit: string) {
  if (display.value.length >= 3) return
  const next = display.value + digit
  const num = parseInt(next)
  if (props.max !== undefined && num > props.max) return
  display.value = next
  emit('update:modelValue', num)
}

function backspace() {
  display.value = display.value.slice(0, -1)
  emit('update:modelValue', display.value ? parseInt(display.value) : 0)
}
</script>

<template>
  <div class="numpad">
    <div class="numpad-display">{{ display || '0' }}</div>
    <div class="numpad-grid">
      <button type="button" class="num-key" @click="press('1')">1</button>
      <button type="button" class="num-key" @click="press('2')">2</button>
      <button type="button" class="num-key" @click="press('3')">3</button>
      <button type="button" class="num-key" @click="press('4')">4</button>
      <button type="button" class="num-key" @click="press('5')">5</button>
      <button type="button" class="num-key" @click="press('6')">6</button>
      <button type="button" class="num-key" @click="press('7')">7</button>
      <button type="button" class="num-key" @click="press('8')">8</button>
      <button type="button" class="num-key" @click="press('9')">9</button>
      <button type="button" class="num-key ghost" disabled></button>
      <button type="button" class="num-key" @click="press('0')">0</button>
      <button type="button" class="num-key backspace" @click="backspace">⌫</button>
    </div>
  </div>
</template>

<style scoped>
.numpad {
  padding: 0 16px 8px;
}

.numpad-display {
  text-align: center;
  font-size: 36px;
  font-weight: 800;
  color: var(--text-primary);
  padding: 12px 0 16px;
  letter-spacing: -1px;
}

.numpad-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.num-key {
  background: var(--surface-3);
  border: 1px solid var(--border-2);
  border-radius: 10px;
  color: var(--text-primary);
  font-size: 22px;
  font-weight: 500;
  padding: 14px 0;
  cursor: pointer;
  transition: background 0.1s;
}

.num-key:active {
  background: var(--surface-1);
}

.num-key.ghost {
  background: transparent;
  border-color: transparent;
  cursor: default;
}

.num-key.backspace {
  color: var(--text-secondary);
  font-size: 18px;
}
</style>
