import type { QualityProfile } from './qualityProfile'

export interface PerformanceMonitor {
  profile: QualityProfile
  lowFrameCount: number
  stableFrameCount: number
  downgradedInEpisode: boolean
}

export interface PerformanceDecision {
  profile: QualityProfile
  reason: 'stable' | 'sustained-low-fps'
}

const LOW_FPS_THRESHOLD = 28
const LOW_FRAME_LIMIT = 300
const RECOVERY_FRAME_LIMIT = 120

export function createPerformanceMonitor(profile: QualityProfile): PerformanceMonitor {
  return { profile, lowFrameCount: 0, stableFrameCount: 0, downgradedInEpisode: false }
}

function lowerQuality(profile: QualityProfile): QualityProfile {
  if (profile === 'high') return 'medium'
  if (profile === 'medium') return 'low'
  return 'low'
}

export function feedPerformanceSample(
  monitor: PerformanceMonitor,
  fps: number,
): PerformanceDecision {
  if (fps < LOW_FPS_THRESHOLD) {
    monitor.lowFrameCount += 1
    monitor.stableFrameCount = 0
  } else {
    monitor.lowFrameCount = 0
    monitor.stableFrameCount += 1
    if (monitor.stableFrameCount >= RECOVERY_FRAME_LIMIT) {
      monitor.downgradedInEpisode = false
    }
  }

  if (
    monitor.lowFrameCount >= LOW_FRAME_LIMIT &&
    !monitor.downgradedInEpisode &&
    monitor.profile !== 'low'
  ) {
    monitor.profile = lowerQuality(monitor.profile)
    monitor.downgradedInEpisode = true
    return { profile: monitor.profile, reason: 'sustained-low-fps' }
  }

  return { profile: monitor.profile, reason: 'stable' }
}

export function feedSamples(
  monitor: PerformanceMonitor,
  samples: number[],
): PerformanceDecision {
  let decision: PerformanceDecision = { profile: monitor.profile, reason: 'stable' }
  for (const fps of samples) {
    const next = feedPerformanceSample(monitor, fps)
    if (next.reason === 'sustained-low-fps') decision = next
    else decision = { ...decision, profile: next.profile }
  }
  return decision
}
