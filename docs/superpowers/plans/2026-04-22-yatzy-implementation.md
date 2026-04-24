# Yatzy Scorekeeper Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a mobile-first dark-theme Yatzy scorekeeper webapp with Vue 3 + Pinia, supporting 5-dice Yatzy and 6-dice Maxi Yatzy rule sets.

**Architecture:** Single-page Vue 3 app with no router — a Pinia store holds `currentView` and switches between SetupView, GameView, and ResultsView. All game state lives in one store. Rule sets are plain config objects.

**Tech Stack:** Vue 3 (Composition API), Vite, Pinia, TypeScript, Vitest, @vue/test-utils, jsdom

---

## File Map

```
yatzee/
├── index.html
├── vite.config.ts
├── tsconfig.json
├── package.json
├── src/
│   ├── main.ts
│   ├── App.vue                  # View switcher only
│   ├── style.css                # Design tokens + global reset
│   ├── rulesets/
│   │   ├── types.ts             # Category + RuleSet interfaces
│   │   ├── yatzy.ts             # 5-dice config
│   │   ├── maxi-yatzy.ts        # 6-dice config
│   │   └── index.ts             # Re-exports + RULESETS array
│   ├── stores/
│   │   └── game.ts              # Pinia store: all state + actions
│   ├── views/
│   │   ├── SetupView.vue        # Rule set selector + player names
│   │   ├── GameView.vue         # Full-height flex scorecard
│   │   └── ResultsView.vue      # Final scores + winner
│   └── components/
│       └── ScoreModal.vue       # Bottom sheet score entry
└── tests/
    ├── rulesets.test.ts
    └── game.store.test.ts
```

---

## Task 1: Scaffold Project

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `index.html`
- Create: `src/main.ts`
- Create: `src/App.vue`
- Create: `src/style.css`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "yatzee",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "pinia": "^2.1.7",
    "vue": "^3.4.21"
  },
  "devDependencies": {
    "@pinia/testing": "^0.1.3",
    "@vitejs/plugin-vue": "^5.0.4",
    "@vue/test-utils": "^2.4.5",
    "jsdom": "^24.0.0",
    "typescript": "^5.4.0",
    "vite": "^5.2.0",
    "vitest": "^1.4.0"
  }
}
```

- [ ] **Step 2: Install dependencies**

```bash
cd /Users/jules/projects/yatzee && npm install
```

Expected: `node_modules/` created, no errors.

- [ ] **Step 3: Create vite.config.ts**

```ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true,
  },
})
```

- [ ] **Step 4: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "jsx": "preserve",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "types": ["vitest/globals"],
    "skipLibCheck": true
  },
  "include": ["src/**/*", "tests/**/*"]
}
```

- [ ] **Step 5: Create index.html**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <title>Yatzy</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

- [ ] **Step 6: Create src/style.css**

```css
:root {
  --bg: #0a0a0a;
  --surface-1: #111111;
  --surface-2: #141414;
  --surface-3: #1a1a1a;
  --border-1: #1e1e1e;
  --border-2: #2a2a2a;
  --text-primary: #e0e0e0;
  --text-secondary: #777777;
  --text-muted: #444444;
  --text-faint: #2a2a2a;
  --positive: #34d399;
  --negative: #f87171;
  --neutral: #555555;
  --player-0: #a78bfa;
  --player-1: #34d399;
  --player-2: #fb923c;
  --player-3: #f87171;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html, body {
  height: 100%;
  background: var(--bg);
  color: var(--text-primary);
  font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
  -webkit-font-smoothing: antialiased;
  overflow: hidden;
}

#app { height: 100%; display: flex; flex-direction: column; }

button { font-family: inherit; cursor: pointer; border: none; background: none; }
input { font-family: inherit; }
```

- [ ] **Step 7: Create src/main.ts**

```ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './style.css'

createApp(App).use(createPinia()).mount('#app')
```

- [ ] **Step 8: Create src/App.vue (stub)**

```vue
<template>
  <div>Yatzy scaffold ok</div>
</template>
```

- [ ] **Step 9: Verify dev server starts**

```bash
cd /Users/jules/projects/yatzee && npm run dev
```

