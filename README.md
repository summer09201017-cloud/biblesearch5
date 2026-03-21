# 多譯本聖經查詢

可在手機與桌機使用的多譯本聖經查詢網站，支援：

- 和合本
- ESV
- 新譯本
- ASV
- KJV

## 資料來源

- `和合本 / 新譯本 / ASV / KJV`：讀取本地 JSON 資料庫 [data/bible_data.json](C:/Users/agape250/Desktop/聖經查詢COD/data/bible_data.json)
- `ESV`：透過信望愛 API 即時查詢

## 功能

- 經文定位：例如 `約 3:16-18`、`John 1`、`創 1:1-5`
- 關鍵字搜尋：先用指定譯本搜尋全本聖經，再展開同一節的五個譯本
- 響應式版面：手機單欄、桌機多欄
- PWA：可安裝到主畫面，支援離線 App 外殼與已快取查詢
- Netlify Functions：部署後保留 `/api/passage` 與 `/api/search`

## 本地啟動

```powershell
node server.js
```

開啟：

```text
http://localhost:4173
```

也可以直接雙擊：

- [start_server.bat](C:/Users/agape250/Desktop/聖經查詢COD/start_server.bat)：如果伺服器還沒開，就啟動後打開瀏覽器
- [restart_server.bat](C:/Users/agape250/Desktop/聖經查詢COD/restart_server.bat)：強制結束 `4173` 上的舊伺服器，再重新啟動

## GitHub + Netlify

本專案已包含：

- [netlify.toml](C:/Users/agape250/Desktop/聖經查詢COD/netlify.toml)
- [netlify/functions/passage.js](C:/Users/agape250/Desktop/聖經查詢COD/netlify/functions/passage.js)
- [netlify/functions/search.js](C:/Users/agape250/Desktop/聖經查詢COD/netlify/functions/search.js)

Netlify 發布目錄為 `public`，函式目錄為 `netlify/functions`，並已設定把：

- `/api/passage` 轉到 Netlify Function
- `/api/search` 轉到 Netlify Function

## PWA 檔案

- [public/manifest.webmanifest](C:/Users/agape250/Desktop/聖經查詢COD/public/manifest.webmanifest)
- [public/sw.js](C:/Users/agape250/Desktop/聖經查詢COD/public/sw.js)
- [public/pwa.js](C:/Users/agape250/Desktop/聖經查詢COD/public/pwa.js)
- [public/offline.html](C:/Users/agape250/Desktop/聖經查詢COD/public/offline.html)

## 來源

- [信望愛 API 文件](https://bible.fhl.net/api/)
- [經文查詢端點 qsb.php](https://bible.fhl.net/json/qsb.php)
- [關鍵字查詢端點 se.php](https://bible.fhl.net/json/se.php)
