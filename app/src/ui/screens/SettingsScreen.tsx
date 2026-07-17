import {
  DEFAULT_COMFORT_SETTINGS,
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

      <fieldset className="quality-fieldset">
        <legend>畫質模式</legend>
        {([
          { mode: 'saver', label: '省電', hint: '解析度較低，適合較舊的平板' },
          { mode: 'standard', label: '標準', hint: '自動依流暢度調整' },
          { mode: 'fine', label: '精緻', hint: '維持最清晰畫面' },
        ] as const).map(({ mode, label, hint }) => (
          <label className="check-setting" key={mode}>
            <input
              type="radio"
              name="quality-mode"
              checked={settings.qualityMode === mode}
              onChange={() => update({ qualityMode: mode })}
            />
            <span>{label}<small className="quality-hint">{hint}</small></span>
          </label>
        ))}
      </fieldset>

      <label>
        <span>音樂音量：{Math.round(settings.musicVolume * 100)}%</span>
        <input
          aria-label="音樂音量"
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={settings.musicVolume}
          onChange={(event) =>
            update({ musicVolume: Number(event.currentTarget.value) })
          }
        />
      </label>

      <label>
        <span>瞄準速度：{Math.round(settings.sensitivity * 100)}%</span>
        <input
          aria-label="瞄準速度"
          type="range"
          min="0.2"
          max="2"
          step="0.1"
          value={settings.sensitivity}
          onChange={(event) =>
            update({ sensitivity: Number(event.currentTarget.value) })
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
          checked={settings.colorAssist}
          onChange={(event) =>
            update({ colorAssist: event.currentTarget.checked })
          }
        />
        <span>色彩辨識輔助（加上符號標示）</span>
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
      <button
        className="secondary-button reset-touch-button"
        type="button"
        onClick={() =>
          update({
            sensitivity: DEFAULT_COMFORT_SETTINGS.sensitivity,
            leftHanded: DEFAULT_COMFORT_SETTINGS.leftHanded,
          })
        }
      >
        重設觸控操作
      </button>
      <button className="primary-button" type="button" onClick={onClose}>
        完成設定
      </button>
    </section>
  )
}
