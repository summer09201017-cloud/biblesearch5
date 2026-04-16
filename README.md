# 多譯本聖經查詢

可在手機與電腦使用的多譯本聖經查詢網站，目前支援：

- 和合本
- ESV
- NIV
- 呂振中譯本
- 新譯本
- ASV
- KJV

## 資料來源

- 六個既有譯本都讀取本地整合 JSON 資料庫：[data/bible_data.json](C:/Users/agape250/Desktop/聖經查詢COD/data/bible_data.json)
- `NIV` 讀取分卷 JSON：[data/NIV](C:/Users/HFP/Downloads/聖經查詢COD/聖經查詢COD/data/NIV)
- 其中 `ESV` 與 `呂振中譯本` 另外保留 FHL 下載檔：
  - [data/fhl_esv.json](C:/Users/agape250/Desktop/聖經查詢COD/data/fhl_esv.json)
  - [data/fhl_lcc.json](C:/Users/agape250/Desktop/聖經查詢COD/data/fhl_lcc.json)
- FHL 下載腳本：[scripts/download_fhl_versions.mjs](C:/Users/agape250/Desktop/聖經查詢COD/scripts/download_fhl_versions.mjs)

## 功能

- 經文定位：可輸入 `約 3:16-18`、`John 1`、`詩 23`、`創 1:1-5`
- 關鍵字搜尋：先用指定譯本搜尋整本聖經，再展開同一節的多個譯本
- 英文關鍵字：未指定譯本時優先用 `ESV`
- 閱讀設定：可調整經文字型大小，會保留在瀏覽器
- 信望愛註釋：搜尋結果可直接打開對應經文註釋
- 響應式版面：適合手機與桌機
- PWA：可安裝成類 App 使用
- Netlify Functions：提供 `/api/passage` 與 `/api/search`

## 本機啟動

```powershell
node server.js
```

開啟：

```text
http://localhost:4173
```

也可以直接雙擊：

- [start_server.bat](C:/Users/agape250/Desktop/聖經查詢COD/start_server.bat)
- [restart_server.bat](C:/Users/agape250/Desktop/聖經查詢COD/restart_server.bat)

## 重新下載 FHL 版本

```powershell
node scripts/download_fhl_versions.mjs
```

這會重新下載：

- `ESV`
- `呂振中譯本`

並更新：

- [data/fhl_esv.json](C:/Users/agape250/Desktop/聖經查詢COD/data/fhl_esv.json)
- [data/fhl_lcc.json](C:/Users/agape250/Desktop/聖經查詢COD/data/fhl_lcc.json)
- [data/bible_data.json](C:/Users/agape250/Desktop/聖經查詢COD/data/bible_data.json)

## Netlify

部署設定檔：

- [netlify.toml](C:/Users/agape250/Desktop/聖經查詢COD/netlify.toml)
- [netlify/functions/passage.js](C:/Users/agape250/Desktop/聖經查詢COD/netlify/functions/passage.js)
- [netlify/functions/search.js](C:/Users/agape250/Desktop/聖經查詢COD/netlify/functions/search.js)

Netlify 建議設定：

- `Base directory`: 留空
- `Build command`: 留空
- `Publish directory`: `public`
- `Functions directory`: `netlify/functions`

## PWA

- [public/manifest.webmanifest](C:/Users/agape250/Desktop/聖經查詢COD/public/manifest.webmanifest)
- [public/sw.js](C:/Users/agape250/Desktop/聖經查詢COD/public/sw.js)
- [public/pwa.js](C:/Users/agape250/Desktop/聖經查詢COD/public/pwa.js)
- [public/offline.html](C:/Users/agape250/Desktop/聖經查詢COD/public/offline.html)

## 來源

- [信望愛 API 文件](https://bible.fhl.net/api/)
- [qb.php](https://bible.fhl.net/json/qb.php)
- [listall.html](https://bible.fhl.net/json/listall.html)
- [版權說明](https://www.fhl.net/main/fhl/fhl8.html)
