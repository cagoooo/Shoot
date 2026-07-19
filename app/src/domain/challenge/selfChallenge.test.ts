import { describe, expect, it } from 'vitest'
import { evaluateChallenge, formatChallengeLine } from './selfChallenge'

describe('evaluateChallenge', () => {
  it('第一次完成即為新紀錄', () => {
    const result = evaluateChallenge('recycling-storm', 90)
    expect(result.isNewRecord).toBe(true)
    expect(result.previousBest).toBeUndefined()
    expect(formatChallengeLine(result)).toContain('第一個紀錄')
  })

  it('比先前最佳快時破紀錄並算出快幾秒', () => {
    const result = evaluateChallenge('recycling-storm', 72, 90)
    expect(result.isNewRecord).toBe(true)
    expect(result.fasterBy).toBe(18)
    expect(formatChallengeLine(result)).toContain('快了 18 秒')
  })

  it('沒有比最佳快時不破紀錄，提示再挑戰', () => {
    const result = evaluateChallenge('recycling-storm', 100, 90)
    expect(result.isNewRecord).toBe(false)
    expect(formatChallengeLine(result)).toContain('最佳紀錄是 90 秒')
  })
})
