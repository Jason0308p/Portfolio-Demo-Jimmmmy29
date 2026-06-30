---
name: demo-builder
description: 把 n8n_project 底下的私有專案，轉成可公開展示的靜態 demo，集中到作品集 repo。當使用者要「新增一個專案 demo」「整理作品集」「把某專案做成展示頁」「檢查 demo 有沒有洩漏機密」時使用。負責規範資料夾結構、靜態化、假資料化、機密過濾與發布前驗證。
---

# demo-builder — 作品集 Demo 建置與整理

## 這個 skill 在做什麼

把 Jason 散落在 `n8n_project/` 各處的真實專案，逐一轉成**乾淨、可公開、純前端靜態**的展示頁，
集中在這個作品集 repo，供求職／作品集對外展示。

核心原則一句話：**對外只放「體驗層」（前端介面 + 局部假資料 + 模擬回應），真實的金鑰、資料、核心邏輯、私密歷史一律留在原專案、不進這個 repo。**

> Jason 正在求職。這些 demo 的目的是讓人 30 秒內看懂「他做過什麼、會串接什麼」，
> 而不是提供可運作的正式系統。可信度靠的是「乾淨的展示 + 誠實的 README + 真實程式碼留在私有原專案」。

## 鐵律：絕對不可進入這個 repo 的東西

每次建立或更新 demo，**完成後必跑「發布前驗證」**（見最後一節）。以下一律禁止：

- API key / token / secret / 密碼（Gemini、LINE、Google、OpenAI、Qdrant…）
- `.env`、`.env.*`、任何 `*service-account*.json`、`*credentials*.json`、`.secrets/` 內容
- 真實營運資料（完整產品表、真實客戶/訂單、完整爬蟲產出、真實 GA/GSC 帳號數據）
- 核心資料邏輯與商業規則的可執行版本（後端演算法、報價規則、prompt 全文、私有 schema）
- 大量私密 commit 歷史（→ 用獨立、乾淨歷史的 repo，不要沿用原專案 git 歷史）

可以放的：前端介面、**局部且去識別化**的範例資料、模擬的 AI 回應、架構示意圖、
方法論層級的設計說明（講「為什麼這樣設計」可以，但不貼可直接複製的營運邏輯/金鑰）。

## 簡述拿捏（重要）

各原專案內都有 AI 工作日誌、`*.md` 說明、`SKILL.md`、MCP 設定等豐富素材，**但這是綜合作品集、是公開的**。
撰寫每個 demo 的說明時，只做「簡述」，目的是讓人知道「做過、會串接」，**不是技術交接文件**。

- ✅ 寫：技術棧名稱（LINE/Gemini/Qdrant/n8n/MCP/GA4…）、解決的問題、成果、設計取捨的「方向」。
- ❌ 不寫：可複製的核心演算法/商業規則、完整 prompt、私有 schema/欄位定義、實際參數與門檻值、
  資料來源清單細節、能重現系統的 step-by-step、客戶/公司可辨識資訊。
- **避免商業利益衝突**：凡是「講出來別人就能照做、或會洩漏雇主營運 know-how」的內容，一律不寫或只講到方向為止。
- 從原專案的工作日誌/SKILL/MD **提煉重點 3–5 條**即可，寧可少而精，不要照搬。
- 拿不準某段算不算敏感時，**預設不寫**，或改用更抽象的講法。

## 技術關鍵字 / 技能標註（SEO + 履歷面試用，重要）

每個 demo **都要明確列出實際用到的技術、API、平台、技能關鍵字**——這是給人看的，也是給搜尋引擎與履歷關鍵字比對用的。
做法：在 Hero 的技術標籤（tag）、設計重點、「我做了什麼」段落，**自然帶入具體名詞**（不是只寫「串接 API」這種空話）。
原則仍是「只到方向、不洩邏輯」，但**技術名詞本身要寫滿、寫準**（名詞不是機密，門檻參數才是）。

寫關鍵字時用「**官方/業界正式名稱**」，方便被搜尋與被招募系統(ATS)比對，例如：
- Shopify：**Shopify Storefront Search API**、Storefront API (GraphQL)、Admin API、Shopify CLI、Liquid、Theme、MCP
- 宜搭：**宜搭 (DingTalk Yida) 表單 API**、**自建 MCP Server**、低程式碼整合
- Google：GA4 Data API、Google Search Console (GSC) API、Google Tag Manager (GTM) API、OAuth、Service Account
- AI/檢索：RAG、向量檢索、Qdrant、Embeddings、Gemini、LLM、prompt engineering、MCP (Model Context Protocol)
- 自動化：n8n、Webhook、爬蟲 (web scraping)、Notion API、排程
- 一般：Python、JavaScript、REST/GraphQL、資料視覺化、ETL/資料同步

### 各專案技術關鍵字庫（建/更新 demo 時挑相關的寫進去）

