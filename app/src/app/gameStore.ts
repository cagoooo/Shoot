import { create } from 'zustand'
import type { LearningEvent } from '../learning/events'
import {
  DEFAULT_COMFORT_SETTINGS,
  type ComfortSettings,
} from '../domain/settings/accessibility'

export type GameScreen =
  | 'start'
  | 'base'
  | 'workbench'
  | 'range'
  | 'mission'
  | 'report'

export type LearningMode = 'middle-assist' | 'upper-standard'

interface GameStore {
  screen: GameScreen
  mode: LearningMode
  learningEvents: LearningEvent[]
  comfortSettings: ComfortSettings
  setScreen: (screen: GameScreen) => void
  setMode: (mode: LearningMode) => void
  recordLearningEvents: (events: LearningEvent[]) => void
  clearLearningEvents: () => void
  setComfortSettings: (settings: ComfortSettings) => void
}

export const useGameStore = create<GameStore>((set) => ({
  screen: 'start',
  mode: 'middle-assist',
  learningEvents: [],
  comfortSettings: DEFAULT_COMFORT_SETTINGS,
  setScreen: (screen) => set({ screen }),
  setMode: (mode) => set({ mode }),
  recordLearningEvents: (events) =>
    set((state) => ({ learningEvents: [...state.learningEvents, ...events] })),
  clearLearningEvents: () => set({ learningEvents: [] }),
  setComfortSettings: (comfortSettings) => set({ comfortSettings }),
}))
