export interface IntroPose {
  x: number
  y: number
  z: number
  targetX: number
  targetY: number
  targetZ: number
}

const playedIntroKeys = new Set<string>()

/** 測試用：清除「已播放過開場」的紀錄。 */
export function resetPlayedIntros(): void {
  playedIntroKeys.clear()
}

/**
 * 進場開場鏡頭：環繞世界中心一圈介紹場景。
 * 同一個 key（任務）只播一次；減少動態、自動化測試或玩家輸入時直接跳過。
 */
export function createIntroOrbit(options: {
  key: string
  center: { x: number; z: number }
  radius?: number
  height?: number
  durationSeconds?: number
  disabled?: boolean
}): {
  update(deltaSeconds: number, cancelled: boolean): IntroPose | null
  consumeJustFinished(): boolean
} {
  const {
    key,
    center,
    radius = 15,
    height = 7,
    durationSeconds = 4,
    disabled = false,
  } = options

  let elapsed = 0
  let finished = disabled || playedIntroKeys.has(key)
  let justFinished = false
  if (!finished) playedIntroKeys.add(key)

  return {
    update(deltaSeconds, cancelled) {
      if (finished) return null
      if (cancelled || elapsed >= durationSeconds) {
        finished = true
        justFinished = true
        return null
      }
      elapsed += deltaSeconds
      const progress = Math.min(1, elapsed / durationSeconds)
      const angle = progress * Math.PI * 2
      return {
        x: center.x + Math.sin(angle) * radius,
        y: height,
        z: center.z + Math.cos(angle) * radius,
        targetX: center.x,
        targetY: 1.2,
        targetZ: center.z,
      }
    },
    consumeJustFinished() {
      const value = justFinished
      justFinished = false
      return value
    },
  }
}
