export type QualityProfile = 'low' | 'medium' | 'high'

export interface PerformanceSample {
  averageFps: number
  deviceMemory?: number
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
