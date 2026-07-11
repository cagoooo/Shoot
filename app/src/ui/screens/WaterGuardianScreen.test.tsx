import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { DEFAULT_COMFORT_SETTINGS } from '../../domain/settings/accessibility'
import { WaterGuardianScreen } from './WaterGuardianScreen'

describe('WaterGuardianScreen', () => {
  it('可完成收集、過濾、分配並送出第二關成果', () => {
    const onMissionComplete = vi.fn()
    render(
      <WaterGuardianScreen
        learningMode="middle-assist"
        comfortSettings={DEFAULT_COMFORT_SETTINGS}
        onComfortSettingsChange={vi.fn()}
        onBack={vi.fn()}
        onMissionComplete={onMissionComplete}
        mapSlot={<div>水站 3D 測試畫面</div>}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: '我準備好了' }))
    for (let index = 0; index < 3; index += 1) {
      fireEvent.click(screen.getByRole('button', { name: '收集一滴雨水' }))
    }
    fireEvent.click(screen.getByRole('button', { name: '前往過濾站' }))
    for (const part of ['布', '砂子', '活性碳']) {
      fireEvent.click(screen.getByRole('button', { name: new RegExp(part) }))
    }
    fireEvent.click(screen.getByRole('button', { name: '完成過濾' }))
    fireEvent.click(screen.getByRole('button', { name: /飲水站/ }))
    fireEvent.click(screen.getByRole('button', { name: /菜園澆灌/ }))
    fireEvent.click(screen.getByRole('button', { name: '完成水滴守護' }))
    fireEvent.click(screen.getByRole('button', { name: '查看永續行動紀錄' }))

    expect(onMissionComplete).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ type: 'machine-repaired', id: 'water-filter-station' }),
        expect.objectContaining({ type: 'protected-target', id: 'clean-water-tank' }),
      ]),
    )
  })
})
