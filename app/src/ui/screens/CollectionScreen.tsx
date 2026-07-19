import { useCallback, useMemo } from 'react'
import type { AbstractEngine } from '@babylonjs/core/Engines/abstractEngine'
import { campaignMissions } from '../../content/missionCatalog'
import { GameCanvas, type SceneFactory } from '../../game/GameCanvas'
import {
  buildCollectionScene,
  collectionWorldColors,
} from '../../game/collection/buildCollectionScene'
import { canRenderTitle3D } from '../../game/title/buildTitleScene'

interface CollectionScreenProps {
  completedMissions: readonly string[]
  missionEndings: Record<string, 'perfect' | 'learned'>
  onBack: () => void
  reducedMotion?: boolean
}

const actionLineByMission: Record<string, string> = {
  'recycling-storm': '我讓回收站重新運轉，減少了垃圾風暴。',
  'water-guardian': '我收集並過濾雨水，把乾淨的水公平分配。',
  'green-energy-community': '我幫社區選對能源，把白天的電留給晚上。',
  'seed-forest': '我修復土壤，讓幼苗有安全的家。',
  'food-rescue': '我保存食物並分享多的，減少浪費。',
  'health-bubble': '我用正確順序洗手，也照顧了校園水站。',
  'safe-home': '我完成防災工程，讓社區撤離路線更安全。',
  'ocean-blue': '我清走海廢、保護潮池生物的家。',
  'earth-partners': '我和夥伴公平合作，一起點亮平衡星核。',
}

export function CollectionScreen({
  completedMissions,
  missionEndings,
  onBack,
  reducedMotion = false,
}: CollectionScreenProps) {
  const show3D = useMemo(() => canRenderTitle3D(), [])
  const completedCount = campaignMissions.filter((mission) =>
    completedMissions.includes(mission.id),
  ).length
  const perfectCount = campaignMissions.filter(
    (mission) => missionEndings[mission.id] === 'perfect',
  ).length

  const worlds = useMemo(
    () =>
      campaignMissions.map((mission) => ({
        id: mission.id,
        icon: mission.icon,
        color: collectionWorldColors[mission.id] ?? '#5eb987',
        completed: completedMissions.includes(mission.id),
        perfect: missionEndings[mission.id] === 'perfect',
      })),
    [completedMissions, missionEndings],
  )
  const sceneFactory = useCallback<SceneFactory>(
    (engine) => buildCollectionScene(engine as AbstractEngine, { worlds, reducedMotion }),
    [worlds, reducedMotion],
  )

  return (
    <main className={`collection-screen${show3D ? ' has-3d' : ''}`}>
      {show3D && (
        <div className="collection-3d-backdrop" aria-hidden="true">
          <GameCanvas sceneFactory={sceneFactory} />
        </div>
      )}
      <header className="mission-header">
        <button className="text-button" type="button" onClick={onBack}>← 回基地</button>
        <div>
          <p className="eyebrow">地球守護隊</p>
          <h1>成就收藏冊</h1>
        </div>
      </header>

      <section className="collection-stats" aria-label="收藏統計">
        <div><strong>{completedCount}／9</strong><span>完成世界</span></div>
        <div><strong>⭐ {perfectCount}</strong><span>完美結局</span></div>
      </section>

      <section className="collection-grid" aria-label="九大世界圖鑑">
        {campaignMissions.map((mission) => {
          const completed = completedMissions.includes(mission.id)
          const ending = missionEndings[mission.id]
          return (
            <article
              key={mission.id}
              className={`collection-card${completed ? ' is-collected' : ''}`}
            >
              <span className="collection-icon" aria-hidden="true">
                {completed ? mission.icon : '❓'}
              </span>
              <strong>{mission.shortTitle}</strong>
              <small>{mission.sdgs}</small>
              <span className="collection-status">
                {ending === 'perfect'
                  ? '⭐ 完美結局'
                  : completed
                    ? '✅ 已完成'
                    : '待挑戰'}
              </span>
            </article>
          )
        })}
      </section>

      <section className="collection-actions-log" aria-label="我幫地球做了什麼">
        <h2>我幫地球做了什麼</h2>
        {completedCount === 0 ? (
          <p>完成第一個任務後，這裡會記下你為地球做的每一件事。</p>
        ) : (
          <ul>
            {campaignMissions
              .filter((mission) => completedMissions.includes(mission.id))
              .map((mission) => (
                <li key={mission.id}>{actionLineByMission[mission.id]}</li>
              ))}
          </ul>
        )}
        <p className="panel-note">完美結局的世界會亮出 ⭐——再挑戰一次，把每個世界都變成完美結局吧！</p>
      </section>
    </main>
  )
}
