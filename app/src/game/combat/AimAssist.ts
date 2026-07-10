export interface Direction3D {
  x: number
  y: number
  z: number
}

export interface AimCandidate {
  id: string
  kind: 'trouble-core' | 'protected'
  direction: Direction3D
  distance: number
}

function length(vector: Direction3D): number {
  return Math.hypot(vector.x, vector.y, vector.z)
}

function angleBetween(a: Direction3D, b: Direction3D): number {
  const divisor = length(a) * length(b)
  if (divisor === 0) return Number.POSITIVE_INFINITY
  const dot = (a.x * b.x + a.y * b.y + a.z * b.z) / divisor
  return Math.acos(Math.max(-1, Math.min(1, dot)))
}

export function selectAimTarget(
  forward: Direction3D,
  candidates: readonly AimCandidate[],
  maximumAngleDegrees: number,
): AimCandidate | undefined {
  const maximumAngle = (Math.max(0, maximumAngleDegrees) * Math.PI) / 180

  return candidates
    .filter((candidate) => candidate.kind === 'trouble-core')
    .map((candidate) => ({
      candidate,
      angle: angleBetween(forward, candidate.direction),
    }))
    .filter(({ angle }) => angle <= maximumAngle)
    .sort(
      (a, b) =>
        a.angle - b.angle || a.candidate.distance - b.candidate.distance,
    )[0]?.candidate
}
