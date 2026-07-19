import { campaignMissions } from '../../content/missionCatalog'

export interface WeeklyQuest {
  /** 本週重點世界的關卡 id。 */
  missionId: string
  missionTitle: string
  missionIcon: string
  /** 一句生活行動挑戰。 */
  action: string
  /** ISO 週序（給顯示與比對用）。 */
  weekKey: string
}

const lifeActions = [
  '這週試著自己帶水壺，少用一次性瓶裝水。',
  '這週把回收確實分類，記錄你回收了幾樣東西。',
  '這週隨手關燈與拔插頭，幫家裡省一點電。',
  '這週吃飯時裝剛好的份量，不留廚餘。',
  '這週用完水記得關緊水龍頭，珍惜每一滴水。',
  '這週走路或搭大眾運輸一次，少一趟開車。',
  '這週把還能用的東西送人或重複使用，不急著丟。',
  '這週觀察一種校園或社區的植物或小動物，記下牠需要什麼。',
  '這週對同學或家人說一次謝謝，一起把好習慣傳出去。',
]

/** 以年份與 ISO 週數算出穩定的週序字串，例如 2026-W29。 */
export function isoWeekKey(date: Date): string {
  const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNumber = (target.getUTCDay() + 6) % 7
  target.setUTCDate(target.getUTCDate() - dayNumber + 3)
  const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4))
  const week =
    1 +
    Math.round(
      ((target.getTime() - firstThursday.getTime()) / 86400000 -
        3 +
        ((firstThursday.getUTCDay() + 6) % 7)) /
        7,
    )
  return `${target.getUTCFullYear()}-W${String(week).padStart(2, '0')}`
}

function weekIndex(date: Date): number {
  const key = isoWeekKey(date)
  const week = Number(key.slice(key.indexOf('W') + 1))
  const year = Number(key.slice(0, 4))
  return year * 53 + week
}

/** 依日期輪換本週重點世界與生活行動挑戰。 */
export function getWeeklyQuest(date: Date = new Date()): WeeklyQuest {
  const index = weekIndex(date)
  const mission = campaignMissions[index % campaignMissions.length]
  const action = lifeActions[index % lifeActions.length]
  return {
    missionId: mission.id,
    missionTitle: mission.title,
    missionIcon: mission.icon,
    action,
    weekKey: isoWeekKey(date),
  }
}
