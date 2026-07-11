import type { LearningMode } from '../../app/gameStore'
import type { MissionState } from '../../domain/missions/missionState'

interface MissionGuideProps {
  phase: MissionState['phase']
  learningMode: LearningMode
}

const guideByPhase: Record<
  MissionState['phase'],
  { icon: string; now: string; next: string; learn: string }
> = {
  briefing: { icon: '📡', now: '先聽懂任務：回收站被垃圾風暴卡住了。', next: '按下「我看懂任務了」。', learn: '找出需要幫忙的環境問題。' },
  loadout: { icon: '🧩', now: '確認你帶著能量工具。', next: '按下「帶著能量工具出發」。', learn: '工具的每個零件都有用途。' },
  entrance: { icon: '🗺️', now: '選一條安全路線進入回收站。', next: '主路好懂；維修小路有更多觀察。', learn: '比較路線的好處與挑戰。' },
  'sorting-hall': { icon: '♻️', now: '看物品的提示，再放進正確回收桶。', next: '每答對一題，修復進度就會前進。', learn: '資源分類能減少浪費。' },
  'storm-machine': { icon: '⚡', now: '先淨化核心，再選擇能源方案。', next: '比較速度、耗能和修復成果。', learn: '能源選擇會改變結果。' },
  evacuation: { icon: '🎒', now: '帶走真正能幫助撤離的物品。', next: '選好後按下「開始安全撤離」。', learn: '危急時要分辨需要與想要。' },
  report: { icon: '🌍', now: '看看這次守護地球的成果。', next: '把一個發現帶回生活中試試看。', learn: 'SDG 7、12、13 可以從每天的小選擇開始。' },
}

export function MissionGuide({ phase, learningMode }: MissionGuideProps) {
  const guide = guideByPhase[phase]

  return (
    <aside className="mission-guide" aria-label="任務圖卡引導">
      <span className="mission-guide-icon" aria-hidden="true">{guide.icon}</span>
      <div>
        <strong>現在要做什麼？</strong>
        <p>{guide.now}</p>
      </div>
      {learningMode === 'middle-assist' && (
        <div className="mission-guide-next">
          <strong>下一步</strong>
          <p>{guide.next}</p>
        </div>
      )}
      <div className="mission-guide-learn">
        <strong>小小科學發現</strong>
        <p>{guide.learn}</p>
      </div>
    </aside>
  )
}
