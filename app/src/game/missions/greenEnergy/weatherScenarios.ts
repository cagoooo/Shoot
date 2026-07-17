export type EnergySource = 'solar' | 'wind' | 'battery'

export interface WeatherScenario {
  id: 'sunny-breeze' | 'cloudy-windy' | 'rainy-calm'
  title: string
  description: string
  /** 日照與風力強度（0–5），供資料卡呈現。 */
  sun: number
  wind: number
  best: EnergySource
  successLine: string
  hints: Record<EnergySource, string>
}

export const sourceLabels: Record<EnergySource, string> = {
  solar: '太陽能板',
  wind: '風力塔',
  battery: '社區備用電池',
}

export const weatherScenarios: readonly WeatherScenario[] = [
  {
    id: 'sunny-breeze',
    title: '晴朗微風的下午',
    description: '陽光充足，只有微微的風。',
    sun: 5,
    wind: 1,
    best: 'solar',
    successLine: '答對了！晴朗下午的陽光充足，適合使用太陽能板。',
    hints: {
      solar: '',
      wind: '再想想：今天是微風，風力塔轉得不夠快。看看資料卡的風力有多少？',
      battery: '再想想：備用電池要留給發不了電的日子；今天太陽這麼大，先用免費的陽光吧。',
    },
  },
  {
    id: 'cloudy-windy',
    title: '陰天強風的下午',
    description: '厚厚的雲擋住太陽，但風呼呼地吹。',
    sun: 1,
    wind: 5,
    best: 'wind',
    successLine: '答對了！雲擋住了太陽，但強風正好讓風力塔全速運轉。',
    hints: {
      solar: '再想想：雲層擋住了大部分陽光，太陽能板收不到多少能量。',
      wind: '',
      battery: '再想想：風力塔今天轉得很快，可以先用風發電，把電池留到沒風沒太陽的日子。',
    },
  },
  {
    id: 'rainy-calm',
    title: '下雨無風的傍晚',
    description: '雨一直下，也幾乎沒有風。',
    sun: 0,
    wind: 1,
    best: 'battery',
    successLine: '答對了！沒太陽也沒風的日子，正是使用之前存好的備用電池的時候。',
    hints: {
      solar: '再想想：下雨天幾乎沒有陽光，太陽能板發不了電。',
      wind: '再想想：今天幾乎沒有風，風力塔轉不動。',
      battery: '',
    },
  },
]

/** 依隨機函式挑一種天氣；自動化測試（webdriver）固定使用第一種確保可重現。 */
export function pickWeatherScenario(random: () => number = Math.random): WeatherScenario {
  if (typeof navigator !== 'undefined' && navigator.webdriver) return weatherScenarios[0]
  const index = Math.min(
    weatherScenarios.length - 1,
    Math.floor(random() * weatherScenarios.length),
  )
  return weatherScenarios[index]
}
