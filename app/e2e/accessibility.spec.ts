import { expect, test } from '@playwright/test'
import { openBaseMissionList } from './helpers'

test('accessibility 鍵盤可啟動並操作主要導覽', async ({ page }) => {
  await page.goto('./')
  await page.keyboard.press('Tab')
  await expect(page.getByLabel(/中年級輔助/)).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(page.getByRole('button', { name: '開始任務' })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('heading', { name: '今天想先去哪裡？' })).toBeVisible()
})

test('accessibility 可放大文字並遵守減少動態偏好', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('./')
  await page.getByRole('button', { name: '開始任務' }).click()
  await openBaseMissionList(page)
  await page.getByRole('button', { name: /今天任務/ }).click()
  await page.getByRole('button', { name: '操作與閱讀設定' }).click()
  await page.getByLabel('放大介面文字').check()
  await page.getByLabel('減少畫面動態').check()
  await page.getByRole('button', { name: '完成設定' }).click()

  await expect(page.locator('.mission-screen')).toHaveClass(/large-text/)
  await expect(page.locator('.mission-screen')).toHaveAttribute(
    'data-reduced-motion',
    'true',
  )
  await expect(page.getByRole('status')).toContainText('目前任務階段')
})

test('accessibility 桌機版善用寬度且沒有水平溢出', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 })
  await page.goto('./')
  await page.getByRole('button', { name: '開始任務' }).click()
  await openBaseMissionList(page)

  const layout = await page.locator('.base-map').boundingBox()
  expect(layout?.width).toBeGreaterThan(1200)
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  )
  expect(overflow).toBe(0)
})
