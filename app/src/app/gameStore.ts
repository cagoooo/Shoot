import { create } from 'zustand'
import type { LearningEvent } from '../learning/events'
import type { CampaignMissionId } from '../content/missionCatalog'
import type { ComfortSettings } from '../domain/settings/accessibility'
import {
  loadComfortSettings,
  saveComfortSettings,
} from '../domain/settings/settingsStorage'

export type GameScreen =
  | 'start'
  | 'base'
  | 'workbench'
  | 'range'
  | 'mission'
  | 'report'
  | 'campaign'
  | 'collection'
  | 'teacher'

export type LearningMode = 'middle-assist' | 'upper-standard'
export type MissionId = CampaignMissionId

interface GameStore {
  screen: GameScreen
  mode: LearningMode
  activeMission: MissionId
  learningEvents: LearningEvent[]
  comfortSettings: ComfortSettings
  /** 每次「進入任務」遞增，觸發俯衝進世界轉場。 */
  diveNonce: number
  setScreen: (screen: GameScreen) => void
  setMode: (mode: LearningMode) => void
  setActiveMission: (mission: MissionId) => void
  triggerDive: () => void
  recordLearningEvents: (events: LearningEvent[]) => void
  clearLearningEvents: () => void
  setComfortSettings: (settings: ComfortSettings) => void
}

export const useGameStore = create<GameStore>((set) => ({
  screen: 'start',
  mode: 'middle-assist',
  activeMission: 'recycling-storm',
  learningEvents: [],
  comfortSettings: loadComfortSettings(),
  diveNonce: 0,
  setScreen: (screen) => set({ screen }),
  setMode: (mode) => set({ mode }),
  setActiveMission: (activeMission) => set({ activeMission }),
  triggerDive: () => set((state) => ({ diveNonce: state.diveNonce + 1 })),
  recordLearningEvents: (events) =>
    set((state) => ({ learningEvents: [...state.learningEvents, ...events] })),
  clearLearningEvents: () => set({ learningEvents: [] }),
  setComfortSettings: (comfortSettings) => {
    saveComfortSettings(comfortSettings)
    set({ comfortSettings })
  },
}))
