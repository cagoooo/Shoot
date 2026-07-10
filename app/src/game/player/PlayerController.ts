export interface Position2D {
  x: number
  z: number
}

export interface MoveInput {
  moveX: number
  moveY: number
}

export interface MovableCamera {
  position: Position2D
  rotation: { y: number }
}

export function integrateMovement(
  position: Position2D,
  input: MoveInput,
  deltaSeconds: number,
  speed: number,
  yaw: number,
): Position2D {
  const inputLength = Math.hypot(input.moveX, input.moveY)
  const scale = inputLength > 1 ? 1 / inputLength : 1
  const localX = input.moveX * scale
  const localZ = input.moveY * scale
  const distance = Math.max(0, deltaSeconds) * speed

  return {
    x:
      position.x +
      (localX * Math.cos(yaw) + localZ * Math.sin(yaw)) * distance,
    z:
      position.z +
      (localZ * Math.cos(yaw) - localX * Math.sin(yaw)) * distance,
  }
}

export function simulateMovement({
  fps,
  seconds,
  speed,
}: {
  fps: number
  seconds: number
  speed: number
}): Position2D {
  let position: Position2D = { x: 0, z: 0 }
  const frameCount = Math.round(fps * seconds)

  for (let frame = 0; frame < frameCount; frame += 1) {
    position = integrateMovement(
      position,
      { moveX: 0, moveY: 1 },
      1 / fps,
      speed,
      0,
    )
  }

  return position
}

export function stepPlayerCamera(
  camera: MovableCamera,
  input: MoveInput,
  deltaSeconds: number,
  speed: number,
): void {
  const next = integrateMovement(
    camera.position,
    input,
    deltaSeconds,
    speed,
    camera.rotation.y,
  )
  camera.position.x = next.x
  camera.position.z = next.z
}
