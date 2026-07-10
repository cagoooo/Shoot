export const recyclingStormZones = [
  'briefing-room',
  'entrance',
  'waste-yard',
  'sorting-hall',
  'maintenance-route',
  'energy-room',
  'storm-machine',
  'rooftop-evacuation',
] as const

export type RecyclingStormZone = (typeof recyclingStormZones)[number]
export type RouteKind = 'main-route' | 'maintenance-route' | 'shared'

export interface ZoneConnection {
  from: RecyclingStormZone
  to: RecyclingStormZone
  route: RouteKind
}

export const zoneConnections: readonly ZoneConnection[] = [
  { from: 'briefing-room', to: 'entrance', route: 'shared' },
  { from: 'entrance', to: 'waste-yard', route: 'main-route' },
  { from: 'waste-yard', to: 'sorting-hall', route: 'main-route' },
  { from: 'sorting-hall', to: 'energy-room', route: 'main-route' },
  {
    from: 'entrance',
    to: 'maintenance-route',
    route: 'maintenance-route',
  },
  {
    from: 'maintenance-route',
    to: 'energy-room',
    route: 'maintenance-route',
  },
  { from: 'energy-room', to: 'storm-machine', route: 'shared' },
  {
    from: 'storm-machine',
    to: 'rooftop-evacuation',
    route: 'shared',
  },
]

export function createZoneGraph() {
  return {
    hasPath(
      start: RecyclingStormZone,
      destination: RecyclingStormZone,
      allowedRoutes: readonly RouteKind[],
    ): boolean {
      const visited = new Set<RecyclingStormZone>()
      const queue: RecyclingStormZone[] = [start]

      while (queue.length > 0) {
        const current = queue.shift()!
        if (current === destination) return true
        if (visited.has(current)) continue
        visited.add(current)

        for (const connection of zoneConnections) {
          if (
            connection.from === current &&
            (connection.route === 'shared' ||
              allowedRoutes.includes(connection.route))
          ) {
            queue.push(connection.to)
          }
        }
      }
      return false
    },
  }
}

export const zonePositions: Record<
  RecyclingStormZone,
  { x: number; z: number; color: string }
> = {
  'briefing-room': { x: 0, z: -16, color: '#d8ecff' },
  entrance: { x: 0, z: -11, color: '#fff0b8' },
  'waste-yard': { x: -6, z: -5, color: '#d8c8a8' },
  'sorting-hall': { x: -6, z: 2, color: '#bfe6d0' },
  'maintenance-route': { x: 6, z: -4, color: '#cdd9e8' },
  'energy-room': { x: 0, z: 7, color: '#ffe18a' },
  'storm-machine': { x: 0, z: 14, color: '#e3c4ef' },
  'rooftop-evacuation': { x: 0, z: 21, color: '#bdebf2' },
}
