# 交接文件：Portfolio 作品集搬 Cloudflare Pages

> 寫於 2026-07-24。**已由 AI 實際部署完成**，本文件記錄結果與後續維護方式。
> 方案：整個作品集純上線、無登入閘門 → **Cloudflare Pages**（非 Worker）。

---

## ✅ 已部署結果（2026-07-24 完成並驗證）

- **Cloudflare Pages 專案名**：`portfolio-demo`
- **正式網址**：**https://portfolio-demo-3pp.pages.dev/**
- **部署方式**：`wrangler pages deploy` 從本機上傳整個作品集根目錄（37 檔）
- **驗證通過**（curl 實測 HTTP 200）：
  - 首頁 `/`（title：Jason｜AI × 數據 × 自動化 作品集）
  - `/ga-mcp-demo/`、`/job-automation-demo/`、`/line-rag-demo/`、`/product-seo-demo/`、`/輿情_demo/` 全部 200
- **GitHub Pages 並存**：原本的 GitHub Pages 未動，兩邊可同時存在。

---

## 這個作品集是什麼（已查證）

- **100% 純靜態，免 build**（無 package.json）。根目錄 `index.html` 是作品集首頁，連到 5 個子 demo。
- 唯一外部依賴：部分 demo 用 Plotly.js 走公開 CDN，不需安裝。
- 路徑：`C:\Users\syf\Desktop\Portfolio_Demo\`
  ```
  index.html              ← 作品集首頁
  ga-mcp-demo/            ← GA MCP demo（純靜態，AI 分析為前端模擬）
  job-automation-demo/
  line-rag-demo/
  product-seo-demo/
  輿情_demo/
  case-studies/           ← .md 案例文件（非網頁）
  ```
- git repo：`https://github.com/Jason0308p/Portfolio-Demo-Jimmmmy29.git`

---

## 之後要更新內容怎麼做（重新部署）

改了任何 demo 的檔案後，重新部署一次即可：
```bash
cd C:\Users\syf\Desktop\Portfolio_Demo
# 需要有 Pages 編輯權限的 CLOUDFLARE_API_TOKEN
export CLOUDFLARE_API_TOKEN="<你的 token>"
export CLOUDFLARE_ACCOUNT_ID="758fac5904cc468daf602cdfa9665723"
npx wrangler pages deploy . --project-name portfolio-demo --commit-dirty=true
```
- 每次會給一個預覽網址；正式網址固定是 `portfolio-demo-3pp.pages.dev`。

### 更省事的替代：接 GitHub 自動部署（一勞永逸）
在 Cloudflare Dashboard → Workers & Pages → `portfolio-demo` → Settings → 連結 GitHub repo `Jason0308p/Portfolio-Demo-Jimmmmy29`，之後 git push 就自動部署，不用再手動跑 wrangler。授權在瀏覽器點。

---

## ⚠️ 安全提醒（重要）

- 這次部署用的 API token（`cfut_...`）是臨時建的、只有 **Cloudflare Pages > Edit** 權限。
- **用完建議到 Cloudflare 撤銷**：Dashboard → My Profile → API Tokens → 找到那顆 → Delete。
  之後要再部署，重建一顆或改接 GitHub 自動部署即可。
- 這份文件與 repo **不要**寫入任何 token 值。

---

## 附錄：如果之後想加「登入閘門」（現在沒用到）

若某天想讓某個 demo 要 email 驗證碼登入才看得到，可複製輿情專案的 worker 登入機制：
- 位置：`C:\Users\syf\Desktop\code\vs_code\n8n_project\0521_claude_輿情\cf_auth_worker\`
- 可複製：`_worker.js` 的登入頁 / OTP 產驗 / session HMAC / Gmail 寄信邏輯（移除 D1 相關的 `handleTrending`/`handleStockHistory`）
- 每站需獨立：新 Worker 名、新 KV namespace、5 個 secret（SESSION_SECRET / WHITELIST_EMAILS / GMAIL_CLIENT_ID / GMAIL_CLIENT_SECRET / GMAIL_REFRESH_TOKEN）、跑 authorize_gmail.py 產 Gmail token
- ⚠️ 寫 wrangler secret **禁用 PowerShell 管道**（會塞 BOM 害 invalid_client）；用 `python subprocess.run(input=val.encode("utf-8"))`，值先 strip BOM，寫完回讀驗證。
- ⚠️ Gmail OAuth 同意畫面要發布 Production，否則 refresh_token 每 7 天失效。