- **line-rag-demo**：LINE Messaging API、n8n、Webhook、RAG、向量檢索、Qdrant、Embeddings、Gemini/LLM、
  宜搭 (DingTalk Yida) 表單 API、自建 MCP、冷熱資料分層、Python。
- **ga-mcp-demo**：GA4 Data API、Google Search Console (GSC) API、Google Tag Manager (GTM) API、
  **自建 MCP Server (Model Context Protocol)**、OAuth/Service Account、AI 分析、資料視覺化、脫敏資料產生、Python。
- **job-automation-demo**：多平台爬蟲 (104/1111)、web scraping、反爬處理、規則 + AI 評分、JD 解析、
  AI 生成 (CV/面試 QA)、Notion API、去重同步、pipeline 設計、Python。
- **product-seo-demo（Claude_改J1上架商品名）**：自建宜搭 (Yida) MCP Server、AI SEO/GEO 內容生成、
  爬蟲商品自動補圖/補敘述、批次 diff/preflight/重試、n8n 社群自動化、成效數據回收、Node/Python。
- **shopify demo（若建）**：**Shopify Storefront Search API**、Storefront API (GraphQL)、Admin API (GraphQL)、
  Shopify CLI、Liquid/Theme、MCP、商品/集合管理、SEO、301 redirect、資料自動化。
- **輿情_demo**：自建 MCP、多來源爬蟲、RSS、AI 情緒分析、資料視覺化、UI/UX、深連結、Python。

> 維護鐵律：之後任何專案新增用到的技術，**都要把關鍵字補進對應 demo 與此關鍵字庫**（[[feedback_sync_all_docs]] 精神）。

## Repo 結構

這個 repo 應為**獨立、乾淨歷史的公開 repo**（不要是 `N8N_syf` 的子資料夾，否則私密歷史會一起曝光）。
建議 repo 名與資料夾名用無空格小寫，例如 `portfolio-demos`，方便 GitHub Pages 網址。

```
portfolio-demos/
├── index.html              # 總覽首頁：卡片式列出所有 demo + 一句話定位 + 進入連結
├── README.md               # repo 說明：我是誰、這些 demo 是什麼、為何用假資料、聯絡方式
├── .nojekyll               # 讓 GitHub Pages 不做 Jekyll 處理（含底線資料夾才正常）
├── .gitignore              # 擋 .env / .secrets / node_modules / *.key 等（雙保險）
├── .claude/skills/demo-builder/SKILL.md
├── 輿情_demo/              # 既有範本：0521_claude_輿情
│   ├── index.html  ├── style.css  ├── script.js  └── README.md
├── ga-mcp-demo/            # Claude_mcp_GA → GA4+GSC+GTM+AI+MCP（假數據）
├── job-automation-demo/    # minimax_英文規劃_專案3 → AI+爬蟲+Notion 履歷自動化
└── line-rag-demo/          # LINE客服機器人 → LINE+AI+RAG+n8n
```

> 子資料夾命名用英文小寫連字號（GitHub Pages 友善）；既有的 `輿情_demo` 可保留或一併改名。

## 單一 demo 的標準範式（以既有 輿情_demo 為準）

每個 demo 是**自給自足的靜態網站**，四個檔：

- `index.html` — 介面 + 內嵌局部範例資料（如 `<script>window.DEMO_DATA=[...]</script>`）
- `style.css` — 樣式（沿用 輿情_demo 的深色專業風，保持作品集視覺一致）
- `script.js` — 前端互動；**模擬**後端/AI 行為，不打任何真實 API
- `README.md` — 用下方範本

GitHub Pages 只能跑靜態，所以**任何後端（Python server / n8n / MCP / 向量庫）都要在前端用 JS 模擬**：
- 真實 API 呼叫 → 改成讀內嵌假資料的本地函式
- AI 回應 → 兩層：①手寫的「劇本式」漂亮回答（展示黃金路徑）②從假資料套模板的「動態式」回答（亂打也答得出）
- 多平台串接（LINE/n8n/MCP/Qdrant）→ 用架構流程圖 + 節點依序亮燈動畫「視覺化模擬」，並誠實標註為示意

### README 範本（每個 demo 一份）

```markdown
# <專案名>_展示用 (MVP)

<一句話定位>。本頁為**靜態展示**，純展示介面與互動，資料為局部範例、AI 回應為模擬。

> 📌 公開作品展示頁，僅含前端與少量範例資料；不含任何金鑰、真實資料或營運邏輯。

## 線上展示
直接開 `index.html`；若資源載入異常用本機伺服器：`python -m http.server 8000`

## 功能特色
- ...（條列）

## 展示資料範圍
| 項目 | 內容 |
|------|------|
| 資料 | 局部範例（非真實營運資料）|
| AI/後端 | 前端模擬，不串接真實服務 |
| 更新方式 | 靜態快照，不即時更新 |

## 我在這個專案實際做了什麼（真實版說明）
- <技術棧：例 LINE + Gemini + Qdrant RAG + n8n + Google Sheets>
- <關鍵設計決策與為什麼：例 分層檢索兼顧準確度與成本、報價保守防錯>
- （真實程式碼/架構文件留在私有原專案，可面談時展示）

## 作者
Jason ｜ jason0308p@gmail.com

---
*本頁為展示用途，資料為範例片段，僅供參考。*
```

