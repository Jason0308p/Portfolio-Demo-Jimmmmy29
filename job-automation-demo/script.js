/* job-automation-demo — 前端模擬（無真實 API；職缺/公司/薪資皆虛構） */
(function () {
  "use strict";

  /* ---------- 虛構職缺資料 ---------- */
  var JOBS = [
    { id: 1, title: "資料工程師", co: "晶宇科技", loc: "台北", pay: "70k–95k", score: "A", reason: "JD 高度匹配：Python、ETL、雲端資料管線", src: "104",
      ktrack: "KB", status: "面試邀約", keywords: "Python, ETL, 雲端資料管線", posted: "20260618", url: "https://www.104.com.tw/job/8k2x1", applicants: 34,
      entryAngle: "🟠KB 切入點次強：ETL／資料管線是你近期主力經驗；資料正規化與監控 → 直接對應這職缺「整合多平台資料」的核心痛點",
      strategy: {
        pain: [
          "跨平台/跨系統的資料格式常常兜不起來，工程師花大量時間在「對齊欄位」而不是真正的分析",
          "既有批次 ETL 排程偏舊，出錯常常是下游報表「數字怪怪的」才被動發現，沒有主動告警",
          "資料量成長後，原本每天一次的批次處理越跑越久，開始卡到隔天早上的報表交付時間"
        ],
        fit: [
          "曾主導重構一條 ETL pipeline，把「失敗後被動發現」改成主動告警，平均問題發現時間從數小時縮短到 15 分鐘內",
          "有實際做過跨來源資料正規化（欄位格式統一、去重、對帳），直接對應這職缺「整合多平台資料」的核心需求",
          "把原本一段跑 3 小時的批次任務改寫成增量處理，壓到 40 分鐘內完成，騰出資源給其他任務"
        ],
        gaps: [
          "履歷目前沒寫出「資料規模」的具體數字，建議補一句如：日處理量／資料筆數的量級",
          "可以加一段說明「告警與監控機制」的設計思路，呼應 JD 提到的維運穩定性要求",
          "雲端資料倉儲（如 BigQuery / Redshift）若有實作經驗但沒寫進履歷，建議明確列出，這職缺明顯偏好雲端經驗"
        ],
        qa: [
          { q: "請描述一次你重構資料管線的經驗？", a: "用 STAR 框架：先講原本的痛點（被動發現錯誤、跑太久），再講你做的具體改動（監控/增量處理），最後給量化結果（時間縮短多少）。" },
          { q: "你怎麼設計資料品質的監控機制？", a: "分層講：欄位層級的規則檢查（型別/空值）、批次層級的筆數對帳、以及異常時的告警通道，強調「主動發現」而不是被動等人回報。" },
          { q: "如果上游資料源臨時改了欄位格式，你的 pipeline 會怎麼反應？", a: "先講 schema validation 這一層會先攔下來，再講你會怎麼設計 fallback（先擋住不讓髒資料進下游，再通知負責人），而不是讓錯誤資料默默流進報表。" },
          { q: "（犀利補弱項）你過去處理的資料量都偏中小規模，如果資料量一次放大 10 倍，你現在的設計還撐得住嗎？", a: "誠實面對規模差距，但講清楚「哪些設計原則是可以延伸的」（增量處理、分區、非同步告警），以及「哪些地方你知道需要重新評估」（單機批次可能要改分散式），展現你懂得自己方案的邊界。" },
          { q: "為什麼想加入晶宇科技？", a: "具體連結公司產品方向與自己技能重疊處，避免只講「想學新技術」這種空泛答案。" }
        ]
      }
    },
    { id: 2, title: "AI 應用工程師", co: "泰科系統", loc: "新竹", pay: "80k–110k", score: "A", reason: "命中 RAG / LLM / 向量資料庫關鍵字", src: "1111",
      ktrack: "KA", status: "Offer", keywords: "RAG, LLM, 向量資料庫", posted: "20260622", url: "https://www.1111.com.tw/job/9j3f2", applicants: 58,
      entryAngle: "🟢KA 切入點最強：RAG／LLM 是你近期主力專案；向量資料庫 → 直接對應你自建的多模型編排經驗（面試可能全英文）",
      strategy: {
        pain: [
          "客服/內部知識庫的問答常常「答非所問」，因為檢索到的段落跟問題語意對不上，等於做了 RAG 但沒真正解決準確度",
          "既有系統只串了單一模型，遇到模型限流或品質不穩時沒有備援，整個服務直接掛掉",
          "工程團隊對「prompt 怎麼調」沒有系統化方法，改一次 prompt 要靠人工肉眼比對輸出品質"
        ],
        fit: [
          "有實作過 RAG 系統的 chunking／向量索引調校經驗，處理過「檢索到但答非所問」的問題，用改善 chunk 策略把命中率明顯提升",
          "做過多模型編排（同一任務有主模型+備援模型自動切換），直接對應這職缺「服務穩定性」的痛點",
          "曾設計過 prompt 版本管理與 A/B 比較流程，把「改 prompt 靠肉眼」變成有基準可比對的流程"
        ],
        gaps: [
          "履歷目前對「向量資料庫」的實作深度描述較少，建議補一句具體用的索引策略（如 HNSW）",
          "可以加一句「多模型編排／備援設計」的經驗，這職缺明顯在意系統穩定性而不只是準確率",
          "面試官背景偏技術主管，建議準備 1-2 個能講清楚「為什麼選這個技術」而不只是「做了什麼」的案例"
        ],
        qa: [
          { q: "請簡述一個你做過最相關的 RAG 專案？", a: "用 STAR：情境先講原本的問答準確率痛點，行動具體到 chunking／embedding 模型選型，結果附上量化的準確率或使用者滿意度提升。" },
          { q: "為什麼選這個 chunking 策略？", a: "講清楚你比較過的選項（固定長度 vs 語意切分）以及取捨依據（檢索準確率 vs 延遲），避免只講「這樣比較準」這種沒有比較基準的答案。" },
          { q: "如果主要模型 API 限流或掛掉，你的系統怎麼處理？", a: "講備援模型自動切換的設計、以及使用者體感上如何降級（例如提示回應較慢但不中斷）。" },
          { q: "（犀利補弱項）你對向量資料庫索引調校的經驗聽起來偏應用層，如果要你從頭選型並評估索引策略，你會怎麼做？", a: "誠實講目前經驗的深度，但展示你知道評估的維度是什麼（資料規模、查詢延遲要求、更新頻率），展現學習能力而不是硬凹已經懂。" },
          { q: "公司近期主打 B2B SaaS 客服 AI，你怎麼看這個賽道？", a: "具體提到你認同或觀察到的產品方向，並連結自己技能能貢獻的點，避免空泛的「很有前景」。" }
        ]
      }
    },
    { id: 3, title: "數據分析師", co: "宏睿數位", loc: "台北", pay: "55k–75k", score: "B", reason: "分析技能符合，雲端經驗為加分項", src: "104",
      status: "已投遞", keywords: "資料分析, 雲端, Excel", posted: "20260625", url: "https://www.104.com.tw/job/7h5k9", applicants: 21 },
    { id: 4, title: "自動化工程師", co: "立群智能", loc: "新北", pay: "60k–80k", score: "B", reason: "n8n / 爬蟲符合，產業略有落差", src: "1111",
      status: "待投遞", keywords: "n8n, 爬蟲, 自動化", posted: "20260619", url: "https://www.1111.com.tw/job/4m8p1", applicants: 12 },
    { id: 5, title: "後端工程師", co: "佳威網路", loc: "高雄", pay: "50k–70k", score: "C", reason: "技能部分符合，地點偏遠", src: "104",
      status: "不投", keywords: "後端, API, 資料庫", posted: "20260610", url: "https://www.104.com.tw/job/2q7w4", applicants: 46 },
    { id: 6, title: "行銷數據專員", co: "睿成行銷", loc: "台北", pay: "45k–60k", score: "C", reason: "偏行銷導向，技術成分較低", src: "1111",
      status: "不投", keywords: "行銷, 數據分析, 廣告", posted: "20260615", url: "https://www.1111.com.tw/job/6r1t8", applicants: 29 },
    { id: 7, title: "MarTech 工程師", co: "澄星資訊", loc: "台北", pay: "70k–95k", score: "A", reason: "命中 MarTech / CRM / 行銷自動化 + AI 整合經驗", src: "yourator",
      ktrack: "KA", status: "待投遞", keywords: "MarTech, CRM, 行銷自動化, AI", posted: "20260628", url: "https://www.yourator.co/jobs/xxxx-martech", applicants: 17,
      entryAngle: "🟢KA 切入點最強：MarTech 是你本業；AI → 對應你的 RAG/MCP/多AI編排（需英文）",
      strategy: {
        pain: [
          "行銷團隊手動把廣告成效資料倒進 CRM 做受眾分群，流程慢且容易出錯，行銷活動常常等資料等到過了黃金時間",
          "多個廣告平台（Meta/Google/LINE）的數據格式不一致，沒有統一的資料層，行銷跟工程常常各說各話",
          "既有自動化流程是靠人工排程觸發，沒有事件驅動機制，行銷活動反應速度慢半拍"
        ],
        fit: [
          "有實作過多平台資料整合的自動化流程，把原本要跨 3 個系統手動複製貼上的流程，改成排程自動同步，省下大量重複人工",
          "曾串接過 CRM／行銷工具的 API，理解「行銷需求」跟「工程實作」中間怎麼對齊，不是只會寫程式不懂行銷語言",
          "有 AI（RAG／多模型編排）相關經驗，可以把這個職缺「MarTech + AI」的方向往前推一步，例如用 AI 輔助受眾分群或內容生成"
        ],
        gaps: [
          "履歷目前偏重技術面，建議補一句「理解行銷成效指標（如 CTR/轉換率）」的經驗，讓行銷主管更有共鳴",
          "廣告平台 API（Meta Ads/Google Ads）若有實作經驗但沒寫出來，這職缺會很吃這塊，建議明確列出",
          "面試可能會用英文，建議提前準備一段英文的專案簡介（本職缺 JD 有提到需要跨國團隊溝通）"
        ],
        qa: [
          { q: "請描述一個你做過的行銷/CRM 相關自動化專案？", a: "STAR 框架，情境講原本手動流程的痛點（耗時/易錯），行動講你怎麼設計自動化，結果附上省下的時間或減少的錯誤率。" },
          { q: "如果要你設計一個跨 Meta/Google/LINE 廣告平台的統一資料層，你會怎麼做？", a: "講清楚你會先定義共通欄位（成本/曝光/轉換），再處理各平台 API 的差異與限流，最後講資料怎麼餵給下游的分群或報表系統。" },
          { q: "你怎麼理解「MarTech」這個職位跟純後端工程的差異？", a: "強調要同時懂「行銷語言」（受眾、轉換、成效）跟「工程實作」，能把行銷需求翻譯成可執行的技術方案，而不是被動接需求。" },
          { q: "（犀利補弱項）你的背景比較偏技術/AI，行銷成效指標的實戰經驗聽起來比較少，這會是你的弱項嗎？", a: "誠實承認深度不如專職行銷分析師，但展示你怎麼快速補齊（例如自學過的成效指標、曾經跟行銷團隊合作對齊需求的經驗），並強調你的技術優勢能補足團隊缺口。" },
          { q: "為什麼想加入澄星資訊？", a: "連結公司在 MarTech/AI 整合方向的產品定位與自己技能重疊處，具體提到 JD 中吸引你的點。" }
        ]
      }
    },
    { id: 8, title: "客服流程自動化專員", co: "沐澄科技", loc: "台中", pay: "42k–58k", score: "C", reason: "客服流程經驗部分符合，技術深度較淺", src: "cake",
      status: "待投遞", keywords: "客服, RPA, 流程自動化", posted: "20260630", url: "https://www.cake.me/companies/xxxx/jobs/customer-service-rpa", applicants: 63 }
  ];
  var GROUPS = [
    { key: "A", label: "🔴 A 級（高匹配）", open: true },
    { key: "B", label: "🟡 B 級（中匹配）", open: false },
    { key: "C", label: "⚪ C 級（參考）", open: false }
  ];

  /* ---------- AI 生成內容（前端範本 + 插值，非真實 LLM 呼叫） ---------- */
  function cvText(j) {
    var kw = j.reason.replace(/^[^：]*：?/, "");
    return "📝 客製 CV 重點 — " + j.title + "（" + j.co + "）\n\n" +
      "・開場摘要句重寫：以「" + j.title + "」核心職責破題，第一句就點出可立即上手，避免泛用開場。\n" +
      "・經歷排序調整：把與此職缺最相關的專案往前移，非相關經歷收進附錄或省略。\n" +
      "・對齊 JD 關鍵字：" + kw + "，將對應關鍵字自然嵌入專案描述與技能區，而非硬塞列表。\n" +
      "・量化成果框架：每條專案改寫成「動作 + 技術 + 可量化結果」（如效率提升 %、成本下降、處理規模），避免只寫職責敘述。\n" +
      "・技能區重新分群：把此職缺高頻出現的技術（" + kw + "）移到技能清單最前面，弱相關技能歸類收尾。\n" +
      "・專案亮點建議：挑一個規模／複雜度最接近此職缺的專案，展開成 2-3 行重點說明，其餘專案維持一行摘要。\n" +
      "・常見地雷提醒：避免用與 JD 不一致的同義詞（如寫「資料處理」但 JD 明確寫「ETL」），優先沿用 JD 原詞以提高關鍵字比對命中率。\n\n" +
      "🎯 一句版求職信開場：「我曾用相近技術解決過類似問題，能為貴司的 " + j.title + " 職務快速上手並貢獻成果。」";
  }
  function qaText(j) {
    return "💬 面試 QA — " + j.title + "（" + j.co + "）\n\n" +
      "Q1.（行為面）請簡述一個與此職務最相關的專案？\n" +
      "→ 用 STAR 法：情境（S）先給背景與規模，任務（T）點出你的角色與目標，行動（A）具體到技術選型與決策，結果（R）附量化數字（時間／成本／規模改善）。\n\n" +
      "Q2.（技術面）遇到資料或系統異常時你怎麼排查？\n" +
      "→ 先定位（分辨資料問題或邏輯問題）、再驗證假設（用最小案例重現）、最後補上監控或測試避免再犯，強調「事後有沒有留下防範機制」比單次解法更重要。\n\n" +
      "Q3.（行為面）為何想加入「" + j.co + "」？\n" +
      "→ 連結該公司產品方向與自身技能重疊處，具體提到 JD 中吸引你的一兩個要點，避免只講「成長機會」這類空泛答案。\n\n" +
      "Q4.（技術／職務面）針對「" + j.title + "」這個角色，你會如何規劃前 30-60-90 天？\n" +
      "→ 分三階段：先熟悉現有系統與資料流（30 天），再挑一個小範圍問題實際貢獻（60 天），最後提出可衡量的改善提案（90 天）。\n\n" +
      "Q5.（行為面）說一個你跟團隊意見不合、後來如何解決的經驗？\n" +
      "→ 聚焦在「你如何用資料或小試驗說服對方」而非誰對誰錯，展現合作與溝通而非單純堅持己見。\n\n" +
      "Q6.（技術面）你會怎麼評估自己做出的方案是否成功？\n" +
      "→ 提前定義可量化的成功指標（如處理時間、錯誤率、使用者滿意度），並說明若指標沒達標你會怎麼調整。";
  }

  /* ---------- AI 生成內容 — 英文版（結構與深度對齊中文版） ---------- */
  function cvText_en(j) {
    var kw = j.reason.replace(/^[^：]*：?/, "");
    return "📝 Tailored CV Highlights — " + j.title + " (" + j.co + ")\n\n" +
      "• Rewrite the opening summary line to lead with the core responsibilities of \"" + j.title + "\", signaling immediate readiness instead of a generic intro.\n" +
      "• Reorder experience: move the most relevant project to the top; push unrelated roles to an appendix or drop them.\n" +
      "• Align with JD keywords: " + kw + " — weave these terms naturally into project descriptions and the skills section rather than listing them bluntly.\n" +
      "• Reframe achievements with a quantified structure: \"action + technology + measurable result\" (efficiency gain %, cost reduction, scale handled) instead of plain duty statements.\n" +
      "• Regroup the skills section: move the technologies this role emphasizes (" + kw + ") to the front; group weaker-fit skills at the end.\n" +
      "• Pick one project to expand: choose the project closest in scale/complexity to this role and expand it to 2-3 lines, keeping others as one-liners.\n" +
      "• Common mistake to avoid: don't swap in synonyms that drift from the JD wording (e.g. \"data processing\" when the JD says \"ETL\") — reuse the JD's own terms to improve keyword matching.\n\n" +
      "🎯 One-line cover letter opener: \"I've solved similar problems with comparable technology before, and can ramp up quickly to contribute to your " + j.title + " role.\"";
  }
  function qaText_en(j) {
    return "💬 Interview Q&A — " + j.title + " (" + j.co + ")\n\n" +
      "Q1. (behavioral) Walk me through a project most relevant to this role.\n" +
      "→ Use the STAR method: Situation gives scope/context, Task frames your role and goal, Action gets specific about technical choices and decisions, Result includes a quantified number (time saved, cost, scale improved).\n\n" +
      "Q2. (technical) How do you debug a data or system anomaly?\n" +
      "→ Localize first (data issue vs. logic issue), validate the hypothesis with a minimal reproducible case, then add monitoring or tests to prevent recurrence — emphasize the follow-up safeguard, not just the one-time fix.\n\n" +
      "Q3. (behavioral) Why do you want to join \"" + j.co + "\"?\n" +
      "→ Connect the company's product direction to your own skill set, citing one or two specifics from the JD that genuinely drew you in — avoid vague answers like \"growth opportunity.\"\n\n" +
      "Q4. (technical / role-specific) How would you plan your first 30-60-90 days as a \"" + j.title + "\"?\n" +
      "→ Three phases: understand the existing system and data flow (30 days), contribute to a small well-scoped problem (60 days), then propose a measurable improvement (90 days).\n\n" +
      "Q5. (behavioral) Describe a time you disagreed with your team and how it was resolved.\n" +
      "→ Focus on how you used data or a small experiment to persuade the other side, not on who was \"right\" — this shows collaboration over stubbornness.\n\n" +
      "Q6. (technical) How do you evaluate whether a solution you built actually succeeded?\n" +
      "→ Define measurable success metrics up front (processing time, error rate, user satisfaction), and explain how you'd adjust course if the metrics fall short.";
  }

  /* ---------- 渲染職缺看板（依評分分組摺疊） ---------- */
  var wrap = document.getElementById("jobgroups");
  var selected = null;
  function renderCard(j) {
    var c = document.createElement("div");
    c.className = "jobcard"; c.dataset.id = j.id;
    c.innerHTML =
      '<div class="jc-top"><div><div class="jc-title">' + j.title + '</div>' +
      '<div class="jc-co">' + j.co + '</div></div>' +
      '<span class="score ' + j.score + '">' + j.score + '</span></div>' +
      '<div class="jc-meta"><span>📍 ' + j.loc + '</span><span>💰 ' + j.pay + '</span><span>來源 ' + j.src + '</span></div>' +
      '<div class="jc-reason">🤖 ' + j.reason + '</div>';
    c.onclick = function () {
      document.querySelectorAll(".jobcard.sel").forEach(function (e) { e.classList.remove("sel"); });
      c.classList.add("sel"); selected = j; lastGen = null;
      aiOut.innerHTML = '<div class="ai-placeholder">已選擇：<b style="color:var(--text)">' + j.title + " · " + j.co + "</b>\n選下方按鈕生成內容。</div>";
    };
    return c;
  }
  GROUPS.forEach(function (g, gi) {
    var items = JOBS.filter(function (j) { return j.score === g.key; });
    var det = document.createElement("details");
    det.className = "acc"; if (g.open) det.open = true;
    var sum = document.createElement("summary");
    sum.innerHTML = g.label + '<span class="cnt">' + items.length + " 筆</span>";
    det.appendChild(sum);
    var body = document.createElement("div"); body.className = "abody";
    items.forEach(function (j) { body.appendChild(renderCard(j)); });
    det.appendChild(body); wrap.appendChild(det);
  });

  /* ---------- 語言切換（中文 / EN，選擇會保留到後續生成） ---------- */
  var lang = "zh";
  var lastGen = null; /* "cv" | "qa" | null，記住目前面板顯示的是哪種內容，供切換語言時重新產生 */
  var langBtns = document.querySelectorAll(".lang-btn");
  function currentCvText(j) { return lang === "en" ? cvText_en(j) : cvText(j); }
  function currentQaText(j) { return lang === "en" ? qaText_en(j) : qaText(j); }
  langBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var l = btn.dataset.lang;
      if (l === lang || typing) return;
      lang = l;
      langBtns.forEach(function (b) { b.classList.toggle("active", b === btn); });
      if (selected && lastGen) {
        typeOut(lastGen === "cv" ? currentCvText(selected) : currentQaText(selected));
      }
    });
  });

  /* ---------- AI 逐字輸出 ---------- */
  var aiOut = document.getElementById("aiOut");
  var genCV = document.getElementById("genCV");
  var genQA = document.getElementById("genQA");
  var typing = false;
  function typeOut(text) {
    if (typing) return; typing = true; genCV.disabled = true; genQA.disabled = true;
    aiOut.textContent = ""; var i = 0;
    (function step() {
      if (i <= text.length) {
        aiOut.textContent = text.slice(0, i);
        var cur = document.createElement("span"); cur.className = "cursor"; cur.textContent = "▌";
        aiOut.appendChild(cur);
        i += 2; setTimeout(step, 10);
      } else { aiOut.textContent = text; typing = false; genCV.disabled = false; genQA.disabled = false; }
    })();
  }
  function needSel() {
    aiOut.innerHTML = '<div class="ai-placeholder">請先從左側點選一個職缺 🙋</div>';
  }
  genCV.onclick = function () { if (!selected) return needSel(); lastGen = "cv"; typeOut(currentCvText(selected)); };
  genQA.onclick = function () { if (!selected) return needSel(); lastGen = "qa"; typeOut(currentQaText(selected)); };

  /* ---------- Notion 同步面板：多平台職缺資料庫 + Dashboard + AI 攻略頁 ---------- */
  /* 獨立於上面的職缺看板 picker（selected 變數），這裡用自己的選取狀態 notionSelected，互不影響 */
  var notionSelected = null;
  var notionFilter = "all";
  var SRC_LABELS = { "104": "104", "1111": "1111", "yourator": "Yourator", "cake": "Cake" };
  var FILTER_DEFS = [
    { key: "all", label: "全部" },
    { key: "104", label: "104" },
    { key: "1111", label: "1111" },
    { key: "yourator", label: "Yourator" },
    { key: "cake", label: "Cake" }
  ];

  function fmtDate(d) {
    if (!d || d.length !== 8) return d || "—";
    return d.slice(0, 4) + "-" + d.slice(4, 6) + "-" + d.slice(6, 8);
  }
  function gradeColorClass(g) {
    if (g === "A") return "pc-green";
    if (g === "B") return "pc-blue";
    return "pc-gold";
  }
  function ktrackColorClass(k) {
    if (k === "KA") return "pc-green";
    if (k === "KB") return "pc-gold";
    if (k === "KC") return "pc-red";
    return "pc-gray";
  }
  function statusColorClass(s) {
    if (s === "Offer") return "pc-green";
    if (s === "面試邀約") return "pc-gold";
    if (s === "已投遞") return "pc-blue";
    if (s === "不投") return "pc-red";
    return "pc-gray"; /* 待投遞 */
  }

  /* ---- Dashboard 摘要：數字全部即時從 JOBS 算出 ---- */
  function renderNotionDash() {
    var dash = document.getElementById("notionDash");
    if (!dash) return;
    var total = JOBS.length;
    var gradeCounts = { A: 0, B: 0, C: 0 };
    var srcCounts = {};
    var locCounts = {};
    JOBS.forEach(function (j) {
      gradeCounts[j.score] = (gradeCounts[j.score] || 0) + 1;
      srcCounts[j.src] = (srcCounts[j.src] || 0) + 1;
      locCounts[j.loc] = (locCounts[j.loc] || 0) + 1;
    });
    var ab = gradeCounts.A + gradeCounts.B;
    var srcLine = Object.keys(srcCounts).map(function (k) { return (SRC_LABELS[k] || k) + " " + srcCounts[k]; }).join("／");
    var locLine = Object.keys(locCounts).map(function (k) { return k + " " + locCounts[k]; }).join("／");
    dash.innerHTML =
      '<div class="notion-callout blue">📊 <b>最後更新：</b>2026-06-30 09:12　<b>總職缺數：</b>' + total + ' 筆　<b>Grade A+B 合計：</b>' + ab + ' 筆</div>' +
      '<div class="notion-callout gray">📈 <b>Grade 分布：</b>A ' + (gradeCounts.A || 0) + ' ／ B ' + (gradeCounts.B || 0) + ' ／ C ' + (gradeCounts.C || 0) + '</div>' +
      '<div class="notion-callout gray">🌐 <b>平台分布：</b>' + srcLine + '</div>' +
      '<div class="notion-callout gray">📍 <b>地區分布：</b>' + locLine + '</div>';
  }

  /* ---- 多平台職缺資料庫表格 ---- */
  function renderNotionTable() {
    var tbody = document.getElementById("notionTableBody");
    if (!tbody) return;
    tbody.innerHTML = "";
    var rows = JOBS.filter(function (j) { return notionFilter === "all" || j.src === notionFilter; });
    rows.forEach(function (j) {
      var tr = document.createElement("tr");
      tr.dataset.id = j.id;
      if (notionSelected && notionSelected.id === j.id) tr.classList.add("nt-sel");
      tr.innerHTML =
        '<td><a href="' + j.url + '" target="_blank" rel="noopener">' + j.title + '</a></td>' +
        '<td>' + j.co + '</td>' +
        '<td>' + j.loc + '</td>' +
        '<td><span class="nt-pill ' + gradeColorClass(j.score) + '">' + j.score + '</span></td>' +
        '<td>' + (j.ktrack ? '<span class="nt-pill ' + ktrackColorClass(j.ktrack) + '">' + j.ktrack + '</span>' : '<span class="nt-dim">—</span>') + '</td>' +
        '<td><span class="nt-pill ' + statusColorClass(j.status) + '">' + j.status + '</span></td>' +
        '<td class="nt-kw">' + j.keywords + '</td>' +
        '<td>' + fmtDate(j.posted) + '</td>' +
        '<td><span class="nt-badge">' + (SRC_LABELS[j.src] || j.src) + '</span></td>';
      var link = tr.querySelector("a");
      if (link) link.addEventListener("click", function (e) { e.stopPropagation(); });
      tr.addEventListener("click", function () {
        document.querySelectorAll("#notionTableBody tr").forEach(function (r) { r.classList.remove("nt-sel"); });
        tr.classList.add("nt-sel");
        notionSelected = j;
        renderStrategyPage(j);
      });
      tbody.appendChild(tr);
    });
  }

  function renderFilterChips() {
    var wrap = document.getElementById("notionFilters");
    if (!wrap) return;
    FILTER_DEFS.forEach(function (f) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "nf-chip" + (f.key === notionFilter ? " active" : "");
      b.textContent = f.label;
      b.addEventListener("click", function () {
        notionFilter = f.key;
        document.querySelectorAll(".nf-chip").forEach(function (c) { c.classList.remove("active"); });
        b.classList.add("active");
        renderNotionTable();
      });
      wrap.appendChild(b);
    });
  }

  /* ---- 攻略頁：只有 Grade A 職缺有 strategy，其餘顯示空狀態 ---- */
  function buildStrategyBody(job) {
    if (!job.strategy) {
      return '<div class="notion-callout gray">📌 此職缺目前為追蹤狀態，尚未產生完整攻略（僅 Grade A 職缺會自動產生完整攻略頁）。</div>';
    }
    var calloutClass = job.ktrack === "KA" ? "green" : job.ktrack === "KC" ? "red" : "gold";
    var html = '<div class="notion-callout ' + calloutClass + '">' + job.entryAngle + '</div>';
    var groups = [
      { heading: "1. 痛點", tag: "痛點", items: job.strategy.pain },
      { heading: "2. 符合點", tag: "符合點", items: job.strategy.fit },
      { heading: "3. 優化方向", tag: "優化方向", items: job.strategy.gaps }
    ];
    groups.forEach(function (g) {
      html += '<h2>' + g.heading + '</h2><ul>';
      g.items.forEach(function (it) { html += '<li><b>' + g.tag + '：</b>' + it + '</li>'; });
      html += '</ul><hr class="notion-hr">';
    });
    html += '<h2>4. 面試 QA</h2><ul>';
    job.strategy.qa.forEach(function (qa, qi) {
      html += '<li><b>Q' + (qi + 1) + '：</b>' + qa.q + '<ul><li>→ <b>A：</b>' + qa.a + '</li></ul></li>';
    });
    html += '</ul>';
    return html;
  }

  function renderStrategyPage(job) {
    var titleEl = document.getElementById("notionTitle");
    var statusEl = document.querySelector("#notionProps .np-status");
    var tagsEl = document.querySelector("#notionProps .np-tags");
    var dateEl = document.querySelector("#notionProps .np-date-val");
    var bodyEl = document.getElementById("notionBody");
    if (!titleEl || !bodyEl) return;
    titleEl.textContent = job.title + " · " + job.co;
    if (statusEl) {
      statusEl.className = "np-pill nt-pill " + statusColorClass(job.status);
      statusEl.textContent = job.status;
    }
    if (tagsEl) {
      tagsEl.innerHTML = job.keywords.split(/[,，]\s*/).map(function (k) {
        return '<span class="np-tag">' + k + '</span>';
      }).join("");
    }
    if (dateEl) dateEl.textContent = fmtDate(job.posted);
    bodyEl.innerHTML = buildStrategyBody(job);
  }

  renderNotionDash();
  renderFilterChips();
  renderNotionTable();
  var defaultNotionJob = JOBS.filter(function (j) { return j.score === "A"; })[0];
  if (defaultNotionJob) { notionSelected = defaultNotionJob; renderStrategyPage(defaultNotionJob); renderNotionTable(); }

  /* ---------- Pipeline 流程動畫 ---------- */
  var STEPS = ["scrape", "merge", "score", "jd", "gen", "notion"];
  var runBtn = document.getElementById("runBtn");
  function setNode(k, st) {
    var n = document.querySelector('.node[data-k="' + k + '"]');
    if (!n) return; n.classList.remove("active", "done"); if (st) n.classList.add(st);
  }
  function playFlow() {
    if (runBtn.disabled) return; runBtn.disabled = true;
    document.querySelectorAll(".node").forEach(function (n) { n.classList.remove("active", "done"); });
    var i = 0;
    (function tick() {
      if (i > 0) setNode(STEPS[i - 1], "done");
      if (i < STEPS.length) { setNode(STEPS[i], "active"); i++; setTimeout(tick, 480); }
      else { runBtn.disabled = false; }
    })();
  }
  runBtn.addEventListener("click", playFlow);
  setTimeout(playFlow, 400);
})();
