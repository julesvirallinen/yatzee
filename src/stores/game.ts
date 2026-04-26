import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Category, RuleSet } from '../rulesets/types'
import { RULESETS } from '../rulesets'

export interface Player {
  id: string
  name: string
  color: string
  scores: Record<string, number | null>
}

const PLAYER_COLORS = ['#a78bfa', '#34d399', '#fb923c', '#f87171']

function isSumOfValue(c: Category): c is Category & { scoring: { type: 'sum-of-value'; value: number } } {
  return c.scoring.type === 'sum-of-value'
}

export interface HistoryEntry {
  playerId: string
  categoryId: string
  previousScore: number | null
  previousActivePlayerIndex: number
}

export const useGameStore = defineStore('game', () => {
  const currentView = ref<'setup' | 'game' | 'results'>('setup')
  const ruleSet = ref<RuleSet>(RULESETS[0])
  const players = ref<Player[]>([])
  const activePlayerIndex = ref(0)

  const undoStack = ref<HistoryEntry[]>([])

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
    const player = players.value.find(p => p.id === playerId)
    if (!player) return 0
    return ruleSet.value.categories
      .filter(c => c.section === 'upper')
      .reduce((sum, c) => sum + (player.scores[c.id] ?? 0), 0)
  }

  function upperDelta(playerId: string): number {
    const player = players.value.find(p => p.id === playerId)
    if (!player) return 0
    const baseline = ruleSet.value.bonusThreshold / 21
    return ruleSet.value.categories
      .filter(c => c.section === 'upper')
      .filter(isSumOfValue)
      .filter(c => player.scores[c.id] !== null)
      .reduce((sum, c) => sum + (player.scores[c.id]! - baseline * c.scoring.value), 0)
  }

  function bonusEarned(playerId: string): boolean {
    return ruleSet.value.bonusThreshold > 0 && upperTotal(playerId) >= ruleSet.value.bonusThreshold
  }

  function lowerTotal(playerId: string): number {
    const player = players.value.find(p => p.id === playerId)
    if (!player) return 0
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
    if (n === 0) return
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
    undoStack.value.push({
      playerId: player.id,
      categoryId,
      previousScore: player.scores[categoryId],
      previousActivePlayerIndex: activePlayerIndex.value,
    })
    player.scores[categoryId] = score
    if (isComplete.value) {
      currentView.value = 'results'
    } else {
      advanceTurn()
    }
  }

  function editScore(playerId: string, categoryId: string, score: number) {
    const player = players.value.find(p => p.id === playerId)
    if (!player) return
    undoStack.value.push({
      playerId,
      categoryId,
      previousScore: player.scores[categoryId],
      previousActivePlayerIndex: activePlayerIndex.value,
    })
    player.scores[categoryId] = score
  }

  function undoLast() {
    const entry = undoStack.value.pop()
    if (!entry) return
    const player = players.value.find(p => p.id === entry.playerId)
    if (!player) return
    player.scores[entry.categoryId] = entry.previousScore
    activePlayerIndex.value = entry.previousActivePlayerIndex
    if (currentView.value === 'results') {
      currentView.value = 'game'
    }
  }

  const canUndo = computed(() => undoStack.value.length > 0)

  function newGame() {
    players.value = []
    activePlayerIndex.value = 0
    undoStack.value = []
    currentView.value = 'setup'
  }

  return {
    currentView, ruleSet, players, activePlayerIndex,
    isComplete, canUndo,
    setRuleSet, setPlayers, startGame, enterScore, editScore, undoLast, newGame,
    upperTotal, upperDelta, bonusEarned, lowerTotal, grandTotal,
  }
})
