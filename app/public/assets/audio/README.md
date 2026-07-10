# 遊戲音訊資產區

本資料夾只接受已完成 `docs/testing/suno-asset-ledger.md` 稽核的音訊檔案。

## 使用原則

- Suno 音樂只由阿凱老師使用自己的成人付費帳號製作或挑選。
- 學生端不連接 Suno、不登入 Suno，也不要求學生產生任何作品。
- 正式音樂需同時提供 `ogg` 與 `mp3`，由瀏覽器選擇可播放格式。
- 檔名使用 manifest ID，例如 `music-exploration.ogg`。
- BGM 不使用歌詞與人聲主唱，避免干擾閱讀、旁白及課堂指令。
- 音訊必須先檢查突發高音量、恐怖聲響、版權與授權紀錄。

## 建議輸出

- 音樂：44.1 kHz 或 48 kHz、立體聲、循環接點無爆音。
- 音效：44.1 kHz 或 48 kHz，短音效避免過長殘響。
- 響度：BGM 約 -18 至 -16 LUFS，峰值不高於 -1 dBTP。
- 每個檔案建立 SHA-256，寫入資產台帳後才能把 manifest 狀態改為 `approved`。

目前七個 BGM 欄位皆為 `awaiting-audited-file`，因此正式網站不會載入不存在或未核准的音樂。
