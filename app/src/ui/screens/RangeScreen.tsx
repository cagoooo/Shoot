import { useMemo } from 'react'
import { GameCanvas } from '../../game/GameCanvas'
import { InputManager } from '../../input/InputManager'
import { TouchControls } from '../components/TouchControls'

interface RangeScreenProps {
  onBack: () => void
}

export function RangeScreen({ onBack }: RangeScreenProps) {
  const inputManager = useMemo(() => new InputManager(), [])

  return (
    <main className="range-screen">
      <header className="range-header">
        <button className="text-button" type="button" onClick={onBack}>
          ← 回基地
        </button>
        <div>
          <p className="eyebrow">安全試玩區</p>
          <h1>3D 能量測試場</h1>
        </div>
      </header>
      <div className="game-frame">
        <GameCanvas />
        <TouchControls
          onInputChange={(state) => inputManager.updateSource('touch', state)}
        />
        <p className="game-hint">使用滑鼠觀察測試場。移動與射擊會在下一階段加入。</p>
      </div>
    </main>
  )
}
