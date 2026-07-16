import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { DEFAULT_COMFORT_SETTINGS } from '../../domain/settings/accessibility'
import { storyMissions } from '../../game/missions/storyWorld/storyMissionConfig'
import { StoryWorldScreen } from './StoryWorldScreen'

describe('StoryWorldScreen', () => {
  it('可完成種子森林的三段守護任務', () => {
    const onMissionComplete = vi.fn()
    render(
      <StoryWorldScreen
        mission={storyMissions[0]}
        learningMode="middle-assist"
        comfortSettings={DEFAULT_COMFORT_SETTINGS}
        onComfortSettingsChange={vi.fn()}
        onBack={vi.fn()}
        onMissionComplete={onMissionComplete}
        mapSlot={<div>森林 3D 測試畫面</div>}
      />,
    )

    for (let step = 0; step < 3; step += 1) {
      const config = storyMissions[0].steps[step]
      if (config.kind === 'sequence') {
        for (const choice of config.choices) {
          fireEvent.click(screen.getByRole('button', { name: new RegExp(choice.title) }))
        }
      } else {
        const choices = screen.getAllByRole('button').filter((button) => button.getAttribute('aria-pressed') === 'false')
        fireEvent.click(choices[0])
        fireEvent.click(choices[1])
      }
      fireEvent.click(screen.getByRole('button', { name: step === 2 ? '完成世界修復' : '帶著發現繼續前進' }))
    }
    expect(screen.getByText(storyMissions[0].endings.perfect)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '查看永續行動紀錄' }))
    expect(onMissionComplete).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ type: 'machine-repaired', id: 'soil-breathing-station' }),
        expect.objectContaining({ type: 'mission-ending', ending: 'perfect' }),
      ]),
    )
  })

  it('途中選錯會走向學習結局', () => {
    const onMissionComplete = vi.fn()
    render(
      <StoryWorldScreen
        mission={storyMissions[0]}
        learningMode="upper-standard"
        comfortSettings={DEFAULT_COMFORT_SETTINGS}
        onComfortSettingsChange={vi.fn()}
        onBack={vi.fn()}
        onMissionComplete={onMissionComplete}
        mapSlot={<div>森林 3D 測試畫面</div>}
      />,
    )

    const firstStep = storyMissions[0].steps[0]
    fireEvent.click(screen.getByRole('button', { name: new RegExp(firstStep.choices[2].title) }))

    for (let step = 0; step < 3; step += 1) {
      const config = storyMissions[0].steps[step]
      if (config.kind === 'sequence') {
        for (const choice of config.choices) {
          fireEvent.click(screen.getByRole('button', { name: new RegExp(choice.title) }))
        }
      } else {
        for (const choice of config.choices.slice(0, config.requiredChoices)) {
          fireEvent.click(screen.getByRole('button', { name: new RegExp(choice.title) }))
        }
      }
      fireEvent.click(screen.getByRole('button', { name: step === 2 ? '完成世界修復' : '帶著發現繼續前進' }))
    }

    expect(screen.getByText(storyMissions[0].endings.learned)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '查看永續行動紀錄' }))
    expect(onMissionComplete).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ type: 'mission-ending', ending: 'learned' }),
      ]),
    )
  })

  it('排順序步驟選錯時給白話引導，且不會前進', () => {
    render(
      <StoryWorldScreen
        mission={storyMissions[0]}
        learningMode="middle-assist"
        comfortSettings={DEFAULT_COMFORT_SETTINGS}
        onComfortSettingsChange={vi.fn()}
        onBack={vi.fn()}
        onMissionComplete={vi.fn()}
        mapSlot={<div>森林 3D 測試畫面</div>}
      />,
    )

    const firstStep = storyMissions[0].steps[0]
    const helpful = firstStep.choices.slice(0, firstStep.requiredChoices)
    for (const choice of helpful) {
      fireEvent.click(screen.getByRole('button', { name: new RegExp(choice.title) }))
    }
    fireEvent.click(screen.getByRole('button', { name: '帶著發現繼續前進' }))

    const sequenceStep = storyMissions[0].steps[1]
    expect(sequenceStep.kind).toBe('sequence')
    fireEvent.click(screen.getByRole('button', { name: new RegExp(sequenceStep.choices[1].title) }))
    expect(screen.getByText(new RegExp(`先選「${sequenceStep.choices[0].title}」`))).toBeInTheDocument()
    expect(screen.getByText(/順序 0／3/)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: new RegExp(sequenceStep.choices[0].title) }))
    expect(screen.getByText(/順序 1／3/)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '帶著發現繼續前進' })).not.toBeInTheDocument()
  })

  it('顯示引導角色對話，判斷題選錯有引導、選對可前進', () => {
    const ocean = storyMissions.find((mission) => mission.id === 'ocean-blue')!
    render(
      <StoryWorldScreen
        mission={ocean}
        learningMode="upper-standard"
        comfortSettings={DEFAULT_COMFORT_SETTINGS}
        onComfortSettingsChange={vi.fn()}
        onBack={vi.fn()}
        onMissionComplete={vi.fn()}
        mapSlot={<div>海洋 3D 測試畫面</div>}
      />,
    )

    const quizStep = ocean.steps[0]
    expect(quizStep.requiredChoices).toBe(1)
    expect(screen.getByText(ocean.guide.name)).toBeInTheDocument()
    expect(screen.getByText(quizStep.dialogue!)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: new RegExp(quizStep.choices[1].title) }))
    expect(screen.getByText(new RegExp(`再想想：${quizStep.choices[1].title}`))).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '帶著發現繼續前進' })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: new RegExp(quizStep.choices[0].title) }))
    expect(screen.getByRole('button', { name: '帶著發現繼續前進' })).toBeInTheDocument()
  })
})
