<script setup lang="ts">
import DiceFace from './DiceFace.vue'

const props = defineProps<{ categoryId: string }>()

// Each entry is an array of groups; each group is an array of die face values.
// Multiple groups are shown with a larger gap between them (e.g. Full House: [[3,3],[4,4,4]])
const SPECS: Record<string, number[][]> = {
  'ones':             [[1]],
  'twos':             [[2]],
  'threes':           [[3]],
  'fours':            [[4]],
  'fives':            [[5]],
  'sixes':            [[6]],
  'one-pair':         [[5, 5]],
  'two-pairs':        [[3, 3], [5, 5]],
  'three-pairs':      [[2, 2], [4, 4], [6, 6]],
  'three-of-a-kind':  [[4, 4, 4]],
  'four-of-a-kind':   [[5, 5, 5, 5]],
  'five-of-a-kind':   [[4, 4, 4, 4, 4]],
  'small-straight':   [[1, 2, 3, 4, 5]],
  'large-straight':   [[2, 3, 4, 5, 6]],
  'full-straight':    [[1, 2, 3, 4, 5, 6]],
  'full-house':       [[3, 3], [4, 4, 4]],
  'villa':            [[3, 3, 3], [4, 4, 4]],
  'tower':            [[5, 5, 5, 5], [3, 3]],
  'yatzy':            [[5, 5, 5, 5, 5]],
  'maxi-yatzy':       [[6, 6, 6, 6, 6, 6]],
}

const TEXT_LABELS: Record<string, string> = {
  'chance': 'Chance',
}

const spec = SPECS[props.categoryId] ?? null
const text = TEXT_LABELS[props.categoryId] ?? null
</script>

<template>
  <span v-if="spec" class="dice-label">
    <template v-for="(group, gi) in spec" :key="gi">
      <span v-if="gi > 0" class="group-sep" />
      <span class="dice-group">
        <DiceFace
          v-for="(val, di) in group"
          :key="di"
          :value="val"
          :size="13"
          :style="di > 0 ? { marginLeft: '2px' } : {}"
        />
      </span>
    </template>
  </span>
  <span v-else-if="text" class="text-label">{{ text }}</span>
  <span v-else class="text-label">{{ categoryId }}</span>
</template>

<style scoped>
.dice-label {
  display: flex;
  align-items: center;
  gap: 0;
  flex-wrap: nowrap;
}

.dice-group {
  display: flex;
  align-items: center;
}

.group-sep {
  display: inline-block;
  width: 1px;
  height: 10px;
  background: #333;
  margin: 0 5px;
  flex-shrink: 0;
}

.text-label {
  font-size: 13px;
  color: var(--text-secondary);
}
</style>
