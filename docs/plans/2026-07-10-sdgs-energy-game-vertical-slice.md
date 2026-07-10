# 《地球守護隊：能量大作戰》首個垂直切片實作計畫

> **給執行工作的代理程式：** 實作時必須使用 `superpowers-executing-plans`，依核取方塊逐項執行並在每個提交點驗證。除非使用者另行要求，不委派子代理。

**目標：** 建立可部署至 GitHub Pages、可在電腦完成完整流程並具備平板／手機架構基礎的〈垃圾風暴救援行動〉垂直切片。

**架構：** 遊戲放在 `app/`，React 負責基地、組裝、設定與學習報告，Babylon.js 負責 3D 任務。純 TypeScript 領域層處理工具數值、任務、敵人、紀錄與存檔，使規則可單元測試且不依賴畫面。WebGL 2 是基準，WebGPU 僅作可選能力。GitHub Actions 建置 `app/dist/` 並部署到 GitHub Pages。

**技術堆疊：** TypeScript、React、Vite、Babylon.js、Zod、Zustand、IndexedDB、Vitest、Testing Library、Playwright、GitHub Actions。

**依據規格：** `docs/specs/2026-07-10-sdgs-energy-game-design.md`

---

## 執行範圍

本計畫只涵蓋里程碑 0–3：技術基礎、3D 操作遊樂場、基地與工具組裝、首個完整垂直切片。

本計畫不實作：

- 其餘 16 個 SDGs 完整章節。
- 教師雲端後台及正式學生帳號。
- 2–4 人連線。
- PWA 完整離線內容。
- 公開配對、排行榜、商城或玩家互相攻擊。
- Suno 即時 API；音樂只使用阿凱老師匯出的已審核成品。

學生及教師試玩、完整行動裝置最佳化、六大世界、教師後台、17 項 SDGs 完整版與多人模式，在垂直切片驗證後各自建立新計畫。

## 預定目錄

```text
H:/Shoot/
├─ app/
│  ├─ public/
│  │  ├─ assets/audio/
│  │  ├─ assets/models/
│  │  ├─ assets/textures/
│  │  └─ content/
│  ├─ src/
│  │  ├─ app/
│  │  ├─ audio/
│  │  ├─ content/
│  │  ├─ domain/
│  │  ├─ game/
│  │  ├─ input/
│  │  ├─ learning/
│  │  ├─ persistence/
│  │  ├─ ui/
│  │  └─ test/
│  ├─ e2e/
│  └─ package.json
├─ docs/
│  ├─ plans/
│  ├─ specs/
│  └─ testing/
└─ .github/workflows/
```

## 共通完成條件

每個任務提交前都執行：

```powershell
npm --prefix app run lint
npm --prefix app run typecheck
npm --prefix app run test -- --run
npm --prefix app run build
```

需要瀏覽器流程的任務再執行：

```powershell
npm --prefix app run test:e2e
```

---

### 任務 1：建立 Vite 專案與品質基線

**檔案：**

- 建立：`app/package.json`
- 建立：`app/vite.config.ts`
- 建立：`app/tsconfig.json`
- 建立：`app/eslint.config.js`
- 建立：`app/src/main.tsx`
- 建立：`app/src/App.tsx`
- 建立：`app/src/test/setup.ts`
- 建立：`app/src/App.test.tsx`
- 建立：`app/e2e/smoke.spec.ts`
- 建立：`app/playwright.config.ts`

- [ ] **步驟 1：建立 React TypeScript 專案**

執行：

```powershell
npm create vite@latest app -- --template react-ts
npm --prefix app install
npm --prefix app install @babylonjs/core @babylonjs/loaders zod zustand idb
npm --prefix app install -D vitest jsdom @testing-library/react @testing-library/jest-dom @playwright/test
```

預期：`app/package.json`、`app/src/` 與 Vite 基礎檔案存在。

- [ ] **步驟 2：先寫應用程式殼層失敗測試**

```tsx
// app/src/App.test.tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('顯示遊戲名稱與開始按鈕', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: '地球守護隊：能量大作戰' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '開始任務' })).toBeInTheDocument()
  })
})
```

- [ ] **步驟 3：執行測試並確認失敗**

執行：`npm --prefix app run test -- --run src/App.test.tsx`

預期：因預設 Vite 畫面沒有指定標題與按鈕而失敗。

- [ ] **步驟 4：建立最小殼層及測試腳本**

```tsx
// app/src/App.tsx
export default function App() {
  return (
    <main>
      <h1>地球守護隊：能量大作戰</h1>
      <button type="button">開始任務</button>
    </main>
  )
}
```

在 `package.json` 加入 `lint`、`typecheck`、`test`、`test:e2e` 與 `build` 腳本，設定 Vitest `jsdom` 與 `src/test/setup.ts`。

- [ ] **步驟 5：驗證並提交**

執行共通完成條件；預期全部通過。

```powershell
git add app
git commit -m "chore: scaffold browser game app"
```

---

### 任務 2：建立 GitHub Pages 建置與部署基礎

**檔案：**

- 修改：`app/vite.config.ts`
- 建立：`app/src/app/basePath.ts`
- 建立：`app/src/app/basePath.test.ts`
- 建立：`.github/workflows/ci.yml`
- 建立：`.github/workflows/deploy-pages.yml`
- 建立：`app/public/version.json`

- [ ] **步驟 1：先寫子路徑測試**

```ts
// app/src/app/basePath.test.ts
import { describe, expect, it } from 'vitest'
import { normalizeBasePath } from './basePath'

describe('normalizeBasePath', () => {
  it.each([
    ['', '/'],
    ['Shoot', '/Shoot/'],
    ['/Shoot/', '/Shoot/'],
  ])('將 %s 轉成 %s', (input, expected) => {
    expect(normalizeBasePath(input)).toBe(expected)
  })
})
```

