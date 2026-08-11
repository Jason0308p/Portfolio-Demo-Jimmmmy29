# GA4 / GSC 資料視覺化 Dashboard_展示用

以 **GA4 Data API** + **Google Search Console API** 抓取的資料，透過自建 pipeline
（抓取 → 彙整 → 產生器）產出的**真實圖表引擎**互動式儀表板。與同作品集內的
`ga-mcp-demo`（MCP 串接 + AI 分析流程模擬）是不同重點的展示：這裡呈現的是
**資料視覺化本身**——KPI、流量來源、進站頁、事件、轉換漏斗、GSC 點擊/曝光/排名，
支援 30 / 90 / 180 天區間切換與中英雙語。

> 📌 公開作品展示頁；所有數字、頁面、品牌名稱皆為虛構脫敏資料（DEMO BRAND），
> 不含任何金鑰、真實 measurement id 或帳號資訊。

## 線上展示

直接以瀏覽器開啟 `index.html`，選擇任一區間/語言版本。

## 技術重點

- GA4 Data API + GSC API 資料擷取，Python pipeline 產生固定 schema 的中繼 JSON
- 圖表產生器一套邏輯輸出中/英雙語、多區間（30/90/180 天）共 6 份靜態頁，避免版本分裂
- 純前端純靜態，無需 build，Plotly.js 走 CDN
- 資料脫敏：真實資料在來源端經 token 對應表批次替換後才產出本頁

## 目錄

- `index.html` — 入口頁，列出各區間/語言版本
- `dashboard.html` / `dashboard_en.html` — 90 天報表（中/英）
- `dashboard_30.html` / `dashboard_en_30.html` — 近 30 天
- `dashboard_180.html` / `dashboard_en_180.html` — 近 180 天

## 免責聲明

本頁所有數字、排名、品牌名稱皆為虛構示意資料，僅供作品集 / 面試展示使用。
