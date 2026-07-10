import { z } from 'zod'

const studentNameSchema = z.string().min(2).max(12)
const shortDescriptionSchema = z.string().min(4).max(40)
const sdgSchema = z.number().int().min(1).max(17)
const scoreSchema = z.number().int().min(1).max(5)

export const statsSchema = z.object({
  power: scoreSchema,
  saving: scoreSchema,
  range: scoreSchema,
  aim: scoreSchema,
  cooling: scoreSchema,
  lightness: scoreSchema,
  earthCare: scoreSchema,
})

export const partSchema = z.object({
  id: z.string().min(1),
  name: studentNameSchema,
  shortDescription: shortDescriptionSchema,
  slot: z.enum([
    'energy',
    'emitter',
    'aimTube',
    'grip',
    'cooler',
    'helper',
  ]),
  stats: statsSchema,
  sdgs: z.array(sdgSchema).min(1),
  why: z.string().min(4).max(80),
})

export const weaponSchema = z.object({
  id: z.string().min(1),
  name: studentNameSchema,
  shortDescription: shortDescriptionSchema,
  platform: z.enum(['light-rifle', 'hand-cannon', 'prism-scatter']),
  defaultParts: z.object({
    energy: z.string().min(1),
    emitter: z.string().min(1),
    aimTube: z.string().min(1),
    grip: z.string().min(1),
    cooler: z.string().min(1),
    helper: z.string().min(1),
  }),
  sdgs: z.array(sdgSchema).min(1),
})

export const missionPhaseSchema = z.object({
  id: z.string().min(1),
  name: studentNameSchema,
  instruction: shortDescriptionSchema,
})

export const badgeSchema = z.object({
  id: z.string().min(1),
  name: studentNameSchema,
  reason: shortDescriptionSchema,
})

export const missionSchema = z.object({
  id: z.string().min(1),
  name: studentNameSchema,
  shortDescription: shortDescriptionSchema,
  sdgs: z.array(sdgSchema).min(1),
  phases: z.array(missionPhaseSchema).min(1),
  badges: z.array(badgeSchema).min(1),
})

export const contentBundleSchema = z.object({
  parts: z.array(partSchema).min(1),
  weapons: z.array(weaponSchema).min(1),
  missions: z.array(missionSchema).min(1),
})

export type PartContent = z.infer<typeof partSchema>
export type WeaponContent = z.infer<typeof weaponSchema>
export type MissionContent = z.infer<typeof missionSchema>
export type ContentBundle = z.infer<typeof contentBundleSchema>
