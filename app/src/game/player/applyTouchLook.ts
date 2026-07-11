import type { InputSnapshot } from '../../input/actions'

export interface LookCamera {
  rotation: { x: number; y: number }
}

export function applyTouchLook(
  camera: LookCamera,
  input: Pick<InputSnapshot, 'lookX' | 'lookY'>,
  deltaSeconds: number,
): void {
  const scale = Math.min(Math.max(deltaSeconds, 0), 0.05)
  camera.rotation.y += input.lookX * scale * 2.5
  camera.rotation.x = Math.max(-0.65, Math.min(0.65, camera.rotation.x - input.lookY * scale * 1.7))
}
