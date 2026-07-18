import { expect, test } from '@playwright/test'

test('啟動頁可在瀏覽器顯示', async ({ page }) => {
  await page.goto('./')

  await expect(page).toHaveTitle('地球守護隊：能量大作戰')
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-Hant')
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    'content',
    'https://cagoooo.github.io/Shoot/assets/social/og-earth-guardian.png',
  )
  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute(
    'href',
    './manifest.webmanifest',
  )
  await expect(
    page.getByRole('heading', { name: '地球守護隊：能量大作戰' }),
  ).toBeVisible()
  await expect(page.getByRole('button', { name: '開始任務' })).toBeVisible()
})

test('3D 基地可直接點建築前往任務', async ({ page }) => {
  await page.goto('./')
  await page.getByRole('button', { name: '開始任務' }).click()
  await expect(page.getByRole('button', { name: /今天任務清單/ })).toBeVisible()

  const canvas = page.locator('.base-3d-backdrop canvas')
  await expect(canvas).toBeVisible()
  // 等第一批影格渲染完成，讓網格的世界矩陣就緒後再點擊任務塔。
  await page.waitForTimeout(800)
  await canvas.click({ position: { x: 640, y: 357 }, force: true })

  await expect(page.getByRole('heading', { name: '垃圾風暴救援行動' })).toBeVisible()
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

test('試玩區可使用能量工具並更新能量表', async ({ page }) => {
  await page.goto('./')
  await page.getByRole('button', { name: '開始任務' }).click()
  await page.getByRole('button', { name: /試玩區/ }).click()

  const canvas = page.getByLabel('地球守護隊 3D 任務畫面')
  await expect(canvas).toBeVisible()
  const box = await canvas.boundingBox()
  if (!box) throw new Error('找不到 3D 畫面範圍')

  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await page.mouse.down()
  await page.waitForTimeout(120)
  await page.mouse.up()

  await expect(page.getByLabel('能量 92%')).toBeVisible()
})
