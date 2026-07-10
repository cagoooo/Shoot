import { GameCanvas } from '../../game/GameCanvas'

interface RangeScreenProps {
  onBack: () => void
}

export function RangeScreen({ onBack }: RangeScreenProps) {
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
        <p className="game-hint">使用滑鼠觀察測試場。移動與射擊會在下一階段加入。</p>
      </div>
    </main>
  )
}
