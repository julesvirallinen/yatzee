<script setup lang="ts">
defineProps<{ value: number; size?: number }>()

const pips: Record<number, [number, number][]> = {
  1: [[50, 50]],
  2: [[30, 30], [70, 70]],
  3: [[30, 30], [50, 50], [70, 70]],
  4: [[30, 30], [70, 30], [30, 70], [70, 70]],
  5: [[30, 30], [70, 30], [50, 50], [30, 70], [70, 70]],
  6: [[30, 25], [70, 25], [30, 50], [70, 50], [30, 75], [70, 75]],
}
</script>

<template>
  <svg
    :width="size ?? 16"
    :height="size ?? 16"
    viewBox="0 0 100 100"
    style="display:inline-block; vertical-align:middle; flex-shrink:0;"
  >
    <rect x="4" y="4" width="92" height="92" rx="22" fill="#1e1e1e" stroke="#383838" stroke-width="4" />
    <circle
      v-for="([cx, cy], i) in pips[value] ?? []"
      :key="i"
      :cx="cx" :cy="cy" r="10"
      fill="#d0d0d0"
    />
  </svg>
</template>
