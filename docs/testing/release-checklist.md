# 正式發布檢查表

每次要把新版本推上 GitHub Pages（`main` 分支）前，複製下方「本次發布紀錄」區塊到當次的發布筆記，逐項勾選。目標：更新可追溯、不影響上課。

## 使用方式

1. 發布前：完成「發布前檢查」全部項目。
2. 推送後：等 GitHub Actions 完成，執行「發布後驗證」。
3. 有問題：依「回復方案」處理，並記錄原因。

---

## 本次發布紀錄（範本）

- 發布日期：
- 版本號（`app/public/version.json`）：
- 對應 commit：
- 發布人：阿凱老師
- 這次改了什麼（一句話，給教師與家長看得懂的說法）：

### 發布前檢查

- [ ] `app/public/version.json` 的版本號已更新（格式如 `0.2.0`，重大內容改第二碼、修正改第三碼）。
- [ ] 本機驗證全數通過：

  ```powershell
  npm --prefix app run lint
  npm --prefix app run typecheck
  npm --prefix app run test -- --run
  npm --prefix app run build
  npm --prefix app run test:e2e
  ```

- [ ] 子路徑建置驗證：`$env:VITE_REPO_NAME='Shoot'` 後 `npm --prefix app run build`，確認 `app/dist/index.html` 資源路徑含 `/Shoot/`。
- [ ] 若新增或替換 BGM／音效：`docs/testing/suno-asset-ledger.md` 已補上來源、方案、SHA-256 與審核人。
- [ ] 若改了學生可見文字：檢查用語適合國小中高年級、無血腥或恐怖字眼、先白話後知識。
- [ ] 若改了 OG 分享圖或標題：og:image 網址已加新的版本查詢字串（防 LINE／FB 快取舊圖）。
- [ ] commit 訊息能看出本次變更範圍。

### 發布後驗證（GitHub Actions 完成後）

- [ ] Actions 的 CI 與 Pages workflow 都是綠色。
- [ ] https://cagoooo.github.io/Shoot/ 首頁回傳 200、可正常進入基地。
- [ ] `https://cagoooo.github.io/Shoot/version.json` 顯示本次版本號。
- [ ] 手機瀏覽器實際打開一次：開始畫面、觸控按鈕、音樂開關正常。
- [ ] 已安裝 PWA 的裝置收到「新版本已準備好」提示，按下後更新成功。
- [ ] 若改了分享素材：用 LINE 或 Facebook 分享偵錯工具重新抓取預覽。

### 教師公告（需要時）

> 【地球守護隊更新】今天更新到 vX.Y.Z：＿＿＿＿。
> 已在網頁版與平板測試過；如果畫面看起來是舊的，請重新整理一次，或按更新提示的「立即更新」。
> 網址：https://cagoooo.github.io/Shoot/

### 回復方案

1. **小問題（不擋上課）**：記錄問題，下一版修正即可。
2. **阻斷性問題（無法進入任務、存檔壞掉、畫面全黑）**：
   - 立刻 `git revert` 問題 commit 並推送 `main`，讓 Pages 自動重建回穩定版。
   - 不要用 `git push --force` 回退，保留完整歷史。
   - 通知已分享連結的班級「請重新整理頁面」。
3. **存檔相容問題**：學生本機存檔壞掉時，遊戲會自動回到安全預設值；提醒學生可用「匯出進度」先備份。

### 發布結果

- 發布完成時間：
- 驗證裝置：
- 遺留問題（若有）：