- [ ] **步驟 2：確認測試失敗**

執行：`npm --prefix app run test -- --run src/app/basePath.test.ts`

預期：找不到 `basePath` 模組。

- [ ] **步驟 3：實作可設定的 GitHub Pages base**

```ts
// app/src/app/basePath.ts
export function normalizeBasePath(value: string): string {
  const trimmed = value.replace(/^\/+|\/+$/g, '')
  return trimmed ? `/${trimmed}/` : '/'
}
```

`vite.config.ts` 從 `VITE_REPO_NAME` 計算 `base`。部署工作流程使用 `actions/configure-pages`、`actions/upload-pages-artifact` 與 `actions/deploy-pages` 發布 `app/dist/`；CI 在 `main` 與 pull request 執行 lint、typecheck、test、build。

- [ ] **步驟 4：本機模擬子路徑建置**

執行：

```powershell
$env:VITE_REPO_NAME='Shoot'
npm --prefix app run build
Remove-Item Env:VITE_REPO_NAME
```

預期：`app/dist/index.html` 的資源路徑包含 `/Shoot/`，且沒有 `/src/` 開發路徑。

- [ ] **步驟 5：提交**

```powershell
git add app/vite.config.ts app/src/app .github app/public/version.json
git commit -m "ci: prepare GitHub Pages deployment"
```

---

### 任務 3：定義內容資料格式與白話文字規則

**檔案：**

- 建立：`app/src/content/schema.ts`
- 建立：`app/src/content/schema.test.ts`
- 建立：`app/public/content/parts.zh-TW.json`
- 建立：`app/public/content/weapons.zh-TW.json`
- 建立：`app/public/content/mission-recycling-storm.zh-TW.json`
- 建立：`app/src/content/loadContent.ts`
- 建立：`app/src/content/loadContent.test.ts`

- [ ] **步驟 1：寫失敗的資料驗證測試**

```ts
// app/src/content/schema.test.ts
import { describe, expect, it } from 'vitest'
import { partSchema } from './schema'

describe('partSchema', () => {
  it('拒絕沒有白話說明的零件', () => {
    expect(() => partSchema.parse({ id: 'solar-box', name: '陽光能源盒' })).toThrow()
  })

  it('接受具七項能力與 SDG 連結的零件', () => {
    const result = partSchema.parse({
      id: 'solar-box', name: '陽光能源盒', shortDescription: '有陽光時充電比較快',
      slot: 'energy', stats: { power: 2, saving: 4, range: 3, aim: 3, cooling: 3, lightness: 3, earthCare: 5 },
      sdgs: [7, 12], why: '太陽能會受到日照強弱影響',
    })
    expect(result.id).toBe('solar-box')
  })
})
```

- [ ] **步驟 2：確認失敗**

執行：`npm --prefix app run test -- --run src/content/schema.test.ts`

預期：找不到 schema。

- [ ] **步驟 3：實作 Zod schemas 與首批內容**

```ts
// app/src/content/schema.ts
import { z } from 'zod'

export const statsSchema = z.object({
  power: z.number().min(1).max(5), saving: z.number().min(1).max(5),
  range: z.number().min(1).max(5), aim: z.number().min(1).max(5),
  cooling: z.number().min(1).max(5), lightness: z.number().min(1).max(5),
  earthCare: z.number().min(1).max(5),
})

export const partSchema = z.object({
  id: z.string().min(1), name: z.string().min(2).max(12),
  shortDescription: z.string().min(4).max(40),
  slot: z.enum(['energy', 'emitter', 'aimTube', 'grip', 'cooler', 'helper']),
  stats: statsSchema, sdgs: z.array(z.number().int().min(1).max(17)).min(1),
  why: z.string().min(4).max(80),
})
```

JSON 先建立三種能源盒、三種武器平台及首關所需零件、任務文字和徽章。

- [ ] **步驟 4：測試所有 JSON 均可載入**

執行：`npm --prefix app run test -- --run src/content`

預期：所有內容通過 schema，學生名稱不超過 12 個中文字元，短說明不超過 40 個字元。

- [ ] **步驟 5：提交**

```powershell
git add app/src/content app/public/content
git commit -m "feat: add validated SDGs content data"
```

---

### 任務 4：實作模組化工具能力計算

**檔案：**

- 建立：`app/src/domain/tools/types.ts`
- 建立：`app/src/domain/tools/calculateTool.ts`
- 建立：`app/src/domain/tools/calculateTool.test.ts`
- 建立：`app/src/domain/tools/presets.ts`

- [ ] **步驟 1：寫組裝取捨測試**

```ts
// app/src/domain/tools/calculateTool.test.ts
import { describe, expect, it } from 'vitest'
import { calculateTool } from './calculateTool'
import { handCannon, recycledBattery, fastCooler } from './presets'

describe('calculateTool', () => {
  it('手炮增加力量但降低省電與輕巧', () => {
    const result = calculateTool([handCannon, recycledBattery, fastCooler])
    expect(result.power).toBeGreaterThan(result.saving)
    expect(result.heatPerShot).toBeGreaterThan(0)
    expect(result.energyPerShot).toBeGreaterThan(0)
  })

  it('將學生能力限制在 1 到 5', () => {
    const result = calculateTool([handCannon, handCannon, handCannon])
    expect(Object.values(result.studentStats).every((v) => v >= 1 && v <= 5)).toBe(true)
  })
})
```

- [ ] **步驟 2：確認測試失敗**

執行：`npm --prefix app run test -- --run src/domain/tools/calculateTool.test.ts`

預期：函式與型別不存在。

- [ ] **步驟 3：實作純函式計算器**

