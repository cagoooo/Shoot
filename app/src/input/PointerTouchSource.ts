export interface StickVector {
  x: number
  y: number
}

export function calculateStickVector(
  startX: number,
  startY: number,
  currentX: number,
  currentY: number,
  radius: number,
): StickVector {
  const deltaX = currentX - startX
  const deltaY = currentY - startY
  const distance = Math.hypot(deltaX, deltaY)
  const scale = distance > radius ? radius / distance : 1
  const normalizedX = (deltaX * scale) / radius
  const normalizedY = -(deltaY * scale) / radius
  return {
    x: Object.is(normalizedX, -0) ? 0 : normalizedX,
    y: Object.is(normalizedY, -0) ? 0 : normalizedY,
  }
}
