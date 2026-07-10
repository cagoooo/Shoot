import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { MissionScreen } from './MissionScreen'

const checkpoint = {
  load: vi.fn(async () => null),
  save: vi.fn(async () => undefined),
}

describe('MissionScreen', () => {
  it('可從任務說明完成分類、撤離並到達行動回顧', async () => {
    const onMissionComplete = vi.fn()
    const onBack = vi.fn()
    render(
      <MissionScreen
        onBack={onBack}
        onMissionComplete={onMissionComplete}
        checkpoint={checkpoint}
        mapSlot={<div>3D 地圖替身</div>}
      />,
    )

    fireEvent.click(await screen.findByRole('button', { name: '我看懂任務了' }))
    fireEvent.click(screen.getByRole('button', { name: '帶上小光能量槍' }))
    fireEvent.click(screen.getByRole('button', { name: /走主路/ }))

    expect(screen.getByText('飲料塑膠瓶')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '放入 紙類' }))
    expect(screen.getByRole('status')).toHaveTextContent('瓶身有彈性')

    for (const bin of ['塑膠類', '紙類', '金屬類', '一般垃圾']) {
      fireEvent.click(screen.getByRole('button', { name: `放入 ${bin}` }))
    }
    fireEvent.click(
      screen.getByRole('button', { name: '分類完成，前往能源控制室' }),
    )
    for (let core = 0; core < 3; core += 1) {
      fireEvent.click(screen.getByRole('button', { name: '淨化搗蛋核心' }))
    }
    fireEvent.click(screen.getByRole('button', { name: /分區聰明修/ }))
    expect(screen.getByText(/兼顧速度與節能/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '確認修復，開始撤離' }))

    for (const item of ['安全急救包', '修理紀錄', '飲用水']) {
      fireEvent.click(screen.getByRole('checkbox', { name: item }))
    }
    fireEvent.click(screen.getByRole('button', { name: '前往屋頂撤離' }))

    expect(
      screen.getByRole('heading', { name: '垃圾風暴救援完成' }),
    ).toBeInTheDocument()
    expect(screen.getByText(/分區供電兼顧速度與節能/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '查看完整永續行動紀錄' }))
    expect(onMissionComplete).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ type: 'energy-used', amount: 72 }),
        expect.objectContaining({ type: 'machine-repaired', id: 'storm-machine' }),
        expect.objectContaining({ type: 'protected-target' }),
      ]),
    )
    expect(onBack).not.toHaveBeenCalled()
    expect(checkpoint.save).toHaveBeenCalled()
  })

  it('從能源控制室檢查點恢復時回到可操作的核心階段', async () => {
    render(
      <MissionScreen
        onBack={vi.fn()}
        checkpoint={{
          load: vi.fn(async () => ({
            phase: 'storm-machine' as const,
            completedObjectives: ['sorting-machine-fixed'],
            reportAwarded: false,
            safeSpawnId: 'storm-machine-safe',
          })),
          save: vi.fn(async () => undefined),
        }}
        mapSlot={<div>3D 地圖替身</div>}
      />,
    )

    expect(
      await screen.findByRole('button', { name: '淨化搗蛋核心' }),
    ).toBeVisible()
  })
})
