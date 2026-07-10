import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import type { PartContent } from '../../content/schema'
import { WorkbenchScreen } from './WorkbenchScreen'

const energyParts: PartContent[] = [
  {
    id: 'solar-box',
    name: '陽光能源盒',
    shortDescription: '晴天補充較快，暴雨時速度較慢',
    slot: 'energy',
    stats: { power: 2, saving: 4, range: 3, aim: 3, cooling: 3, lightness: 3, earthCare: 5 },
    sdgs: [7, 12],
    why: '太陽能會受到日照強弱影響',
  },
  {
    id: 'recycled-battery',
    name: '回收電池盒',
    shortDescription: '供電穩定，但可以使用的時間較短',
    slot: 'energy',
    stats: { power: 3, saving: 3, range: 3, aim: 3, cooling: 3, lightness: 4, earthCare: 5 },
    sdgs: [7, 12],
    why: '整理舊電池能延長材料的使用時間',
  },
]

describe('WorkbenchScreen', () => {
  it('更換能源盒後顯示能力與白話原因', async () => {
    const user = userEvent.setup()
    render(<WorkbenchScreen parts={energyParts} onBack={() => undefined} />)

    await user.click(screen.getByRole('button', { name: /回收電池盒/ }))

    expect(screen.getByText('省電')).toBeVisible()
    await user.click(screen.getByRole('button', { name: '為什麼？' }))
    expect(screen.getByText(/延長材料的使用時間/)).toBeVisible()
  })
})
