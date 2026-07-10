// @vitest-environment node
import { readFileSync } from 'node:fs'
import { describe, expect, it, vi } from 'vitest'
import { audioManifestSchema, loadAudioManifest } from './audioManifest'

describe('audio manifest', () => {
  it('七種遊戲音樂情境都有可稽核紀錄', () => {
    const file = new URL('../../public/content/audio-manifest.json', import.meta.url)
    const manifest = audioManifestSchema.parse(
      JSON.parse(readFileSync(file, 'utf8')),
    )

    expect(manifest.filter((asset) => asset.kind === 'music')).toHaveLength(7)
    expect(
      manifest.every(
        (asset) =>
          asset.licenseRecord.length > 0 &&
          (asset.deploymentStatus === 'awaiting-audited-file' ||
            asset.sources.length > 0),
      ),
    ).toBe(true)
  })

  it('未完成稽核的正式音樂不能宣告可部署', () => {
    expect(() =>
      audioManifestSchema.parse([
        {
          id: 'bad-track',
          kind: 'music',
          sources: [],
          loop: true,
          licenseRecord: 'missing',
          deploymentStatus: 'approved',
        },
      ]),
    ).toThrow()
  })

  it('可從 GitHub Pages 子路徑載入 manifest', async () => {
    const fetcher = vi.fn(async () =>
      new Response(
        JSON.stringify([
          {
            id: 'music-base',
            kind: 'music',
            sources: [],
            loop: true,
            licenseRecord: 'ledger#music-base',
            deploymentStatus: 'awaiting-audited-file',
          },
        ]),
        { status: 200 },
      ),
    )

    await expect(loadAudioManifest('/Shoot/', fetcher)).resolves.toHaveLength(1)
    expect(fetcher).toHaveBeenCalledWith('/Shoot/content/audio-manifest.json')
  })
})
