import { create } from 'zustand'
import type { LearningEvent } from '../learning/events'

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
  setScreen: (screen: GameScreen) => void
  setMode: (mode: LearningMode) => void
  recordLearningEvents: (events: LearningEvent[]) => void
  clearLearningEvents: () => void
}

export const useGameStore = create<GameStore>((set) => ({
  screen: 'start',
  mode: 'middle-assist',
  learningEvents: [],
  setScreen: (screen) => set({ screen }),
  setMode: (mode) => set({ mode }),
  recordLearningEvents: (events) =>
    set((state) => ({ learningEvents: [...state.learningEvents, ...events] })),
  clearLearningEvents: () => set({ learningEvents: [] }),
}))
