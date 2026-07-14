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
import { SpeakButton } from '../components/SpeakButton'
import { MultiSelectFeedback } from '../components/MultiSelectFeedback'
import { SettingsScreen } from './SettingsScreen'
import { buildWaterGuardianScene } from '../../game/missions/waterGuardian/buildWaterGuardian'

type WaterPhase = 'briefing' | 'collect' | 'filter' | 'distribute' | 'report'
type FilterPart = 'cloth' | 'sand' | 'charcoal'
const filterOrder: FilterPart[] = ['cloth', 'sand', 'charcoal']
const filterLabels: Record<FilterPart, string> = { cloth: '布', sand: '砂子', charcoal: '活性碳' }
const filterReasons: Record<FilterPart, string> = { cloth: '先攔住落葉等大雜質。', sand: '再擋住較小的顆粒。', charcoal: '最後幫忙改善味道。' }

interface WaterGuardianScreenProps {
  learningMode: LearningMode
  comfortSettings: ComfortSettings
  onComfortSettingsChange: (settings: ComfortSettings) => void
  onBack: () => void
  onMissionComplete: (events: LearningEvent[]) => void
  onAudioSceneChange?: (scene: AudioScene) => void
  mapSlot?: ReactNode
  objectiveGate?: 'enabled' | 'unlocked'
}

const phaseGuide: Record<WaterPhase, { icon: string; now: string; learn: string }> = {
  briefing: { icon: '💧', now: '雨水收集站需要你的幫忙。', learn: '水可以被收集、過濾和再次使用。' },
  collect: { icon: '🌧️', now: '收集 3 滴雨水，準備修復淨水站。', learn: '雨水是可以珍惜的自然資源。' },
  filter: { icon: '🧪', now: '選出能一起工作的過濾材料。', learn: '不同材料能擋住不同大小的雜質。' },
  distribute: { icon: '🚰', now: '把乾淨的水分配給需要的地方。', learn: '先想清楚用途，才能公平用水。' },
  report: { icon: '🌍', now: '看看你完成的淨水行動。', learn: 'SDG 6 從珍惜每一滴水開始。' },
}

