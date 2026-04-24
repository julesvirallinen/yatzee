import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useGameStore } from '../src/stores/game'
import { yatzy } from '../src/rulesets/yatzy'

function setupGame(store: ReturnType<typeof useGameStore>, names = ['Alice', 'Bob']) {
  store.setRuleSet('yatzy')
  store.setPlayers(names)
  store.startGame()
}

beforeEach(() => {
  setActivePinia(createPinia())
})

describe('initial state', () => {
  it('starts on setup view', () => {
    const store = useGameStore()
    expect(store.currentView).toBe('setup')
  })
  it('defaults to yatzy ruleset', () => {
    const store = useGameStore()
    expect(store.ruleSet.id).toBe('yatzy')
  })
})

describe('setRuleSet', () => {
  it('switches to maxi-yatzy', () => {
    const store = useGameStore()
    store.setRuleSet('maxi-yatzy')
    expect(store.ruleSet.id).toBe('maxi-yatzy')
    expect(store.ruleSet.numDice).toBe(6)
  })
})

describe('setPlayers', () => {
  it('creates players with correct names and colors', () => {
    const store = useGameStore()
    store.setRuleSet('yatzy')
    store.setPlayers(['Alice', 'Bob'])
    expect(store.players).toHaveLength(2)
    expect(store.players[0].name).toBe('Alice')
    expect(store.players[1].name).toBe('Bob')
    expect(store.players[0].color).toBe('#a78bfa')
    expect(store.players[1].color).toBe('#34d399')
  })
  it('initializes all scores to null', () => {
    const store = useGameStore()
    store.setRuleSet('yatzy')
    store.setPlayers(['Alice'])
    const player = store.players[0]
    expect(Object.values(player.scores).every(v => v === null)).toBe(true)
    expect(Object.keys(player.scores)).toHaveLength(15)
  })
})

describe('startGame', () => {
  it('switches to game view', () => {
    const store = useGameStore()
    setupGame(store)
    expect(store.currentView).toBe('game')
  })
  it('sets activePlayerIndex to 0', () => {
    const store = useGameStore()
    setupGame(store)
    expect(store.activePlayerIndex).toBe(0)
  })
})

describe('upperTotal', () => {
  it('sums filled upper scores', () => {
    const store = useGameStore()
    setupGame(store)
    const alice = store.players[0]
    alice.scores['ones'] = 2
    alice.scores['twos'] = 8
    alice.scores['fours'] = 12
    expect(store.upperTotal(alice.id)).toBe(22)
  })
  it('treats null scores as 0', () => {
    const store = useGameStore()
    setupGame(store)
    const alice = store.players[0]
    alice.scores['ones'] = 3
    expect(store.upperTotal(alice.id)).toBe(3)
  })
})

describe('upperDelta', () => {
  it('is 0 when no upper categories filled', () => {
    const store = useGameStore()
    setupGame(store)
    const alice = store.players[0]
    expect(store.upperDelta(alice.id)).toBe(0)
  })
  it('scores exactly on pace return delta 0 (fours=12 means 3×4=12, delta=0)', () => {
    const store = useGameStore()
    setupGame(store)
    const alice = store.players[0]
    alice.scores['fours'] = 12
    expect(store.upperDelta(alice.id)).toBe(0)
  })
  it('2 ones gives delta -1 (2 - 3*1 = -1)', () => {
    const store = useGameStore()
    setupGame(store)
    const alice = store.players[0]
    alice.scores['ones'] = 2
    expect(store.upperDelta(alice.id)).toBe(-1)
  })
  it('4 fives gives delta +5 (20 - 3*5 = +5)', () => {
    const store = useGameStore()
    setupGame(store)
    const alice = store.players[0]
    alice.scores['fives'] = 20
    expect(store.upperDelta(alice.id)).toBe(5)
  })
  it('accumulates delta across multiple filled upper categories', () => {
    const store = useGameStore()
    setupGame(store)
    const alice = store.players[0]
    alice.scores['ones'] = 2   // -1
    alice.scores['twos'] = 8   // +2
    alice.scores['fours'] = 12 // 0
    expect(store.upperDelta(alice.id)).toBe(1)
  })
})

