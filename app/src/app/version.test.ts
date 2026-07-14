import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { APP_MISSION, APP_VERSION } from './appVersion'

describe('發行候選版本', () => {
  it('公開版本檔與程式內版本一致', () => {
    const version = JSON.parse(
      readFileSync(resolve(process.cwd(), 'public/version.json'), 'utf8'),
    )

    expect(version).toEqual({
      version: APP_VERSION,
      spec: '2026-07-11',
      mission: APP_MISSION,
    })
  })
})