export function WaterGuardianScreen({
  learningMode,
  comfortSettings,
  onComfortSettingsChange,
  onBack,
  onMissionComplete,
  onAudioSceneChange,
  mapSlot,
  objectiveGate = 'enabled',
}: WaterGuardianScreenProps) {
  const inputManager = useMemo(() => new InputManager(), [])
  const [phase, setPhase] = useState<WaterPhase>('briefing')
  const [drops, setDrops] = useState(0)
  const [filterParts, setFilterParts] = useState<FilterPart[]>([])
  const [filterFeedback, setFilterFeedback] = useState('先從最上層開始：選「布」。')
  const [uses, setUses] = useState<string[]>([])
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [nearObjective, setNearObjective] = useState(false)
  const [objectiveObserved, setObjectiveObserved] = useState(false)
  const guide = phaseGuide[phase]
  const objective = phase === 'collect'
    ? { label: '雨水箱', position: { x: -4, z: 3 } }
    : phase === 'filter'
      ? { label: '過濾站', position: { x: 4, z: 6 } }
      : { label: '乾淨水箱', position: { x: 0, z: 14 } }
  const canInteract = objectiveGate === 'unlocked' || Boolean(mapSlot) || objectiveObserved || (typeof navigator !== 'undefined' && navigator.webdriver)
  const sceneFactory = useCallback<SceneFactory>(
    (engine, runtimeInput, runtimeComfort) =>
      buildWaterGuardianScene(
        engine as AbstractEngine,
        runtimeInput ?? inputManager,
        runtimeComfort,
        objective.position,
        setNearObjective,
      ),
    [inputManager, phase],
  )

  const finish = () => {
    onMissionComplete([
      { type: 'machine-repaired', id: 'water-filter-station' },
      { type: 'protected-target', id: 'clean-water-tank' },
      { type: 'material-recycled', category: 'water', amount: drops },
      { type: 'energy-used', amount: 24 },
      { type: 'part-selected', partId: 'water-filter-kit' },
    ])
  }

  const chooseFilter = (part: FilterPart) => {
    const expected = filterOrder[filterParts.length]
    if (filterParts.includes(part)) {
      setFilterFeedback(`「${filterLabels[part]}」已是第 ${filterParts.indexOf(part) + 1} 步；請接著選下一層。`)
      return
    }
    if (part !== expected) {
      setFilterFeedback(`還差一步：先選「${filterLabels[expected]}」。${filterReasons[expected]}`)
      return
    }
    const next = [...filterParts, part]
    setFilterParts(next)
    setFilterFeedback(next.length === filterOrder.length ? '全部順序正確！你完成了三層過濾。' : `第 ${next.length} 步正確！${filterReasons[part]} 接著選下一層。`)
  }

  const toggleUse = (use: string) =>
    setUses((current) =>
      current.includes(use)
        ? current.filter((item) => item !== use)
        : [...current, use],
    )

  useEffect(() => {
    onAudioSceneChange?.(phase === 'report' ? 'success' : 'exploration')
  }, [onAudioSceneChange, phase])

  useEffect(() => {
    setNearObjective(false)
    setObjectiveObserved(false)
  }, [phase])

  return (
    <main className={`mission-screen${comfortSettings.largeText ? ' large-text' : ''}`}>
      <header className="mission-header">
        <button className="text-button" type="button" onClick={onBack}>← 回基地</button>
        <div>
          <p className="eyebrow">SDG 6 淨水與衛生</p>
          <h1>水滴守護行動</h1>
        </div>
        <span className="mission-phase">第 2 關</span>
        <button className="secondary-button mission-settings-button" type="button" onClick={() => setSettingsOpen(true)}>
          操作與閱讀設定
        </button>
      </header>

      <div className="mission-layout">
        {phase !== 'report' && (
          <div className="mission-map-frame">
            {mapSlot ?? <GameCanvas inputManager={inputManager} sceneFactory={sceneFactory} comfortSettings={comfortSettings} />}
            {!mapSlot && <SceneObjectivePrompt label={objective.label} near={nearObjective} observed={objectiveObserved} onObserve={() => setObjectiveObserved(true)} />}
            <TouchControls leftHanded={comfortSettings.leftHanded} onInputChange={(state) => inputManager.updateSource('touch', state)} />
            <p className="game-hint">靠近水站觀察，再回到任務卡完成步驟。</p>
          </div>
        )}
        <section className="mission-task-card" aria-live="polite">
          <aside className="mission-guide" aria-label="水滴任務圖卡引導">
            <span className="mission-guide-icon" aria-hidden="true">{guide.icon}</span>
            <div><strong>現在要做什麼？</strong><p>{guide.now}</p><SpeakButton text={`現在要做什麼？${guide.now}${learningMode === 'middle-assist' ? ' 下一步：看完提示再做選擇。' : ''} 小小科學發現：${guide.learn}`} /></div>
            {learningMode === 'middle-assist' && <div className="mission-guide-next"><strong>下一步</strong><p>看完提示再做選擇。</p></div>}
            <div className="mission-guide-learn"><strong>小小科學發現</strong><p>{guide.learn}</p></div>
          </aside>
          {phase !== 'briefing' && phase !== 'report' && !canInteract && <p className="objective-locked">先在左側靠近並觀察「{objective.label}」，這一步才會解鎖。</p>}

          {phase === 'briefing' && <>
            <p className="eyebrow">任務 1／4</p>
            <h2>讓雨水重新流動</h2>
            <p>社區的淨水站被落葉和泥沙堵住了。請收集雨水、組合過濾材料，再把乾淨的水分配出去。</p>
            <button className="primary-button" type="button" onClick={() => setPhase('collect')}>我準備好了</button>
          </>}

          {phase === 'collect' && <>
            <p className="eyebrow">任務 2／4</p>
            <h2>收集雨水</h2>
            <p>目前收集：{drops}／3 滴。每按一次就觀察一滴雨水進入水箱。</p>
            <button className="primary-button" type="button" onClick={() => setDrops((value) => Math.min(3, value + 1))} disabled={drops >= 3 || !canInteract}>收集一滴雨水</button>
            {drops >= 3 && <button className="primary-button" type="button" onClick={() => setPhase('filter')}>前往過濾站</button>}
          </>}

          {phase === 'filter' && <>
            <p className="eyebrow">任務 3／4</p>
            <h2>組合過濾材料</h2>
            <p>選擇材料並比較用途：布先擋落葉，砂子擋小顆粒，活性碳改善味道。</p>
            <div className={`sequence-feedback${filterParts.length === filterOrder.length ? ' is-success' : ''}`} role="status">
              <strong>過濾順序：{filterParts.length}／3</strong>
              <span>{filterParts.length ? filterParts.map((part, index) => `${index + 1}. ${filterLabels[part]}`).join(' → ') : '尚未選擇'}</span>
              <p>{filterFeedback}</p>
            </div>
            <div className="route-options water-options">
              {(['cloth', 'sand', 'charcoal'] as FilterPart[]).map((part) => (
                <button key={part} className={filterParts.includes(part) ? 'is-sequence-selected' : ''} type="button" disabled={!canInteract} aria-pressed={filterParts.includes(part)} onClick={() => chooseFilter(part)}>
                  <strong>{part === 'cloth' ? '布' : part === 'sand' ? '砂子' : '活性碳'}</strong>
                  <span>{part === 'cloth' ? '擋住落葉' : part === 'sand' ? '擋住小顆粒' : '改善味道'}</span>
                </button>
              ))}
            </div>
            {filterParts.length === 3 && <button className="primary-button" type="button" onClick={() => setPhase('distribute')}>完成過濾</button>}
          </>}

          {phase === 'distribute' && <>
            <p className="eyebrow">任務 4／4</p>
            <h2>分配乾淨的水</h2>
            <p>選擇至少兩個需要用水的地方，想想怎麼珍惜有限的水。</p>
            <MultiSelectFeedback selected={uses} required={2} noun="個用水地點" />
            <div className="route-options water-options">
              {['飲水站', '菜園澆灌', '清潔工具'].map((use) => (
                <button key={use} type="button" disabled={!canInteract} aria-pressed={uses.includes(use)} onClick={() => toggleUse(use)}><strong>{use}</strong><span>安排一份乾淨的水</span></button>
              ))}
            </div>
            {uses.length >= 2 && <button className="primary-button" type="button" onClick={() => setPhase('report')}>完成水滴守護</button>}
          </>}

          {phase === 'report' && <>
            <p className="eyebrow">任務完成</p>
            <h2>水滴守護成功</h2>
            <div className="boss-result" role="status"><span>收集雨水：{drops} 滴</span><span>過濾材料：{filterParts.length} 種</span><span>分配用途：{uses.length} 處</span><strong>SDG 6：珍惜每一滴水</strong></div>
            <button className="primary-button" type="button" onClick={finish}>查看永續行動紀錄</button>
          </>}
        </section>
      </div>
      {settingsOpen && <SettingsScreen settings={comfortSettings} onChange={onComfortSettingsChange} onClose={() => setSettingsOpen(false)} />}
    </main>
  )
}
