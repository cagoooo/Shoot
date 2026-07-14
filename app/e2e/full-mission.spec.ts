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
  await page.getByRole('button', { name: /前往下一關：綠能社區行動/ }).click()
  await expect(page.getByRole('heading', { name: '綠能社區行動' })).toBeVisible()
  await page.getByRole('button', { name: '開始觀察天氣' }).click()
  await page.getByRole('button', { name: /太陽能板/ }).click()
  await page.getByRole('button', { name: '確認發電方式' }).click()
  await page.getByRole('button', { name: '儲存綠色能量' }).click()
  await page.getByRole('button', { name: '安排晚上的用電' }).click()
  await page.getByRole('button', { name: /醫療站/ }).click()
  await page.getByRole('button', { name: /交通號誌/ }).click()
  await page.getByRole('button', { name: '完成綠能社區行動' }).click()
  await page.getByRole('button', { name: '查看永續行動紀錄' }).click()
  await page.getByRole('button', { name: /前往下一關：種子森林行動/ }).click()
  await expect(page.getByRole('heading', { name: '種子森林行動' })).toBeVisible()
  for (const choices of [['鋪上落葉', '加入堆肥'], ['鬆開土壤', '放入種子', '鋪落葉並澆水'], ['定期觀察', '種原生植物']]) {
    for (const choice of choices) {
      await page.getByRole('button', { name: new RegExp(choice) }).click()
    }
    await page.getByRole('button', { name: /帶著發現繼續前進|完成世界修復/ }).click()
  }
  await page.getByRole('button', { name: '查看永續行動紀錄' }).click()
  expect(pageErrors).toEqual([])
})