```ts
// app/src/domain/tools/calculateTool.ts
import type { ToolPart, ToolResult } from './types'

export function calculateTool(parts: ToolPart[]): ToolResult {
  const sum = (key: keyof ToolPart['stats']) => parts.reduce((total, part) => total + part.stats[key], 0)
  const clamp = (value: number) => Math.max(1, Math.min(5, Math.round(value / Math.max(parts.length, 1))))
  return {
    studentStats: {
      power: clamp(sum('power')), saving: clamp(sum('saving')), range: clamp(sum('range')),
      aim: clamp(sum('aim')), cooling: clamp(sum('cooling')), lightness: clamp(sum('lightness')),
      earthCare: clamp(sum('earthCare')),
    },
    power: sum('power'), energyPerShot: Math.max(1, 12 - sum('saving')),
    heatPerShot: Math.max(1, 12 - sum('cooling')),
  }
}
```

- [ ] **步驟 4：執行單元測試與型別檢查**

執行：`npm --prefix app run test -- --run src/domain/tools && npm --prefix app run typecheck`

預期：通過，且領域層不 import React 或 Babylon.js。

- [ ] **步驟 5：提交**

```powershell
git add app/src/domain/tools
git commit -m "feat: calculate modular energy tool stats"
```

---

### 任務 5：建立版本化本機存檔

**檔案：**

- 建立：`app/src/persistence/saveSchema.ts`
- 建立：`app/src/persistence/saveSchema.test.ts`
- 建立：`app/src/persistence/saveRepository.ts`
- 建立：`app/src/persistence/saveRepository.test.ts`
- 建立：`app/src/persistence/exportSave.ts`

- [ ] **步驟 1：寫遷移與匿名資料測試**

```ts
// app/src/persistence/saveSchema.test.ts
import { describe, expect, it } from 'vitest'
import { migrateSave } from './saveSchema'

describe('migrateSave', () => {
  it('建立版本 1 存檔且不含姓名或電子郵件', () => {
    const save = migrateSave(undefined)
    expect(save.version).toBe(1)
    expect(JSON.stringify(save)).not.toMatch(/name|email/i)
  })
})
```

- [ ] **步驟 2：確認失敗**

執行：`npm --prefix app run test -- --run src/persistence/saveSchema.test.ts`

預期：找不到 `migrateSave`。

- [ ] **步驟 3：實作 schema、IndexedDB repository 與匯出**

```ts
// app/src/persistence/saveSchema.ts
export interface SaveV1 {
  version: 1
  mode: 'middle-assist' | 'upper-standard'
  completedMissions: string[]
  unlockedParts: string[]
  toolLoadout: Record<string, string>
  reflections: Array<{ missionId: string; choice: string; createdAt: string }>
}

export function migrateSave(input: unknown): SaveV1 {
  if (input && typeof input === 'object' && 'version' in input && input.version === 1) return input as SaveV1
  return { version: 1, mode: 'middle-assist', completedMissions: [], unlockedParts: [], toolLoadout: {}, reflections: [] }
}
```

Repository 使用 `idb`，測試使用注入的記憶體 adapter，避免測試依賴真實瀏覽器資料庫。

- [ ] **步驟 4：測試存取、匯出與壞資料恢復**

執行：`npm --prefix app run test -- --run src/persistence`

預期：儲存後可讀回；錯誤 JSON 回到安全預設值並回報非致命錯誤。

- [ ] **步驟 5：提交**

```powershell
git add app/src/persistence
git commit -m "feat: add private versioned local saves"
```

---

### 任務 6：建立基地、模式選擇與工具桌 UI

**檔案：**

- 建立：`app/src/app/gameStore.ts`
- 建立：`app/src/ui/screens/StartScreen.tsx`
- 建立：`app/src/ui/screens/BaseScreen.tsx`
- 建立：`app/src/ui/screens/WorkbenchScreen.tsx`
- 建立：`app/src/ui/components/StatDots.tsx`
- 建立：`app/src/ui/components/PartCard.tsx`
- 建立：`app/src/ui/screens/WorkbenchScreen.test.tsx`
- 建立：`app/src/ui/styles/tokens.css`
- 建立：`app/src/ui/styles/layout.css`
- 修改：`app/src/App.tsx`

- [ ] **步驟 1：寫工具桌互動測試**

```tsx
// app/src/ui/screens/WorkbenchScreen.test.tsx
it('更換能源盒後顯示省電變化與白話原因', async () => {
  render(<WorkbenchScreen />)
  await userEvent.click(screen.getByRole('button', { name: /回收電池盒/ }))
  expect(screen.getByText(/省電/)).toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: '為什麼？' }))
  expect(screen.getByText(/重新使用/)).toBeInTheDocument()
})
```

- [ ] **步驟 2：確認失敗**

執行：`npm --prefix app run test -- --run src/ui/screens/WorkbenchScreen.test.tsx`

預期：元件不存在。

- [ ] **步驟 3：實作四區基地與工具桌**

```ts
// app/src/app/gameStore.ts
import { create } from 'zustand'

export const useGameStore = create<{
  screen: 'start' | 'base' | 'workbench' | 'range' | 'mission' | 'report'
  setScreen: (screen: 'start' | 'base' | 'workbench' | 'range' | 'mission' | 'report') => void
}>((set) => ({ screen: 'start', setScreen: (screen) => set({ screen }) }))
```

基地顯示「今天任務」「工具桌」「試玩區」「我的行動紀錄」。工具桌支援點選零件再點位置；拖曳是增強功能，不是唯一操作。

- [ ] **步驟 4：執行 UI 測試與鍵盤操作檢查**

執行：`npm --prefix app run test -- --run src/ui`

預期：滑鼠與鍵盤皆可組裝；沒有只能靠顏色理解的狀態。

- [ ] **步驟 5：提交**

