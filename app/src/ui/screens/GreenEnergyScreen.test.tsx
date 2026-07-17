import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { DEFAULT_COMFORT_SETTINGS } from '../../domain/settings/accessibility'
import { weatherScenarios } from '../../game/missions/greenEnergy/weatherScenarios'
import { GreenEnergyScreen } from './GreenEnergyScreen'

describe('GreenEnergyScreen', () => {
  it('可從天氣判讀完成儲能與用電優先順序', () => {
    const onMissionComplete = vi.fn()
    render(
      <GreenEnergyScreen
        learningMode="middle-assist"
        comfortSettings={DEFAULT_COMFORT_SETTINGS}
        onComfortSettingsChange={vi.fn()}
        onBack={vi.fn()}
        onMissionComplete={onMissionComplete}
        mapSlot={<div>綠能社區 3D 測試畫面</div>}
        weatherScenario={weatherScenarios[0]}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: '開始觀察天氣' }))
    fireEvent.click(screen.getByRole('button', { name: /太陽能板/ }))
    fireEvent.click(screen.getByRole('button', { name: '確認發電方式' }))
    fireEvent.click(screen.getByRole('button', { name: '儲存綠色能量' }))
    fireEvent.click(screen.getByRole('button', { name: '安排晚上的用電' }))
    fireEvent.click(screen.getByRole('button', { name: /醫療站/ }))
    fireEvent.click(screen.getByRole('button', { name: /交通號誌/ }))
    fireEvent.click(screen.getByRole('button', { name: '完成綠能社區行動' }))
    fireEvent.click(screen.getByRole('button', { name: '查看永續行動紀錄' }))

    expect(onMissionComplete).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ type: 'machine-repaired', id: 'community-energy-grid' }),
        expect.objectContaining({ type: 'protected-target', id: 'community-battery' }),
      ]),
    )
  })

  it('雨天情境要選備用電池，選錯有資料引導', () => {
    render(
      <GreenEnergyScreen
        learningMode="upper-standard"
        comfortSettings={DEFAULT_COMFORT_SETTINGS}
        onComfortSettingsChange={vi.fn()}
        onBack={vi.fn()}
        onMissionComplete={vi.fn()}
        mapSlot={<div>綠能社區 3D 測試畫面</div>}
        weatherScenario={weatherScenarios[2]}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: '開始觀察天氣' }))
    expect(screen.getByText(/下雨無風的傍晚/)).toBeInTheDocument()
    expect(screen.getByText(/今天的發電條件/)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /太陽能板/ }))
    expect(screen.getByText(/下雨天幾乎沒有陽光/)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '確認發電方式' })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /社區備用電池/ }))
    expect(screen.getByRole('button', { name: '確認發電方式' })).toBeInTheDocument()
  })
})
