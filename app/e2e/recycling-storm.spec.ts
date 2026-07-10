import { expect, test, type Page } from '@playwright/test'

async function finishRecyclingStorm(
  page: Page,
  route: '主路' | '維修小路',
  energyChoice: '分區聰明修' | '省電慢慢修',
) {
  await page.goto('./')
  await page.getByRole('button', { name: '開始任務' }).click()
  await page.getByRole('button', { name: /今天任務/ }).click()

  await expect(
    page.getByRole('heading', { name: '垃圾風暴救援行動' }),
  ).toBeVisible()
  await page.getByRole('button', { name: '我看懂任務了' }).click()
  await page.getByRole('button', { name: '帶上小光能量槍' }).click()
  await page.getByRole('button', { name: new RegExp(`走${route}`) }).click()

  for (const bin of ['塑膠類', '紙類', '金屬類', '一般垃圾']) {
    await page.getByRole('button', { name: `放入 ${bin}` }).click()
  }
  await page
    .getByRole('button', { name: '分類完成，前往能源控制室' })
    .click()
  for (let core = 0; core < 3; core += 1) {
    await page.getByRole('button', { name: '淨化搗蛋核心' }).click()
  }
  await page.getByRole('button', { name: new RegExp(energyChoice) }).click()
  await expect(page.getByText(/能源使用：/)).toBeVisible()
  await page.getByRole('button', { name: '確認修復，開始撤離' }).click()

  for (const item of ['安全急救包', '修理紀錄', '飲用水']) {
    await page.getByRole('checkbox', { name: item }).check()
  }
  await page.getByRole('button', { name: '前往屋頂撤離' }).click()

  await expect(
    page.getByRole('heading', { name: '垃圾風暴救援完成' }),
  ).toBeVisible()
  await expect(page.getByText(`你走了${route}`)).toBeVisible()
}

test('垃圾風暴主路可從基地完成分類並撤離', async ({ page }) => {
  await finishRecyclingStorm(page, '主路', '分區聰明修')
})

test('垃圾風暴維修小路可從基地完成分類並撤離', async ({ page }) => {
  await finishRecyclingStorm(page, '維修小路', '省電慢慢修')
})
