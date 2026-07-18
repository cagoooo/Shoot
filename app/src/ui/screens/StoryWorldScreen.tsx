import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { AbstractEngine } from '@babylonjs/core/Engines/abstractEngine'
import type { AudioScene } from '../../audio/AudioManager'
import type { LearningMode } from '../../app/gameStore'
import type { ComfortSettings } from '../../domain/settings/accessibility'
import type { LearningEvent } from '../../learning/events'
import { InputManager } from '../../input/InputManager'
import { GameCanvas, type SceneFactory } from '../../game/GameCanvas'
import { TouchControls } from '../components/TouchControls'
import { SceneObjectivePrompt } from '../components/SceneObjectivePrompt'
import { ControlsHintOverlay } from '../components/ControlsHintOverlay'
import { SpeakButton } from '../components/SpeakButton'
import type { ObjectiveTracking } from '../../game/missions/objectiveTracking'
import { MultiSelectFeedback } from '../components/MultiSelectFeedback'
import { DataCompareCard } from '../components/DataCompareCard'
import { SettingsScreen } from './SettingsScreen'
import { buildStoryWorldScene } from '../../game/missions/storyWorld/buildStoryWorld'
import type { StoryMissionConfig, StoryStep } from '../../game/missions/storyWorld/storyMissionConfig'

const initialFeedbackFor = (step?: StoryStep) =>
  step?.kind === 'sequence'
    ? `照順序來：先選「${step.choices[0].title}」。`
    : step?.requiredChoices === 1
      ? '想一想，選出一個最好的答案。'
      : '選出對地球有幫助的方法。'

interface StoryWorldScreenProps {
  mission: StoryMissionConfig
  learningMode: LearningMode
  comfortSettings: ComfortSettings
  onComfortSettingsChange: (settings: ComfortSettings) => void
  onBack: () => void
  onMissionComplete: (events: LearningEvent[]) => void
  onAudioSceneChange?: (scene: AudioScene) => void
  mapSlot?: ReactNode
  objectiveGate?: 'enabled' | 'unlocked'
}