```powershell
git add app/src/app app/src/ui app/src/App.tsx
git commit -m "feat: add accessible base and workbench UI"
```

---

### 任務 7：建立 Babylon.js 場景與畫質等級

**檔案：**

- 建立：`app/src/game/engine/createEngine.ts`
- 建立：`app/src/game/engine/createScene.ts`
- 建立：`app/src/game/engine/qualityProfile.ts`
- 建立：`app/src/game/engine/qualityProfile.test.ts`
- 建立：`app/src/game/GameCanvas.tsx`
- 建立：`app/src/game/GameCanvas.test.tsx`

- [ ] **步驟 1：寫畫質決策測試**

```ts
// app/src/game/engine/qualityProfile.test.ts
it.each([
  [{ averageFps: 24, deviceMemory: 2 }, 'low'],
  [{ averageFps: 45, deviceMemory: 4 }, 'medium'],
  [{ averageFps: 60, deviceMemory: 8 }, 'high'],
])('依效能選擇畫質', (sample, expected) => {
  expect(selectQualityProfile(sample)).toBe(expected)
})
```

- [ ] **步驟 2：確認失敗**

執行：`npm --prefix app run test -- --run src/game/engine/qualityProfile.test.ts`

預期：函式不存在。

- [ ] **步驟 3：實作 WebGL 基準與 WebGPU 可選能力**

```ts
// app/src/game/engine/createEngine.ts
export async function createGameEngine(canvas: HTMLCanvasElement) {
  if ('gpu' in navigator) {
    try {
      const { WebGPUEngine } = await import('@babylonjs/core/Engines/webgpuEngine')
      const engine = new WebGPUEngine(canvas)
      await engine.initAsync()
      return engine
    } catch {
      // WebGPU 初始化失敗時使用下方 WebGL 路徑。
    }
  }
  const { Engine } = await import('@babylonjs/core/Engines/engine')
  return new Engine(canvas, true, { preserveDrawingBuffer: false, stencil: false })
}
```

WebGPU 初始化失敗時捕捉錯誤並改用 WebGL；學生畫面只顯示「已使用流暢模式」。

- [ ] **步驟 4：以 Babylon NullEngine 測試場景生命週期**

執行：`npm --prefix app run test -- --run src/game`

預期：掛載建立 canvas 與場景，卸載後 dispose engine、scene 及事件監聽器。

- [ ] **步驟 5：提交**

```powershell
git add app/src/game
git commit -m "feat: bootstrap adaptive Babylon game scene"
```

---

### 任務 8：建立跨裝置統一輸入層

**檔案：**

- 建立：`app/src/input/actions.ts`
- 建立：`app/src/input/InputManager.ts`
- 建立：`app/src/input/InputManager.test.ts`
- 建立：`app/src/input/KeyboardMouseSource.ts`
- 建立：`app/src/input/PointerTouchSource.ts`
- 建立：`app/src/input/GamepadSource.ts`
- 建立：`app/src/ui/components/TouchControls.tsx`
- 建立：`app/src/ui/components/TouchControls.test.tsx`

- [ ] **步驟 1：寫同一動作多來源測試**

```ts
it('將鍵盤、觸控與控制器都轉成 move 與 primaryUse', () => {
  const manager = new InputManager()
  manager.updateSource('keyboard', { moveX: 1, moveY: 0, primaryUse: false })
  manager.updateSource('touch', { moveX: 0, moveY: 1, primaryUse: true })
  expect(manager.snapshot()).toMatchObject({ moveX: 1, moveY: 1, primaryUse: true })
})
```

- [ ] **步驟 2：確認失敗**

執行：`npm --prefix app run test -- --run src/input`

預期：InputManager 不存在。

- [ ] **步驟 3：實作共通動作與來源 adapter**

```ts
// app/src/input/actions.ts
export interface InputSnapshot {
  moveX: number; moveY: number; lookX: number; lookY: number
  primaryUse: boolean; secondaryUse: boolean; interact: boolean
  switchNext: boolean; pause: boolean
}
```

TouchControls 使用 Pointer Events、pointer capture 與 CSS `touch-action: none`；按鈕至少 48 CSS 像素，支援左右手配置。

- [ ] **步驟 4：測試 pointer cancel、旋轉與多指操作**

執行：`npm --prefix app run test -- --run src/input src/ui/components/TouchControls.test.tsx`

預期：`pointercancel` 後所有移動歸零，避免角色自行走動。

- [ ] **步驟 5：提交**

```powershell
git add app/src/input app/src/ui/components/TouchControls*
git commit -m "feat: unify keyboard touch and gamepad input"
```

---

### 任務 9：建立第一人稱移動與舒適設定

**檔案：**

- 建立：`app/src/game/player/PlayerController.ts`
- 建立：`app/src/game/player/PlayerController.test.ts`
- 建立：`app/src/domain/settings/accessibility.ts`
- 建立：`app/src/domain/settings/accessibility.test.ts`
- 建立：`app/src/ui/screens/SettingsScreen.tsx`

- [ ] **步驟 1：寫幀率無關移動與設定測試**

```ts
it('不同幀率下移動距離近似相同', () => {
  const sixty = simulateMovement({ fps: 60, seconds: 1, speed: 4 })
  const thirty = simulateMovement({ fps: 30, seconds: 1, speed: 4 })
  expect(Math.abs(sixty - thirty)).toBeLessThan(0.02)
})
```

- [ ] **步驟 2：確認失敗**

執行：`npm --prefix app run test -- --run src/game/player src/domain/settings`

預期：模組不存在。

- [ ] **步驟 3：實作移動、碰撞及舒適選項**

```ts
export interface ComfortSettings {
  cameraBob: boolean
  motionBlur: boolean
  flashStrength: 'reduced' | 'standard'
  fieldOfView: number
  sensitivity: number
  quickTurn: boolean
}
```

