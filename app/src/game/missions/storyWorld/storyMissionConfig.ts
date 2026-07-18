import type { CampaignMissionId } from '../../../content/missionCatalog'
import type { LearningEvent } from '../../../learning/events'

export type StoryMissionId = Exclude<
  CampaignMissionId,
  'recycling-storm' | 'water-guardian' | 'green-energy-community'
>

export interface StoryChoice {
  id: string
  title: string
  description: string
}

export interface StoryStep {
  title: string
  description: string
  choices: readonly StoryChoice[]
  requiredChoices: number
  /** 'sequence' 代表要依 choices 的排列順序逐一選取；預設為多選（requiredChoices 為 1 時即為判斷題）。 */
  kind?: 'multi-select' | 'sequence'
  /** 這一步在 3D 世界中的觀察地點；未指定時使用世界地標（0, 7）。 */
  position?: { x: number; z: number }
  /** 引導角色在這一步說的話。 */
  dialogue?: string
  /** 這一步 3D 目標上方的漂浮圖示；未指定時使用世界圖示。 */
  objectiveIcon?: string
  /** 科學資料判讀卡：以長條圖呈現數據，幫助學生用資料做決定。 */
  dataCard?: {
    title: string
    note?: string
    bars: ReadonlyArray<{ label: string; value: number; unit: string }>
  }
}

export interface StoryMissionConfig {
  id: StoryMissionId
  title: string
  sdgs: string
  chapter: number
  icon: string
  intro: string
  conclusion: string
  color: string
  landmark: 'forest' | 'food' | 'health' | 'home' | 'ocean' | 'partners'
  /** 這個世界的引導角色（voice 為朗讀聲線：pitch 音高、rate 語速）。 */
  guide: { name: string; icon: string; voice: { pitch: number; rate: number } }
  /** 分支結局：一次都沒選錯是 perfect，途中有選錯是 learned。 */
  endings: { perfect: string; learned: string }
  steps: readonly [StoryStep, StoryStep, StoryStep]
  events: readonly LearningEvent[]
}

