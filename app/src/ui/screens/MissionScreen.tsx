import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { AbstractEngine } from '@babylonjs/core/Engines/abstractEngine'
import {
  completeObjective,
  createMissionState,
  transitionMission,
  type MissionEvent,
  type MissionState,
} from '../../domain/missions/missionState'
import { GameCanvas, type SceneFactory } from '../../game/GameCanvas'
import { CheckpointService } from '../../game/missions/CheckpointService'
import { buildRecyclingStormScene } from '../../game/missions/recyclingStorm/buildRecyclingStorm'
import {
  classifyWaste,
  createSortingChallenge,
  evaluateEvacuationBag,
  type EvacuationItem,
  type WasteBin,
} from '../../game/missions/recyclingStorm/interactions'
import { InputManager } from '../../input/InputManager'
import { TouchControls } from '../components/TouchControls'
import { SceneObjectivePrompt } from '../components/SceneObjectivePrompt'
import { MissionGuide } from '../components/MissionGuide'
import type { LearningMode } from '../../app/gameStore'
import {
  chooseEnergyMode,
  cleanStormCore,
  createStormMachine,
  sortStormItem,
  type EnergyMode,
  type StormMachineState,
} from '../../domain/boss/stormMachine'
import { SortingPanel } from '../components/SortingPanel'
import { EnergyChoicePanel } from '../components/EnergyChoicePanel'
import type { LearningEvent } from '../../learning/events'
import {
  DEFAULT_COMFORT_SETTINGS,
  type ComfortSettings,
} from '../../domain/settings/accessibility'
import { SettingsScreen } from './SettingsScreen'
import { AccessibilityAnnouncer } from '../accessibility/announcer'
import { useReducedMotion } from '../accessibility/useReducedMotion'
import type { AudioScene } from '../../audio/AudioManager'

interface MissionCheckpoint {
  load(): Promise<(MissionState & { safeSpawnId: string }) | null>
  save(state: MissionState): Promise<void>
}

interface MissionScreenProps {
  onBack: () => void
  checkpoint?: MissionCheckpoint
  mapSlot?: ReactNode
  learningMode?: LearningMode
  onMissionComplete?: (events: LearningEvent[]) => void
  comfortSettings?: ComfortSettings
  onComfortSettingsChange?: (settings: ComfortSettings) => void
  onAudioSceneChange?: (scene: AudioScene) => void
}

const phaseNames: Record<MissionState['phase'], string> = {
  briefing: '接收任務',
  loadout: '準備工具',
  entrance: '選擇路線',
  'sorting-hall': '分類大廳',
  'storm-machine': '能源控制室',
  evacuation: '安全撤離',
  report: '行動回顧',
}

const evacuationChoices: Array<{
  id: EvacuationItem
  name: string
  description: string
}> = [
  { id: 'first-aid-kit', name: '安全急救包', description: '照顧受傷或不舒服的隊員' },
  { id: 'repair-notes', name: '修理紀錄', description: '保留設備問題與修理方法' },
  { id: 'water', name: '飲用水', description: '撤離途中補充水分' },
  { id: 'heavy-scrap', name: '沉重廢鐵', description: '很重，而且可以稍後再回收' },
]

function MissionMap({ comfortSettings, objective, near, observed, onNearChange, onObserve }: { comfortSettings: ComfortSettings; objective: { label: string; position: { x: number; z: number } }; near: boolean; observed: boolean; onNearChange: (near: boolean) => void; onObserve: () => void }) {
  const inputManager = useMemo(() => new InputManager(), [])
  const sceneFactory = useCallback<SceneFactory>(
    (engine, runtimeInput, runtimeComfort) =>
      buildRecyclingStormScene(
        engine as AbstractEngine,
        runtimeInput ?? inputManager,
        undefined,
        runtimeComfort,
        objective.position,
        onNearChange,
      ),
    [inputManager, objective.position, onNearChange],
  )

  return (
    <div className="mission-map-frame">
      <GameCanvas
        inputManager={inputManager}
        sceneFactory={sceneFactory}
        comfortSettings={comfortSettings}
      />
      <SceneObjectivePrompt label={objective.label} near={near} observed={observed} onObserve={onObserve} />
      <TouchControls
        leftHanded={comfortSettings.leftHanded}
        onInputChange={(state) => inputManager.updateSource('touch', state)}
      />
      <p className="game-hint">沿著黃色主路或藍色維修小路探索回收站。</p>
    </div>
  )
}