export function StoryWorldScreen({ mission, learningMode, comfortSettings, onComfortSettingsChange, onBack, onMissionComplete, onAudioSceneChange, mapSlot, objectiveGate = 'enabled' }: StoryWorldScreenProps) {
  const inputManager = useMemo(() => new InputManager(), [])
  const [phase, setPhase] = useState(0)
  const [selected, setSelected] = useState<string[]>([])
  const [missteps, setMissteps] = useState(0)
  const [selectionFeedback, setSelectionFeedback] = useState(() => initialFeedbackFor(mission.steps[0]))
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [objectiveTracking, setObjectiveTracking] = useState<ObjectiveTracking | null>(null)
  const nearObjective = objectiveTracking?.near ?? false
  const [objectiveObserved, setObjectiveObserved] = useState(false)
  const step = mission.steps[phase]
  const objective = {
    label: phase < mission.steps.length ? step.title : mission.title,
    position: {
      ...((phase < mission.steps.length && step.position) || { x: 0, z: 7 }),
      icon: (phase < mission.steps.length && step.objectiveIcon) || mission.icon,
    },
  }
  const canInteract = objectiveGate === 'unlocked' || Boolean(mapSlot) || objectiveObserved || (typeof navigator !== 'undefined' && navigator.webdriver)
  const sceneFactory = useCallback<SceneFactory>((engine, runtimeInput, runtimeComfort) => buildStoryWorldScene(engine as AbstractEngine, runtimeInput ?? inputManager, mission, runtimeComfort, objective.position, setObjectiveTracking), [inputManager, mission, phase])

  useEffect(() => {
    onAudioSceneChange?.(phase >= mission.steps.length ? 'success' : 'exploration')
  }, [mission.steps.length, onAudioSceneChange, phase])

  useEffect(() => { setObjectiveTracking(null); setObjectiveObserved(false) }, [phase])

  const toggleChoice = (id: string) => {
    const choice = step.choices.find((item) => item.id === id)
    if (!choice) return
    const isHelpful = step.choices.indexOf(choice) < step.requiredChoices
    if (!isHelpful) {
      setMissteps((count) => count + 1)
      setSelectionFeedback(`再想想：${choice.title} 不適合，${choice.description}`)
      return
    }
    setSelected((current) => {
      const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
      setSelectionFeedback(next.length >= step.requiredChoices ? '選得很好！這些都是能幫助任務的做法。' : `已選「${choice.title}」，再找一個好方法。`)
      return next
    })
  }
  const chooseSequence = (id: string) => {
    const choice = step.choices.find((item) => item.id === id)
    if (!choice) return
    if (selected.includes(id)) {
      setSelectionFeedback(`「${choice.title}」已是第 ${selected.indexOf(id) + 1} 步；請接著選下一步。`)
      return
    }
    const expected = step.choices[selected.length]
    if (id !== expected.id) {
      setMissteps((count) => count + 1)
      setSelectionFeedback(`還差一步：先選「${expected.title}」。${expected.description}`)
      return
    }
    const next = [...selected, id]
    setSelected(next)
    setSelectionFeedback(
      next.length === step.choices.length
        ? '全部順序正確！你完成了這個步驟。'
        : `第 ${next.length} 步正確！${choice.description} 接著選下一步。`,
    )
  }
  const goNext = () => {
    setSelected([])
    setSelectionFeedback(initialFeedbackFor(mission.steps[phase + 1]))
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
        {!mapSlot && <SceneObjectivePrompt label={objective.label} near={nearObjective} observed={objectiveObserved} onObserve={() => setObjectiveObserved(true)} tracking={objectiveTracking} />}
        <TouchControls leftHanded={comfortSettings.leftHanded} onInputChange={(state) => inputManager.updateSource('touch', state)} />
        {!mapSlot && <ControlsHintOverlay />}
        <p className="game-hint">在世界場景中觀察線索，再回任務卡做出守護選擇。</p>
      </div>}
      <section className="mission-task-card" aria-live="polite">
        <aside className="mission-guide" aria-label={`${mission.title}圖卡引導`}>
          <span className="mission-guide-icon" aria-hidden="true">{mission.icon}</span>
          <div><strong>世界求救訊號</strong><p>{phase === 0 ? mission.intro : phase < mission.steps.length ? step.description : mission.conclusion}</p><SpeakButton text={`世界求救訊號：${phase === 0 ? mission.intro : phase < mission.steps.length ? step.description : mission.conclusion}${learningMode === 'middle-assist' ? ` 下一步：${phase < mission.steps.length ? `選出至少 ${step.requiredChoices} 個好方法，再繼續前進。` : '把今天的守護方法帶回生活中。'}` : ''}`} /></div>
          {learningMode === 'middle-assist' && <div className="mission-guide-next"><strong>下一步</strong><p>{phase < mission.steps.length ? `選出至少 ${step.requiredChoices} 個好方法，再繼續前進。` : '把今天的守護方法帶回生活中。'}</p></div>}
          <div className="mission-guide-learn"><strong>小小科學發現</strong><p>{phase < mission.steps.length ? step.title : '每一個小選擇，都會讓地球更平衡。'}</p></div>
        </aside>
        {phase < mission.steps.length ? <>
          <p className="eyebrow">任務 {phase + 1}／{mission.steps.length}</p>
          <h2>{step.title}</h2>
          <p>{step.description}</p>
          {step.dialogue && (
            <div className="guide-dialogue">
              <span className="guide-dialogue-icon" aria-hidden="true">{mission.guide.icon}</span>
              <div>
                <strong>{mission.guide.name}</strong>
                <p>{step.dialogue}</p>
                <SpeakButton text={`${mission.guide.name}說：${step.dialogue}`} label="聽角色說" voice={mission.guide.voice} />
              </div>
            </div>
          )}
          {step.dataCard && <DataCompareCard title={step.dataCard.title} note={step.dataCard.note} bars={step.dataCard.bars} />}
          {!canInteract && <p className="objective-locked">先在左側靠近並觀察「{objective.label}」，這一步才會解鎖。</p>}
          {step.kind === 'sequence' ? (
            <div className={`sequence-feedback${selected.length === step.choices.length ? ' is-success' : ''}`} role="status">
              <strong>順序 {selected.length}／{step.choices.length}</strong>
              <span>{selected.length ? selected.map((id, index) => `${index + 1}. ${step.choices.find((choice) => choice.id === id)?.title ?? id}`).join('　') : '還沒開始排順序'}</span>
              <p>{selectionFeedback}</p>
            </div>
          ) : (
            <MultiSelectFeedback selected={selected.map((id) => step.choices.find((choice) => choice.id === id)?.title ?? id)} required={step.requiredChoices} message={selectionFeedback} />
          )}
          <div className="route-options water-options">
            {step.choices.map((choice) => <button key={choice.id} type="button" disabled={!canInteract} className={step.kind === 'sequence' && selected.includes(choice.id) ? 'is-sequence-selected' : undefined} aria-pressed={selected.includes(choice.id)} onClick={() => (step.kind === 'sequence' ? chooseSequence(choice.id) : toggleChoice(choice.id))}><strong>{choice.title}</strong><span>{choice.description}</span></button>)}
          </div>
          {selected.length >= step.requiredChoices && <button className="primary-button" type="button" onClick={goNext}>{phase === mission.steps.length - 1 ? '完成世界修復' : '帶著發現繼續前進'}</button>}
        </> : <>
          <p className="eyebrow">世界修復完成</p>
          <h2>{mission.conclusion}</h2>
          <div className="guide-dialogue">
            <span className="guide-dialogue-icon" aria-hidden="true">{mission.guide.icon}</span>
            <div>
              <strong>{mission.guide.name}</strong>
              <p>{missteps === 0 ? mission.endings.perfect : mission.endings.learned}</p>
              <SpeakButton text={`${mission.guide.name}說：${missteps === 0 ? mission.endings.perfect : mission.endings.learned}`} label="聽角色說" voice={mission.guide.voice} />
            </div>
          </div>
          <div className="boss-result" role="status"><span>完成三個守護任務</span><span>收集世界資料</span><span>保護關鍵目標</span><strong>{mission.sdgs} 的行動已寫入地球地圖</strong></div>
          <button
            className="primary-button"
            type="button"
            onClick={() =>
              onMissionComplete([
                ...mission.events,
                {
                  type: 'mission-ending',
                  missionId: mission.id,
                  ending: missteps === 0 ? 'perfect' : 'learned',
                  summary: missteps === 0 ? mission.endings.perfect : mission.endings.learned,
                },
              ])
            }
          >
            查看永續行動紀錄
          </button>
        </>}
      </section>
    </div>
    {settingsOpen && <SettingsScreen settings={comfortSettings} onChange={onComfortSettingsChange} onClose={() => setSettingsOpen(false)} />}
  </main>
}