## 建一個新 demo 的流程

1. **盤點原專案**：找出最能展示的「成果畫面」。許多專案已有靜態產出可直接改造：
   - `Claude_mcp_GA/ga-dashboard-deploy/`（GA 儀表板 HTML，已是靜態）
   - `0521_claude_輿情/site/`、各 dashboard 資料夾
   - `LINE客服機器人回應_完整版/test_chat_ui.html`（聊天 UI，可改成前端模擬）
2. **抽局部假資料**：從真實快照抽幾十筆，**去識別化**（改名、改數字、移除可辨識客戶/帳號）。
3. **靜態化**：移除所有 `fetch` 真實 API；後端/AI 行為改 JS 模擬（劇本 + 模板兩層）。
4. **多平台串接視覺化**：畫架構流程圖 + 互動亮燈動畫，標註「示意/模擬」。
5. **寫 README**（用上方範本），補「我實際做了什麼 + 設計決策」段落。
6. **更新總覽 `index.html`**：加一張卡片連到新 demo。
7. **跑發布前驗證**（下節）。

## 各專案 demo 重點對照（建置時參考）

- **輿情_demo（0521_claude_輿情）**：台股輿情儀表板。已完成，當視覺與結構範本。
  賣點：自建 MCP + 多來源爬蟲 + AI 情緒分數 + 強 UIUX（多分頁、深色、響應式、深連結）。
- **ga-mcp-demo（Claude_mcp_GA）**：GA4 + GSC + GTM + AI 分析 + MCP 串接。
  賣點：把 GA/GSC/GTM 數據用 MCP 餵給 AI 做分析並產出儀表板。**全用假數據**。
  可改造 `ga-dashboard-deploy/` 既有 HTML，務必換掉真實帳號/數據與 measurement id。
- **job-automation-demo（minimax_英文規劃_專案3）**：AI + 爬蟲 + Notion 自動化求職。
  賣點：職缺抓取 → AI 整理 → 自動產 QA/CV → 寫入 Notion 的 pipeline。
  用流程動畫 + 假職缺/假履歷片段呈現；**不可放真實個資與真實職缺爬取結果全量**。
- **line-rag-demo（LINE客服機器人）**：B2B 客服機器人，串 LINE + AI + RAG + n8n + 宜搭(Yida) + 通知。
  範圍：API 串接、冷熱資料分層、宜搭表單、LINE 收發、群組通知、RAG 向量庫、AI 回應。
  賣點（只講方向）：訊息進來 → 分層檢索（精準→語意）→ AI 生成 → 回覆 + 通知；冷熱資料分流、報價保守防錯。
  改造 `test_chat_ui.html` 成前端模擬聊天 + LINE→n8n→RAG→AI→回覆/通知 流程動畫；
  細節（實際門檻、prompt、欄位、資料來源）一律不寫。

## 發布前驗證（每次必跑，通過才可 commit / push）

在 repo 根目錄執行，**任何一項命中就要先處理**：

```bash
# 1. 掃機密字樣與金鑰格式（應為空）
grep -rniE "api[_-]?key|secret|password|token|bearer|AIza[0-9A-Za-z_-]{20,}|sk-[A-Za-z0-9]{20,}" \
  --include=*.html --include=*.js --include=*.css --include=*.md --include=*.json . \
  | grep -viE "localStorage|THEME_KEY|TEXT_KEY|BG_KEY|data-key|aria|api 串接|金鑰|不含"

# 2. 確認沒有機密檔被加入
find . -iname ".env*" -o -iname "*service-account*" -o -iname "*credential*" -o -name "*.key" -o -name "*.pem"

# 3. 確認 git 歷史乾淨（應只有 demo 相關提交，不是沿用 N8N_syf 全歷史）
git log --oneline | head

# 4. 抽查每個 demo 是否真的沒打外部 API
grep -rn "fetch(\|XMLHttpRequest\|axios" --include=*.js . | grep -viE "http://localhost|範例|mock|模擬"
```

人工再確認：
- 每個 demo 的 README 都有「展示用 / 局部資料 / 不含金鑰」聲明。
- 範例資料已去識別化（無真實客戶名、訂單號、真實 GA 帳號/measurement id、真實個資）。
- 總覽首頁連結都通、`.nojekyll` 存在、底線開頭資料夾能正常載入。

## 維護規則

- 新增/修改任何 demo，**必同步更新總覽 `index.html`** 的卡片清單。
- 每個 demo 視覺沿用同一套 `style.css` 風格，保持作品集一致性。
- 真實邏輯有更新時，**不要**為了同步而把更多真實邏輯搬進公開 repo；只更新展示與 README 說明。
- 這個 repo 與原始私有專案**永遠分離**：原專案改動不自動流入此 repo。
