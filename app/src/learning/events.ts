export type LearningEvent =
  | { type: 'part-selected'; partId: string }
  | { type: 'energy-used'; amount: number }
  | { type: 'material-recycled'; category: string; amount: number }
  | { type: 'machine-repaired'; id: string }
  | { type: 'protected-target'; id: string }
  | { type: 'reflection-chosen'; choice: string }
  | { type: 'enemy-cleansed'; amount: number }
  | { type: 'energy-mode'; mode: 'fast-full' | 'slow-saving' | 'zoned' }
  | { type: 'route-chosen'; route: 'main-route' | 'maintenance-route' }
  | { type: 'mission-ending'; missionId: string; ending: 'perfect' | 'learned'; summary: string }

export interface LearningReport {
  energyUsed: number
  recycledByCategory: Record<string, number>
  repairedMachines: string[]
  protectedTargets: string[]
  selectedParts: string[]
  reflections: string[]
  enemiesCleansed: number
  energyModes: Array<'fast-full' | 'slow-saving' | 'zoned'>
  routes: Array<'main-route' | 'maintenance-route'>
  endings: string[]
  /** 本次紀錄中拿到完美結局的次數（金卡判定用）。 */
  perfectEndings: number
}