Expected: server starts at `http://localhost:5173`, browser shows "Yatzy scaffold ok". Stop the server with Ctrl+C.

- [ ] **Step 10: Commit**

```bash
cd /Users/jules/projects/yatzee && git init && git add -A && git commit -m "chore: scaffold Vue 3 + Vite + Pinia project"
```

---

## Task 2: Ruleset Types and Configs

**Files:**
- Create: `src/rulesets/types.ts`
- Create: `src/rulesets/yatzy.ts`
- Create: `src/rulesets/maxi-yatzy.ts`
- Create: `src/rulesets/index.ts`
- Create: `tests/rulesets.test.ts`

- [ ] **Step 1: Create src/rulesets/types.ts**

```ts
export interface Category {
  id: string
  name: string
  section: 'upper' | 'lower'
  scoring:
    | { type: 'sum-of-value'; value: number }
    | { type: 'fixed'; points: number }
    | { type: 'sum-all' }
}

export interface RuleSet {
  id: string
  name: string
  numDice: number
  categories: Category[]
  bonusThreshold: number
  bonusPoints: number
}
```

- [ ] **Step 2: Create src/rulesets/yatzy.ts**

```ts
import type { RuleSet } from './types'

export const yatzy: RuleSet = {
  id: 'yatzy',
  name: 'Yatzy — 5 dice',
  numDice: 5,
  bonusThreshold: 63,
  bonusPoints: 50,
  categories: [
    { id: 'ones',   name: 'Ones',   section: 'upper', scoring: { type: 'sum-of-value', value: 1 } },
    { id: 'twos',   name: 'Twos',   section: 'upper', scoring: { type: 'sum-of-value', value: 2 } },
    { id: 'threes', name: 'Threes', section: 'upper', scoring: { type: 'sum-of-value', value: 3 } },
    { id: 'fours',  name: 'Fours',  section: 'upper', scoring: { type: 'sum-of-value', value: 4 } },
    { id: 'fives',  name: 'Fives',  section: 'upper', scoring: { type: 'sum-of-value', value: 5 } },
    { id: 'sixes',  name: 'Sixes',  section: 'upper', scoring: { type: 'sum-of-value', value: 6 } },
    { id: 'one-pair',          name: 'One Pair',          section: 'lower', scoring: { type: 'sum-all' } },
    { id: 'two-pairs',         name: 'Two Pairs',         section: 'lower', scoring: { type: 'sum-all' } },
    { id: 'three-of-a-kind',   name: 'Three of a Kind',   section: 'lower', scoring: { type: 'sum-all' } },
    { id: 'four-of-a-kind',    name: 'Four of a Kind',    section: 'lower', scoring: { type: 'sum-all' } },
    { id: 'small-straight',    name: 'Small Straight',    section: 'lower', scoring: { type: 'fixed', points: 15 } },
    { id: 'large-straight',    name: 'Large Straight',    section: 'lower', scoring: { type: 'fixed', points: 20 } },
    { id: 'full-house',        name: 'Full House',        section: 'lower', scoring: { type: 'sum-all' } },
    { id: 'chance',            name: 'Chance',            section: 'lower', scoring: { type: 'sum-all' } },
    { id: 'yatzy',             name: 'Yatzy',             section: 'lower', scoring: { type: 'fixed', points: 50 } },
  ],
}
```

- [ ] **Step 3: Create src/rulesets/maxi-yatzy.ts**

