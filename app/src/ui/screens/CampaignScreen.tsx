import { useCallback, useEffect, useMemo } from 'react'
import type { AbstractEngine } from '@babylonjs/core/Engines/abstractEngine'
import type { MissionId } from '../../app/gameStore'
import { campaignMissions, isMissionUnlocked } from '../../content/missionCatalog'
import { GameCanvas, type SceneFactory } from '../../game/GameCanvas'
import { buildCampaignScene } from '../../game/campaign/buildCampaignScene'
import { collectionWorldColors } from '../../game/collection/buildCollectionScene'
import { canRenderTitle3D } from '../../game/title/buildTitleScene'
import { subscribeSceneInteraction } from '../../game/missions/sceneInteraction'

interface CampaignScreenProps {
  completedMissions: string[]
  onBack: () => void
  onMissionSelect: (mission: MissionId) => void
  reducedMotion?: boolean
}

export function CampaignScreen({
  completedMissions,
  onBack,
  onMissionSelect,
  reducedMotion = false,
}: CampaignScreenProps) {
  const show3D = useMemo(() => canRenderTitle3D(), [])

  const worlds = useMemo(
    () =>
      campaignMissions.map((mission) => {
        const unlocked = isMissionUnlocked(mission, completedMissions)
        const playable = mission.status === 'playable' && unlocked
        return {
          id: mission.id,
          order: mission.order,
          icon: mission.icon,
          color: collectionWorldColors[mission.id] ?? '#5eb987',
          unlocked,
          playable,
          completed: completedMissions.includes(mission.id),
        }
      }),
    [completedMissions],
  )
  const sceneFactory = useCallback<SceneFactory>(
    (engine) => buildCampaignScene(engine as AbstractEngine, { worlds, reducedMotion }),
    [worlds, reducedMotion],
  )

  // 點 3D 地圖上的世界標記直接進關（只有可遊玩的標記可點）。
  useEffect(
    () =>
      subscribeSceneInteraction((interaction) => {
        if (interaction.kind !== 'campaign-world') return
        const world = worlds.find((candidate) => candidate.id === interaction.id)
        if (world?.playable) onMissionSelect(world.id as MissionId)
      }),
    [worlds, onMissionSelect],
  )

  return (
    <main className={`campaign-screen${show3D ? ' has-3d' : ''}`}>
      {show3D && (
        <div className="campaign-3d-backdrop" aria-hidden="true">
          <GameCanvas sceneFactory={sceneFactory} />
        </div>
      )}
      <header className="campaign-header">
        <button className="text-button" type="button" onClick={onBack}>← 回基地</button>
        <div>
          <p className="eyebrow">九大世界・SDGs 永續冒險</p>
          <h1>地球行動地圖</h1>
          <p>每完成一關，就讓平衡星核找回一種守護地球的方法。</p>
        </div>
      </header>

      {show3D && <p className="campaign-hint">👆 點地圖上發亮的世界，就能直接出發！</p>}

      <section className="campaign-grid" aria-label="九大世界任務地圖">
        {campaignMissions.map((mission) => {
          const unlocked = isMissionUnlocked(mission, completedMissions)
          const playable = mission.status === 'playable' && unlocked
          const status = mission.status === 'building'
            ? '建造中'
            : playable
              ? completedMissions.includes(mission.id) ? '可再次挑戰' : '開始行動'
              : '完成前一關後解鎖'

          return (
            <article
              key={mission.id}
              className={`campaign-card${playable ? ' is-playable' : ''}${unlocked ? '' : ' is-locked'}`}
            >
              <span className="campaign-order">{String(mission.order).padStart(2, '0')}</span>
              <span className="campaign-icon" aria-hidden="true">{mission.icon}</span>
              <p className="campaign-sdgs">{mission.sdgs}</p>
              <h2>{mission.title}</h2>
              <p>{mission.story}</p>
              <small>玩法：{mission.mechanic}</small>
              <button
                type="button"
                disabled={!playable}
                onClick={() => onMissionSelect(mission.id)}
              >
                {status}
              </button>
            </article>
          )
        })}
      </section>
    </main>
  )
}
