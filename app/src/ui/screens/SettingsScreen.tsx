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

      <p className="panel-note">若覺得頭暈，請保持兩項關閉並休息一下。</p>
      <button className="primary-button" type="button" onClick={onClose}>
        完成設定
      </button>
    </section>
  )
}