```ts
import type { RuleSet } from './types'

export const maxiYatzy: RuleSet = {
  id: 'maxi-yatzy',
  name: 'Maxi Yatzy — 6 dice',
  numDice: 6,
  bonusThreshold: 84,
  bonusPoints: 100,
  categories: [
    { id: 'ones',   name: 'Ones',   section: 'upper', scoring: { type: 'sum-of-value', value: 1 } },
    { id: 'twos',   name: 'Twos',   section: 'upper', scoring: { type: 'sum-of-value', value: 2 } },
    { id: 'threes', name: 'Threes', section: 'upper', scoring: { type: 'sum-of-value', value: 3 } },
    { id: 'fours',  name: 'Fours',  section: 'upper', scoring: { type: 'sum-of-value', value: 4 } },
    { id: 'fives',  name: 'Fives',  section: 'upper', scoring: { type: 'sum-of-value', value: 5 } },
    { id: 'sixes',  name: 'Sixes',  section: 'upper', scoring: { type: 'sum-of-value', value: 6 } },
    { id: 'one-pair',        name: 'One Pair',        section: 'lower', scoring: { type: 'sum-all' } },
    { id: 'two-pairs',       name: 'Two Pairs',       section: 'lower', scoring: { type: 'sum-all' } },
    { id: 'three-pairs',     name: 'Three Pairs',     section: 'lower', scoring: { type: 'sum-all' } },
    { id: 'three-of-a-kind', name: 'Three of a Kind', section: 'lower', scoring: { type: 'sum-all' } },
    { id: 'four-of-a-kind',  name: 'Four of a Kind',  section: 'lower', scoring: { type: 'sum-all' } },
    { id: 'five-of-a-kind',  name: 'Five of a Kind',  section: 'lower', scoring: { type: 'sum-all' } },
    { id: 'small-straight',  name: 'Small Straight',  section: 'lower', scoring: { type: 'fixed', points: 15 } },
    { id: 'large-straight',  name: 'Large Straight',  section: 'lower', scoring: { type: 'fixed', points: 20 } },
    { id: 'full-straight',   name: 'Full Straight',   section: 'lower', scoring: { type: 'fixed', points: 21 } },
    { id: 'full-house',      name: 'Full House',      section: 'lower', scoring: { type: 'sum-all' } },
    { id: 'villa',           name: 'Villa',           section: 'lower', scoring: { type: 'sum-all' } },
    { id: 'tower',           name: 'Tower',           section: 'lower', scoring: { type: 'sum-all' } },
    { id: 'chance',          name: 'Chance',          section: 'lower', scoring: { type: 'sum-all' } },
    { id: 'maxi-yatzy',      name: 'Maxi Yatzy',      section: 'lower', scoring: { type: 'fixed', points: 100 } },
  ],
}
```

- [ ] **Step 4: Create src/rulesets/index.ts**

```ts
export type { Category, RuleSet } from './types'
export { yatzy } from './yatzy'
export { maxiYatzy } from './maxi-yatzy'
import { yatzy } from './yatzy'
import { maxiYatzy } from './maxi-yatzy'
export const RULESETS = [yatzy, maxiYatzy]
```

- [ ] **Step 5: Write failing tests**

Create `tests/rulesets.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { yatzy } from '../src/rulesets/yatzy'
import { maxiYatzy } from '../src/rulesets/maxi-yatzy'
import { RULESETS } from '../src/rulesets'

describe('yatzy ruleset', () => {
  it('has 15 categories', () => {
    expect(yatzy.categories).toHaveLength(15)
  })
  it('has 6 upper categories', () => {
    expect(yatzy.categories.filter(c => c.section === 'upper')).toHaveLength(6)
  })
  it('upper categories have unique face values 1–6', () => {
    const values = yatzy.categories
      .filter(c => c.scoring.type === 'sum-of-value')
      .map(c => (c.scoring as { type: 'sum-of-value'; value: number }).value)
    expect(values.sort()).toEqual([1, 2, 3, 4, 5, 6])
  })
  it('bonus threshold is 63, bonus points is 50', () => {
    expect(yatzy.bonusThreshold).toBe(63)
    expect(yatzy.bonusPoints).toBe(50)
  })
  it('yatzy category scores 50 fixed', () => {
    const cat = yatzy.categories.find(c => c.id === 'yatzy')!
    expect(cat.scoring).toEqual({ type: 'fixed', points: 50 })
  })
  it('small-straight scores 15 fixed', () => {
    const cat = yatzy.categories.find(c => c.id === 'small-straight')!
    expect(cat.scoring).toEqual({ type: 'fixed', points: 15 })
  })
  it('has 5 dice', () => {
    expect(yatzy.numDice).toBe(5)
  })
})

describe('maxi-yatzy ruleset', () => {
  it('has 20 categories', () => {
    expect(maxiYatzy.categories).toHaveLength(20)
  })
  it('has 6 upper categories', () => {
    expect(maxiYatzy.categories.filter(c => c.section === 'upper')).toHaveLength(6)
  })
  it('bonus threshold is 84, bonus points is 100', () => {
    expect(maxiYatzy.bonusThreshold).toBe(84)
    expect(maxiYatzy.bonusPoints).toBe(100)
  })
  it('maxi-yatzy category scores 100 fixed', () => {
    const cat = maxiYatzy.categories.find(c => c.id === 'maxi-yatzy')!
    expect(cat.scoring).toEqual({ type: 'fixed', points: 100 })
  })
  it('full-straight scores 21 fixed', () => {
    const cat = maxiYatzy.categories.find(c => c.id === 'full-straight')!
    expect(cat.scoring).toEqual({ type: 'fixed', points: 21 })
  })
  it('has 6 dice', () => {
    expect(maxiYatzy.numDice).toBe(6)
  })
  it('has villa and tower categories', () => {
    expect(maxiYatzy.categories.find(c => c.id === 'villa')).toBeDefined()
    expect(maxiYatzy.categories.find(c => c.id === 'tower')).toBeDefined()
  })
})

describe('RULESETS', () => {
  it('contains both rule sets', () => {
    expect(RULESETS).toHaveLength(2)
    expect(RULESETS.map(r => r.id)).toEqual(['yatzy', 'maxi-yatzy'])
  })
})
```

