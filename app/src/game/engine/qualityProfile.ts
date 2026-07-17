export type QualityProfile = 'low' | 'medium' | 'high'

export interface PerformanceSample {
  averageFps: number
  deviceMemory?: number
}

import type { QualityMode } from '../../domain/settings/accessibility'

export interface QualityModeResolution {
  /** 硬體縮放：越大解析度越低、越省電。 */
  hardwareScaling: number
  /** 是否允許持續低 FPS 時自動再降級。 */
  autoDegrade: boolean
}

export function resolveQualityMode(mode: QualityMode): QualityModeResolution {
  switch (mode) {
    case 'saver':
      return { hardwareScaling: 1.8, autoDegrade: true }
    case 'fine':
      return { hardwareScaling: 1, autoDegrade: false }
    default:
      return { hardwareScaling: 1, autoDegrade: true }
  }
}

export function selectQualityProfile(
  sample: PerformanceSample,
): QualityProfile {
  if (sample.averageFps < 28 || (sample.deviceMemory ?? 4) <= 2) {
    return 'low'
  }
  if (sample.averageFps < 55 || (sample.deviceMemory ?? 4) <= 4) {
    return 'medium'
  }
  return 'high'
}
