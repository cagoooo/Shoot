import { useCallback, useMemo } from 'react'
import type { AbstractEngine } from '@babylonjs/core/Engines/abstractEngine'
import type { LearningMode } from '../../app/gameStore'
import { GameCanvas, type SceneFactory } from '../../game/GameCanvas'
import { buildTitleScene, canRenderTitle3D } from '../../game/title/buildTitleScene'

interface StartScreenProps {
  mode: LearningMode
  onModeChange: (mode: LearningMode) => void
  onStart: () => void
  onTeacherMode?: () => void
  reducedMotion?: boolean
}

export function StartScreen({ mode, onModeChange, onStart, onTeacherMode, reducedMotion = false }: StartScreenProps) {
  const show3D = useMemo(() => canRenderTitle3D(), [])
  const sceneFactory = useCallback<SceneFactory>(
    (engine) => buildTitleScene(engine as AbstractEngine, { reducedMotion }),
    [reducedMotion],
  )

  return (
    <main className={`start-screen${show3D ? ' has-3d' : ''}`}>
      {show3D && (
        <div className="start-3d-backdrop" aria-hidden="true">
          <GameCanvas sceneFactory={sceneFactory} />
        </div>
      )}
      <section className="start-card" aria-labelledby="game-title">
        <p className="eyebrow">SDGs 永續行動遊戲</p>
        <h1 id="game-title">地球守護隊：能量大作戰</h1>
        <p className="intro">
          組裝能量工具、找出環境問題，和地球守護隊一起完成任務。
        </p>

        <fieldset className="mode-picker">
          <legend>選擇遊戲方式</legend>
          <label>
            <input
              type="radio"
              name="learning-mode"
              checked={mode === 'middle-assist'}
              onChange={() => onModeChange('middle-assist')}
            />
            <span>
              <strong>中年級輔助</strong>
              <small>提示更多、瞄準更容易</small>
            </span>
          </label>
          <label>
            <input
              type="radio"
              name="learning-mode"
              checked={mode === 'upper-standard'}
              onChange={() => onModeChange('upper-standard')}
            />
            <span>
              <strong>高年級標準</strong>
              <small>自己觀察、比較和改良</small>
            </span>
          </label>
        </fieldset>

        <button className="start-button" type="button" onClick={onStart}>
          開始任務
        </button>
        {onTeacherMode && (
          <button className="text-button teacher-entry" type="button" onClick={onTeacherMode}>
            🍎 我是老師：開啟課堂投影模式
          </button>
        )}
      </section>
    </main>
  )
}
