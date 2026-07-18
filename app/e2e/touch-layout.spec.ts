import { expect, test } from '@playwright/test'
import { openBaseMissionList } from './helpers'

test.use({
  viewport: { width: 1024, height: 768 },
  hasTouch: true,
  isMobile: true,
})

test('平板橫向可完成主要觸控操作', async ({ page }) => {
  await page.goto('./')
  await page.getByRole('button', { name: '開始任務' }).click()
  await page.getByRole('button', { name: /試玩區/ }).click()

  const primary = page.getByTestId('primary-use')
  await expect(primary).toBeVisible()
  await expect(primary).toHaveCSS('min-width', '92px')
  await expect(primary).toHaveCSS('min-height', '52px')
  await expect(page.getByLabel('觸控操作')).toHaveCSS('padding-left', '12px')

  await page.getByRole('button', { name: '舒適設定' }).click()
  await page.getByLabel('左手操作模式').check()
  await page.getByRole('button', { name: '完成設定' }).click()
  await expect(page.getByLabel('觸控操作')).toHaveClass(/touch-left-handed/)
})

test('手機直向沒有水平溢出且主要按鈕可操作', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 })
  await page.goto('./')
  await expect(page.getByRole('button', { name: '開始任務' })).toBeVisible()
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  )
  expect(overflow).toBe(0)
  await expect(page.getByRole('button', { name: '開始任務' })).toHaveCSS(
    'min-height',
    '50px',
  )
})

test('手機可關閉背景音樂，且不影響基地主要操作', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 })
  await page.goto('./')
  await page.getByRole('button', { name: '開始任務' }).click()

  const muteButton = page.getByRole('button', { name: '關閉背景音樂' })
  await expect(muteButton).toHaveAttribute('aria-pressed', 'false')
  await muteButton.click()
  await expect(
    page.getByRole('button', { name: '開啟背景音樂' }),
  ).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('button', { name: /今天任務/ })).toBeVisible()
})

test('手機可閱讀九大世界地圖且沒有水平溢出', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('./')
  await page.getByRole('button', { name: '開始任務' }).click()
  await openBaseMissionList(page)
  await page.getByRole('button', { name: '查看九大世界任務地圖 →' }).click()

  await expect(page.getByRole('heading', { name: '地球行動地圖' })).toBeVisible()
  await expect(page.getByText('地球夥伴總動員')).toBeVisible()
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  )
  expect(overflow).toBe(0)
})

test('平板直向可打開任務與操作閱讀設定', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 })
  await page.goto('./')
  await page.getByRole('button', { name: '開始任務' }).click()
  await openBaseMissionList(page)
  await page.getByRole('button', { name: /今天任務/ }).click()

  await expect(page.getByRole('button', { name: '操作與閱讀設定' })).toBeVisible()
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  )
  expect(overflow).toBe(0)
})
