import type { EnergyMode } from '../../domain/boss/stormMachine'

interface EnergyChoicePanelProps {
  onChoose: (mode: EnergyMode) => void
}

const choices: Array<{
  id: EnergyMode
  name: string
  energy: string
  time: string
  description: string
}> = [
  {
    id: 'fast-full',
    name: '全力快速修',
    energy: '能源：高',
    time: '時間：短',
    description: '全部設備一起啟動，最快完成但最耗電。',
  },
  {
    id: 'slow-saving',
    name: '省電慢慢修',
    energy: '能源：低',
    time: '時間：長',
    description: '一次修一區，等待較久但最省能源。',
  },
  {
    id: 'zoned',
    name: '分區聰明修',
    energy: '能源：中',
    time: '時間：中',
    description: '重要區域先供電，兼顧速度與穩定。',
  },
]

export function EnergyChoicePanel({ onChoose }: EnergyChoicePanelProps) {
  return (
    <div className="energy-choice-panel" aria-label="選擇修復能源方案">
      {choices.map((choice) => (
        <button type="button" key={choice.id} onClick={() => onChoose(choice.id)}>
          <strong>{choice.name}</strong>
          <span>{choice.energy}</span>
          <span>{choice.time}</span>
          <small>{choice.description}</small>
        </button>
      ))}
    </div>
  )
}
