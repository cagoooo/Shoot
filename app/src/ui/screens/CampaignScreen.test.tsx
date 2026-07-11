import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { CampaignScreen } from './CampaignScreen'

describe('CampaignScreen', () => {
  it('顯示九大世界，僅讓已完成前置任務的可玩關卡啟動', async () => {
    const user = userEvent.setup()
    const onMissionSelect = vi.fn()
    render(
      <CampaignScreen
        completedMissions={['recycling-storm']}
        onBack={vi.fn()}
        onMissionSelect={onMissionSelect}
      />,
    )

    expect(screen.getByRole('heading', { name: '地球行動地圖' })).toBeVisible()
    expect(screen.getByRole('button', { name: '開始行動' })).toBeEnabled()
    for (const button of screen.getAllByRole('button', { name: '建造中' })) {
      expect(button).toBeDisabled()
    }
    await user.click(screen.getByRole('button', { name: '開始行動' }))
    expect(onMissionSelect).toHaveBeenCalledWith('water-guardian')
  })
})