預設關閉視角晃動與動態模糊。移動速度與旋轉使用 delta time；暫停、失焦或開啟說明時停止輸入。

- [ ] **步驟 4：在測試場景驗證鍵鼠與觸控**

執行：`npm --prefix app run test:e2e -- --grep "player movement"`

預期：鍵鼠可移動及轉向；模擬觸控後方向一致；離開頁面不持續移動。

- [ ] **步驟 5：提交**

```powershell
git add app/src/game/player app/src/domain/settings app/src/ui/screens/SettingsScreen.tsx
git commit -m "feat: add comfortable first person movement"
```

---

### 任務 10：實作能量射擊、耗能、過熱與輔助瞄準

**檔案：**

- 建立：`app/src/domain/combat/weaponState.ts`
- 建立：`app/src/domain/combat/weaponState.test.ts`
- 建立：`app/src/game/combat/RaycastTool.ts`
- 建立：`app/src/game/combat/ProjectileTool.ts`
- 建立：`app/src/game/combat/AimAssist.ts`
- 建立：`app/src/game/combat/AimAssist.test.ts`
- 建立：`app/src/ui/components/GameHud.tsx`

- [ ] **步驟 1：寫耗能與過熱測試**

```ts
it('過熱後暫停發射並在冷卻後恢復', () => {
  let state = createWeaponState({ energy: 100, heatLimit: 10 })
  state = fire(state, { energyCost: 5, heat: 10 })
  expect(canFire(state)).toBe(false)
  state = cool(state, 5)
  expect(canFire(state)).toBe(true)
})
```

- [ ] **步驟 2：確認失敗**

執行：`npm --prefix app run test -- --run src/domain/combat`

預期：狀態函式不存在。

- [ ] **步驟 3：實作三平台與兩種命中方式**

```ts
export type WeaponPlatform = 'light-rifle' | 'hand-cannon' | 'prism-scatter'
export interface WeaponState { energy: number; heat: number; overheated: boolean }
```

小光能量槍與手炮使用 raycast；泡泡工具使用慢速 projectile。彩光散射槍使用受控多射線，不建立大量物理物件。

- [ ] **步驟 4：測試中年級輔助瞄準不鎖定保護目標**

執行：`npm --prefix app run test -- --run src/game/combat`

預期：只在小角度內吸附搗蛋核心；綠色保護目標永遠不進候選清單。

- [ ] **步驟 5：提交**

```powershell
git add app/src/domain/combat app/src/game/combat app/src/ui/components/GameHud.tsx
git commit -m "feat: add energy tools heat and aim assist"
```

---

### 任務 11：建立搗蛋怪狀態機與物件池

**檔案：**

- 建立：`app/src/domain/enemies/enemyState.ts`
- 建立：`app/src/domain/enemies/enemyState.test.ts`
- 建立：`app/src/game/enemies/EnemyController.ts`
- 建立：`app/src/game/enemies/EnemyPool.ts`
- 建立：`app/src/game/enemies/EnemyPool.test.ts`
- 建立：`app/public/content/enemies.zh-TW.json`

- [ ] **步驟 1：寫可讀提示與非血腥狀態測試**

```ts
it('攻擊前一定經過 telegraph 狀態', () => {
  let state = createEnemyState('idle')
  state = updateEnemy(state, { playerVisible: true, elapsedMs: 16 })
  expect(state.kind).toBe('telegraph')
  state = updateEnemy(state, { playerVisible: true, elapsedMs: 700 })
  expect(state.kind).toBe('action')
})
```

- [ ] **步驟 2：確認失敗**

執行：`npm --prefix app run test -- --run src/domain/enemies`

預期：狀態機不存在。

- [ ] **步驟 3：實作垃圾黏黏怪與偷電小怪**

```ts
export type EnemyStateKind = 'idle' | 'notice' | 'telegraph' | 'action' | 'stunned' | 'cleansed'
```

所有攻擊先顯示黃色提示；淨化後變成粒子與回收物，不留下屍體。物件池預先配置 24 隻，垂直切片同時活動上限 20 隻。

- [ ] **步驟 4：測試回收及低畫質更新頻率**

執行：`npm --prefix app run test -- --run src/game/enemies`

預期：離開視野的敵人降低更新；cleansed 後回到池中且不殘留事件監聽器。

- [ ] **步驟 5：提交**

```powershell
git add app/src/domain/enemies app/src/game/enemies app/public/content/enemies.zh-TW.json
git commit -m "feat: add readable nonviolent troublemaker AI"
```

---

### 任務 12：建立任務狀態機、目標與自動存檔點

**檔案：**

- 建立：`app/src/domain/missions/missionState.ts`
- 建立：`app/src/domain/missions/missionState.test.ts`
- 建立：`app/src/game/missions/MissionDirector.ts`
- 建立：`app/src/game/missions/ObjectiveTracker.ts`
- 建立：`app/src/game/missions/CheckpointService.ts`

- [ ] **步驟 1：寫完整流程及非法跳階測試**

```ts
it('不能在未修好分類機前進入頭目能源選擇', () => {
  const state = createMissionState()
  expect(() => transitionMission(state, 'choose-energy-mode')).toThrow('objective_not_completed')
})
```

- [ ] **步驟 2：確認失敗**

執行：`npm --prefix app run test -- --run src/domain/missions`

預期：狀態機不存在。

- [ ] **步驟 3：實作七階段狀態機**

```ts
export type MissionPhase =
  | 'briefing' | 'loadout' | 'entrance' | 'sorting-hall'
  | 'storm-machine' | 'evacuation' | 'report'
```

每次 phase 轉換寫入 checkpoint；讀取存檔時將玩家放在安全出生點，不恢復半完成的物理狀態。