- [ ] **Step 6: Run tests — verify they pass**

```bash
cd /Users/jules/projects/yatzee && npm test
```

Expected: all 13 tests pass.

- [ ] **Step 7: Commit**

```bash
cd /Users/jules/projects/yatzee && git add -A && git commit -m "feat: add ruleset types and configs (yatzy + maxi-yatzy)"
```

---

## Task 3: Pinia Game Store

**Files:**
- Create: `src/stores/game.ts`
- Create: `tests/game.store.test.ts`

- [ ] **Step 1: Write failing store tests**

Create `tests/game.store.test.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useGameStore } from '../src/stores/game'
import { yatzy } from '../src/rulesets/yatzy'
import { maxiYatzy } from '../src/rulesets/maxi-yatzy'

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
```

- [ ] **Step 2: Run tests — confirm they fail**

```bash
cd /Users/jules/projects/yatzee && npm test
```

Expected: errors about `useGameStore` not found.

- [ ] **Step 3: Create src/stores/game.ts**

```ts
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
```

- [ ] **Step 4: Run tests — verify all pass**

```bash
cd /Users/jules/projects/yatzee && npm test
```

Expected: all tests pass (rulesets + store).

- [ ] **Step 5: Commit**

```bash
cd /Users/jules/projects/yatzee && git add -A && git commit -m "feat: add Pinia game store with scoring logic"
```

---

## Task 4: App.vue — View Switcher

**Files:**
- Modify: `src/App.vue`

- [ ] **Step 1: Replace App.vue stub with view switcher**

```vue
<template>
  <component :is="currentComponent" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from './stores/game'
import SetupView from './views/SetupView.vue'
import GameView from './views/GameView.vue'
import ResultsView from './views/ResultsView.vue'

const store = useGameStore()

const currentComponent = computed(() => ({
  setup: SetupView,
  game: GameView,
  results: ResultsView,
}[store.currentView]))
</script>
```

- [ ] **Step 2: Create stub views so App.vue compiles**

Create `src/views/SetupView.vue`:
```vue
<template><div style="color:white;padding:20px">Setup</div></template>
```

Create `src/views/GameView.vue`:
```vue
<template><div style="color:white;padding:20px">Game</div></template>
```

Create `src/views/ResultsView.vue`:
```vue
<template><div style="color:white;padding:20px">Results</div></template>
```

Create `src/components/ScoreModal.vue` (stub for now):
```vue
<template><div></div></template>
<script setup lang="ts">
import type { Category } from '../rulesets/types'
import type { Player } from '../stores/game'
defineProps<{ category: Category; player: Player }>()
defineEmits<{ confirm: [score: number]; close: [] }>()
</script>
```

