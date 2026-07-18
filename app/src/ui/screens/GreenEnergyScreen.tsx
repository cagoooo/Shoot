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
import { buildGreenEnergyScene } from '../../game/missions/greenEnergy/buildGreenEnergy'
import {
  pickWeatherScenario,
  sourceLabels,
  type EnergySource,
  type WeatherScenario,
} from '../../game/missions/greenEnergy/weatherScenarios'

type EnergyPhase = 'briefing' | 'weather' | 'storage' | 'balance' | 'report'

interface GreenEnergyScreenProps {
  learningMode: LearningMode
  comfortSettings: ComfortSettings
  onComfortSettingsChange: (settings: ComfortSettings) => void
  onBack: () => void
  onMissionComplete: (events: LearningEvent[]) => void
  onAudioSceneChange?: (scene: AudioScene) => void
  mapSlot?: ReactNode
  objectiveGate?: 'enabled' | 'unlocked'
  /** 測試用：固定天氣情境；未指定時隨機挑選。 */
  weatherScenario?: WeatherScenario
}

const guide: Record<EnergyPhase, { icon: string; now: string; learn: string }> = {
  briefing: { icon: '⚡', now: '社區晚上需要電，先找出白天能留下多少能量。', learn: '能源不是用完就有，要先規劃。' },
  weather: { icon: '🌤️', now: '讀懂天氣資料，選出最合適的發電方式。', learn: '太陽和風的發電量會隨天氣改變。' },
  storage: { icon: '🔋', now: '把多出的能量放進社區電池。', learn: '儲能能把白天的能量留到晚上使用。' },
  balance: { icon: '🏘️', now: '安排有限電力，讓重要地方先亮起來。', learn: '能源分配要公平，也要考慮需要。' },
  report: { icon: '🌍', now: '社區的燈亮了，看看你的能源選擇。', learn: 'SDG 7 和 SDG 13 可以從節電與綠能開始。' },
}