- [ ] **步驟 4：測試暫停、離開及恢復**

執行：`npm --prefix app run test -- --run src/domain/missions src/game/missions`

預期：每個 phase 可安全恢復；報告頁不重複發徽章。

- [ ] **步驟 5：提交**

```powershell
git add app/src/domain/missions app/src/game/missions
git commit -m "feat: add checkpointed mission flow"
```

---

### 任務 13：建立〈垃圾風暴救援行動〉地圖流程

**檔案：**

- 建立：`app/src/game/missions/recyclingStorm/buildRecyclingStorm.ts`
- 建立：`app/src/game/missions/recyclingStorm/zones.ts`
- 建立：`app/src/game/missions/recyclingStorm/interactions.ts`
- 建立：`app/src/game/missions/recyclingStorm/recyclingStorm.test.ts`
- 建立：`app/public/assets/models/recycling-station.glb`
- 建立：`app/public/assets/textures/recycling-station/`
- 建立：`app/e2e/recycling-storm.spec.ts`

- [ ] **步驟 1：先用幾何替身建立失敗流程測試**

```ts
it('主路與維修小路都能到達能源控制室', () => {
  const graph = createZoneGraph()
  expect(graph.hasPath('entrance', 'energy-room', ['main-route'])).toBe(true)
  expect(graph.hasPath('entrance', 'energy-room', ['maintenance-route'])).toBe(true)
})
```

- [ ] **步驟 2：確認測試失敗**

執行：`npm --prefix app run test -- --run recyclingStorm.test.ts`

預期：區域圖不存在。

- [ ] **步驟 3：先完成灰盒地圖，不等待正式美術**

```ts
export const recyclingStormZones = [
  'briefing-room', 'entrance', 'waste-yard', 'sorting-hall',
  'maintenance-route', 'energy-room', 'storm-machine', 'rooftop-evacuation',
] as const
```

以簡單幾何及明確色塊完成碰撞、引導、兩條路線、敵人生成點、互動點、保護目標與撤離點。正式 GLB 必須可在之後替換而不改任務規則。

- [ ] **步驟 4：執行完整 E2E 流程**

執行：`npm --prefix app run test:e2e -- --grep "垃圾風暴"`

預期：兩條路線均能從基地到結算；任何步驟沒有無法繼續的狀態。

- [ ] **步驟 5：提交**

```powershell
git add app/src/game/missions/recyclingStorm app/public/assets app/e2e/recycling-storm.spec.ts
git commit -m "feat: build recycling storm vertical slice map"
```

---

### 任務 14：實作垃圾風暴機三階段頭目

**檔案：**

- 建立：`app/src/domain/boss/stormMachine.ts`
- 建立：`app/src/domain/boss/stormMachine.test.ts`
- 建立：`app/src/game/boss/StormMachineController.ts`
- 建立：`app/src/ui/components/SortingPanel.tsx`
- 建立：`app/src/ui/components/EnergyChoicePanel.tsx`
- 建立：`app/src/ui/components/SortingPanel.test.tsx`

- [ ] **步驟 1：寫三階段與可恢復錯誤測試**

```ts
it('分類錯誤只增加提示，不造成任務失敗', () => {
  const result = sortItem(createStormMachine(), { item: 'paper', bin: 'metal' })
  expect(result.phase).toBe('sorting')
  expect(result.feedback).toBe('try-again')
})
```

- [ ] **步驟 2：確認失敗**

執行：`npm --prefix app run test -- --run src/domain/boss`

預期：頭目狀態不存在。

- [ ] **步驟 3：實作分類、核心及能源方案**

```ts
export type StormMachinePhase = 'sorting' | 'clean-cores' | 'energy-choice' | 'restored'
export type EnergyMode = 'fast-full' | 'slow-saving' | 'zoned'
```

三種能源方案都能完成任務，但耗能、守護時間與報告結果不同。中年級逐步顯示提示，高年級只顯示設備與天氣資料。

- [ ] **步驟 4：測試所有方案均可完成且結果不同**

執行：`npm --prefix app run test -- --run src/domain/boss src/ui/components/SortingPanel.test.tsx`

預期：三條方案到達 restored，且 energyUsed、timeSpent、repairScore 不完全相同。

- [ ] **步驟 5：提交**

```powershell
git add app/src/domain/boss app/src/game/boss app/src/ui/components/SortingPanel* app/src/ui/components/EnergyChoicePanel.tsx
git commit -m "feat: add multi-solution storm machine mission"
```

---

### 任務 15：建立學習事件、徽章與永續行動卡

**檔案：**

- 建立：`app/src/learning/events.ts`
- 建立：`app/src/learning/reducer.ts`
- 建立：`app/src/learning/reducer.test.ts`
- 建立：`app/src/learning/badges.ts`
- 建立：`app/src/learning/badges.test.ts`
- 建立：`app/src/ui/screens/ReportScreen.tsx`
- 建立：`app/src/ui/screens/ReportScreen.test.tsx`
- 建立：`app/src/learning/exportActionCard.ts`

- [ ] **步驟 1：寫「不看擊敗數」的徽章測試**

```ts
it('省電高手只依能源效率與修復行動判定', () => {
  const report = reduceLearningEvents([
    { type: 'energy-used', amount: 30 },
    { type: 'machine-repaired', id: 'sorter-a' },
    { type: 'enemy-cleansed', amount: 0 },
  ])
  expect(calculateBadges(report)).toContain('energy-saver')
})
```

- [ ] **步驟 2：確認失敗**

執行：`npm --prefix app run test -- --run src/learning`

預期：reducer 與徽章函式不存在。

- [ ] **步驟 3：實作事件、三張回顧卡及圖片匯出**