- [ ] **Step 3: Verify dev server still starts**

```bash
cd /Users/jules/projects/yatzee && npm run dev
```

Expected: browser shows "Setup" text. Stop server.

- [ ] **Step 4: Commit**

```bash
cd /Users/jules/projects/yatzee && git add -A && git commit -m "feat: add view switcher and stub views"
```

---

## Task 5: SetupView

**Files:**
- Modify: `src/views/SetupView.vue`

- [ ] **Step 1: Implement SetupView**

```vue
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

const store = useGameStore()
const selectedRuleSetId = ref('yatzy')
const playerNames = ref(['', ''])

const canStart = computed(() =>
  playerNames.value.filter(n => n.trim().length > 0).length >= 2
)

function startGame() {
  const validNames = playerNames.value.filter(n => n.trim().length > 0)
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
```

- [ ] **Step 2: Test manually in browser**

```bash
cd /Users/jules/projects/yatzee && npm run dev
```

Verify:
- Rule set cards render and radio state toggles correctly
- Player name inputs work, color dots show, add/remove work
- Start button is disabled until 2 valid names entered
- Clicking Start switches to "Game" stub

Stop server.

- [ ] **Step 3: Commit**

```bash
cd /Users/jules/projects/yatzee && git add -A && git commit -m "feat: implement SetupView"
```

---

## Task 6: ScoreModal

**Files:**
- Modify: `src/components/ScoreModal.vue`

The modal is a fixed bottom sheet overlaying the GameView. Rendered by GameView when `activeCategory` is set; emits `confirm(score)` or `close()`.

- [ ] **Step 1: Implement ScoreModal**

```vue
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
          <button class="confirm-btn" :style="confirmStyle" @click="confirm((category.scoring as any).points)">
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
```

- [ ] **Step 2: Commit**

```bash
cd /Users/jules/projects/yatzee && git add -A && git commit -m "feat: implement ScoreModal bottom sheet"
```

---

## Task 7: GameView — Full Scorecard

**Files:**
- Modify: `src/views/GameView.vue`

This is the main view. Uses CSS flexbox to fill 100% height — rows share available space with `flex: 1`, no fixed padding.

- [ ] **Step 1: Implement GameView**

```vue
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
            <span :style="deltaStyle(player, cat)">{{ formatDelta(player, cat) }}</span>
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
            <span :style="{ color: player.color, fontWeight: 600 }">{{ player.scores[cat.id] }}</span>
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

const activePlayer = computed(() => store.players[store.activePlayerIndex])

const upperCats = computed(() => store.ruleSet.categories.filter(c => c.section === 'upper'))
const lowerCats = computed(() => store.ruleSet.categories.filter(c => c.section === 'lower'))

const totalCategories = computed(() => store.ruleSet.categories.length)

const filledCount = computed(() =>
  store.ruleSet.categories.filter(c =>
    store.players.some(p => p.scores[c.id] !== null)
  ).length
)

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

/* Upper rows share 6 flex units, lower rows share lower-cat-count units */
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

/* Upper rows: highlight open slots for active player */
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
</style>
```

- [ ] **Step 2: Test manually in browser**

```bash
cd /Users/jules/projects/yatzee && npm run dev
```

Set up a 2-player game and verify:
- All categories render, no scroll
- Active player column is full brightness, other is at 40% opacity
- Turn pill shows active player name with colored glow dot
- Tapping an active player's open slot opens the ScoreModal
- ScoreModal shows correct quick buttons for upper categories, fixed score for fixed categories, stepper for sum-all
- Confirming a score fills the slot and advances turn
- Upper section shows delta (±N) in correct color after filling
- Bonus row updates cumulative delta and progress
- Cross-out enters 0

Stop server.

- [ ] **Step 3: Commit**

```bash
cd /Users/jules/projects/yatzee && git add -A && git commit -m "feat: implement GameView with flex scorecard"
```

---

## Task 8: ResultsView

**Files:**
- Modify: `src/views/ResultsView.vue`

- [ ] **Step 1: Implement ResultsView**

