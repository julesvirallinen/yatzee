import { yatzy } from './yatzy'
import { maxiYatzy } from './maxi-yatzy'

export type { Category, RuleSet } from './types'
export { yatzy, maxiYatzy }
export const RULESETS = [yatzy, maxiYatzy] as const
