export type WasteBin = 'paper' | 'plastic' | 'metal' | 'general'

export interface SortingItem {
  id: string
  name: string
  correctBin: WasteBin
  hint: string
  learning: string
}

const sortingChallenge: readonly SortingItem[] = [
  {
    id: 'drink-bottle',
    name: '飲料塑膠瓶',
    correctBin: 'plastic',
    hint: '摸摸看：瓶身有彈性，而且可以洗乾淨再利用。',
    learning: '清空、沖洗、壓扁後再回收。',
  },
  {
    id: 'clean-cardboard',
    name: '乾淨紙盒',
    correctBin: 'paper',
    hint: '看看纖維：乾淨紙材可以重新做成紙製品。',
    learning: '先拆開、壓平，保持乾燥。',
  },
  {
    id: 'aluminum-can',
    name: '鋁罐',
    correctBin: 'metal',
    hint: '輕輕敲：它會發出金屬聲，而且能重複熔製。',
    learning: '清空內容物後放入金屬回收。',
  },
  {
    id: 'used-tissue',
    name: '使用過的衛生紙',
    correctBin: 'general',
    hint: '被弄髒的短纖維紙，已經不適合重新製紙。',
    learning: '減少抽取張數，比勉強回收更有幫助。',
  },
]

export function createSortingChallenge(): SortingItem[] {
  return sortingChallenge.map((item) => ({ ...item }))
}

export function classifyWaste(item: SortingItem, bin: WasteBin) {
  return bin === item.correctBin
    ? { correct: true, hint: item.learning }
    : { correct: false, hint: item.hint }
}

export type EvacuationItem =
  | 'first-aid-kit'
  | 'repair-notes'
  | 'water'
  | 'heavy-scrap'

export function evaluateEvacuationBag(items: readonly EvacuationItem[]): {
  ready: boolean
  reason: string
} {
  if (items.length > 3) {
    return { ready: false, reason: '最多選三件重要物品' }
  }
  if (!items.includes('first-aid-kit')) {
    return { ready: false, reason: '請帶上安全急救包' }
  }
  return { ready: true, reason: '準備完成，可以前往屋頂撤離' }
}
