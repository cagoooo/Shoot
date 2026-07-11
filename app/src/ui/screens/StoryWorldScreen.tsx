import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { AbstractEngine } from '@babylonjs/core/Engines/abstractEngine'
import type { AudioScene } from '../../audio/AudioManager'
import type { LearningMode } from '../../app/gameStore'
import type { ComfortSettings } from '../../domain/settings/accessibility'
import type { LearningEvent } from '../../learning/events'
import { InputManager } from '../../input/InputManager'
import { GameCanvas, type SceneFactory } from '../../game/GameCanvas'
import { TouchControls } from '../components/TouchControls'
import { SettingsScreen } from './SettingsScreen'
import { buildStoryWorldScene } from '../../game/missions/storyWorld/buildStoryWorld'
import type { StoryMissionConfig } from '../../game/missions/storyWorld/storyMissionConfig'

interface StoryWorldScreenProps {
  mission: StoryMissionConfig
  learningMode: LearningMode
  comfortSettings: ComfortSettings
  onComfortSettingsChange: (settings: ComfortSettings) => void
  onBack: () => void
  onMissionComplete: (events: LearningEvent[]) => void
  onAudioSceneChange?: (scene: AudioScene) => void
  mapSlot?: ReactNode
}

export function StoryWorldScreen({ mission, learningMode, comfortSettings, onComfortSettingsChange, onBack, onMissionComplete, onAudioSceneChange, mapSlot }: StoryWorldScreenProps) {
  const inputManager = useMemo(() => new InputManager(), [])
  const [phase, setPhase] = useState(0)
  const [selected, setSelected] = useState<string[]>([])
  const [settingsOpen, setSettingsOpen] = useState(false)
  const step = mission.steps[phase]
  const sceneFactory = useCallback<SceneFactory>((engine, runtimeInput, runtimeComfort) => buildStoryWorldScene(engine as AbstractEngine, runtimeInput ?? inputManager, mission, runtimeComfort), [inputManager, mission])

  useEffect(() => {
    onAudioSceneChange?.(phase >= mission.steps.length ? 'success' : 'exploration')
  }, [mission.steps.length, onAudioSceneChange, phase])

  const toggleChoice = (id: string) => setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
  const goNext = () => {
    setSelected([])
    setPhase((current) => Math.min(current + 1, mission.steps.length))
  }

  return <main className={`mission-screen${comfortSettings.largeText ? ' large-text' : ''}`}>
    <header className="mission-header">
      <button className="text-button" type="button" onClick={onBack}>← 回基地</button>
      <div><p className="eyebrow">{mission.sdgs}</p><h1>{mission.title}</h1></div>
      <span className="mission-phase">第 {mission.chapter} 關</span>
      <button className="secondary-button mission-settings-button" type="button" onClick={() => setSettingsOpen(true)}>操作與閱讀設定</button>
    </header>
    <div className="mission-layout">
      {phase < mission.steps.length && <div className="mission-map-frame">
        {mapSlot ?? <GameCanvas inputManager={inputManager} sceneFactory={sceneFactory} comfortSettings={comfortSettings} />}
        <TouchControls leftHanded={comfortSettings.leftHanded} onInputChange={(state) => inputManager.updateSource('touch', state)} />
        <p className="game-hint">在世界場景中觀察線索，再回任務卡做出守護選擇。</p>
      </div>}
      <section className="mission-task-card" aria-live="polite">
        <aside className="mission-guide" aria-label={`${mission.title}圖卡引導`}>
          <span className="mission-guide-icon" aria-hidden="true">{mission.icon}</span>
          <div><strong>世界求救訊號</strong><p>{phase === 0 ? mission.intro : phase < mission.steps.length ? step.description : mission.conclusion}</p></div>
          {learningMode === 'middle-assist' && <div className="mission-guide-next"><strong>下一步</strong><p>{phase < mission.steps.length ? `選出至少 ${step.requiredChoices} 個好方法，再繼續前進。` : '把今天的守護方法帶回生活中。'}</p></div>}
          <div className="mission-guide-learn"><strong>小小科學發現</strong><p>{phase < mission.steps.length ? step.title : '每一個小選擇，都會讓地球更平衡。'}</p></div>
        </aside>
        {phase < mission.steps.length ? <>
          <p className="eyebrow">任務 {phase + 1}／{mission.steps.length}</p>
          <h2>{step.title}</h2>
          <p>{step.description}</p>
          <div className="route-options water-options">
            {step.choices.map((choice) => <button key={choice.id} type="button" aria-pressed={selected.includes(choice.id)} onClick={() => toggleChoice(choice.id)}><strong>{choice.title}</strong><span>{choice.description}</span></button>)}
          </div>
          {selected.length >= step.requiredChoices && <button className="primary-button" type="button" onClick={goNext}>{phase === mission.steps.length - 1 ? '完成世界修復' : '帶著發現繼續前進'}</button>}
        </> : <>
          <p className="eyebrow">世界修復完成</p>
          <h2>{mission.conclusion}</h2>
          <div className="boss-result" role="status"><span>完成三個守護任務</span><span>收集世界資料</span><span>保護關鍵目標</span><strong>{mission.sdgs} 的行動已寫入地球地圖</strong></div>
          <button className="primary-button" type="button" onClick={() => onMissionComplete([...mission.events])}>查看永續行動紀錄</button>
        </>}
      </section>
    </div>
    {settingsOpen && <SettingsScreen settings={comfortSettings} onChange={onComfortSettingsChange} onClose={() => setSettingsOpen(false)} />}
  </main>
}
