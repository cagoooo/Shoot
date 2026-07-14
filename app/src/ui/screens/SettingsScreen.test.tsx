import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { DEFAULT_COMFORT_SETTINGS } from '../../domain/settings/accessibility'
import { SettingsScreen } from './SettingsScreen'

describe('SettingsScreen', () => {
  it('顯示護眼舒適預設，並回報視野調整', () => {
    const onChange = vi.fn()
    render(
      <SettingsScreen
        settings={DEFAULT_COMFORT_SETTINGS}
        onChange={onChange}
        onClose={vi.fn()}
      />,
    )

    expect(screen.getByLabelText('鏡頭走路晃動')).not.toBeChecked()
    expect(screen.getByLabelText('動態模糊')).not.toBeChecked()
    expect(screen.getByLabelText('左手操作模式')).not.toBeChecked()
    expect(screen.getByLabelText('放大介面文字')).not.toBeChecked()

    fireEvent.change(screen.getByLabelText('觀看範圍'), {
      target: { value: '80' },
    })
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ fieldOfView: 80 }),
    )

    fireEvent.click(screen.getByLabelText('左手操作模式'))
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ leftHanded: true }),
    )

    fireEvent.change(screen.getByLabelText('瞄準速度'), {
      target: { value: '1.4' },
    })
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ sensitivity: 1.4 }),
    )

    fireEvent.click(screen.getByRole('button', { name: '重設觸控操作' }))
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ sensitivity: 1, leftHanded: false }),
    )
  })

  it('可調整音樂音量並開啟色彩辨識輔助', () => {
    const onChange = vi.fn()
    render(
      <SettingsScreen
        settings={DEFAULT_COMFORT_SETTINGS}
        onChange={onChange}
        onClose={vi.fn()}
      />,
    )

    fireEvent.change(screen.getByLabelText('音樂音量'), {
      target: { value: '0.3' },
    })
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ musicVolume: 0.3 }),
    )

    fireEvent.click(screen.getByLabelText('色彩辨識輔助（加上符號標示）'))
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ colorAssist: true }),
    )
  })
})
