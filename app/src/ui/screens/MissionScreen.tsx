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

interface MissionCheckpoint {
  load(): Promise<(MissionState & { safeSpawnId: string }) | null>
  save(state: MissionState): Promise<void>
}

interface MissionScreenProps {
  onBack: () => void
  checkpoint?: MissionCheckpoint
  mapSlot?: ReactNode
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

const binNames: Record<WasteBin, string> = {
  paper: '紙類',
  plastic: '塑膠類',
  metal: '金屬類',
  general: '一般垃圾',
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

function MissionMap() {
  const inputManager = useMemo(() => new InputManager(), [])
  const sceneFactory = useCallback<SceneFactory>(
    (engine) =>
      buildRecyclingStormScene(engine as AbstractEngine, inputManager),
    [inputManager],
  )

  return (
    <div className="mission-map-frame">
      <GameCanvas inputManager={inputManager} sceneFactory={sceneFactory} />
      <TouchControls
        onInputChange={(state) => inputManager.updateSource('touch', state)}
      />
      <p className="game-hint">沿著黃色主路或藍色維修小路探索回收站。</p>
    </div>
  )
}

export function MissionScreen({
  onBack,
  checkpoint: checkpointInput,
  mapSlot,
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

  useEffect(() => {
    let active = true
    void checkpoint.load().then((restored) => {
      if (!active) return
      if (restored) setMission(createMissionState(restored))
      setLoading(false)
    })
    return () => {
      active = false
    }
  }, [checkpoint])

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
    if (result.correct) setSortingIndex((index) => index + 1)
  }

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

  if (loading) {
    return <main className="loading-screen">正在讀取安全檢查點…</main>
  }

  return (
    <main className="mission-screen">
      <header className="mission-header">
        <button className="text-button" type="button" onClick={onBack}>
          ← 回基地
        </button>
        <div>
          <p className="eyebrow">SDG 7・12・13 聯合任務</p>
          <h1>垃圾風暴救援行動</h1>
        </div>
        <span className="mission-phase">{phaseNames[mission.phase]}</span>
      </header>

      <div className="mission-layout">
        {mission.phase !== 'report' && (mapSlot ?? <MissionMap />)}

        <section className="mission-task-card" aria-live="polite">
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
                  <p className="sorting-item">{challenge[sortingIndex].name}</p>
                  <div className="sorting-bins">
                    {(Object.keys(binNames) as WasteBin[]).map((bin) => (
                      <button type="button" key={bin} onClick={() => sortInto(bin)}>
                        放入 {binNames[bin]}
                      </button>
                    ))}
                  </div>
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
              {hint && <p role="status" className="learning-hint">{hint}</p>}
            </>
          )}

          {mission.phase === 'storm-machine' && (
            <>
              <p className="eyebrow">任務 5／7・經由{route}</p>
              <h2>能源控制室已到達</h2>
              <p>先關閉風暴機的能源，再保留修理紀錄。頭目挑戰將在下一階段加入。</p>
              <button
                className="primary-button"
                type="button"
                onClick={() =>
                  advance('storm-machine-cleansed', 'start-evacuation')
                }
              >
                關閉風暴機，開始撤離
              </button>
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
              <div className="sdg-result">
                <strong>這次守護了</strong>
                <span>SDG 7 可負擔的潔淨能源</span>
                <span>SDG 12 責任消費與生產</span>
                <span>SDG 13 氣候行動</span>
              </div>
              <button className="primary-button" type="button" onClick={onBack}>
                帶著行動紀錄回基地
              </button>
            </>
          )}
        </section>
      </div>
    </main>
  )
}
