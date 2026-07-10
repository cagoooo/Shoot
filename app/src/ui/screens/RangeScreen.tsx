import { useMemo, useState } from 'react'
import { GameCanvas } from '../../game/GameCanvas'
import { InputManager } from '../../input/InputManager'
import { TouchControls } from '../components/TouchControls'
import {
  DEFAULT_COMFORT_SETTINGS,
  type ComfortSettings,
} from '../../domain/settings/accessibility'
import { SettingsScreen } from './SettingsScreen'

interface RangeScreenProps {
  onBack: () => void
}

export function RangeScreen({ onBack }: RangeScreenProps) {
  const inputManager = useMemo(() => new InputManager(), [])
  const [comfortSettings, setComfortSettings] = useState<ComfortSettings>(
    DEFAULT_COMFORT_SETTINGS,
  )
  const [settingsOpen, setSettingsOpen] = useState(false)

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
        <button
          className="secondary-button"
          type="button"
          onClick={() => setSettingsOpen(true)}
        >
          舒適設定
        </button>
      </header>
      <div className="game-frame">
        <GameCanvas
          inputManager={inputManager}
          comfortSettings={comfortSettings}
        />
        <TouchControls
          onInputChange={(state) => inputManager.updateSource('touch', state)}
        />
        <p className="game-hint">鍵盤 W A S D 或左側搖桿移動，滑鼠轉動視角。</p>
        {settingsOpen && (
          <SettingsScreen
            settings={comfortSettings}
            onChange={setComfortSettings}
            onClose={() => setSettingsOpen(false)}
          />
        )}
      </div>
    </main>
  )
}
