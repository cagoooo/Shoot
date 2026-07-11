import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('發行候選版本', () => {
  it('公開版本檔標示 0.1.0 垂直切片', () => {
    const version = JSON.parse(
      readFileSync(resolve(process.cwd(), 'public/version.json'), 'utf8'),
    )

    expect(version).toEqual({
      version: '0.1.0-vertical-slice',
      spec: '2026-07-10',
      mission: 'recycling-storm',
    })
  })
})
