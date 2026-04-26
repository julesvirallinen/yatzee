import { yatzy } from './yatzy'
import { maxiYatzy } from './maxi-yatzy'
import { secretDice } from './secret-dice'

export type { Category, RuleSet } from './types'
export { yatzy, maxiYatzy, secretDice }
export const RULESETS = [yatzy, maxiYatzy, secretDice] as const
export const MAIN_RULESETS = [yatzy, maxiYatzy] as const
export const MORE_RULESETS = [secretDice] as const
