import type { Page } from '@playwright/test'

/** 3D 基地預設收合選單；需要點任務清單／九大世界地圖前先展開。 */
export async function openBaseMissionList(page: Page): Promise<void> {
  const chip = page.getByRole('button', { name: /今天任務清單/ })
  if (await chip.isVisible().catch(() => false)) {
    await chip.click()
  }
}
