<script setup lang="ts">
import type { Category } from '../rulesets/types'
import type { Player } from '../stores/game'
defineProps<{ category: Category; player: Player }>()
defineEmits<{ confirm: [score: number]; close: [] }>()
</script>
<template><div></div></template>
