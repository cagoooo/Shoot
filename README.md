# 地球守護隊：能量大作戰

給國小中、高年級學生的瀏覽器 3D 第一人稱永續行動遊戲。玩家在基地組裝像積木一樣的能量工具，探索環境問題區域，完成科學與工程挑戰後安全撤離；中年級可使用輔助模式，高年級以標準模式體驗溫和的部分損失與自主判斷。

目前的 `0.1.0-vertical-slice` 收錄完整任務〈垃圾風暴救援行動〉，聚焦 SDG 7、12、13，並預留未來 17 項 SDGs 任務、多元能量工具及多人連線架構。

🌐 **線上試玩版**：[https://cagoooo.github.io/Shoot/](https://cagoooo.github.io/Shoot/)

## 本機開始

需求：Node.js 24。

```powershell
cd app
npm ci
npm run dev
```

完整驗證：

```powershell
npm run lint
npm run typecheck
npm run test -- --run
npm run build
npm run test:e2e
```

## GitHub Pages

專案已提供 `.github/workflows/deploy-pages.yml`。推送 `main` 後會用儲存庫名稱設定 Vite 子路徑並部署 `app/dist`；正式網址為 [https://cagoooo.github.io/Shoot/](https://cagoooo.github.io/Shoot/)。

本機模擬 `Shoot` 儲存庫子路徑：

```powershell
$env:VITE_REPO_NAME='Shoot'
npm --prefix app run build
npm --prefix app run preview -- --host 127.0.0.1 --port 5180
```

開啟 `http://127.0.0.1:5180/Shoot/`。

## 教育、安全與音樂原則

- 以自然科學與工程設計為主軸，數學及環境教育融入任務。
- 不教真實槍械製作；能量工具只呈現可觀察的虛構科學效果。
- 不血腥、不以擊敗數排名，也不收集學生個資。
- Suno 只由教師的成人帳號製作 BGM；正式檔案上線前需完成來源與授權台帳，學生不使用 Suno。

規格、實作計畫與驗收紀錄位於 `docs/`。

---

<!-- BEGIN:PROJECT_GUIDE -->
## 專案導覽

這個 repository 收錄 **Shoot** 專案的原始碼與相關資源。以下資訊依目前檔案結構整理；實際行為仍以程式碼與部署設定為準。

- 專案定位：互動遊戲／遊戲化學習專案
- Repository：`cagoooo/Shoot`
- 可見性：公開
- 主要技術：TypeScript
- 線上入口：<https://cagoooo.github.io/Shoot/>

### 可以怎麼應用

- 課堂暖身、複習活動或學習站任務
- 校慶、闖關或社團活動中的互動挑戰
- 替換題庫、美術、音效與規則後，延伸成其他學科或主題遊戲

這些是依目前專案定位整理的延伸方向，不代表所有情境都已內建完成；實作前請先確認現有功能與資料格式。

### 技術與專案結構

- `README.md`
- `app`
- `docs`

檔案結構會隨版本演進；若本節與程式碼不一致，以目前預設分支的原始碼為準。

### 本機執行

請先閱讀根目錄設定檔與原始碼入口，再依專案所使用的語言／平台建立環境。此 repo 未提供可安全推定的通用啟動指令。

### 給 AI Agent 的接手指南

1. 先閱讀本 README、`AGENTS.md`（若有）、套件腳本與部署設定。
2. 先找出遊戲狀態、關卡／題庫資料與輸入控制的來源，再調整規則。
3. 更換素材時同步檢查授權、載入路徑、碰撞區域與不同螢幕比例。
4. 修改後至少驗證開始、遊玩、計分／勝負、重新開始，以及手機與桌面版面。
5. 不要捏造尚未存在的功能；README 與實作有落差時，應同時更新文件。
6. 提交前只納入本次任務檔案，並記錄實際執行過的驗證。

### 安全與資料注意事項

- 不要提交 `.env`、服務帳號、API 金鑰、token、學生個資或正式環境匯出資料。
- 使用 Firebase、Supabase、Google API 或其他雲端服務時，請建立自己的測試專案並套用最小權限。
- 若要公開衍生作品，請先確認程式碼、圖片、音訊、字型與教材內容的授權。

### 貢獻與客製化

歡迎依教學現場、活動或工作流程需求進行 fork／客製化。建議在變更說明中交代使用情境、主要修改、測試方式，以及是否影響資料格式或部署設定。
<!-- END:PROJECT_GUIDE -->
