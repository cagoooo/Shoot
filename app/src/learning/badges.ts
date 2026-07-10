import type { LearningReport } from './events'

export type LearningBadge =
  | 'energy-saver'
  | 'recycling-expert'
  | 'repair-helper'
  | 'safety-guardian'
  | 'design-improver'

export const badgeDetails: Record<
  LearningBadge,
  { name: string; reason: string; sdgs: number[] }
> = {
  'energy-saver': {
    name: '省電高手',
    reason: '使用較少能源完成設備修復',
    sdgs: [7, 13],
  },
  'recycling-expert': {
    name: '回收達人',
    reason: '正確整理多種可回收材料',
    sdgs: [11, 12],
  },
  'repair-helper': {
    name: '修理能手',
    reason: '找出問題並修好兩項設備',
    sdgs: [9, 12],
  },
  'safety-guardian': {
    name: '安全守護者',
    reason: '辨認並保護重要目標',
    sdgs: [3, 11],
  },
  'design-improver': {
    name: '改良小博士',
    reason: '根據結果提出下一次的改法',
    sdgs: [4, 9],
  },
}

export function calculateBadges(report: LearningReport): LearningBadge[] {
  const badges: LearningBadge[] = []
  const recycledTotal = Object.values(report.recycledByCategory).reduce(
    (sum, amount) => sum + amount,
    0,
  )

  if (
    report.energyUsed > 0 &&
    report.energyUsed <= 72 &&
    report.repairedMachines.length >= 1
  ) {
    badges.push('energy-saver')
  }
  if (
    recycledTotal >= 4 &&
    Object.keys(report.recycledByCategory).length >= 3
  ) {
    badges.push('recycling-expert')
  }
  if (report.repairedMachines.length >= 2) badges.push('repair-helper')
  if (report.protectedTargets.length >= 1) badges.push('safety-guardian')
  if (report.reflections.length >= 1) badges.push('design-improver')
  return badges
}
