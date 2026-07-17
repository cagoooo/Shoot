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
    expect(screen.getByText(/每小時可收集的雨水量/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /屋頂雨水管/ }))
    fireEvent.click(screen.getByRole('button', { name: /沿著屋頂雨水管出發/ }))
    for (let index = 0; index < 3; index += 1) {
      fireEvent.click(screen.getByRole('button', { name: '收集一滴雨水' }))
    }
    fireEvent.click(screen.getByRole('button', { name: '檢查水質' }))
    expect(screen.getByText(/水箱裡有 3 隻泥沙搗蛋怪/)).toBeInTheDocument()
    for (let index = 0; index < 3; index += 1) {
      fireEvent.click(screen.getAllByRole('button', { name: /泥沙搗蛋怪/ })[0])
    }
    expect(screen.getByText(/水質恢復乾淨了/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '前往過濾站' }))
    fireEvent.click(screen.getByRole('button', { name: /砂子/ }))
    expect(screen.getByText(/還差一步：先選「布」/)).toBeInTheDocument()
    for (const part of ['布', '砂子', '活性碳']) {
      fireEvent.click(screen.getByRole('button', { name: new RegExp(part) }))
    }
    expect(screen.getByText('全部順序正確！你完成了三層過濾。')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '完成過濾' }))
    fireEvent.click(screen.getByRole('button', { name: /飲水站/ }))
    fireEvent.click(screen.getByRole('button', { name: /菜園澆灌/ }))
    fireEvent.click(screen.getByRole('button', { name: '完成水滴守護' }))
    fireEvent.click(screen.getByRole('button', { name: '查看永續行動紀錄' }))

    expect(onMissionComplete).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ type: 'machine-repaired', id: 'water-filter-station' }),
        expect.objectContaining({ type: 'protected-target', id: 'clean-water-tank' }),
        expect.objectContaining({ type: 'enemy-cleansed', amount: 3 }),
      ]),
    )
  })

  it('選地面集水溝時泥沙搗蛋怪較少', () => {
    render(
      <WaterGuardianScreen
        learningMode="upper-standard"
        comfortSettings={DEFAULT_COMFORT_SETTINGS}
        onComfortSettingsChange={vi.fn()}
        onBack={vi.fn()}
        onMissionComplete={vi.fn()}
        mapSlot={<div>水站 3D 測試畫面</div>}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: '我準備好了' }))
    fireEvent.click(screen.getByRole('button', { name: /地面集水溝/ }))
    fireEvent.click(screen.getByRole('button', { name: /沿著地面集水溝出發/ }))
    for (let index = 0; index < 3; index += 1) {
      fireEvent.click(screen.getByRole('button', { name: '收集一滴雨水' }))
    }
    fireEvent.click(screen.getByRole('button', { name: '檢查水質' }))
    expect(screen.getByText(/水箱裡有 2 隻泥沙搗蛋怪/)).toBeInTheDocument()
  })
})
