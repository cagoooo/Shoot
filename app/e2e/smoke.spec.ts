import { expect, test } from '@playwright/test'

test('啟動頁可在瀏覽器顯示', async ({ page }) => {
  await page.goto('./')

  await expect(
    page.getByRole('heading', { name: '地球守護隊：能量大作戰' }),
  ).toBeVisible()
  await expect(page.getByRole('button', { name: '開始任務' })).toBeVisible()
})
