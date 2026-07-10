import { z } from 'zod'

export const saveSchema = z.object({
  version: z.literal(1),
  mode: z.enum(['middle-assist', 'upper-standard']),
  completedMissions: z.array(z.string()),
  unlockedParts: z.array(z.string()),
  toolLoadout: z.record(z.string(), z.string()),
  reflections: z.array(
    z.object({
      missionId: z.string(),
      choice: z.string(),
      createdAt: z.string(),
    }),
  ),
})

export type SaveV1 = z.infer<typeof saveSchema>

export function createEmptySave(): SaveV1 {
  return {
    version: 1,
    mode: 'middle-assist',
    completedMissions: [],
    unlockedParts: [],
    toolLoadout: {},
    reflections: [],
  }
}

export function migrateSave(input: unknown): SaveV1 {
  const result = saveSchema.safeParse(input)
  return result.success ? result.data : createEmptySave()
}
