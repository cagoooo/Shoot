import type { WeaponState } from '../../domain/combat/weaponState'

interface GameHudProps {
  toolName: string
  weaponState: WeaponState
}

const percentage = (value: number, maximum: number) =>
  Math.round((value / Math.max(1, maximum)) * 100)

export function GameHud({ toolName, weaponState }: GameHudProps) {
  const energy = percentage(weaponState.energy, weaponState.energyCapacity)
  const heat = percentage(weaponState.heat, weaponState.heatLimit)

  return (
    <div className="game-hud" aria-label="工具狀態">
      <div className="aim-crosshair" aria-hidden="true">
        <span />
      </div>
      <section className="tool-status-card">
        <strong>{toolName}</strong>
        <label>
          <span>能量</span>
          <progress aria-label={`能量 ${energy}%`} max="100" value={energy} />
        </label>
        <label>
          <span>溫度</span>
          <progress
            className="heat-progress"
            aria-label={`溫度 ${heat}%`}
            max="100"
            value={heat}
          />
        </label>
        <p role="status" aria-live="polite">
          {weaponState.overheated ? '工具正在降溫，請稍等一下' : '工具可以使用'}
        </p>
      </section>
    </div>
  )
}
