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
