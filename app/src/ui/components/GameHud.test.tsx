import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { createWeaponState } from '../../domain/combat/weaponState'
import { GameHud } from './GameHud'

describe('GameHud', () => {
  it('用文字與進度條顯示能量及溫度', () => {
    render(
      <GameHud
        toolName="小光能量槍"
        weaponState={createWeaponState({ energy: 75, heat: 30 })}
      />,
    )

    expect(screen.getByText('小光能量槍')).toBeInTheDocument()
    expect(screen.getByLabelText('能量 75%')).toBeInTheDocument()
    expect(screen.getByLabelText('溫度 30%')).toBeInTheDocument()
  })

  it('過熱時顯示容易理解的降溫提示', () => {
    render(
      <GameHud
        toolName="小光能量槍"
        weaponState={createWeaponState({ heat: 100, heatLimit: 100 })}
      />,
    )

    expect(screen.getByRole('status')).toHaveTextContent('工具正在降溫')
  })
})
