import { z } from 'zod'

const audioSourceSchema = z.object({
  format: z.enum(['ogg', 'mp3']),
  path: z.string().min(1),
})

export const audioAssetRecordSchema = z
  .object({
    id: z.string().min(1),
    kind: z.enum(['music', 'sfx', 'narration']),
    sources: z.array(audioSourceSchema),
    loop: z.boolean(),
    licenseRecord: z.string().min(1),
    deploymentStatus: z.enum([
      'awaiting-audited-file',
      'approved',
      'test-only',
    ]),
  })
  .superRefine((asset, context) => {
    if (asset.deploymentStatus === 'approved' && asset.sources.length === 0) {
      context.addIssue({
        code: 'custom',
        message: 'approved_audio_requires_source',
        path: ['sources'],
      })
    }
  })

export const audioManifestSchema = z.array(audioAssetRecordSchema)

export type AudioAssetRecord = z.infer<typeof audioAssetRecordSchema>

type Fetcher = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>

export async function loadAudioManifest(
  basePath: string,
  fetcher: Fetcher = fetch,
): Promise<AudioAssetRecord[]> {
  const normalizedBase = basePath.endsWith('/') ? basePath : `${basePath}/`
  const response = await fetcher(`${normalizedBase}content/audio-manifest.json`)
  if (!response.ok) throw new Error('audio_manifest_load_failed')
  return audioManifestSchema.parse(await response.json())
}
