import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { RuleSet } from '../rulesets/types'
import { RULESETS } from '../rulesets'

export interface Player {
  id: string
  name: string
  color: string
  scores: Record<string, number | null>
}

const PLAYER_COLORS = ['#a78bfa', '#34d399', '#fb923c', '#f87171']

export const useGameStore = defineStore('game', () => {
  const currentView = ref<'setup' | 'game' | 'results'>('setup')
  const ruleSet = ref<RuleSet>(RULESETS[0])
  const players = ref<Player[]>([])
  const activePlayerIndex = ref(0)

  function setRuleSet(id: string) {
    const found = RULESETS.find(r => r.id === id)
    if (found) ruleSet.value = found
  }

  function setPlayers(names: string[]) {
    players.value = names.map((name, i) => ({
      id: crypto.randomUUID(),
      name,
      color: PLAYER_COLORS[i % PLAYER_COLORS.length],
      scores: Object.fromEntries(ruleSet.value.categories.map(c => [c.id, null])),
    }))
  }

  function startGame() {
    activePlayerIndex.value = 0
    currentView.value = 'game'
  }

  function upperTotal(playerId: string): number {
    const player = players.value.find(p => p.id === playerId)!
    return ruleSet.value.categories
      .filter(c => c.section === 'upper')
      .reduce((sum, c) => sum + (player.scores[c.id] ?? 0), 0)
  }

  function upperDelta(playerId: string): number {
    const player = players.value.find(p => p.id === playerId)!
    return ruleSet.value.categories
      .filter(c => c.section === 'upper' && c.scoring.type === 'sum-of-value')
      .filter(c => player.scores[c.id] !== null)
      .reduce((sum, c) => {
        const pace = 3 * (c.scoring as { type: 'sum-of-value'; value: number }).value
        return sum + (player.scores[c.id]! - pace)
      }, 0)
  }

  function bonusEarned(playerId: string): boolean {
    return upperTotal(playerId) >= ruleSet.value.bonusThreshold
  }

  function lowerTotal(playerId: string): number {
    const player = players.value.find(p => p.id === playerId)!
    return ruleSet.value.categories
      .filter(c => c.section === 'lower')
      .reduce((sum, c) => sum + (player.scores[c.id] ?? 0), 0)
  }

  function grandTotal(playerId: string): number {
    return upperTotal(playerId)
      + (bonusEarned(playerId) ? ruleSet.value.bonusPoints : 0)
      + lowerTotal(playerId)
  }

  const isComplete = computed(() => {
    if (players.value.length === 0) return false
    return players.value.every(player =>
      ruleSet.value.categories.every(c => player.scores[c.id] !== null)
    )
  })

  function advanceTurn() {
    const n = players.value.length
    let next = (activePlayerIndex.value + 1) % n
    let attempts = 0
    while (attempts < n) {
      const hasOpen = ruleSet.value.categories.some(c => players.value[next].scores[c.id] === null)
      if (hasOpen) break
      next = (next + 1) % n
      attempts++
    }
    activePlayerIndex.value = next
  }

  function enterScore(categoryId: string, score: number) {
    const player = players.value[activePlayerIndex.value]
    player.scores[categoryId] = score
    if (isComplete.value) {
      currentView.value = 'results'
    } else {
      advanceTurn()
    }
  }

  function newGame() {
    players.value = []
    activePlayerIndex.value = 0
    currentView.value = 'setup'
  }

  return {
    currentView, ruleSet, players, activePlayerIndex,
    isComplete,
    setRuleSet, setPlayers, startGame, enterScore, newGame,
    upperTotal, upperDelta, bonusEarned, lowerTotal, grandTotal,
  }
})
