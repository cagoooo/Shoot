import { expect, test } from '@playwright/test'

test('啟動頁可在瀏覽器顯示', async ({ page }) => {
  await page.goto('./')

  await expect(page).toHaveTitle('地球守護隊：能量大作戰')
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-Hant')
  await expect(
    page.getByRole('heading', { name: '地球守護隊：能量大作戰' }),
  ).toBeVisible()
  await expect(page.getByRole('button', { name: '開始任務' })).toBeVisible()
})

test('可從基地進入工具桌並載入正式零件', async ({ page }) => {
  await page.goto('./')
  await page.getByRole('button', { name: '開始任務' }).click()
  await page.getByRole('button', { name: /工具桌/ }).click()

  await expect(
    page.getByRole('heading', { name: '組裝小光能量槍' }),
  ).toBeVisible()
  await expect(page.getByRole('button', { name: /陽光能源盒/ })).toBeVisible()
})

test('試玩區可建立 Babylon 3D 畫面', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  await page.goto('./')
  await page.getByRole('button', { name: '開始任務' }).click()
  await page.getByRole('button', { name: /試玩區/ }).click()

  await expect(
    page.getByLabel('地球守護隊 3D 任務畫面'),
  ).toBeVisible()
  expect(pageErrors).toEqual([])
})
