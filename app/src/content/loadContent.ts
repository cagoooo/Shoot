import { normalizeBasePath } from '../app/basePath'
import {
  contentBundleSchema,
  enemySchema,
  missionSchema,
  partSchema,
  weaponSchema,
  type ContentBundle,
} from './schema'

type Fetcher = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>

async function loadJson(
  basePath: string,
  filename: string,
  fetcher: Fetcher,
): Promise<unknown> {
  const response = await fetcher(`${normalizeBasePath(basePath)}content/${filename}`)
  if (!response.ok) {
    throw new Error(`content_load_failed: ${filename}`)
  }
  return response.json()
}

export async function loadContent(
  basePath: string,
  fetcher: Fetcher = fetch,
): Promise<ContentBundle> {
  const [partsData, weaponsData, missionData, enemiesData] = await Promise.all([
    loadJson(basePath, 'parts.zh-TW.json', fetcher),
    loadJson(basePath, 'weapons.zh-TW.json', fetcher),
    loadJson(basePath, 'mission-recycling-storm.zh-TW.json', fetcher),
    loadJson(basePath, 'enemies.zh-TW.json', fetcher),
  ])

  return contentBundleSchema.parse({
    parts: partSchema.array().parse(partsData),
    weapons: weaponSchema.array().parse(weaponsData),
    missions: [missionSchema.parse(missionData)],
    enemies: enemySchema.array().parse(enemiesData),
  })
}
