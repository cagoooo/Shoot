# 地球守護隊：能量大作戰

給國小中、高年級學生的瀏覽器 3D 第一人稱永續行動遊戲。玩家在基地組裝像積木一樣的能量工具，探索環境問題區域，完成科學與工程挑戰後安全撤離；中年級可使用輔助模式，高年級以標準模式體驗溫和的部分損失與自主判斷。

目前的 `0.1.0-vertical-slice` 收錄完整任務〈垃圾風暴救援行動〉，聚焦 SDG 7、12、13，並預留未來 17 項 SDGs 任務、多元能量工具及多人連線架構。

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

專案已提供 `.github/workflows/deploy-pages.yml`。推送 `main` 後會用儲存庫名稱設定 Vite 子路徑並部署 `app/dist`。目前本機尚未設定 GitHub 遠端，因此正式 Demo 網址尚未產生；請勿先填入猜測網址。

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
