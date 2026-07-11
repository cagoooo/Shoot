import type { AudioAdapter } from './AudioManager'
import { loadAudioManifest, type AudioAssetRecord } from './audioManifest'

export interface BrowserAudioElement {
  loop: boolean
  volume: number
  paused: boolean
  play(): Promise<void>
  pause(): void
}

type AudioFactory = (source: string) => BrowserAudioElement
type ManifestLoader = (basePath: string) => Promise<AudioAssetRecord[]>

const joinPath = (basePath: string, path: string) =>
  `${basePath.endsWith('/') ? basePath : `${basePath}/`}${path.replace(/^\//, '')}`

const createBrowserAudio: AudioFactory = (source) => new Audio(source)

export class BrowserAudioAdapter implements AudioAdapter {
  private readonly tracks = new Map<string, BrowserAudioElement>()
  private readonly basePath: string
  private readonly createAudio: AudioFactory
  private readonly manifestLoader: ManifestLoader
  private currentTrack?: BrowserAudioElement
  private musicGain = 0.7
  private initialized = false
  private fadeTimer?: ReturnType<typeof setInterval>

  constructor(
    basePath: string,
    createAudio: AudioFactory = createBrowserAudio,
    manifestLoader: ManifestLoader = loadAudioManifest,
  ) {
    this.basePath = basePath
    this.createAudio = createAudio
    this.manifestLoader = manifestLoader
  }

  async initialize(): Promise<void> {
    if (this.initialized) return
    try {
      const manifest = await this.manifestLoader(this.basePath)
      for (const asset of manifest) {
        const source = asset.sources.find((candidate) => candidate.format === 'mp3')
        if (asset.kind !== 'music' || asset.deploymentStatus !== 'approved' || !source) continue
        const audio = this.createAudio(joinPath(this.basePath, source.path))
        audio.loop = asset.loop
        audio.volume = this.musicGain
        this.tracks.set(asset.id, audio)
      }
    } catch {
      // 音樂載入失敗時仍可完整遊玩，下一次重新開啟頁面會再次載入。
    }
    this.initialized = true
  }

  async transitionMusic(trackId: string, fadeMs: number): Promise<void> {
    const nextTrack = this.tracks.get(trackId)
    if (!nextTrack || nextTrack === this.currentTrack) return
    const previousTrack = this.currentTrack
    if (this.fadeTimer) clearInterval(this.fadeTimer)
    this.currentTrack = nextTrack
    nextTrack.volume = previousTrack && fadeMs > 0 ? 0 : this.musicGain
    try {
      await nextTrack.play()
    } catch {
      // 行動裝置可能暫時拒絕播放；下一次使用者互動會重新解鎖。
    }
    if (!previousTrack || fadeMs <= 0) {
      previousTrack?.pause()
      return
    }
    const steps = Math.max(1, Math.ceil(fadeMs / 50))
    let step = 0
    this.fadeTimer = setInterval(() => {
      step += 1
      const progress = Math.min(1, step / steps)
      previousTrack.volume = this.musicGain * (1 - progress)
      nextTrack.volume = this.musicGain * progress
      if (progress < 1) return
      previousTrack.pause()
      clearInterval(this.fadeTimer)
      this.fadeTimer = undefined
    }, fadeMs / steps)
  }

  setMusicGain(gain: number): void {
    this.musicGain = gain
    if (this.currentTrack) this.currentTrack.volume = gain
  }

  setEffectsGain(_gain: number): void {}

  playEffect(_effectId: string): void {}

  async suspend(): Promise<void> {
    this.currentTrack?.pause()
  }

  async resume(): Promise<void> {
    if (!this.currentTrack || !this.currentTrack.paused) return
    try {
      await this.currentTrack.play()
    } catch {
      // 由瀏覽器的自動播放規則保護使用者；不將此情況視為遊戲錯誤。
    }
  }
}