```vue
<template>
  <div class="results">
    <div class="content">
      <div class="header">
        <h1>Game over</h1>
        <p class="subtitle">Final scores</p>
      </div>

      <div class="scores">
        <div
          v-for="(player, i) in ranked"
          :key="player.id"
          class="score-card"
          :class="{ winner: i === 0 }"
          :style="i === 0 ? { borderColor: player.color, background: player.color + '0f' } : {}"
        >
          <div class="rank" :style="i === 0 ? { color: player.color } : {}">
            {{ i === 0 ? '🏆' : `#${i + 1}` }}
          </div>
          <div class="player-info">
            <div class="player-name" :style="{ color: player.color }">{{ player.name }}</div>
            <div class="score-breakdown">
              <span>Upper {{ store.upperTotal(player.id) }}</span>
              <span v-if="store.bonusEarned(player.id)" class="bonus-badge" :style="{ color: player.color }">+{{ store.ruleSet.bonusPoints }}</span>
              <span>Lower {{ store.lowerTotal(player.id) }}</span>
            </div>
          </div>
          <div class="total" :style="{ color: player.color }">
            {{ store.grandTotal(player.id) }}
          </div>
        </div>
      </div>

      <button class="new-game-btn" @click="store.newGame()">
        New Game
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '../stores/game'

const store = useGameStore()

const ranked = computed(() =>
  [...store.players].sort((a, b) => store.grandTotal(b.id) - store.grandTotal(a.id))
)
</script>

<style scoped>
.results {
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
}

.subtitle {
  color: var(--text-muted);
  font-size: 14px;
  margin-top: 4px;
}

.scores {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.score-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: var(--surface-3);
  border: 1px solid var(--border-2);
  border-radius: 16px;
  padding: 18px 20px;
}

.score-card.winner {
  border-width: 1px;
}

.rank {
  font-size: 20px;
  font-weight: 800;
  color: var(--text-muted);
  width: 32px;
  text-align: center;
}

.player-info {
  flex: 1;
}

.player-name {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 4px;
}

.score-breakdown {
  display: flex;
  gap: 10px;
  font-size: 12px;
  color: var(--text-muted);
}

.bonus-badge {
  font-weight: 700;
}

.total {
  font-size: 28px;
  font-weight: 800;
}

.new-game-btn {
  width: 100%;
  background: var(--surface-3);
  border: 1px solid var(--border-2);
  border-radius: 14px;
  color: var(--text-primary);
  padding: 18px;
  font-size: 16px;
  font-weight: 700;
  margin-top: auto;
}
</style>
```

- [ ] **Step 2: Test end-to-end in browser**

```bash
cd /Users/jules/projects/yatzee && npm run dev
```

Play a full game (fill all slots for all players) and verify:
- Game automatically switches to ResultsView when the last slot is filled
- Players are ranked by grand total, winner shows 🏆
- Upper/bonus/lower breakdown is correct
- "New Game" returns to SetupView with a clean state

Stop server.

- [ ] **Step 3: Run all tests to ensure nothing is broken**

```bash
cd /Users/jules/projects/yatzee && npm test
```

Expected: all tests pass.

- [ ] **Step 4: Commit**

```bash
cd /Users/jules/projects/yatzee && git add -A && git commit -m "feat: implement ResultsView with ranked scores"
```

---

## Task 9: Undo and Long-Press Edit

**Files:**
- Modify: `src/stores/game.ts`
- Modify: `src/views/GameView.vue`
- Modify: `tests/game.store.test.ts`

Players can long-press any filled score cell (theirs or anyone's) to re-enter the score. A single undo button in the header reverts the last `enterScore` call.

- [ ] **Step 1: Add undo history to the store**

In `src/stores/game.ts`, add an `undoStack` ref and update `enterScore` and `undoLast`:

```ts
interface HistoryEntry {
  playerId: string
  categoryId: string
  previousScore: number | null
  previousActivePlayerIndex: number
}

// Add inside the defineStore callback, after the existing refs:
const undoStack = ref<HistoryEntry[]>([])

// Replace enterScore with:
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