describe('bonusEarned', () => {
  it('returns false when under threshold', () => {
    const store = useGameStore()
    setupGame(store)
    const alice = store.players[0]
    alice.scores['ones'] = 3
    expect(store.bonusEarned(alice.id)).toBe(false)
  })
  it('returns true when at or above threshold (63)', () => {
    const store = useGameStore()
    setupGame(store)
    const alice = store.players[0]
    // fill all upper: 3+6+9+12+15+18 = 63
    alice.scores['ones'] = 3
    alice.scores['twos'] = 6
    alice.scores['threes'] = 9
    alice.scores['fours'] = 12
    alice.scores['fives'] = 15
    alice.scores['sixes'] = 18
    expect(store.bonusEarned(alice.id)).toBe(true)
  })
})

describe('grandTotal', () => {
  it('includes upper + lower, no bonus if under threshold', () => {
    const store = useGameStore()
    setupGame(store)
    const alice = store.players[0]
    alice.scores['ones'] = 2
    alice.scores['one-pair'] = 10
    expect(store.grandTotal(alice.id)).toBe(12)
  })
  it('adds bonus points when upper meets threshold', () => {
    const store = useGameStore()
    setupGame(store)
    const alice = store.players[0]
    alice.scores['ones'] = 3
    alice.scores['twos'] = 6
    alice.scores['threes'] = 9
    alice.scores['fours'] = 12
    alice.scores['fives'] = 15
    alice.scores['sixes'] = 18 // total = 63, bonus = 50
    alice.scores['one-pair'] = 10
    expect(store.grandTotal(alice.id)).toBe(63 + 50 + 10)
  })
})

describe('enterScore', () => {
  it('writes score to active player', () => {
    const store = useGameStore()
    setupGame(store)
    store.enterScore('ones', 3)
    expect(store.players[0].scores['ones']).toBe(3)
  })
  it('cross-out (score=0) is valid', () => {
    const store = useGameStore()
    setupGame(store)
    store.enterScore('ones', 0)
    expect(store.players[0].scores['ones']).toBe(0)
  })
  it('advances turn to next player', () => {
    const store = useGameStore()
    setupGame(store)
    store.enterScore('ones', 3)
    expect(store.activePlayerIndex).toBe(1)
  })
  it('wraps turn back to player 0', () => {
    const store = useGameStore()
    setupGame(store)
    store.enterScore('ones', 3)   // Alice fills, Bob's turn
    store.enterScore('ones', 3)   // Bob fills, Alice's turn
    expect(store.activePlayerIndex).toBe(0)
  })
  it('skips players with no open slots', () => {
    const store = useGameStore()
    store.setRuleSet('yatzy')
    store.setPlayers(['Alice', 'Bob'])
    store.startGame()
    // Fill all of Alice's categories except 'ones'
    yatzy.categories.filter(c => c.id !== 'ones').forEach(c => {
      store.players[0].scores[c.id] = 5
    })
    // Alice fills her last slot — isComplete is false (Bob has open)
    // Bob is next
    store.enterScore('ones', 3)
    expect(store.activePlayerIndex).toBe(1)
  })
})

describe('isComplete', () => {
  it('is false when any score is null', () => {
    const store = useGameStore()
    setupGame(store)
    expect(store.isComplete).toBe(false)
  })
  it('is true when all players have all categories filled', () => {
    const store = useGameStore()
    setupGame(store)
    store.players.forEach(player => {
      yatzy.categories.forEach(c => {
        player.scores[c.id] = 5
      })
    })
    expect(store.isComplete).toBe(true)
  })
})

describe('isComplete triggers results', () => {
  it('switches to results view when last score entered', () => {
    const store = useGameStore()
    setupGame(store)
    // Fill everything except Alice's 'ones'
    store.players.forEach(player => {
      yatzy.categories.forEach(c => {
        if (!(player.id === store.players[0].id && c.id === 'ones')) {
          player.scores[c.id] = 5
        }
      })
    })
    store.enterScore('ones', 3)
    expect(store.currentView).toBe('results')
  })
})

describe('newGame', () => {
  it('resets to setup view and clears players', () => {
    const store = useGameStore()
    setupGame(store)
    store.newGame()
    expect(store.currentView).toBe('setup')
    expect(store.players).toHaveLength(0)
    expect(store.activePlayerIndex).toBe(0)
  })
})
