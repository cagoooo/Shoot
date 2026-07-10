# 回收站正式模型替換位置

目前垂直切片使用程式化灰盒幾何，確保桌機、平板與手機能先完成流程測試。

未來正式美術檔放置為 `recycling-station.glb`，並透過
`RecyclingStationAssetProvider` 載入；任務區域、分類規則、路線圖與檢查點不依賴模型節點名稱。
