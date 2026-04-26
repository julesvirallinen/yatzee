import type { RuleSet } from './types'

export const secretDice: RuleSet = {
  id: 'secret-dice',
  name: 'Secret Dice — 5 dice',
  numDice: 5,
  bonusThreshold: 0,
  bonusPoints: 0,
  categories: [
    { id: 'ones',   name: 'Ones',   section: 'upper', scoring: { type: 'sum-of-value', value: 1 } },
    { id: 'twos',   name: 'Twos',   section: 'upper', scoring: { type: 'sum-of-value', value: 2 } },
    { id: 'threes', name: 'Threes', section: 'upper', scoring: { type: 'sum-of-value', value: 3 } },
    { id: 'fours',  name: 'Fours',  section: 'upper', scoring: { type: 'sum-of-value', value: 4 } },
    { id: 'fives',  name: 'Fives',  section: 'upper', scoring: { type: 'sum-of-value', value: 5 } },
    { id: 'sixes',  name: 'Sixes',  section: 'upper', scoring: { type: 'sum-of-value', value: 6 } },
    { id: 'total',          name: 'Total',        section: 'lower', scoring: { type: 'sum-all' } },
    { id: 'full-house',     name: '2·3 Dice',     section: 'lower', scoring: { type: 'fixed', points: 20 } },
    { id: 'small-straight', name: '4 in a Row',   section: 'lower', scoring: { type: 'fixed', points: 20 } },
    { id: 'large-straight', name: '5 in a Row',   section: 'lower', scoring: { type: 'fixed', points: 30 } },
    { id: 'four-of-a-kind', name: '4 Dice',       section: 'lower', scoring: { type: 'fixed', points: 20 } },
    { id: 'secret-dice',    name: '5 Dice/Joker', section: 'lower', scoring: { type: 'fixed', points: 40 } },
  ],
}
