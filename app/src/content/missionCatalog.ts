export type CampaignMissionId =
  | 'recycling-storm'
  | 'water-guardian'
  | 'green-energy-community'
  | 'seed-forest'
  | 'food-rescue'
  | 'health-bubble'
  | 'safe-home'
  | 'ocean-blue'
  | 'earth-partners'

export interface CampaignMission {
  id: CampaignMissionId
  order: number
  title: string
  shortTitle: string
  sdgs: string
  icon: string
  story: string
  mechanic: string
  status: 'playable' | 'building'
  requires?: CampaignMissionId
}

export const campaignMissions: readonly CampaignMission[] = [
  {
    id: 'recycling-storm',
    order: 1,
    title: '垃圾風暴救援行動',
    shortTitle: '垃圾風暴',
    sdgs: 'SDG 7・12・13',
    icon: '♻️',
    story: '回收站被混亂垃圾堵住了，快幫它重新運轉。',
    mechanic: '分類、能源選擇、撤離',
    status: 'playable',
  },
  {
    id: 'water-guardian',
    order: 2,
    title: '水滴守護行動',
    shortTitle: '水滴守護',
    sdgs: 'SDG 6・12',
    icon: '💧',
    story: '雨水站被落葉和泥沙堵住，乾淨的水流不出來。',
    mechanic: '收集、過濾、分配',
    status: 'playable',
    requires: 'recycling-storm',
  },
  {
    id: 'green-energy-community',
    order: 3,
    title: '綠能社區行動',
    shortTitle: '綠能社區',
    sdgs: 'SDG 7・11・13',
    icon: '☀️',
    story: '白天的陽光沒有存好，晚上社區卻需要電。',
    mechanic: '天氣判讀、儲能排程',
    status: 'playable',
    requires: 'water-guardian',
  },
  {
    id: 'seed-forest',
    order: 4,
    title: '種子森林行動',
    shortTitle: '種子森林',
    sdgs: 'SDG 13・15',
    icon: '🌱',
    story: '土壤變硬，小樹苗找不到安全的家。',
    mechanic: '土壤觀察、棲地修復',
    status: 'playable',
    requires: 'green-energy-community',
  },
  {
    id: 'food-rescue',
    order: 5,
    title: '食物救援行動',
    shortTitle: '食物救援',
    sdgs: 'SDG 2・3・12',
    icon: '🥕',
    story: '配送站的保存箱失去平衡，食物可能被浪費。',
    mechanic: '保存、分配、營養選擇',
    status: 'playable',
    requires: 'seed-forest',
  },
  {
    id: 'health-bubble',
    order: 6,
    title: '健康泡泡行動',
    shortTitle: '健康泡泡',
    sdgs: 'SDG 3・6',
    icon: '🫧',
    story: '校園水站和清潔站需要重新啟動。',
    mechanic: '衛生判斷、補給路線',
    status: 'playable',
    requires: 'food-rescue',
  },
  {
    id: 'safe-home',
    order: 7,
    title: '安心家園行動',
    shortTitle: '安心家園',
    sdgs: 'SDG 9・11・13',
    icon: '🏠',
    story: '暴雨後的社區需要安全通道和避難準備。',
    mechanic: '防災建造、撤離規劃',
    status: 'playable',
    requires: 'health-bubble',
  },
  {
    id: 'ocean-blue',
    order: 8,
    title: '海洋藍光行動',
    shortTitle: '海洋藍光',
    sdgs: 'SDG 12・14',
    icon: '🐋',
    story: '海岸潮池被漂流物覆蓋，海洋生物需要幫忙。',
    mechanic: '潮汐判讀、海廢回收',
    status: 'playable',
    requires: 'safe-home',
  },
  {
    id: 'earth-partners',
    order: 9,
    title: '地球夥伴總動員',
    shortTitle: '夥伴總動員',
    sdgs: 'SDG 4・5・10・16・17',
    icon: '🤝',
    story: '九個世界的資料需要一起校正，才能讓平衡星核回到地球。',
    mechanic: '資料整合、合作分工',
    status: 'playable',
    requires: 'ocean-blue',
  },
]

export function isMissionUnlocked(
  mission: CampaignMission,
  completedMissions: readonly string[],
): boolean {
  return !mission.requires || completedMissions.includes(mission.requires)
}
