import { expect, test } from '@playwright/test'

test('高年級學生可由準備、探索到撤離並查看永續紀錄', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))
  await page.goto('./')
  await page.getByRole('radio', { name: /高年級標準/ }).check()
  await page.getByRole('button', { name: '開始任務' }).click()

  await page.getByRole('button', { name: /工具桌/ }).click()
  await expect(page.getByRole('heading', { name: '組裝小光能量槍' })).toBeVisible()
  await page.getByRole('button', { name: /回基地/ }).click()
  await page.getByRole('button', { name: /今天任務/ }).click()

  await page.getByRole('button', { name: '我看懂任務了' }).click()
  await page.getByRole('button', { name: '帶上小光能量槍' }).click()
  await page.getByRole('button', { name: /走主路/ }).click()
  for (const bin of ['塑膠類', '紙類', '金屬類', '一般垃圾']) {
    await page.getByRole('button', { name: `放入 ${bin}` }).click()
  }
  await page.getByRole('button', { name: '分類完成，前往能源控制室' }).click()
  for (let core = 0; core < 3; core += 1) {
    await page.getByRole('button', { name: '淨化搗蛋核心' }).click()
  }
  await page.getByRole('button', { name: /分區聰明修/ }).click()
  await page.getByRole('button', { name: '確認修復，開始撤離' }).click()
  for (const item of ['安全急救包', '修理紀錄', '飲用水']) {
    await page.getByRole('checkbox', { name: item }).check()
  }
  await page.getByRole('button', { name: '前往屋頂撤離' }).click()
  await page.getByRole('button', { name: '查看完整永續行動紀錄' }).click()

  await expect(page.getByRole('heading', { name: '我的永續行動紀錄' })).toBeVisible()
  await expect(page.getByText('省電高手')).toBeVisible()
  await page.getByRole('button', { name: /前往下一關：水滴守護行動/ }).click()
  await expect(page.getByRole('heading', { name: '水滴守護行動' })).toBeVisible()
  await page.getByRole('button', { name: '我準備好了' }).click()
  for (let drop = 0; drop < 3; drop += 1) {
    await page.getByRole('button', { name: '收集一滴雨水' }).click()
  }
  await page.getByRole('button', { name: '前往過濾站' }).click()
  for (const part of ['布', '砂子', '活性碳']) {
    await page.getByRole('button', { name: new RegExp(part) }).click()
  }
  await page.getByRole('button', { name: '完成過濾' }).click()
  await page.getByRole('button', { name: /飲水站/ }).click()
  await page.getByRole('button', { name: /菜園澆灌/ }).click()
  await page.getByRole('button', { name: '完成水滴守護' }).click()
  await page.getByRole('button', { name: '查看永續行動紀錄' }).click()
  await expect(page.getByRole('heading', { name: '水滴守護成功' })).not.toBeVisible()
  expect(pageErrors).toEqual([])
})
