import { describe, expect, it } from 'vitest'
import { pickWeatherScenario, weatherScenarios } from './weatherScenarios'

describe('weatherScenarios', () => {
  it('三種天氣的最佳能源各不相同，且錯誤選項都有引導', () => {
    expect(new Set(weatherScenarios.map((scenario) => scenario.best)).size).toBe(3)
    for (const scenario of weatherScenarios) {
      expect(scenario.hints[scenario.best]).toBe('')
      for (const source of ['solar', 'wind', 'battery'] as const) {
        if (source !== scenario.best) {
          expect(scenario.hints[source].length).toBeGreaterThan(5)
        }
      }
    }
  })

  it('依隨機值挑選天氣且不會超出範圍', () => {
    expect(pickWeatherScenario(() => 0).id).toBe('sunny-breeze')
    expect(pickWeatherScenario(() => 0.5).id).toBe('cloudy-windy')
    expect(pickWeatherScenario(() => 0.99).id).toBe('rainy-calm')
  })
})
