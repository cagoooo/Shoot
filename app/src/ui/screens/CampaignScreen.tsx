import type { MissionId } from '../../app/gameStore'
import { campaignMissions, isMissionUnlocked } from '../../content/missionCatalog'

interface CampaignScreenProps {
  completedMissions: string[]
  onBack: () => void
  onMissionSelect: (mission: MissionId) => void
}

export function CampaignScreen({
  completedMissions,
  onBack,
  onMissionSelect,
}: CampaignScreenProps) {
  return (
    <main className="campaign-screen">
      <header className="campaign-header">
        <button className="text-button" type="button" onClick={onBack}>← 回基地</button>
        <div>
          <p className="eyebrow">九大世界・SDGs 永續冒險</p>
          <h1>地球行動地圖</h1>
          <p>每完成一關，就讓平衡星核找回一種守護地球的方法。</p>
        </div>
      </header>

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
