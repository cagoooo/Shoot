export interface ObjectiveTracking {
  near: boolean
  /** 與目標的水平距離（公尺，約等於遊戲中一步）。 */
  distance: number
  /** 目標相對於目前視角的方向（度，-180 到 180，0 代表正前方）。 */
  bearing: number
}

interface CameraPose {
  x: number
  z: number
  /** 相機 yaw（弧度），0 代表面向 +z。 */
  yaw: number
}

export function computeObjectiveTracking(
  camera: CameraPose,
  objective: { x: number; z: number },
  nearRadius: number,
): ObjectiveTracking {
  const dx = objective.x - camera.x
  const dz = objective.z - camera.z
  const distance = Math.hypot(dx, dz)
  const worldAngle = Math.atan2(dx, dz)
  let bearing = ((worldAngle - camera.yaw) * 180) / Math.PI
  while (bearing > 180) bearing -= 360
  while (bearing < -180) bearing += 360
  return { near: distance <= nearRadius, distance, bearing }
}

/**
 * 包一層節流：只有在「靠近狀態改變」「距離差超過半步」或
 * 「方向差超過 5 度」時才通知，避免每一幀觸發 React 重繪。
 */
export function createTrackingEmitter(
  onTracking?: (tracking: ObjectiveTracking) => void,
): (tracking: ObjectiveTracking) => void {
  let last: ObjectiveTracking | undefined
  return (tracking) => {
    if (!onTracking) return
    if (
      last &&
      last.near === tracking.near &&
      Math.abs(last.distance - tracking.distance) < 0.5 &&
      Math.abs(last.bearing - tracking.bearing) < 5
    ) {
      return
    }
    last = tracking
    onTracking(tracking)
  }
}