export const storyMissions: readonly StoryMissionConfig[] = [
  {
    id: 'seed-forest', title: '種子森林行動', sdgs: 'SDG 13・15', chapter: 4, icon: '🌱',
    intro: '土壤變硬，幼苗找不到安全的地方生根。請修復森林的呼吸角落。', conclusion: '種子森林重新有了可以長大的家。', color: '#77a96e', landmark: 'forest',
    guide: { voice: { pitch: 1.3, rate: 1 }, name: '森林嚮導苗苗', icon: '🌳' },
    endings: { perfect: '你一次就把森林照顧對了！幼苗們在最鬆軟的土裡安心長大。', learned: '雖然中間試了幾次，但你把每個錯誤都變成森林筆記，幼苗一樣長大了。' },
    steps: [
      { title: '觀察土壤', description: '走到硬土觀察區，找出讓土壤恢復鬆軟的方法。', requiredChoices: 2, position: { x: -7, z: 4 }, dialogue: '你摸摸看，這裡的土硬得像石頭，雨水都流走了。想想什麼能讓土壤重新呼吸？', choices: [{ id: 'leaves', title: '鋪上落葉', description: '讓土壤保有水分。' }, { id: 'compost', title: '加入堆肥', description: '補充有機養分。' }, { id: 'plastic', title: '鋪滿塑膠片', description: '會讓雨水更難進入土壤。' }] },
      { title: '種植的順序', description: '在育苗棚照正確順序種下種子，順序錯了種子會長不好。', requiredChoices: 3, kind: 'sequence', position: { x: 0, z: 7 }, dialogue: '種樹跟蓋房子一樣要照步驟來。你先想想：種子最需要的第一件事是什麼？', choices: [{ id: 'loosen', title: '鬆開土壤', description: '先讓空氣和水能進入土裡。' }, { id: 'seed', title: '放入種子', description: '種子要接觸鬆軟的土才容易發芽。' }, { id: 'mulch', title: '鋪落葉並澆水', description: '最後保濕，保護剛種下的種子。' }] },
      { title: '守護幼苗', description: '走到幼苗區，安排兩個長大後能幫助森林的行動。', requiredChoices: 2, position: { x: 7, z: 4 }, dialogue: '小樹苗種下去只是開始，之後的照顧才是真正的守護喔。', choices: [{ id: 'observe', title: '定期觀察', description: '記錄幼苗的變化。' }, { id: 'native', title: '種原生植物', description: '幫助在地生物。' }, { id: 'waste', title: '留下垃圾', description: '會傷害棲地。' }] },
    ],
    events: [{ type: 'machine-repaired', id: 'soil-breathing-station' }, { type: 'protected-target', id: 'forest-seedlings' }, { type: 'part-selected', partId: 'seed-launcher-kit' }, { type: 'energy-used', amount: 20 }],
  },
  {
    id: 'food-rescue', title: '食物救援行動', sdgs: 'SDG 2・3・12', chapter: 5, icon: '🥕',
    intro: '配送站的保存箱失去平衡，食物可能在送到需要的人手上前就被浪費。', conclusion: '食物被好好保存，也送到了需要的地方。', color: '#d8914d', landmark: 'food',
    guide: { voice: { pitch: 1.1, rate: 1.05 }, name: '配送隊長飽飽', icon: '🍱' },
    endings: { perfect: '一份食物都沒有浪費！配送站把新鮮直接送到了大家手上。', learned: '有幾箱食物差點放錯位置，還好你及時修正，大家都吃到了新鮮餐點。' },
    steps: [
      { title: '分類保存', description: '走到保存箱旁，選出兩種能延長食物新鮮度的方法。', requiredChoices: 2, position: { x: -7, z: 4 }, dialogue: '這批食物再不處理就要壞掉了！幫我想想怎麼讓它們保持新鮮。', choices: [{ id: 'cool', title: '放入冷藏箱', description: '適合需要低溫保存的食物。' }, { id: 'label', title: '標示日期', description: '先使用快到期的食物。' }, { id: 'sun', title: '放在陽光下', description: '容易讓食物變質。' }] },
      { title: '出餐的順序', description: '在配送台照正確順序處理食物，才不會有食物被放到壞掉。', requiredChoices: 3, kind: 'sequence', position: { x: 0, z: 7 }, dialogue: '配送最怕手忙腳亂。記住我們隊的口訣：先看日期、快壞先送、剩的收好！', choices: [{ id: 'check', title: '檢查保存期限', description: '先知道哪些食物快到期。' }, { id: 'use-first', title: '先送出快到期的', description: '讓食物在變質前被吃掉。' }, { id: 'store-rest', title: '其餘冷藏保存', description: '最後把剩下的食物妥善收好。' }] },
      { title: '減少浪費', description: '走到分享站，選兩個送出食物前的好做法。', requiredChoices: 2, position: { x: 7, z: 4 }, dialogue: '分享站是我最喜歡的地方——多的食物在這裡會找到新主人，不會被丟掉。', choices: [{ id: 'share', title: '分享多出的食物', description: '讓資源被好好使用。' }, { id: 'portion', title: '準備剛好的份量', description: '減少吃不完。' }, { id: 'discard', title: '先丟掉再說', description: '會增加浪費。' }] },
    ],
    events: [{ type: 'machine-repaired', id: 'food-storage-station' }, { type: 'protected-target', id: 'community-meal-box' }, { type: 'part-selected', partId: 'freshness-scanner-kit' }, { type: 'energy-used', amount: 26 }],
  },
  {
    id: 'health-bubble', title: '健康泡泡行動', sdgs: 'SDG 3・6', chapter: 6, icon: '🫧',
    intro: '校園水站和清潔站需要重新啟動，健康泡泡正在慢慢消失。', conclusion: '健康泡泡回來了，大家都能安心使用校園空間。', color: '#70b8c1', landmark: 'health',
    guide: { voice: { pitch: 1.25, rate: 0.95 }, name: '保健員小澄', icon: '🫧' },
    endings: { perfect: '洗手順序全對！健康泡泡閃著最亮的光守護校園。', learned: '泡泡消失了幾顆又被你救回來，校園最後還是安心地亮了起來。' },
    steps: [
      { title: '洗手的順序', description: '走到洗手台旁，照正確順序完成洗手，健康泡泡才會亮起來。', requiredChoices: 3, kind: 'sequence', position: { x: -7, z: 4 }, dialogue: '洗手是有魔法順序的！做對順序，泡泡才能把細菌統統帶走。', choices: [{ id: 'wet-soap', title: '淋濕雙手抹肥皂', description: '先讓泡泡容易搓出來。' }, { id: 'rub', title: '仔細搓洗二十秒', description: '指縫、手背和指甲都要搓到。' }, { id: 'rinse-dry', title: '沖乾淨並擦乾', description: '最後帶走髒污，保持乾爽。' }] },
      { title: '照顧水站', description: '走到飲水站旁，選出兩個讓飲水更安心的做法。', requiredChoices: 2, position: { x: 7, z: 4 }, dialogue: '飲水站是大家共用的，每個人多做一點，水就能一直乾淨下去。', choices: [{ id: 'clean', title: '保持出水口清潔', description: '減少髒污停留。' }, { id: 'bottle', title: '使用乾淨水壺', description: '保護自己也保護水站。' }, { id: 'sharecup', title: '共用同一個杯子', description: '不衛生。' }] },
      { title: '健康提醒', description: '回到健康泡泡站，選兩個能照顧同學的行動。', requiredChoices: 2, position: { x: 0, z: 7 }, dialogue: '照顧健康不只是照顧自己——會關心同學的人，是保健室最棒的小幫手。', choices: [{ id: 'rest', title: '不舒服時休息', description: '讓身體有恢復時間。' }, { id: 'tell', title: '告訴可信任的大人', description: '需要時可以得到協助。' }, { id: 'hide', title: '一直忍耐不說', description: '可能錯過需要的幫忙。' }] },
    ],
    events: [{ type: 'machine-repaired', id: 'health-station' }, { type: 'protected-target', id: 'school-water-station' }, { type: 'part-selected', partId: 'health-bubble-kit' }, { type: 'energy-used', amount: 18 }],
  },
  {
    id: 'safe-home', title: '安心家園行動', sdgs: 'SDG 9・11・13', chapter: 7, icon: '🏠',
    intro: '暴雨後的社區需要安全通道與避難準備，大家正在等守護隊的工程方案。', conclusion: '安全通道完成了，社區有了更安心的準備。', color: '#b0836e', landmark: 'home',
    guide: { voice: { pitch: 0.75, rate: 0.88 }, name: '工程師阿磚', icon: '👷' },
    endings: { perfect: '工程一次到位！社區的避難路線又快又安全。', learned: '有些步驟重排了幾次，但你堅持檢查到對為止，社區因此更安全。' },
    steps: [
      { title: '觀察天氣', description: '走到社區中心，看看雨量預報圖，再選兩個暴雨前值得先注意的資料。', requiredChoices: 2, position: { x: 0, z: 7 }, dialogue: '好工程從看資料開始。看看這張雨量圖：哪一天最需要提前準備？', dataCard: { title: '未來三天雨量預報', note: '長條越長代表雨量越多；明天的雨量最大，要提前準備。', bars: [{ label: '今天', value: 30, unit: 'mm' }, { label: '明天', value: 120, unit: 'mm' }, { label: '後天', value: 45, unit: 'mm' }] }, choices: [{ id: 'rain', title: '雨量預報', description: '知道可能下多少雨。' }, { id: 'warning', title: '警報訊息', description: '了解是否需要準備。' }, { id: 'rumor', title: '未確認傳言', description: '不應當作防災依據。' }] },
      { title: '通道工程的順序', description: '走到排水口旁，照正確順序完成通道工程，社區才真正安全。', requiredChoices: 3, kind: 'sequence', position: { x: -7, z: 4 }, dialogue: '工程有工程的規矩：先解決水、再指路、最後一定要自己走一遍檢查！', choices: [{ id: 'drain', title: '清理排水口', description: '先減少積水，路才不會被淹。' }, { id: 'sign', title: '設置明顯標示', description: '再讓大家知道安全方向。' }, { id: 'practice', title: '實際演練走一次', description: '最後確認路線真的可行。' }] },
      { title: '準備避難包', description: '走到安全標示牌旁，選兩種真正能幫助撤離的物品。', requiredChoices: 2, position: { x: 7, z: 4 }, dialogue: '避難包不是越大越好，帶真正需要的東西，跑起來才快。', choices: [{ id: 'water', title: '飲用水', description: '維持基本需要。' }, { id: 'light', title: '手電筒', description: '停電時能照明。' }, { id: 'toy', title: '大型玩具箱', description: '會增加負擔。' }] },
    ],
    events: [{ type: 'machine-repaired', id: 'resilience-route' }, { type: 'protected-target', id: 'community-shelter' }, { type: 'part-selected', partId: 'safety-beacon-kit' }, { type: 'energy-used', amount: 30 }],
  },
  {
    id: 'ocean-blue', title: '海洋藍光行動', sdgs: 'SDG 12・14', chapter: 8, icon: '🐋',
    intro: '海岸潮池被漂流物覆蓋，海洋生物的藍光訊號快被遮住了。', conclusion: '潮池重新閃著藍光，海洋朋友有了安全的家。', color: '#4f91bb', landmark: 'ocean',
    guide: { voice: { pitch: 1.15, rate: 0.85 }, name: '研究員小汐', icon: '🌊' },
    endings: { perfect: '你的判斷全對！潮池的朋友們一隻也沒受到打擾。', learned: '有一次差點選錯——潮池生物差點少了朋友，還好你重新想過，牠們都平安。' },
    steps: [
      { title: '潮汐安全判斷', description: '走到左邊的潮池旁。小汐考考你：什麼時候靠近潮池觀察最安全？只有一個最好的答案。', requiredChoices: 1, position: { x: -7, z: 4 }, dialogue: '在海邊做研究，第一課永遠是安全。想一想：海水什麼時候最溫和？', choices: [{ id: 'low-tide', title: '退潮時和大人一起', description: '退潮水位低，加上大人陪同最安全。' }, { id: 'high-tide', title: '漲潮時自己去', description: '海水上漲會蓋過步道，很危險。' }, { id: 'storm', title: '大浪的日子去', description: '大浪可能把人捲進海裡。' }] },
      { title: '回收海廢', description: '走到漂流物堆旁，選兩種需要優先帶走的漂流物。', requiredChoices: 2, position: { x: 7, z: 4 }, dialogue: '注意！不是潮池裡的東西都要撿——先分清楚哪些是垃圾、哪些是生物的家。', choices: [{ id: 'bottle', title: '塑膠瓶', description: '可能碎成微小塑膠。' }, { id: 'net', title: '廢棄漁網', description: '可能纏住生物。' }, { id: 'shell', title: '活的貝殼', description: '是潮池生物的家。' }] },
      { title: '守護海洋', description: '回到大潮池訊號站，選兩個能讓海洋更乾淨的生活行動。', requiredChoices: 2, position: { x: 0, z: 7 }, dialogue: '你知道嗎？離海很遠的地方丟的垃圾，最後也可能流進海裡。守護海洋從陸地開始。', choices: [{ id: 'reusable', title: '使用可重複用品', description: '減少一次性塑膠。' }, { id: 'sort', title: '做好回收分類', description: '讓資源被再利用。' }, { id: 'litter', title: '把垃圾留在沙灘', description: '會回到海洋裡。' }] },
    ],
    events: [{ type: 'machine-repaired', id: 'tide-pool-signal' }, { type: 'protected-target', id: 'ocean-habitat' }, { type: 'part-selected', partId: 'ocean-magnet-kit' }, { type: 'material-recycled', category: 'ocean-waste', amount: 3 }, { type: 'energy-used', amount: 24 }],
  },
  {
    id: 'earth-partners', title: '地球夥伴總動員', sdgs: 'SDG 4・5・10・16・17', chapter: 9, icon: '🤝',
    intro: '九個世界的資料終於集齊，但平衡星核需要大家公平合作才能重新啟動。', conclusion: '平衡星核亮起來了，地球守護隊也知道合作能讓改變更長久。', color: '#956fba', landmark: 'partners',
    guide: { voice: { pitch: 1, rate: 0.92 }, name: '星核管理員和和', icon: '⭐' },
    endings: { perfect: '星核第一次就聽懂了大家的聲音，光芒特別穩定。', learned: '合作本來就需要練習，星核在你們一次次的嘗試中亮了起來。' },
    steps: [
      { title: '聽見每個人的資料', description: '走到左邊的討論桌，選兩個合作時需要做到的行動。', requiredChoices: 2, position: { x: -7, z: 4 }, dialogue: '星核聽得懂九個世界的聲音，因為它從不打斷任何一個。我們也來練習吧。', choices: [{ id: 'listen', title: '輪流聆聽', description: '每個人的發現都很重要。' }, { id: 'evidence', title: '拿出觀察證據', description: '用資料一起做決定。' }, { id: 'interrupt', title: '一直打斷別人', description: '會讓合作變困難。' }] },
      { title: '合作情境判斷', description: '走到右邊的討論桌。和和考考你：小組裡有人一直沒發言，最好的做法是什麼？只有一個最好的答案。', requiredChoices: 1, position: { x: 7, z: 4 }, dialogue: '公平不是大家都做一樣的事，而是每個人都有機會發光。你會怎麼做？', choices: [{ id: 'invite', title: '邀請他分享想法', description: '每個人的想法都珍貴，先聽聽看。' }, { id: 'decide-for', title: '直接幫他決定', description: '那樣就不是他真正的想法了。' }, { id: 'skip', title: '跳過他繼續討論', description: '會讓夥伴被排除在外。' }] },
      { title: '啟動星核', description: '走到中央的平衡星核，選兩個能持續守護地球的合作行動。', requiredChoices: 2, position: { x: 0, z: 7 }, dialogue: '星核的光不是一個人點亮的。選出能讓大家一直合作下去的方法吧！', choices: [{ id: 'share', title: '分享好方法', description: '讓更多人一起做。' }, { id: 'review', title: '一起檢查改良', description: '看見成果也找出下一步。' }, { id: 'blame', title: '互相責怪', description: '不能解決問題。' }] },
    ],
    events: [{ type: 'machine-repaired', id: 'planet-balance-core' }, { type: 'protected-target', id: 'earth-partnership' }, { type: 'part-selected', partId: 'partner-link-kit' }, { type: 'energy-used', amount: 36 }],
  },
]

export function getStoryMission(id: CampaignMissionId): StoryMissionConfig | undefined {
  return storyMissions.find((mission) => mission.id === id)
}
