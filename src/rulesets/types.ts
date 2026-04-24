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