```ts
export type LearningEvent =
  | { type: 'part-selected'; partId: string }
  | { type: 'energy-used'; amount: number }
  | { type: 'material-recycled'; category: string; amount: number }
  | { type: 'machine-repaired'; id: string }
  | { type: 'protected-target'; id: string }
  | { type: 'reflection-chosen'; choice: string }
```

報告依序顯示「我做了什麼」「發生了什麼」「下次想怎麼改」。匯出卡不含真實姓名與裝置識別碼。

- [ ] **步驟 4：驗證隱私、列印與鍵盤操作**

執行：`npm --prefix app run test -- --run src/learning src/ui/screens/ReportScreen.test.tsx`

預期：報告不包含姓名、電子郵件、IP 或廣告識別資訊；沒有公開排名。

- [ ] **步驟 5：提交**

```powershell
git add app/src/learning app/src/ui/screens/ReportScreen*
git commit -m "feat: add SDGs learning report and action card"
```

---

### 任務 16：建立 BGM、音效與 Suno 資產稽核流程

**檔案：**

- 建立：`app/src/audio/AudioManager.ts`
- 建立：`app/src/audio/AudioManager.test.ts`
- 建立：`app/src/audio/audioManifest.ts`
- 建立：`app/public/content/audio-manifest.json`
- 建立：`app/public/assets/audio/README.md`
- 建立：`docs/testing/suno-asset-ledger.md`
- 建立：`docs/testing/audio-acceptance.md`

- [ ] **步驟 1：寫淡化與語音閃避測試**

```ts
it('語音播放時降低 BGM 並於結束後恢復', () => {
  const audio = new AudioManager(new FakeAudioAdapter())
  audio.setMusicVolume(0.8)
  audio.setNarrationActive(true)
  expect(audio.currentMusicGain()).toBeLessThan(0.4)
  audio.setNarrationActive(false)
  expect(audio.currentMusicGain()).toBeCloseTo(0.8)
})
```

- [ ] **步驟 2：確認失敗**

執行：`npm --prefix app run test -- --run src/audio`

預期：AudioManager 不存在。

- [ ] **步驟 3：實作音訊管理與 manifest**

```ts
export interface AudioAssetRecord {
  id: string
  kind: 'music' | 'sfx' | 'narration'
  sources: Array<{ format: 'ogg' | 'mp3'; path: string }>
  loop: boolean
  licenseRecord: string
}
```

AudioManager 必須等使用者按下開始後才建立 AudioContext。支援基地、探索、緊張、頭目、撤離、成功及報告狀態交叉淡化；分頁隱藏時暫停。

- [ ] **步驟 4：建立成人 Suno 帳號資產紀錄範本**

`docs/testing/suno-asset-ledger.md` 每筆包含作品 ID／連結、產生日期、付費方案、提示詞、模型、原始檔雜湊、剪輯紀錄、遊戲檔案、條款快照與審核人。第一輪可先放明確標示為測試用且不發布的自製靜音／節拍資產；正式 BGM 必須由阿凱老師提供完成紀錄的檔案後才能進入部署。

- [ ] **步驟 5：驗證並提交**

執行：`npm --prefix app run test -- --run src/audio && npm --prefix app run build`

```powershell
git add app/src/audio app/public/content/audio-manifest.json app/public/assets/audio docs/testing
git commit -m "feat: add audited adaptive game audio pipeline"
```

---

### 任務 17：完成無障礙、手機與平板介面基線

**檔案：**

- 建立：`app/src/ui/accessibility/announcer.tsx`
- 建立：`app/src/ui/accessibility/useReducedMotion.ts`
- 建立：`app/src/ui/styles/responsive.css`
- 建立：`app/e2e/accessibility.spec.ts`
- 建立：`app/e2e/touch-layout.spec.ts`
- 修改：`app/src/ui/components/TouchControls.tsx`
- 修改：`app/src/ui/components/GameHud.tsx`

- [ ] **步驟 1：寫響應式與無滑鼠懸停測試**

```ts
test('平板橫向可完成主要操作', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 })
  await page.goto('./')
  await expect(page.getByRole('button', { name: '開始任務' })).toBeVisible()
  await expect(page.getByTestId('primary-use')).toHaveCSS('min-width', '48px')
})
```

- [ ] **步驟 2：執行並確認失敗**

執行：`npm --prefix app run test:e2e -- --grep "平板橫向"`

預期：觸控控制或尺寸規格尚未完成。

- [ ] **步驟 3：實作安全區域與三種斷點**

```css
.touch-controls {
  padding: max(12px, env(safe-area-inset-top)) max(12px, env(safe-area-inset-right))
    max(12px, env(safe-area-inset-bottom)) max(12px, env(safe-area-inset-left));
}
.touch-action { min-width: 48px; min-height: 48px; }
@media (max-width: 640px) { .workbench { grid-template-columns: 1fr; } }
```

提供文字放大、字幕背景、減少動態、關閉閃光、左右手模式及任務語音公告接口。

- [ ] **步驟 4：執行 desktop、tablet、phone 三組 E2E**

執行：`npm --prefix app run test:e2e -- --grep "accessibility|touch"`

預期：360×800、768×1024、1366×768 均無水平溢出；重要操作可用鍵盤及觸控完成。

- [ ] **步驟 5：提交**

```powershell
git add app/src/ui app/e2e/accessibility.spec.ts app/e2e/touch-layout.spec.ts
git commit -m "feat: add accessible responsive touch baseline"
```

---

### 任務 18：效能預算、錯誤恢復與完整流程驗證

**檔案：**

- 建立：`app/src/app/ErrorBoundary.tsx`
- 建立：`app/src/game/engine/performanceMonitor.ts`
- 建立：`app/src/game/engine/performanceMonitor.test.ts`
- 建立：`app/e2e/full-mission.spec.ts`
- 建立：`app/e2e/recovery.spec.ts`
- 建立：`docs/testing/device-matrix.md`
- 建立：`docs/testing/vertical-slice-acceptance.md`