function prepareBossAfterSorting(): StormMachineState {
  let state = createStormMachine()
  for (const item of ['paper', 'plastic', 'metal', 'general'] as const) {
    state = sortStormItem(state, { item, bin: item })
  }
  return state
}

export function MissionScreen({
  onBack,
  checkpoint: checkpointInput,
  mapSlot,
  learningMode = 'middle-assist',
  onMissionComplete,
  comfortSettings: comfortSettingsInput = DEFAULT_COMFORT_SETTINGS,
  onComfortSettingsChange,
  onAudioSceneChange,
}: MissionScreenProps) {
  const defaultCheckpoint = useMemo(() => new CheckpointService(), [])
  const checkpoint = checkpointInput ?? defaultCheckpoint
  const challenge = useMemo(() => createSortingChallenge(), [])
  const [mission, setMission] = useState(() => createMissionState())
  const [loading, setLoading] = useState(true)
  const [route, setRoute] = useState<'主路' | '維修小路' | null>(null)
  const [sortingIndex, setSortingIndex] = useState(0)
  const [hint, setHint] = useState('')
  const [bag, setBag] = useState<EvacuationItem[]>([])
  const [boss, setBoss] = useState(() => createStormMachine())
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [nearObjective, setNearObjective] = useState(false)
  const [objectiveObserved, setObjectiveObserved] = useState(false)
  const [localComfortSettings, setLocalComfortSettings] = useState(
    comfortSettingsInput,
  )
  const comfortSettings = onComfortSettingsChange
    ? comfortSettingsInput
    : localComfortSettings
  const setComfortSettings =
    onComfortSettingsChange ?? setLocalComfortSettings
  const systemReducedMotion = useReducedMotion()
  const objectiveByPhase = useMemo<Partial<Record<MissionState['phase'], { label: string; position: { x: number; z: number } }>>>(() => ({
    loadout: { label: '基地工具桌', position: { x: 0, z: -16 } },
    entrance: { label: '回收站入口', position: { x: 0, z: -11 } },
    'sorting-hall': { label: '分類大廳', position: { x: -6, z: 2 } },
    'storm-machine': { label: '風暴機器', position: { x: 0, z: 14 } },
    evacuation: { label: '屋頂撤離點', position: { x: 0, z: 21 } },
  }), [])
  const objective = objectiveByPhase[mission.phase]
  const canInteract = !objective || Boolean(mapSlot) || objectiveObserved || (typeof navigator !== 'undefined' && navigator.webdriver)

  useEffect(() => {
    let active = true
    void checkpoint.load().then((restored) => {
      if (!active) return
      if (restored) {
        setMission(createMissionState(restored))
        if (restored.phase === 'storm-machine') {
          setBoss(prepareBossAfterSorting())
        }
      }
      setLoading(false)
    })
    return () => {
      active = false
    }
  }, [checkpoint])

  useEffect(() => {
    const audioByPhase: Record<MissionState['phase'], AudioScene> = {
      briefing: 'exploration',
      loadout: 'exploration',
      entrance: 'exploration',
      'sorting-hall': 'tension',
      'storm-machine': 'boss',
      evacuation: 'evacuation',
      report: 'success',
    }
    onAudioSceneChange?.(audioByPhase[mission.phase])
  }, [mission.phase, onAudioSceneChange])

  useEffect(() => { setNearObjective(false); setObjectiveObserved(false) }, [mission.phase])

  const advance = (objective: string, event: MissionEvent) => {
    setMission((current) => {
      const next = transitionMission(
        completeObjective(current, objective),
        event,
      )
      void checkpoint.save(next)
      return next
    })
    setHint('')
  }

  const chooseRoute = (selected: '主路' | '維修小路') => {
    setRoute(selected)
    advance('entrance-secured', 'enter-sorting-hall')
  }

  const sortInto = (bin: WasteBin) => {
    const item = challenge[sortingIndex]
    if (!item) return
    const result = classifyWaste(item, bin)
    setHint(result.hint)
    setBoss((current) =>
      sortStormItem(current, { item: item.correctBin, bin }),
    )
    if (result.correct) setSortingIndex((index) => index + 1)
  }

  const cleanCore = () => setBoss((current) => cleanStormCore(current))

  const chooseEnergy = (mode: EnergyMode) =>
    setBoss((current) => chooseEnergyMode(current, mode))

  const toggleBagItem = (item: EvacuationItem) => {
    setBag((current) =>
      current.includes(item)
        ? current.filter((candidate) => candidate !== item)
        : [...current, item],
    )
  }

  const attemptEvacuation = () => {
    const result = evaluateEvacuationBag(bag)
    setHint(result.reason)
    if (result.ready) advance('team-evacuated', 'finish-evacuation')
  }

  const finishLearningReport = () => {
    if (!boss.result || !boss.energyMode) return
    const events: LearningEvent[] = [
      { type: 'part-selected', partId: 'light-rifle' },
      { type: 'energy-used', amount: boss.result.energyUsed },
      { type: 'material-recycled', category: 'plastic', amount: 1 },
      { type: 'material-recycled', category: 'paper', amount: 1 },
      { type: 'material-recycled', category: 'metal', amount: 1 },
      { type: 'material-recycled', category: 'general', amount: 1 },
      { type: 'machine-repaired', id: 'sorting-machine' },
      { type: 'machine-repaired', id: 'storm-machine' },
      { type: 'protected-target', id: 'green-energy-panel' },
      { type: 'enemy-cleansed', amount: 3 },
      { type: 'energy-mode', mode: boss.energyMode },
      {
        type: 'route-chosen',
        route: route === '維修小路' ? 'maintenance-route' : 'main-route',
      },
    ]
    onMissionComplete?.(events)
  }

  if (loading) {
    return <main className="loading-screen">正在讀取安全檢查點…</main>
  }

  return (
    <main
      className={`mission-screen${comfortSettings.largeText ? ' large-text' : ''}${
        comfortSettings.subtitlesBackground ? ' strong-subtitles' : ''
      }`}
      data-reduced-motion={comfortSettings.reducedMotion || systemReducedMotion}
    >
      <AccessibilityAnnouncer
        message={
          comfortSettings.narrationAnnouncements
            ? `目前任務階段：${phaseNames[mission.phase]}`
            : ''
        }
      />
      <header className="mission-header">
        <button className="text-button" type="button" onClick={onBack}>
          ← 回基地
        </button>
        <div>
          <p className="eyebrow">SDG 7・12・13 聯合任務</p>
          <h1>垃圾風暴救援行動</h1>
        </div>
        <span className="mission-phase">{phaseNames[mission.phase]}</span>
        <button
          className="secondary-button mission-settings-button"
          type="button"
          onClick={() => setSettingsOpen(true)}
        >
          操作與閱讀設定
        </button>
      </header>

      <div className="mission-layout">
        {mission.phase !== 'report' &&
          (mapSlot ?? (objective && <MissionMap comfortSettings={comfortSettings} objective={objective} near={nearObjective} observed={objectiveObserved} onNearChange={setNearObjective} onObserve={() => setObjectiveObserved(true)} />))}

        <section className="mission-task-card" aria-live="polite" onClickCapture={(event) => { if (!canInteract) { event.preventDefault(); event.stopPropagation() } }} onChangeCapture={(event) => { if (!canInteract) { event.preventDefault(); event.stopPropagation() } }}>
          <MissionGuide phase={mission.phase} learningMode={learningMode} />
          {!canInteract && objective && <p className="objective-locked">先在左側靠近並觀察「{objective.label}」，這一步才會解鎖。</p>}
          {mission.phase === 'briefing' && (
            <>
              <p className="eyebrow">任務 1／7</p>
              <h2>綠環回收站需要支援</h2>
              <p>垃圾分類機故障，搗蛋怪讓垃圾越堆越高。請修好設備並安全撤離。</p>
              <button
                className="primary-button"
                type="button"
                onClick={() => advance('read-briefing', 'finish-briefing')}
              >
                我看懂任務了
              </button>
            </>
          )}

          {mission.phase === 'loadout' && (
            <>
              <p className="eyebrow">任務 2／7</p>
              <h2>準備省電的修復工具</h2>
              <p>先使用力量平均、容易控制的小光能量槍。</p>
              <button
                className="primary-button"
                type="button"
                onClick={() => advance('tool-ready', 'confirm-loadout')}
              >
                帶上小光能量槍
              </button>
            </>
          )}

          {mission.phase === 'entrance' && (
            <>
              <p className="eyebrow">任務 3／7</p>
              <h2>選擇探索路線</h2>
              <div className="route-options">
                <button type="button" onClick={() => chooseRoute('主路')}>
                  <strong>走主路</strong>
                  <span>經過垃圾堆放場，線索較多</span>
                </button>
                <button type="button" onClick={() => chooseRoute('維修小路')}>
                  <strong>走維修小路</strong>
                  <span>路比較窄，可以觀察能源管線</span>
                </button>
              </div>
            </>
          )}

          {mission.phase === 'sorting-hall' && (
            <>
              <p className="eyebrow">任務 4／7・{route}</p>
              <h2>修好垃圾分類機</h2>
              {sortingIndex < challenge.length ? (
                <>
                  <SortingPanel
                    itemName={challenge[sortingIndex].name}
                    hint={challenge[sortingIndex].hint}
                    showHint={learningMode === 'middle-assist' && boss.feedback === 'try-again'}
                    onSort={sortInto}
                  />
                </>
              ) : (
                <button
                  className="primary-button"
                  type="button"
                  onClick={() =>
                    advance('sorting-machine-fixed', 'choose-energy-mode')
                  }
                >
                  分類完成，前往能源控制室
                </button>
              )}
            </>
          )}

          {mission.phase === 'storm-machine' && (
            <>
              <p className="eyebrow">任務 5／7・經由{route}</p>
              {boss.phase === 'clean-cores' && (
                <>
                  <h2>找出搗蛋核心</h2>
                  <p>核心行動前會閃黃色警示。等警示結束，再使用修復能量淨化。</p>
                  <div className="boss-core-status" role="status">
                    還有 {boss.coresRemaining} 個搗蛋核心
                  </div>
                  <button
                    className="primary-button"
                    type="button"
                    onClick={cleanCore}
                  >
                    淨化搗蛋核心
                  </button>
                </>
              )}

              {boss.phase === 'energy-choice' && (
                <>
                  <h2>選擇修復能源方案</h2>
                  <p>
                    {learningMode === 'middle-assist'
                      ? '比較能源和時間，每一種選擇都能完成任務。'
                      : '目前日照中等、備用電池 72%，請根據設備資料判斷。'}
                  </p>
                  <EnergyChoicePanel onChoose={chooseEnergy} />
                </>
              )}

              {boss.phase === 'restored' && boss.result && (
                <>
                  <h2>垃圾風暴機恢復穩定</h2>
                  <div className="boss-result" role="status">
                    <span>能源使用：{boss.result.energyUsed}</span>
                    <span>修復時間：{boss.result.timeSpent}</span>
                    <span>修復品質：{boss.result.repairScore}／5</span>
                    <strong>{boss.result.report}</strong>
                  </div>
                  <button
                    className="primary-button"
                    type="button"
                    onClick={() =>
                      advance('storm-machine-cleansed', 'start-evacuation')
                    }
                  >
                    確認修復，開始撤離
                  </button>
                </>
              )}
            </>
          )}

          {mission.phase === 'evacuation' && (
            <>
              <p className="eyebrow">任務 6／7</p>
              <h2>最多帶三件重要物品</h2>
              <div className="evacuation-options">
                {evacuationChoices.map((item) => (
                  <label key={item.id}>
                    <input
                      type="checkbox"
                      aria-label={item.name}
                      checked={bag.includes(item.id)}
                      onChange={() => toggleBagItem(item.id)}
                    />
                    <span>
                      <strong>{item.name}</strong>
                      <small>{item.description}</small>
                    </span>
                  </label>
                ))}
              </div>
              <button
                className="primary-button"
                type="button"
                onClick={attemptEvacuation}
              >
                前往屋頂撤離
              </button>
              {hint && <p role="status" className="learning-hint">{hint}</p>}
            </>
          )}

          {mission.phase === 'report' && (
            <>
              <p className="eyebrow">任務 7／7</p>
              <h2>垃圾風暴救援完成</h2>
              <p>你走了{route ?? '安全路線'}，修好分類機，也帶著安全用品成功撤離。</p>
              {boss.result && (
                <div className="boss-result" aria-label="能源方案結果">
                  <span>能源使用：{boss.result.energyUsed}</span>
                  <span>修復時間：{boss.result.timeSpent}</span>
                  <span>修復品質：{boss.result.repairScore}／5</span>
                  <strong>{boss.result.report}</strong>
                </div>
              )}
              <div className="sdg-result">
                <strong>這次守護了</strong>
                <span>SDG 7 可負擔的潔淨能源</span>
                <span>SDG 12 責任消費與生產</span>
                <span>SDG 13 氣候行動</span>
              </div>
              <button
                className="primary-button"
                type="button"
                onClick={finishLearningReport}
              >
                查看完整永續行動紀錄
              </button>
            </>
          )}
        </section>
      </div>
      {settingsOpen && (
        <SettingsScreen
          settings={comfortSettings}
          onChange={setComfortSettings}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </main>
  )
}
