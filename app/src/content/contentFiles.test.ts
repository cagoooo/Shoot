// @vitest-environment node
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { missionSchema, partSchema, weaponSchema } from './schema'

function readJson(filename: string): unknown {
  const url = new URL(`../../public/content/${filename}`, import.meta.url)
  return JSON.parse(readFileSync(url, 'utf8'))
}

describe('正式內容檔', () => {
  it('所有零件、武器與任務都符合 schema', () => {
    const parts = partSchema.array().parse(readJson('parts.zh-TW.json'))
    const weapons = weaponSchema.array().parse(readJson('weapons.zh-TW.json'))
    const mission = missionSchema.parse(
      readJson('mission-recycling-storm.zh-TW.json'),
    )

    expect(parts.length).toBeGreaterThanOrEqual(12)
    expect(weapons).toHaveLength(3)
    expect(mission.phases).toHaveLength(7)
    expect(mission.badges).toHaveLength(5)
  })

  it('武器預設零件都存在且位置相符', () => {
    const parts = partSchema.array().parse(readJson('parts.zh-TW.json'))
    const weapons = weaponSchema.array().parse(readJson('weapons.zh-TW.json'))
    const partsById = new Map(parts.map((part) => [part.id, part]))

    for (const weapon of weapons) {
      for (const [slot, partId] of Object.entries(weapon.defaultParts)) {
        expect(partsById.get(partId)?.slot).toBe(slot)
      }
    }
  })
})