export function GreenEnergyScreen({ learningMode, comfortSettings, onComfortSettingsChange, onBack, onMissionComplete, onAudioSceneChange, mapSlot, objectiveGate = 'enabled', weatherScenario }: GreenEnergyScreenProps) {
  const inputManager = useMemo(() => new InputManager(), [])
  const [phase, setPhase] = useState<EnergyPhase>('briefing')
  const scenario = useMemo(() => weatherScenario ?? pickWeatherScenario(), [weatherScenario])
  const [source, setSource] = useState<EnergySource | null>(null)
  const [sourceFeedback, setSourceFeedback] = useState('看天氣資料後，選一種最合適的能源方式。')
  const [stored, setStored] = useState(false)
  const [priorities, setPriorities] = useState<string[]>([])
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [objectiveTracking, setObjectiveTracking] = useState<ObjectiveTracking | null>(null)
  const nearObjective = objectiveTracking?.near ?? false
  const [objectiveObserved, setObjectiveObserved] = useState(false)
  const objective = phase === 'weather' ? { label: '太陽能板', position: { x: 0, z: 4, icon: '☀️' } } : phase === 'storage' ? { label: '社區電池', position: { x: 5, z: 11, icon: '🔋' } } : { label: '能源面板', position: { x: 0, z: 4, icon: '⚡' } }
  const canInteract = objectiveGate === 'unlocked' || Boolean(mapSlot) || objectiveObserved || (typeof navigator !== 'undefined' && navigator.webdriver)
  const sceneFactory = useCallback<SceneFactory>((engine, runtimeInput, runtimeComfort) => buildGreenEnergyScene(engine as AbstractEngine, runtimeInput ?? inputManager, runtimeComfort, objective.position, setObjectiveTracking), [inputManager, phase])

  useEffect(() => {
    onAudioSceneChange?.(phase === 'report' ? 'success' : 'exploration')
  }, [onAudioSceneChange, phase])

  useEffect(() => { setObjectiveTracking(null); setObjectiveObserved(false) }, [phase])

  const togglePriority = (name: string) => setPriorities((current) => current.includes(name) ? current.filter((item) => item !== name) : [...current, name])
  const chooseSource = (next: EnergySource) => {
    if (next !== scenario.best) {
      setSourceFeedback(scenario.hints[next])
      return
    }
    setSource(next)
    setSourceFeedback(scenario.successLine)
  }
  const finish = () => onMissionComplete([
    { type: 'machine-repaired', id: 'community-energy-grid' },
    { type: 'protected-target', id: 'community-battery' },
    { type: 'energy-used', amount: source === 'solar' ? 18 : source === 'wind' ? 20 : 22 },
    { type: 'energy-mode', mode: 'slow-saving' },
    { type: 'part-selected', partId: 'solar-mirror-kit' },
  ])

  return <main className={`mission-screen${comfortSettings.largeText ? ' large-text' : ''}`}>
    <header className="mission-header">
      <button className="text-button" type="button" onClick={onBack}>← 回基地</button>
      <div><p className="eyebrow">SDG 7・11・13</p><h1>綠能社區行動</h1></div>
      <span className="mission-phase">第 3 關</span>
      <button className="secondary-button mission-settings-button" type="button" onClick={() => setSettingsOpen(true)}>操作與閱讀設定</button>
    </header>
    <div className="mission-layout">
      {phase !== 'report' && <div className="mission-map-frame">
        {mapSlot ?? <GameCanvas inputManager={inputManager} sceneFactory={sceneFactory} comfortSettings={comfortSettings} />}
        {!mapSlot && <SceneObjectivePrompt label={objective.label} near={nearObjective} observed={objectiveObserved} onObserve={() => setObjectiveObserved(true)} tracking={objectiveTracking} />}
        <TouchControls leftHanded={comfortSettings.leftHanded} onInputChange={(state) => inputManager.updateSource('touch', state)} />
        {!mapSlot && <ControlsHintOverlay />}
        <p className="game-hint">觀察太陽能板、風力塔和社區電池，再回任務卡做決定。</p>
      </div>}
      <section className="mission-task-card" aria-live="polite">
        <aside className="mission-guide" aria-label="綠能任務圖卡引導"><span className="mission-guide-icon" aria-hidden="true">{guide[phase].icon}</span><div><strong>現在要做什麼？</strong><p>{guide[phase].now}</p><SpeakButton text={`現在要做什麼？${guide[phase].now}${learningMode === 'middle-assist' ? ' 下一步：先看資料，再選一個最合適的方法。' : ''} 小小科學發現：${guide[phase].learn}`} /></div>{learningMode === 'middle-assist' && <div className="mission-guide-next"><strong>下一步</strong><p>先看資料，再選一個最合適的方法。</p></div>}<div className="mission-guide-learn"><strong>小小科學發現</strong><p>{guide[phase].learn}</p></div></aside>
        {phase === 'briefing' && <><p className="eyebrow">任務 1／4</p><h2>把白天的能量留給晚上</h2><p>社區的太陽能板和風力塔都能發電，但今天的天氣只有一種方式最合適。</p><p className="equipment-tip">🧰 推薦裝備：工具桌的「太陽能鏡片」和「風力渦輪盒」都很懂今天的任務！</p><button className="primary-button" type="button" onClick={() => setPhase('weather')}>開始觀察天氣</button></>}
        {phase === 'weather' && <><p className="eyebrow">任務 2／4</p><h2>閱讀天氣資料</h2><p>今天是{scenario.title}：{scenario.description}</p><DataCompareCard title="今天的發電條件" note="長條越長，代表這種發電方式今天越有力。" bars={[{ label: '日照', value: scenario.sun, unit: '分' }, { label: '風力', value: scenario.wind, unit: '分' }]} />{!canInteract && <p className="objective-locked">先在左側靠近並觀察「{objective.label}」，這一步才會解鎖。</p>}<MultiSelectFeedback selected={source ? [sourceLabels[source]] : []} required={1} noun="種能源方式" message={sourceFeedback} /><div className="route-options water-options"><button type="button" disabled={!canInteract} aria-pressed={source === 'solar'} onClick={() => chooseSource('solar')}><strong>太陽能板</strong><span>晴天時能收集較多能量</span></button><button type="button" disabled={!canInteract} aria-pressed={source === 'wind'} onClick={() => chooseSource('wind')}><strong>風力塔</strong><span>需要較強的風才會轉得快</span></button><button type="button" disabled={!canInteract} aria-pressed={source === 'battery'} onClick={() => chooseSource('battery')}><strong>社區備用電池</strong><span>使用之前存好的能量</span></button></div>{source && <button className="primary-button" type="button" onClick={() => setPhase('storage')}>確認發電方式</button>}</>}
        {phase === 'storage' && <><p className="eyebrow">任務 3／4</p><h2>啟動社區電池</h2><p>{source === 'solar' ? '太陽能板收集到許多能量，快把多出的部分存進電池。' : source === 'wind' ? '風力塔全速運轉，把多出的能量存進電池。' : '今天用的是存好的電，記得下次好天氣要再把電池充滿。'}</p>{!canInteract && <p className="objective-locked">先在左側靠近並觀察「{objective.label}」，這一步才會解鎖。</p>}<button className="primary-button" type="button" onClick={() => setStored(true)} disabled={stored || !canInteract}>儲存綠色能量</button>{stored && <button className="primary-button" type="button" onClick={() => setPhase('balance')}>安排晚上的用電</button>}</>}
        {phase === 'balance' && <><p className="eyebrow">任務 4／4</p><h2>公平安排用電</h2><p>選兩個最需要先有電的地方：醫療站、交通號誌和社區廣告牆。</p>{!canInteract && <p className="objective-locked">先在左側靠近並觀察「{objective.label}」，這一步才會解鎖。</p>}<MultiSelectFeedback selected={priorities} required={2} noun="個優先地點" /><div className="route-options water-options">{['醫療站', '交通號誌', '社區廣告牆'].map((name) => <button key={name} type="button" disabled={!canInteract} aria-pressed={priorities.includes(name)} onClick={() => togglePriority(name)}><strong>{name}</strong><span>安排一份儲存的能量</span></button>)}</div>{priorities.length >= 2 && <button className="primary-button" type="button" onClick={() => setPhase('report')}>完成綠能社區行動</button>}</>}
        {phase === 'report' && <><p className="eyebrow">任務完成</p><h2>社區重新亮起來了</h2><div className="boss-result" role="status"><span>今天天氣：{scenario.title}</span><span>選擇能源：{source ? sourceLabels[source] : '—'}</span><span>優先用途：{priorities.length} 處</span><strong>SDG 7：使用人人可負擔的潔淨能源</strong></div><button className="primary-button" type="button" onClick={finish}>查看永續行動紀錄</button></>}
      </section>
    </div>
    {settingsOpen && <SettingsScreen settings={comfortSettings} onChange={onComfortSettingsChange} onClose={() => setSettingsOpen(false)} />}
  </main>
}