- [ ] **步驟 1：寫連續低幀率降級測試**

```ts
it('連續五秒低於 28 FPS 時只降一級畫質', () => {
  const monitor = createPerformanceMonitor('high')
  const result = feedSamples(monitor, Array(300).fill(24))
  expect(result.profile).toBe('medium')
  expect(result.reason).toBe('sustained-low-fps')
})
```

- [ ] **步驟 2：確認失敗**

執行：`npm --prefix app run test -- --run performanceMonitor.test.ts`

預期：監控器不存在。

- [ ] **步驟 3：實作效能降級與友善錯誤恢復**

```ts
export type QualityProfile = 'low' | 'medium' | 'high'
export interface PerformanceDecision { profile: QualityProfile; reason: 'stable' | 'sustained-low-fps' }
```

錯誤邊界提供「重新載入目前階段」「回基地」「匯出錯誤紀錄」三個選項，不顯示堆疊給學生。錯誤紀錄不得含個資或存檔全文。

- [ ] **步驟 4：執行完整驗證**

執行：

```powershell
npm --prefix app run lint
npm --prefix app run typecheck
npm --prefix app run test -- --run
npm --prefix app run build
npm --prefix app run test:e2e
```

預期：從模式選擇、組裝、試玩、任務、頭目、撤離到報告全部通過；錯誤恢復及 checkpoint 通過。

- [ ] **步驟 5：提交**

```powershell
git add app/src/app/ErrorBoundary.tsx app/src/game/engine app/e2e docs/testing
git commit -m "test: verify vertical slice performance and recovery"
```

---

### 任務 19：GitHub Pages 預發布與書面驗收

**檔案：**

- 修改：`README.md`
- 修改：`app/public/version.json`
- 修改：`docs/testing/vertical-slice-acceptance.md`
- 建立：`docs/testing/classroom-pilot-guide.md`

- [ ] **步驟 1：建立發行候選版本資訊**

```json
{
  "version": "0.1.0-vertical-slice",
  "spec": "2026-07-10",
  "mission": "recycling-storm"
}
```

- [ ] **步驟 2：執行正式建置及子路徑預覽**

執行：

```powershell
$env:VITE_REPO_NAME='Shoot'
npm --prefix app run build
npm --prefix app run preview -- --host 127.0.0.1
```

預期：從 `/Shoot/` 載入所有 JS、模型、內容及音訊，沒有根目錄資源錯誤。

- [ ] **步驟 3：完成書面驗收表**

`vertical-slice-acceptance.md` 必須記錄：

- 電腦 30 FPS 基準。
- 12–18 分鐘完整任務。
- 中年級輔助模式。
- 非血腥與無跳躍驚嚇檢查。
- SDG 7、12、13 行動連結。
- 存檔、恢復、匯出與隱私。
- Windows、Chromebook、iPad、Android 平板、iPhone、Android 手機的已測／未測狀態與實際裝置資訊。
- 正式 BGM 每首授權紀錄。

- [ ] **步驟 4：提交並推送 main**

只有在已設定正確的 GitHub 遠端、使用 `cagoooo` GitHub 身分且使用者已將該 repository 放入本任務範圍時執行：

```powershell
git add README.md app/public/version.json docs/testing
git commit -m "release: prepare SDGs vertical slice 0.1.0"
git push origin main
```

若尚無遠端，不自行建立 GitHub repository；保留本機 commit 並回報缺少遠端。

- [ ] **步驟 5：驗證 GitHub Pages**

GitHub Actions 完成後檢查正式網址：

- 首頁回傳 200。
- `/Shoot/` 下所有資源回傳 200。
- 重新整理不出現 404。
- `version.json` 為 `0.1.0-vertical-slice`。
- 手機與平板可載入基地及開始畫面。

最終將網址、commit、Actions 狀態、已驗證裝置及未完成的實機測試一併回報。

---

## 計畫自我審查清單

- [ ] 19 個任務都有明確檔案、測試、實作、驗證與提交點。
- [ ] 沒有占位文字、未指定的錯誤處理或留給執行者自行猜測的步驟。
- [ ] 領域層不依賴 React、Babylon.js 或 IndexedDB。
- [ ] GitHub Pages 子路徑從任務 2 開始驗證，不留到最後才修。
- [ ] 手機與平板輸入從任務 8 開始建立，不是完成電腦版後才移植。
- [ ] Suno 只由阿凱老師的成人帳號製作 BGM，正式資產都有授權紀錄。
- [ ] 首版不加入教師雲端後台、正式帳號、多人體系或其餘 16 個完整章節。
- [ ] 每次提交都能獨立通過共通完成條件。
- [ ] 所有學生可見文字遵守先白話、後知識。
- [ ] 遊戲成功不依賴擊敗數或遊玩時長。

## 實作完成定義

只有同時符合下列條件，才能宣告首個垂直切片完成：

1. 19 個任務全部完成並有對應 commit。
2. lint、typecheck、單元測試、建置及 E2E 全部通過。
3. 〈垃圾風暴救援行動〉可從基地完整玩到永續行動卡。
4. Windows／Chromebook 鍵盤滑鼠達到可用品質。
5. 平板／手機架構、響應式 UI 與觸控基本流程可運作；完整真機最佳化仍依後續計畫執行。
6. GitHub Pages 正式網址在儲存庫子路徑下正確載入。
7. 正式 BGM 都有阿凱老師成人 Suno 帳號的來源與授權紀錄。
8. 未使用真實槍械教學、血腥、公開排名、學生個資或非官方 Suno API。
9. 使用者完成垂直切片驗收。
