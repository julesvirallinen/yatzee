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
