# Shopify 商品上架與 SEO/GEO 自動化_展示用 (MVP)

以 **Shopify CLI 與 Admin API（GraphQL）**為核心，涵蓋**商品/集合批次管理、AI 生成 SEO/GEO 商品內容、頁面產生器與安全發布、
部落格內容生成、搜尋意圖推薦與加權再排序**；官方 **Shopify dev-mcp** 輔助開發查詢 schema，**宜搭 (Yida)** 表單則作為下架流程
下游同步的其中一個整合點。本頁為**靜態前端展示**，商品與數據皆為**虛構範例**。

> 📌 公開作品展示頁；不含任何金鑰、Shopify 店鋪網域、client_id、宜搭 token、表單 id 或真實商品/營運資料。

## 線上展示

直接以瀏覽器開啟 `index.html`；若資源載入異常：

```bash
python -m http.server 8000   # 開 http://localhost:8000
```

## 功能特色

- **上架與下架流程動畫**：Excel 名單匯入 → Shopify 批次讀取（Admin GraphQL）→ AI 生成 SEO/GEO → Shopify 寫回 → 宜搭同步（下游）→ n8n 通知
- **AI 生成 SEO/GEO 商品文案（原始 → 完成）**：一鍵處理，逐步補上圖片、SEO 名稱、Handle 變更（含 301 轉址徽章）、列點＋GEO 敘述、標籤、JSON-LD 與宜搭同步狀態
- **商品／分類批次管理**：批次下架「循序 vs 平行（ThreadPoolExecutor）」效能對比圖表與動畫進度條、Collection 縮圖生成 pipeline 動畫
- **頁面產生器與安全發布**：兩套版型＋共用區塊庫，備份→切片 patch→驗證→寫入→重新讀取驗證的安全發布流程動畫
- **部落格文章生成與文案規則**：主題點選後打字機生成標題與 meta description，並即時計算全形字數依區間變色檢核
- **商品推薦：搜尋意圖分類器**：關鍵字比對約 8 類意圖分類（中英同義詞），顯示命中詞與信心指數
- **搜尋過濾與加權再排序**：標題 +20／供應商或類型 +10／Meta +3 加權重排序，含全形/半形空白正規化與權重圖例圖表
- **SEO/GEO 結構化資料**：JSON-LD 覆蓋清單（含不捏造 Review/AggregateRating 說明）與 GEO 策略條列
- 深色專業介面、響應式、兩張 Plotly.js 深色主題圖表

## 技術關鍵字

`Shopify CLI` · `Shopify Admin API (GraphQL)` · `Shopify dev-mcp` · `AI SEO/GEO 內容生成` ·
`批次自動化 (ThreadPoolExecutor)` · `頁面產生器 / 安全發布` · `搜尋意圖分類 / 加權再排序` ·
`JSON-LD 結構化資料` · `宜搭 (Yida) 表單同步` · `Python / Node`

## 在這個專案我實際做了什麼（高層說明）

- 🧰 **Shopify CLI＋Admin GraphQL 批次工具**：以 Shopify CLI 執行 Admin GraphQL 查詢／異動，官方 dev-mcp 輔助查詢 schema 與文件
- ⚡ **批次下架效能優化＋宜搭下游同步**：ThreadPoolExecutor 平行處理＋批次 handle 查詢取代逐筆查詢，示意效能約 15 分鐘 → 1.6 分鐘，下架同時同步宜搭表單狀態
- 🖼️ **Collection 縮圖 AI 生成 Pipeline**：Prompt → AI 繪圖 → 暫存上傳 → 寫入集合 → 重新讀取驗證上線，全自動化
- 🧱 **頁面產生器（兩套版型＋區塊庫＋安全發布）**：備份→切片 patch→驗證→寫入→重新讀取驗證，不整頁覆寫
- 📝 **部落格文章與 SEO/GEO 內容規則**：70–80 全形字 meta description、不捏造規格數字、避免句式公式化重複
- 🎯 **搜尋與推薦：意圖分類＋加權再排序**：關鍵字意圖分類（保溫瓶／馬克杯／帆布提袋等約 8 類）＋標題/供應商/Meta 加權重排序

> 實際商店網域、商品 handle、GraphQL schema 細節與生成 prompt 屬營運 know-how，未公開於此展示，可於面談時說明。

## 作者

Jason ｜ jason0308p@gmail.com

---
*本頁為展示用途，商品與數據為虛構範例，僅供參考。*
