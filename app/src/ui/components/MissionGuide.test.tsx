import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MissionGuide } from './MissionGuide'

describe('MissionGuide', () => {
  it('中年級輔助模式顯示現在、下一步與科學發現', () => {
    render(<MissionGuide phase="sorting-hall" learningMode="middle-assist" />)

    expect(screen.getByLabelText('任務圖卡引導')).toHaveTextContent('現在要做什麼？')
    expect(screen.getByText('下一步')).toBeVisible()
    expect(screen.getByText('小小科學發現')).toBeVisible()
  })

  it('高年級標準模式保留任務與學習重點，不顯示下一步', () => {
    render(<MissionGuide phase="storm-machine" learningMode="upper-standard" />)

    expect(screen.getByText('先淨化核心，再選擇能源方案。')).toBeVisible()
    expect(screen.queryByText('下一步')).not.toBeInTheDocument()
  })
})
