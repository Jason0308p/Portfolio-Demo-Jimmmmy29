# GA4 + MCP 數據分析_展示用 (MVP)

把 **GA4 Data API**、**Google Search Console (GSC) API**、**Google Tag Manager (GTM) API** 的數據，
透過**自建 MCP Server (Model Context Protocol)** 標準化後餵給 AI 自動分析，並產出可視化儀表板與洞察。
本頁為**靜態前端展示**，所有數字、頁面、品牌、排名皆為**虛構脫敏資料**，AI 分析為前端模擬。

> 📌 公開作品展示頁；不含任何金鑰、真實 measurement id、帳號或真實數據。

## 線上展示

直接以瀏覽器開啟 `index.html`；若資源載入異常：

```bash
python -m http.server 8000   # 開 http://localhost:8000
```

## 功能特色

- **資料流程動畫**：GA4 / GSC / GTM → 自建 MCP Server → AI 分析 → 儀表板，依序亮燈示意
- **KPI 卡**：sessions、互動率、推估詢價、GSC 點擊 / CTR / 平均排名（紅漲綠跌，台灣慣例）
- **AI 分析摘要**：可選整體成效 / SEO 機會 / 轉換分析三種情境，逐字輸出（模擬）
- **進站頁流量長條圖**（虛構），深色專業介面、響應式

## 技術關鍵字

`GA4 Data API` · `Google Search Console (GSC) API` · `Google Tag Manager (GTM) API` ·
`官方 GA MCP (Google)` · `GSC / GTM API 整合` · `AI 分析 / LLM` ·
`API 配額管理` · `GA4 抽樣處理` · `跨資料模型對齊` · `資料視覺化` · `Python`

## 在這個專案我實際做了什麼（高層說明）

- 🔌 **官方 GA MCP + GSC / GTM API**：以 Google 官方 GA MCP 取 GA4 數據，整合 GSC / GTM API，讓 AI 以一致介面取數
- 🚦 **API 配額管理**：對 GA4 / GSC API 做請求節流、分頁、快取與退避重試，避免撞 429、確保大量取數穩定
- 📉 **GA4 抽樣處理**：拆分日期區間、縮小維度並偵測 samplingLevel，降低或標示 GA4 抽樣造成的失真
- 🧩 **跨資料模型對齊**：對齊 GA4 事件模型與 GSC 查詢模型的維度、時間與口徑，做可信交叉分析
- 🤖 **AI 自動分析**：取數後交 LLM 產出成效摘要、SEO 機會與轉換洞察
- 📈 **資料視覺化**：KPI 卡、每日趨勢、流量來源、GSC 關鍵字、轉換漏斗等儀表板

> 實際帳號、measurement id、查詢語法與分析 prompt 屬機密，未公開於此展示，可於面談時說明。

## 作者

Jason ｜ jason0308p@gmail.com

---
*本頁為展示用途，數字為虛構脫敏資料，僅供參考。*
