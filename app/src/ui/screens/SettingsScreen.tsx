import {
  normalizeComfortSettings,
  type ComfortSettings,
} from '../../domain/settings/accessibility'

interface SettingsScreenProps {
  settings: ComfortSettings
  onChange: (settings: ComfortSettings) => void
  onClose: () => void
}

export function SettingsScreen({
  settings,
  onChange,
  onClose,
}: SettingsScreenProps) {
  const update = (patch: Partial<ComfortSettings>) =>
    onChange(normalizeComfortSettings({ ...settings, ...patch }))

  return (
    <section className="comfort-panel" aria-labelledby="comfort-title">
      <div>
        <p className="eyebrow">依自己感受調整</p>
        <h2 id="comfort-title">舒適設定</h2>
      </div>

      <label>
        <span>觀看範圍：{settings.fieldOfView} 度</span>
        <input
          aria-label="觀看範圍"
          type="range"
          min="60"
          max="90"
          value={settings.fieldOfView}
          onChange={(event) =>
            update({ fieldOfView: Number(event.currentTarget.value) })
          }
        />
      </label>

      <label className="check-setting">
        <input
          type="checkbox"
          checked={settings.cameraBob}
          onChange={(event) => update({ cameraBob: event.currentTarget.checked })}
        />
        <span>鏡頭走路晃動</span>
      </label>

      <label className="check-setting">
        <input
          type="checkbox"
          checked={settings.motionBlur}
          onChange={(event) => update({ motionBlur: event.currentTarget.checked })}
        />
        <span>動態模糊</span>
      </label>

      <label className="check-setting">
        <input
          type="checkbox"
          checked={settings.leftHanded}
          onChange={(event) => update({ leftHanded: event.currentTarget.checked })}
        />
        <span>左手操作模式</span>
      </label>

      <label className="check-setting">
        <input
          type="checkbox"
          checked={settings.largeText}
          onChange={(event) => update({ largeText: event.currentTarget.checked })}
        />
        <span>放大介面文字</span>
      </label>

      <label className="check-setting">
        <input
          type="checkbox"
          checked={settings.subtitlesBackground}
          onChange={(event) =>
            update({ subtitlesBackground: event.currentTarget.checked })
          }
        />
        <span>加強字幕背景</span>
      </label>

      <label className="check-setting">
        <input
          type="checkbox"
          checked={settings.reducedMotion}
          onChange={(event) =>
            update({ reducedMotion: event.currentTarget.checked })
          }
        />
        <span>減少畫面動態</span>
      </label>

      <label className="check-setting">
        <input
          type="checkbox"
          checked={settings.flashStrength === 'reduced'}
          onChange={(event) =>
            update({
              flashStrength: event.currentTarget.checked
                ? 'reduced'
                : 'standard',
            })
          }
        />
        <span>減少閃光效果</span>
      </label>

      <label className="check-setting">
        <input
          type="checkbox"
          checked={settings.narrationAnnouncements}
          onChange={(event) =>
            update({ narrationAnnouncements: event.currentTarget.checked })
          }
        />
        <span>朗讀任務公告</span>
      </label>

      <p className="panel-note">若覺得頭暈，請減少動態與閃光，並休息一下。</p>
      <button className="primary-button" type="button" onClick={onClose}>
        完成設定
      </button>
    </section>
  )
}
