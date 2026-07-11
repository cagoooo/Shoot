# Suno BGM 成人帳號資產台帳

## 使用邊界

- 帳號持有人：阿凱老師的成人帳號。
- 學生不登入、不操作、不產生 Suno 作品。
- 此台帳不是要學生填寫的學習單。
- 正式 BGM 必須由阿凱老師確認帳號方案、使用條款與作品權利後才能上架。
- 若資料不完整，`audio-manifest.json` 必須維持 `awaiting-audited-file`。

## 每筆資產必填欄位

1. manifest ID
2. Suno 作品 ID 與原始連結
3. 產生／取得日期
4. 當時使用的成人付費方案
5. 完整提示詞
6. 使用模型與版本
7. 原始下載檔 SHA-256
8. 剪輯、循環、正規化紀錄
9. 最終遊戲檔名與 SHA-256
10. 當日 Suno 條款／授權說明快照位置
11. 人工審核人與日期
12. 上架狀態

## 待補正式作品

| manifest ID | 用途 | 作品 ID／連結 | 日期 | 付費方案 | 提示詞／模型 | 原始檔雜湊 | 剪輯紀錄 | 遊戲檔案 | 條款快照 | 審核人 | 狀態 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| music-base | 守護隊基地 | 待阿凱老師提供 | — | 待填 | 待填 | 待填 | 待填 | 待填 | 待填 | 待填 | 等待稽核檔案 |
| music-exploration | 區域探索 | 待阿凱老師提供 | — | 待填 | 待填 | 待填 | 待填 | 待填 | 待填 | 待填 | 等待稽核檔案 |
| music-tension | 黃色警示 | 待阿凱老師提供 | — | 待填 | 待填 | 待填 | 待填 | 待填 | 待填 | 待填 | 等待稽核檔案 |
| music-boss | 垃圾風暴機 | 待阿凱老師提供 | — | 待填 | 待填 | 待填 | 待填 | 待填 | 待填 | 待填 | 等待稽核檔案 |
| music-evacuation | 屋頂撤離 | 待阿凱老師提供 | — | 待填 | 待填 | 待填 | 待填 | 待填 | 待填 | 待填 | 等待稽核檔案 |
| music-success | 任務成功短曲 | 待阿凱老師提供 | — | 待填 | 待填 | 待填 | 待填 | 待填 | 待填 | 待填 | 等待稽核檔案 |
| music-report | 永續行動報告 | 待阿凱老師提供 | — | 待填 | 待填 | 待填 | 待填 | 待填 | 待填 | 待填 | 等待稽核檔案 |

## 僅供試聽的候選作品（不可部署）

| manifest ID | Suno 作品連結 | 生成日期 | 帳號方案 | 模型 | 用途 | 上架狀態 |
|---|---|---|---|---|---|---|
| music-base | https://suno.com/song/44fc9a08-87b1-46c2-87ac-026e83fb2c3a | 2026-07-11 | Free Plan | v4.5-all | 基地候選 A：Sprout Lab Morning | 僅供試聽；不得下載或部署 |
| music-base | https://suno.com/song/b05ee56c-1fcc-49a9-ae15-28c8538be9ed | 2026-07-11 | Free Plan | v4.5-all | 基地候選 B：Sprout Lab Morning | 僅供試聽；不得下載或部署 |

這兩首是在成人帳號登入後依 `suno-generation-prompts.md` 的基地提示詞產生。帳號當下顯示為 Free Plan，不符合本專案「正式遊戲 BGM 使用具有商用權利的成人付費方案」的發布門檻，因此不列入正式資產、不寫入 manifest，也不放進 GitHub Pages。

## 正式方案候選（待聽檢、下載與雜湊）

生成日期：2026-07-11　　帳號方案：Pro Plan　　模型：v5.5　　作品權利：Suno 帳戶頁明示「Commercial use rights for new songs made」。

| manifest ID | 場景 | 候選 A | 候選 B | 暫定選擇 | 狀態 |
|---|---|---|---|---|---|
| music-base | 守護隊基地 | [Sprout Hub Morning](https://suno.com/song/6047429d-1597-49ce-9fa8-2628c2eff65a) | [Sprout Hub Morning](https://suno.com/song/9de1423c-26d7-4911-95e3-77eca76f519e) | A | 待下載、聽檢與剪輯 |
| music-exploration | 區域探索 | [Recycling Trail Map](https://suno.com/song/17110dd1-6eae-4858-85b3-6fd49dcd338d) | [Recycling Trail Map](https://suno.com/song/a5e10576-c7e6-4d75-95d3-ad9c14e93d82) | B | 待下載、聽檢與剪輯 |
| music-tension | 黃色警示 | [Yellow Bin Check](https://suno.com/song/d38473e0-21cc-473e-952c-137d14f3d731) | [Yellow Bin Check](https://suno.com/song/bc926a16-77ef-43b6-b882-44b7de453c76) | B | 待下載、聽檢與剪輯 |
| music-boss | 垃圾風暴機 | [Recycled Reactor Run](https://suno.com/song/2e342971-4902-429c-b774-eed81aba5c29) | [Recycled Reactor Run](https://suno.com/song/72e96691-489b-4f61-b64e-c64b4dad934d) | B | 待下載、聽檢與剪輯 |
| music-evacuation | 屋頂撤離 | [Rooftop Relay](https://suno.com/song/9fb25329-63d4-41af-989a-a3ceddea974b) | [Rooftop Relay](https://suno.com/song/bb402fb0-b945-4d93-9af9-8252f7e74ff9) | A | 待下載、聽檢與剪輯 |
| music-success | 任務成功短曲 | [Little Green Win](https://suno.com/song/f4a15b3a-799a-44e3-833e-760f1b7f329e) | [Little Green Win](https://suno.com/song/d7464ad9-74aa-41d4-9ccf-1320f1b83cf7) | B | 待剪輯為 5–10 秒短曲 |
| music-report | 永續行動報告 | [Little Green Steps](https://suno.com/song/943e5f17-e267-4830-ac01-c5f6deda81ac) | [Little Green Steps](https://suno.com/song/f8f95908-a373-4ac5-951e-3ffe7f7112d7) | A | 待下載、聽檢與剪輯 |

「暫定選擇」依場景長度與提示詞契合度安排；部署前仍須以實際聽感確認無人聲、突發巨響、恐怖音色或干擾閱讀的頻段，並填入原始／最終檔 SHA-256、剪輯紀錄與條款快照。

## 建議的無歌詞提示詞方向

完整可直接貼入 Suno 的提示詞、節奏、長度與篩選流程見 `suno-generation-prompts.md`。

- 基地：明亮、溫暖、好奇心、輕科技感、沒有主唱。
- 探索：自然聲響感、穩定節拍、保留思考空間、沒有驚嚇音效。
- 緊張：可預測的節奏上升、不要恐怖、不要尖銳突發聲。
- 頭目：工程解題感、節奏清楚、緊張但不暴力。
- 撤離：積極前進、安全感、不要製造恐慌。
- 成功：5～10 秒、溫暖肯定、避免賭博式獎勵音效。
- 報告：安靜、反思、適合閱讀。

提示詞只是創作方向，不代表授權完成；仍須逐筆填妥台帳。