// Add editScore for long-press re-entry (does NOT advance turn or push undo):
function editScore(playerId: string, categoryId: string, score: number) {
  const player = players.value.find(p => p.id === playerId)!
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
  const player = players.value.find(p => p.id === entry.playerId)!
  player.scores[entry.categoryId] = entry.previousScore
  activePlayerIndex.value = entry.previousActivePlayerIndex
  if (currentView.value === 'results') {
    currentView.value = 'game'
  }
}

const canUndo = computed(() => undoStack.value.length > 0)
```

Also add `undoStack`, `canUndo`, `undoLast`, `editScore` to the return object.

Also clear `undoStack` in `newGame()`:
```ts
function newGame() {
  players.value = []
  activePlayerIndex.value = 0
  undoStack.value = []
  currentView.value = 'setup'
}
```

- [ ] **Step 2: Write failing store tests for undo and edit**

Append to `tests/game.store.test.ts`:

```ts
describe('undoLast', () => {
  it('reverts a score to null', () => {
    const store = useGameStore()
    setupGame(store)
    store.enterScore('ones', 3)
    store.undoLast()
    expect(store.players[0].scores['ones']).toBeNull()
  })
  it('restores activePlayerIndex', () => {
    const store = useGameStore()
    setupGame(store)
    store.enterScore('ones', 3) // Alice scores, Bob's turn
    store.undoLast()
    expect(store.activePlayerIndex).toBe(0)
  })
  it('canUndo is false initially', () => {
    const store = useGameStore()
    setupGame(store)
    expect(store.canUndo).toBe(false)
  })
  it('canUndo is true after enterScore', () => {
    const store = useGameStore()
    setupGame(store)
    store.enterScore('ones', 3)
    expect(store.canUndo).toBe(true)
  })
  it('canUndo is false after undoLast empties stack', () => {
    const store = useGameStore()
    setupGame(store)
    store.enterScore('ones', 3)
    store.undoLast()
    expect(store.canUndo).toBe(false)
  })
  it('undoes from results view back to game view', () => {
    const store = useGameStore()
    setupGame(store)
    store.players.forEach(player => {
      yatzy.categories.forEach(c => {
        if (!(player.id === store.players[0].id && c.id === 'ones')) {
          player.scores[c.id] = 5
        }
      })
    })
    store.enterScore('ones', 3) // game ends → results
    expect(store.currentView).toBe('results')
    store.undoLast()
    expect(store.currentView).toBe('game')
    expect(store.players[0].scores['ones']).toBeNull()
  })
})

describe('editScore', () => {
  it('updates a filled score without advancing turn', () => {
    const store = useGameStore()
    setupGame(store)
    store.enterScore('ones', 3) // Alice scores 3, Bob's turn
    store.editScore(store.players[0].id, 'ones', 5)
    expect(store.players[0].scores['ones']).toBe(5)
    expect(store.activePlayerIndex).toBe(1) // still Bob's turn
  })
  it('is undoable', () => {
    const store = useGameStore()
    setupGame(store)
    store.enterScore('ones', 3)
    store.editScore(store.players[0].id, 'ones', 5)
    store.undoLast() // undo edit → back to 3
    expect(store.players[0].scores['ones']).toBe(3)
  })
})
```

- [ ] **Step 3: Run tests — confirm they fail**

```bash
cd /Users/jules/projects/yatzee && npm test
```

Expected: failures for `undoLast`, `canUndo`, `editScore`.

- [ ] **Step 4: Update src/stores/game.ts with undo support**

Apply all the changes described in Step 1. The full updated `defineStore` callback return object must include:

```ts
return {
  currentView, ruleSet, players, activePlayerIndex,
  isComplete, canUndo,
  setRuleSet, setPlayers, startGame, enterScore, editScore, undoLast, newGame,
  upperTotal, upperDelta, bonusEarned, lowerTotal, grandTotal,
}
```

- [ ] **Step 5: Run tests — verify all pass**

```bash
cd /Users/jules/projects/yatzee && npm test
```

Expected: all tests pass.

- [ ] **Step 6: Add undo button to GameView header**

In `src/views/GameView.vue`, update the `app-header` template to add an undo button:

```vue
<!-- Replace the existing header -->
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
```

Add to `<style scoped>` in GameView:

```css
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
```

- [ ] **Step 7: Add long-press to filled score cells in GameView**

Add a `useLongPress` composable inline in `GameView.vue` (in the `<script setup>` block):

```ts
function useLongPress(onLongPress: () => void, duration = 500) {
  let timer: ReturnType<typeof setTimeout> | null = null
  return {
    onPointerdown() { timer = setTimeout(onLongPress, duration) },
    onPointerup() { if (timer) { clearTimeout(timer); timer = null } },
    onPointercancel() { if (timer) { clearTimeout(timer); timer = null } },
  }
}
```

Add state for editing an existing score:

```ts
const editTarget = ref<{ player: Player; category: Category } | null>(null)
```

Update the template — replace both upper and lower "filled" cell templates to support long-press:

```vue
<!-- Upper filled cell (replace the existing <template v-if="player.scores[cat.id] !== null"> block) -->
<template v-if="player.scores[cat.id] !== null">
  <span
    :style="deltaStyle(player, cat)"
    v-bind="useLongPress(() => { editTarget = { player, category: cat } })"
    style="touch-action: none;"
  >{{ formatDelta(player, cat) }}</span>
