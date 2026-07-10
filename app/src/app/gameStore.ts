import { create } from 'zustand'

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
  setScreen: (screen: GameScreen) => void
  setMode: (mode: LearningMode) => void
}

export const useGameStore = create<GameStore>((set) => ({
  screen: 'start',
  mode: 'middle-assist',
  setScreen: (screen) => set({ screen }),
  setMode: (mode) => set({ mode }),
}))
