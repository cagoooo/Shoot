import { expect, test } from '@playwright/test'

test('工具資料載入失敗時可安全回基地', async ({ page }) => {
  await page.route('**/content/parts.zh-TW.json', (route) =>
    route.fulfill({ status: 500, body: 'temporary failure' }),
  )
  await page.goto('./')
  await page.getByRole('button', { name: '開始任務' }).click()
  await page.getByRole('button', { name: /工具桌/ }).click()

  await expect(page.getByRole('alert')).toContainText('工具資料暫時無法載入')
  await page.getByRole('button', { name: '回基地' }).click()
  await expect(page.getByRole('heading', { name: '今天想先去哪裡？' })).toBeVisible()
})

test('重新開啟任務時可從安全檢查點繼續', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      'earth-guardian-checkpoint',
      JSON.stringify({
        phase: 'storm-machine',
        completedObjectives: ['sorting-machine-fixed'],
        reportAwarded: false,
      }),
    )
  })
  await page.goto('./')
  await page.getByRole('button', { name: '開始任務' }).click()
  await page.getByRole('button', { name: /今天任務/ }).click()

  await expect(page.getByRole('button', { name: '淨化搗蛋核心' })).toBeVisible()
  await expect(page.getByText('能源控制室', { exact: true })).toBeVisible()
})