</template>

<!-- Lower filled cell (replace the existing <template v-if="player.scores[cat.id] !== null"> block) -->
<template v-if="player.scores[cat.id] !== null">
  <span
    :style="{ color: player.color, fontWeight: 600 }"
    v-bind="useLongPress(() => { editTarget = { player, category: cat } })"
    style="touch-action: none;"
  >{{ player.scores[cat.id] }}</span>
</template>
```

Add the edit modal below the existing ScoreModal in the template:

```vue
<ScoreModal
  v-if="editTarget"
  :category="editTarget.category"
  :player="editTarget.player"
  :numDice="store.ruleSet.numDice"
  @confirm="(score) => { store.editScore(editTarget!.player.id, editTarget!.category.id, score); editTarget = null }"
  @close="editTarget = null"
/>
```

- [ ] **Step 8: Test long-press and undo in browser**

```bash
cd /Users/jules/projects/yatzee && npm run dev
```

Verify:
- Long-pressing (500ms hold) on a filled score cell opens the modal pre-populated
- Confirming a new score updates that cell without changing whose turn it is
- Undo button appears after first score is entered
- Undo reverts the last action (including edits)
- Undo from ResultsView returns to GameView with the last slot unfilled

Stop server.

- [ ] **Step 9: Commit**

```bash
cd /Users/jules/projects/yatzee && git add -A && git commit -m "feat: add undo and long-press score editing"
```

---

## Task 10: Final Polish

**Files:**
- Modify: `src/views/GameView.vue`
- Modify: `src/style.css`

- [ ] **Step 1: Add safe area insets for iPhone notch/home indicator**

In `src/style.css`, add after the existing rules:

```css
.game {
  padding-top: env(safe-area-inset-top, 0px);
}

.setup, .results {
  padding-top: env(safe-area-inset-top, 0px);
  padding-bottom: env(safe-area-inset-bottom, 0px);
}
```

- [ ] **Step 2: Add .gitignore**

```
node_modules/
dist/
.superpowers/
```

```bash
cd /Users/jules/projects/yatzee && echo "node_modules/\ndist/\n.superpowers/" > .gitignore
```

- [ ] **Step 3: Verify Maxi Yatzy works end-to-end**

```bash
cd /Users/jules/projects/yatzee && npm run dev
```

- Select "Maxi Yatzy — 6 dice" on SetupView
- Verify all 20 categories render in the compact layout without overflow
- Verify quick buttons for upper categories show 6 options (×1 through ×6)
- Verify "Full Straight" shows fixed score of 21

Stop server.

- [ ] **Step 4: Final test run**

```bash
cd /Users/jules/projects/yatzee && npm test
```

Expected: all tests pass.

- [ ] **Step 5: Build for production**

```bash
cd /Users/jules/projects/yatzee && npm run build
```

Expected: `dist/` created with no errors.

- [ ] **Step 6: Final commit**

```bash
cd /Users/jules/projects/yatzee && git add -A && git commit -m "chore: safe area insets, gitignore, production build"
```
