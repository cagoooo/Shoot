export type AudioScene =
  | 'base'
  | 'exploration'
  | 'tension'
  | 'boss'
  | 'evacuation'
  | 'success'
  | 'report'

export interface AudioAdapter {
  initialize(): Promise<void>
  transitionMusic(trackId: string, fadeMs: number): Promise<void>
  setMusicGain(gain: number): void
  setEffectsGain(gain: number): void
  playEffect(effectId: string): void
  suspend(): Promise<void>
  resume(): Promise<void>
}

const musicByScene: Record<AudioScene, string> = {
  base: 'music-base',
  exploration: 'music-exploration',
  tension: 'music-tension',
  boss: 'music-boss',
  evacuation: 'music-evacuation',
  success: 'music-success',
  report: 'music-report',
}

const clampVolume = (volume: number) => Math.max(0, Math.min(1, volume))

export class AudioManager {
  private readonly adapter: AudioAdapter
  private musicVolume = 0.7
  private effectsVolume = 0.8
  private narrationActive = false
  private muted = false
  private unlocked = false
  private scene: AudioScene = 'base'

  constructor(adapter: AudioAdapter) {
    this.adapter = adapter
  }

  async unlockFromUserGesture(): Promise<void> {
    if (this.unlocked) return
    await this.adapter.initialize()
    this.unlocked = true
    this.applyGains()
    await this.adapter.transitionMusic(musicByScene[this.scene], 900)
  }

  transitionTo(scene: AudioScene): void {
    this.scene = scene
    if (this.unlocked) {
      void this.adapter.transitionMusic(musicByScene[scene], 900)
    }
  }

  setMusicVolume(volume: number): void {
    this.musicVolume = clampVolume(volume)
    this.adapter.setMusicGain(this.currentMusicGain())
  }

  setEffectsVolume(volume: number): void {
    this.effectsVolume = clampVolume(volume)
    this.adapter.setEffectsGain(this.currentEffectsGain())
  }

  setNarrationActive(active: boolean): void {
    this.narrationActive = active
    this.adapter.setMusicGain(this.currentMusicGain())
  }

  setMuted(muted: boolean): void {
    this.muted = muted
    this.applyGains()
  }

  currentMusicGain(): number {
    if (this.muted) return 0
    return this.musicVolume * (this.narrationActive ? 0.35 : 1)
  }

  currentEffectsGain(): number {
    return this.muted ? 0 : this.effectsVolume
  }

  playEffect(effectId: string): void {
    if (this.unlocked && !this.muted) this.adapter.playEffect(effectId)
  }

  async setPageHidden(hidden: boolean): Promise<void> {
    if (!this.unlocked) return
    if (hidden) await this.adapter.suspend()
    else await this.adapter.resume()
  }

  private applyGains(): void {
    this.adapter.setMusicGain(this.currentMusicGain())
    this.adapter.setEffectsGain(this.currentEffectsGain())
  }
}
