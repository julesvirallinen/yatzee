# Yatzy Scorekeeper — Design Spec

## Overview

A mobile-first (iPhone 17, 393×852) dark-theme Yatzy scorekeeper webapp. Vue 3 + Vite + Pinia. No backend, deploys as static files. Supports multiple rule sets (Yatzy 5-dice, Maxi Yatzy 6-dice) selectable at game start.

---

## Tech Stack

- **Vue 3** (Composition API) + **Vite** + **Pinia**
- No router — view switching via `currentView` in the game store
- TypeScript
- Single `index.html` entry, static deployment

---

## Views

### SetupView
- Rule set selector: radio-button cards (Yatzy 5-dice / Maxi Yatzy 6-dice)
- Player name inputs with per-player color dot (purple, green, orange, red…)
- Add player button (dashed border)
- "Start Game →" CTA button
- Min 2 players

### GameView
- Full-height flex scorecard — rows scale naturally to fill 100% of available height (no fixed padding)
- Column header row: category label column + one column per player (active player shows glowing dot + full brightness; inactive players dimmed to 40% opacity)
- Active player pill in header: "Alice's turn" with glowing dot
- **Upper section** rows: show pace delta only (±N, not raw score)
  - Green = ahead of pace, red = behind, grey `0` = exactly on pace
  - Pace = 3 × face value per category
  - Open slots tinted in active player's color with `+` tap target
- **Bonus row** (flex: 1.8): cumulative pace delta (large, coloured) + running upper total `22 / 63` (small, muted below)
- **Lower section** rows: show raw score when filled; open slots show `+` tap target
- **Total row** (flex: 1.4): grand total per player
- Tapping an open slot in the active player's column opens the ScoreModal

### ScoreModal (bottom sheet)
- Drag handle + category name + player name in header
- **Upper categories**: quick-select buttons for all valid multiples of the face value (e.g. Threes → 3, 6, 9, 12, 15), plus manual `−` / input / `+` stepper
- **Fixed-score lower categories** (Small Straight = 15, Large Straight = 20, Yatzy = 50, Maxi Yatzy = 100, Full Straight = 21): single confirm button showing the fixed score
- **Variable lower categories**: manual stepper only
- "Confirm N" primary button + "✕ Cross out" secondary button (scores 0)
- Confirming advances turn to next player

### ResultsView
- Final scores per player, winner highlighted
- "New Game" button → returns to SetupView, resets store

---

## Rule Sets

Rule sets are plain config objects in `src/rulesets/`. Adding a new variant = adding a new file.

```ts
interface Category {
  id: string
  name: string
  section: 'upper' | 'lower'
  scoring:
    | { type: 'sum-of-value'; value: number }   // upper: Ones/Twos/etc
    | { type: 'fixed'; points: number }          // Small Straight, Yatzy, etc
    | { type: 'sum-all' }                        // Pairs, Full House, Chance, etc
}

interface RuleSet {
  id: string
  name: string
  numDice: number
  categories: Category[]
  bonusThreshold: number
  bonusPoints: number
}
```

### Yatzy (5 dice)
- Upper: Ones–Sixes. Bonus: ≥63 → +50
- Lower: One Pair, Two Pairs, Three of a Kind, Four of a Kind, Small Straight (15), Large Straight (20), Full House (sum), Chance (sum), Yatzy (50)

### Maxi Yatzy (6 dice)
- Upper: Ones–Sixes. Bonus: ≥84 → +100
- Lower: One Pair, Two Pairs, Three Pairs, Three of a Kind, Four of a Kind, Five of a Kind, Small Straight (15), Large Straight (20), Full Straight (21), Full House (sum), Villa (sum, two different 3ok), Tower (sum, 4ok+pair), Chance (sum), Maxi Yatzy (100)

---

## Pinia Store (`useGameStore`)

```ts
interface Player {
  id: string
  name: string
  color: string   // css color value
  scores: Record<string, number | null>  // categoryId → score (null = unfilled, number = filled, 0 = crossed out)
}

interface GameStore {
  currentView: 'setup' | 'game' | 'results'
  ruleSet: RuleSet
  players: Player[]
  activePlayerIndex: number
}
```

Computed getters:
- `upperTotal(playerId)` — sum of filled upper scores
- `upperDelta(playerId)` — cumulative pace delta for filled upper categories
- `bonusEarned(playerId)` — boolean, true if upperTotal ≥ threshold
- `lowerTotal(playerId)` — sum of filled lower scores
- `grandTotal(playerId)` — upperTotal + bonus + lowerTotal
- `isComplete` — all categories filled for all players → switch to ResultsView

---

## Layout — Natural Flex Fill

The GameView scorecard uses CSS flexbox to fill 100% of the viewport height with no fixed padding. Each data row gets `flex: 1`; bonus row `flex: 1.8`; total row `flex: 1.4`. This works for both rule sets — Maxi Yatzy has more rows so each is slightly shorter, but proportions hold.

---

## Design Tokens

- Background: `#0a0a0a`
- Surface: `#111`, `#141414`, `#1a1a1a`
- Border: `#1e1e1e`, `#2a2a2a`
- Player colors: purple `#a78bfa`, green `#34d399`, orange `#fb923c`, red `#f87171`
- Positive delta: `#34d399`
- Negative delta: `#f87171`
- Neutral/zero delta: `#555`
- Active slot tint: player color at 13% opacity + player color border at 33%
- Inactive player opacity: 0.4

---

## Turn Order

Round-robin through players in setup order. Confirming or crossing out a score in the modal advances `activePlayerIndex` to the next player (wraps). When all categories are filled for all players, `isComplete` becomes true and the view switches to ResultsView.

Filled slots are **read-only** — no editing after confirming (v1).

---

## Error Handling

None needed — all inputs are bounded (min 0, max derived from rule), no network calls, no persistence.
