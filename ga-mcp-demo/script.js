/* ga-mcp-demo — 前端模擬（無真實 API；所有數字為假資料，圖表以 Plotly.js 重建，結構仿真實 GA4/GSC/GTM 專案） */
(function () {
  "use strict";

  var COLORS = {
    accent: "#3b82f6", accent2: "#22d3ee", green: "#22c55e", gold: "#f59e0b",
    red: "#ef4444", line: "#06c755", purple: "#a78bfa",
    text: "#e6edf7", text2: "#9fb2cc", text3: "#6b809e",
    card: "#13213a", card2: "#0e1830", border: "#22324f", border2: "#2c4061"
  };
  var PLY_CONFIG = { responsive: true, displayModeBar: false };
  var PLY_BASE_LAYOUT = {
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    font: { family: "Inter, 'Noto Sans TC', sans-serif", color: COLORS.text2, size: 11 },
    margin: { t: 30, r: 20, b: 36, l: 44 },
    hoverlabel: { bgcolor: COLORS.card, bordercolor: COLORS.border2, font: { color: COLORS.text, size: 12 } },
    legend: { orientation: "h", y: -0.2, font: { size: 10, color: COLORS.text2 } }
  };
  function mergeLayout(extra) {
    var out = JSON.parse(JSON.stringify(PLY_BASE_LAYOUT));
    for (var k in extra) out[k] = extra[k];
    return out;
  }
  function lerpColor(a, b, t) {
    var ah = parseInt(a.slice(1), 16), bh = parseInt(b.slice(1), 16);
    var ar = (ah >> 16) & 255, ag = (ah >> 8) & 255, ab = ah & 255;
    var br = (bh >> 16) & 255, bg = (bh >> 8) & 255, bb = bh & 255;
    var rr = Math.round(ar + (br - ar) * t), rg = Math.round(ag + (bg - ag) * t), rb = Math.round(ab + (bb - ab) * t);
    return "rgb(" + rr + "," + rg + "," + rb + ")";
  }

  /* ---------- KPI 假數據 ---------- */
  var KPI = [
    { lab: "Sessions", val: "48.2k", chg: "▲ +12.4% MoM", dir: "up" },
    { lab: "互動率", val: "63.1%", chg: "▲ +3.2%", dir: "up" },
    { lab: "推估詢價", val: "312", chg: "▲ +18", dir: "up" },
    { lab: "GSC 點擊", val: "9,840", chg: "▲ +6.7%", dir: "up", gsc: true },
    { lab: "平均 CTR", val: "4.8%", chg: "▼ -0.3%", dir: "down", gsc: true },
    { lab: "平均排名", val: "11.2", chg: "▲ 名次前進 1.4", dir: "up", gsc: true }
  ];

  /* ---------- AI 分析（模擬逐字） ---------- */
  var AI_TEXT = {
    overview:
      "📊 本月整體成效摘要（GA4 × GSC × GTM 交叉分析）\n\n" +
      "【流量與互動】\n" +
      "・Sessions 48.2k，較上月 +12.4%；互動率 63.1%（+3.2pt），顯示新進站來源品質提升。\n" +
      "・來源結構：自然搜尋 42%、直接 27%、社群 18%、推薦 13%。\n" +
      "・新訪客佔 61%，回訪率微升，品牌記憶度改善。\n\n" +
      "【搜尋表現（GSC）】\n" +
      "・自然點擊 9,840（+6.7%）、曝光 205k、平均 CTR 4.8%、平均排名前進 1.4 至 11.2。\n" +
      "・品牌詞穩定第 1–3 名；非品牌長尾詞成長最快，是流量增量主力。\n\n" +
      "【轉換】\n" +
      "・推估詢價 312（+18），主要來自 /products 與 /eco-bags。\n" +
      "・行動裝置轉換率仍低於桌機約 40%，為最大改善空間。\n\n" +
      "🎯 三個優先動作：\n" +
      "1. 擴充 /eco-bags 內容並建立內部連結，鞏固表現最佳頁面。\n" +
      "2. 為成長中的非品牌長尾詞補上對應到達頁。\n" +
      "3. 優化行動版詢價流程，縮小與桌機的轉換差距。",
    seo:
      "🔍 自然搜尋 / SEO 機會（Search Console）\n\n" +
      "【接近首頁的機會詞】\n" +
      "・偵測到 3 組關鍵字停在第 11–15 名（第二頁前段），曝光足但點擊少，小幅優化即可進首頁。\n" +
      "・做法：強化對應頁的 H1、段落關鍵字與內部連結，並補充相關子題。\n\n" +
      "【高曝光低點擊】\n" +
      "・/blog/gift-guide 曝光高但 CTR 僅 1.9%，明顯低於站台平均 4.8%。\n" +
      "・做法：改寫 title 與 meta description，加入數字與利益點提高吸引力。\n\n" +
      "【技術與體驗】\n" +
      "・行動裝置佔自然點擊 68%，但行動 LCP 偏慢，恐拖累排名與跳出率。\n" +
      "・做法：壓縮首屏圖片、延後非必要腳本，改善 Core Web Vitals。\n\n" +
      "🎯 優先順序：先做「接近首頁的機會詞」，投報率最高、見效最快。",
    conv:
      "💰 轉換與詢價分析（GA4 事件 × GTM）\n\n" +
      "【詢價漏斗】\n" +
      "・進站 → 瀏覽商品 72% → 開始填表 4% → 送出詢價表單 0.6%。\n" +
      "・最大流失在「瀏覽商品 → 開始填表」，僅 4% 進入表單。\n\n" +
      "【裝置差異】\n" +
      "・帶 GTM 事件的表單啟動率，桌機為行動的 1.8 倍。\n" +
      "・行動版表單欄位過多，送出率明顯偏低。\n\n" +
      "【高價值入口】\n" +
      "・/products 進站者詢價率最高，/eco-bags 次之。\n" +
      "・LINE 點擊轉換漏斗流失集中在「瀏覽商品 → 點擊 LINE」，代表 CTA 曝光位置仍有優化空間。\n\n" +
      "🎯 建議：\n" +
      "1. 商品頁 CTA 上移並加對比色，提高點擊。\n" +
      "2. 行動版詢價表單精簡為 3–4 欄，其餘改為送出後補填。\n" +
      "3. 將預算向 /products 與搜尋廣告傾斜。",
    ref:
      "🤖 AI 引薦流量歸因（pageReferrer 網域分類）\n\n" +
      "【方法】\n" +
      "・以 GA4 事件參數 pageReferrer 的網域做分類，比對 chatgpt.com、claude.ai、gemini.google.com、perplexity.ai 等已知 AI 對話介面網域，把「AI 引薦」流量獨立出來，不與一般自然搜尋或社群來源混記。\n" +
      "・多數 AI 工具的來源在瀏覽器端會被記為 referral 而非 UTM，需額外維護網域清單並定期更新，避免新工具上線後被誤分類為（none）。\n\n" +
      "【本月觀察】\n" +
      "・AI 引薦 session 佔整體自然流量的 3.1%，較上月成長近一倍，來源以 ChatGPT／Perplexity 為主，Claude／Gemini 引薦量仍小但單次停留時間最長。\n" +
      "・受益到達頁集中在 /eco-bags 與 /blog/gift-guide 等具明確答案結構（條列、規格表）的頁面，推測與 AI 摘要引用時偏好結構化內容有關。\n" +
      "・AI 引薦流量的跳出率低於平均，顯示使用者是帶著明確意圖點擊過來，屬於高品質流量。\n\n" +
      "🎯 建議：\n" +
      "1. 針對高被引用頁面補強條列式規格與常見問題區塊，提高被 AI 摘要引用的機率。\n" +
      "2. 持續維護 AI 網域清單，避免新出現的 AI 工具被誤判來源。\n" +
      "3. 觀察 AI 引薦流量的轉換路徑，若停留時間長但轉換率偏低，優先檢查到達頁的下一步行動是否明確。"
  };

  /* ---------- 渲染 KPI ---------- */
  var grid = document.getElementById("kpiGrid");
  KPI.forEach(function (k) {
    var d = document.createElement("div");
    d.className = "kpi-card" + (k.gsc ? " gsc" : "");
    d.innerHTML = '<div class="lab">' + k.lab + "</div>" +
      '<div class="val">' + k.val + "</div>" +
      '<div class="chg ' + k.dir + '">' + k.chg + "</div>";
    grid.appendChild(d);
  });

  /* ---------- 流程動畫 ---------- */
  var STEPS = [["ga", "gsc", "gtm"], ["mcp"], ["ai"], ["out"]];
  var SIDE_AT = { 1: "gen", 3: "viz" };
  var runBtn = document.getElementById("runBtn");
  function setNode(k, st) {
    var n = document.querySelector('.node[data-k="' + k + '"]');
    if (!n) return; n.classList.remove("active", "done"); if (st) n.classList.add(st);
  }
  function pingSide(k) {
    var n = document.querySelector('.node.side[data-k="' + k + '"]');
    if (n) { n.classList.add("ping"); setTimeout(function () { n.classList.remove("ping"); }, 1300); }
  }
  function playFlow() {
    if (runBtn.disabled) return;
    runBtn.disabled = true;
    document.querySelectorAll(".node").forEach(function (n) { n.classList.remove("active", "done"); });
    var i = 0;
    function tick() {
      if (i > 0) STEPS[i - 1].forEach(function (k) { setNode(k, "done"); });
      if (i < STEPS.length) {
        STEPS[i].forEach(function (k) { setNode(k, "active"); });
        if (SIDE_AT[i]) pingSide(SIDE_AT[i]);
        i++; setTimeout(tick, 520);
      } else { runBtn.disabled = false; }
    }
    tick();
  }
  runBtn.addEventListener("click", playFlow);

  /* ---------- AI 分頁式情境切換 + 逐字輸出 ---------- */
  var aiOut = document.getElementById("aiOut");
  var aiTabs = document.querySelectorAll(".ai-tab");
  var typing = false;
  function typeOut(text) {
    if (typing) return; typing = true;
    aiTabs.forEach(function (b) { b.disabled = true; });
    aiOut.textContent = ""; var i = 0;
    (function step() {
      if (i <= text.length) {
        aiOut.textContent = text.slice(0, i);
        var cur = document.createElement("span"); cur.className = "cursor"; cur.textContent = "▌";
        aiOut.appendChild(cur);
        i += 2; setTimeout(step, 12);
      } else {
        aiOut.textContent = text; typing = false;
        aiTabs.forEach(function (b) { b.disabled = false; });
      }
    })();
  }
  aiTabs.forEach(function (btn) {
    btn.addEventListener("click", function () {
      aiTabs.forEach(function (b) { b.classList.remove("active"); b.setAttribute("aria-selected", "false"); });
      btn.classList.add("active"); btn.setAttribute("aria-selected", "true");
      typeOut(AI_TEXT[btn.dataset.scene] || AI_TEXT.overview);
    });
  });
  /* 首次載入直接展示第一個情境 */
  setTimeout(function () { typeOut(AI_TEXT.overview); }, 900);

  /* ================= 1. GSC 三軸組合趨勢圖 ================= */
  (function () {
    var DAYS = ["06/17", "06/18", "06/19", "06/20", "06/21", "06/22", "06/23", "06/24", "06/25", "06/26", "06/27", "06/28", "06/29", "06/30"];
    var IMP = [14200, 14800, 13950, 15100, 16200, 15800, 14650, 15950, 16700, 17200, 16850, 17950, 18400, 19200];
    var CLICKS = [680, 712, 655, 742, 806, 774, 690, 760, 812, 845, 820, 875, 905, 948];
    var POS = [12.8, 12.6, 12.9, 12.4, 12.1, 12.3, 12.5, 12.0, 11.7, 11.6, 11.9, 11.4, 11.1, 10.8];

    var traceImp = {
      type: "scatter", mode: "lines", name: "曝光 Impressions",
      x: DAYS, y: IMP, yaxis: "y",
      fill: "tozeroy", fillcolor: "rgba(34,211,238,.16)",
      line: { color: COLORS.accent2, width: 2 },
      hovertemplate: "曝光 %{y:,}<extra></extra>"
    };
    var traceClicks = {
      type: "bar", name: "點擊 Clicks", x: DAYS, y: CLICKS, yaxis: "y2",
      marker: { color: "rgba(59,130,246,.75)" },
      hovertemplate: "點擊 %{y:,}<extra></extra>"
    };
    var tracePos = {
      type: "scatter", mode: "lines+markers", name: "平均排名（Y 軸反轉）",
      x: DAYS, y: POS, yaxis: "y3",
      line: { color: COLORS.gold, width: 2 }, marker: { size: 5, color: COLORS.gold },
      hovertemplate: "平均排名 %{y}<extra></extra>"
    };

    var layout = mergeLayout({
      margin: { t: 46, r: 66, b: 40, l: 50 },
      xaxis: { domain: [0, 0.86], tickfont: { size: 10, color: COLORS.text3 }, gridcolor: "rgba(255,255,255,.05)" },
      yaxis: { title: { text: "曝光", font: { size: 10, color: COLORS.text3 } }, gridcolor: "rgba(255,255,255,.06)", tickfont: { size: 10, color: COLORS.text3 }, zeroline: false },
      yaxis2: { title: { text: "點擊", font: { size: 10, color: COLORS.text3 } }, overlaying: "y", side: "right", showgrid: false, tickfont: { size: 10, color: COLORS.text3 } },
      yaxis3: { title: { text: "平均排名", font: { size: 9, color: COLORS.gold } }, overlaying: "y", side: "right", anchor: "free", position: 1, autorange: "reversed", showgrid: false, tickfont: { size: 10, color: COLORS.gold } },
      annotations: [{ xref: "paper", yref: "paper", x: 0, y: 1.18, showarrow: false, align: "left", text: "排名軸已反轉：線越靠上代表名次越好", font: { size: 10, color: COLORS.text3 } }]
    });
    Plotly.newPlot("gscTrendChart", [traceImp, traceClicks, tracePos], layout, PLY_CONFIG);
  })();

  /* ================= 流量來源結構（橫向長條） ================= */
  (function () {
    var SRC = [{ n: "自然搜尋", v: 42 }, { n: "直接", v: 27 }, { n: "社群", v: 18 }, { n: "推薦", v: 13 }];
    var trace = {
      type: "bar", orientation: "h",
      x: SRC.map(function (d) { return d.v; }),
      y: SRC.map(function (d) { return d.n; }),
      marker: { color: COLORS.accent2 },
      text: SRC.map(function (d) { return d.v + "%"; }),
      textposition: "outside", textfont: { color: COLORS.text2, size: 11 },
      hovertemplate: "%{y}：%{x}%<extra></extra>"
    };
    var layout = mergeLayout({
      margin: { t: 10, r: 30, b: 30, l: 70 },
      xaxis: { visible: false },
      yaxis: { autorange: "reversed", tickfont: { size: 11, color: COLORS.text2 } },
      showlegend: false
    });
    Plotly.newPlot("srcChart", [trace], layout, PLY_CONFIG);
  })();

  /* ================= 6. 裝置圓餅圖 ================= */
  (function () {
    var DEV = [
      { n: "行動", v: 64, clicks: 6200, imp: 132000 },
      { n: "桌機", v: 31, clicks: 3300, imp: 66300 },
      { n: "平板", v: 5, clicks: 340, imp: 6900 }
    ];
    var trace = {
      type: "pie", hole: 0.5,
      labels: DEV.map(function (d) { return d.n; }),
      values: DEV.map(function (d) { return d.v; }),
      marker: { colors: [COLORS.accent2, COLORS.accent, COLORS.text3], line: { color: COLORS.card, width: 2 } },
      customdata: DEV.map(function (d) { return [d.clicks, d.imp, (d.clicks / d.imp * 100).toFixed(1)]; }),
      hovertemplate: "<b>%{label}</b><br>佔比 %{percent}<br>點擊 %{customdata[0]:,}<br>曝光 %{customdata[1]:,}<br>CTR %{customdata[2]}%<extra></extra>",
      textinfo: "label+percent", textfont: { size: 11, color: COLORS.text }
    };
    var layout = mergeLayout({ margin: { t: 10, r: 10, b: 10, l: 10 }, showlegend: false });
    Plotly.newPlot("deviceChart", [trace], layout, PLY_CONFIG);
  })();

  /* ================= 3. Day × Hour Sessions Heatmap ================= */
  (function () {
    var DAYS = ["週一", "週二", "週三", "週四", "週五", "週六", "週日"];
    var HOURS = []; for (var h = 0; h < 24; h++) HOURS.push(h);
    var z = DAYS.map(function (d, r) {
      var isWeekend = r >= 5;
      return HOURS.map(function (hh) {
        var base = isWeekend ? 14 : 10;
        var bump1 = isWeekend
          ? 46 * Math.exp(-Math.pow(hh - 15, 2) / (2 * 6.5 * 6.5))
          : 40 * Math.exp(-Math.pow(hh - 10.5, 2) / (2 * 3.2 * 3.2));
        var bump2 = isWeekend
          ? 30 * Math.exp(-Math.pow(hh - 21, 2) / (2 * 3 * 3))
          : 34 * Math.exp(-Math.pow(hh - 20, 2) / (2 * 3.6 * 3.6));
        var wobble = ((r * 31 + hh * 17) % 7) - 3; /* 確定性小擾動，非隨機亂數 */
        return Math.max(2, Math.round(base + bump1 + bump2 + wobble));
      });
    });
    var trace = {
      type: "heatmap", x: HOURS, y: DAYS, z: z,
      colorscale: [[0, COLORS.card2], [0.5, "#1c3a5e"], [1, COLORS.accent2]],
      hovertemplate: "%{y} %{x}:00｜%{z} sessions<extra></extra>",
      showscale: true,
      colorbar: { thickness: 10, len: 0.8, tickfont: { size: 9, color: COLORS.text3 } }
    };
    var layout = mergeLayout({
      margin: { t: 10, r: 10, b: 34, l: 44 },
      xaxis: { dtick: 2, tickfont: { size: 9, color: COLORS.text3 }, title: { text: "時段", font: { size: 10, color: COLORS.text3 } } },
      yaxis: { tickfont: { size: 10, color: COLORS.text3 }, autorange: "reversed" }
    });
    Plotly.newPlot("heatmapChart", [trace], layout, PLY_CONFIG);
  })();

  /* ================= 4. 頁面類型多線趨勢 + 下拉選單 ================= */
  (function () {
    var PT_DAYS = ["06/17", "06/18", "06/19", "06/20", "06/21", "06/22", "06/23", "06/24", "06/25", "06/26", "06/27", "06/28", "06/29", "06/30"];
    var PT_NAMES = ["商品頁 /products/*", "分類頁 /collections/*", "內容頁 /pages/*", "部落格 /blog/*"];
    var PT_COLORS = [COLORS.accent, COLORS.accent2, COLORS.gold, COLORS.purple];
    var PT_SESSIONS = [
      [1850, 1920, 1780, 2010, 2150, 2080, 1990, 2200, 2350, 2280, 2400, 2500, 2600, 2700],
      [1200, 1250, 1180, 1300, 1400, 1350, 1280, 1420, 1500, 1470, 1550, 1600, 1650, 1700],
      [600, 620, 590, 640, 680, 660, 630, 690, 720, 700, 730, 750, 770, 790],
      [420, 450, 410, 470, 520, 500, 460, 540, 580, 560, 600, 630, 660, 700]
    ];
    var PT_USERS = PT_SESSIONS.map(function (arr) { return arr.map(function (v) { return Math.round(v * 0.84); }); });
    var PT_PAGEVIEWS = PT_SESSIONS.map(function (arr) { return arr.map(function (v) { return Math.round(v * 1.42); }); });

    var traces = PT_NAMES.map(function (nm, i) {
      return {
        type: "scatter", mode: "lines+markers", name: nm,
        x: PT_DAYS, y: PT_SESSIONS[i],
        line: { color: PT_COLORS[i], width: 2 }, marker: { size: 4, color: PT_COLORS[i] },
        hovertemplate: nm + "：%{y:,}<extra></extra>"
      };
    });

    var layout = mergeLayout({
      margin: { t: 56, r: 20, b: 40, l: 48 },
      xaxis: { tickfont: { size: 10, color: COLORS.text3 }, gridcolor: "rgba(255,255,255,.05)" },
      yaxis: { title: { text: "Sessions", font: { size: 10, color: COLORS.text3 } }, gridcolor: "rgba(255,255,255,.06)", tickfont: { size: 10, color: COLORS.text3 } },
      updatemenus: [{
        type: "dropdown", direction: "down", x: 1, xanchor: "right", y: 1.28, yanchor: "top",
        bgcolor: COLORS.card2, bordercolor: COLORS.border2, font: { size: 11, color: COLORS.text2 },
        buttons: [
          { label: "指標：Sessions", method: "restyle", args: [{ y: PT_SESSIONS }, [0, 1, 2, 3]] },
          { label: "指標：Users", method: "restyle", args: [{ y: PT_USERS }, [0, 1, 2, 3]] },
          { label: "指標：Pageviews", method: "restyle", args: [{ y: PT_PAGEVIEWS }, [0, 1, 2, 3]] }
        ]
      }]
    });
    Plotly.newPlot("pageTypeChart", traces, layout, PLY_CONFIG);
  })();

  /* ================= 5. Session Duration Histogram ================= */
  (function () {
    function mulberry32(seed) {
      return function () {
        seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
        var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    }
    var rng = mulberry32(20260630);
    var durations = [];
    for (var i = 0; i < 600; i++) {
      var u1 = Math.max(1e-6, rng()), u2 = rng();
      var z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      var mu = 4.15, sigma = 0.62;
      var dur = Math.exp(mu + sigma * z);
      durations.push(Math.min(1500, Math.round(dur)));
    }
    var trace = {
      type: "histogram", x: durations,
      marker: { color: "rgba(34,211,238,.55)", line: { color: COLORS.accent2, width: 1 } },
      xbins: { start: 0, end: 1500, size: 40 },
      hovertemplate: "時長區間 %{x}<br>使用者數 %{y}<extra></extra>"
    };
    var layout = mergeLayout({
      margin: { t: 14, r: 20, b: 40, l: 48 }, showlegend: false,
      xaxis: { title: { text: "工作階段時長（秒）", font: { size: 10, color: COLORS.text3 } }, tickfont: { size: 10, color: COLORS.text3 }, gridcolor: "rgba(255,255,255,.05)" },
      yaxis: { title: { text: "使用者數", font: { size: 10, color: COLORS.text3 } }, tickfont: { size: 10, color: COLORS.text3 }, gridcolor: "rgba(255,255,255,.06)" }
    });
    Plotly.newPlot("sessionDurChart", [trace], layout, PLY_CONFIG);
  })();

  /* ================= 8. 關鍵字表 + 欄位溫度圖上色 ================= */
  (function () {
    var KW = [
      { k: "客製 保溫杯", c: 1240, i: 18500, ctr: 6.7, pos: 3.2, up: true },
      { k: "環保袋 印logo", c: 980, i: 15200, ctr: 6.4, pos: 4.1, up: true },
      { k: "企業 禮品 推薦", c: 760, i: 22100, ctr: 3.4, pos: 8.6, up: false },
      { k: "帆布袋 客製", c: 640, i: 9800, ctr: 6.5, pos: 5.0, up: true },
      { k: "行動電源 客製 logo", c: 410, i: 12600, ctr: 3.3, pos: 11.4, up: false },
      { k: "活動 贈品 少量", c: 355, i: 8700, ctr: 4.1, pos: 9.8, up: true }
    ];
    var kwBody = document.getElementById("kwBody");
    KW.forEach(function (r) {
      var tr = document.createElement("tr");
      tr.innerHTML =
        "<td>" + r.k + "</td>" +
        "<td data-col='c' data-val='" + r.c + "'>" + r.c.toLocaleString() + "</td>" +
        "<td data-col='i' data-val='" + r.i + "'>" + r.i.toLocaleString() + "</td>" +
        "<td data-col='ctr' data-val='" + r.ctr + "'>" + r.ctr + "%</td>" +
        "<td data-col='pos' data-val='" + r.pos + "' class='" + (r.up ? "up" : "down") + "'>" + r.pos + (r.up ? " ▲" : " ▼") + "</td>";
      kwBody.appendChild(tr);
    });

    /* 欄位溫度圖：依各欄自身 min–max 上色（跟 day×hour 網格熱力圖是不同的視覺語言） */
    function paintTemperature(cols) {
      cols.forEach(function (col) {
        var cells = document.querySelectorAll('#kwTable td[data-col="' + col.key + '"]');
        var vals = Array.prototype.map.call(cells, function (c) { return parseFloat(c.dataset.val); });
        var min = Math.min.apply(null, vals), max = Math.max.apply(null, vals);
        cells.forEach(function (c) {
          var v = parseFloat(c.dataset.val);
          var t = max > min ? (v - min) / (max - min) : 0.5;
          if (col.invert) t = 1 - t;
          c.style.background = "rgba(34,211,238," + (0.06 + t * 0.4).toFixed(2) + ")";
          if (t > 0.62) c.style.color = "#04263a";
        });
      });
    }
    paintTemperature([
      { key: "c" }, { key: "i" }, { key: "ctr" }, { key: "pos", invert: true }
    ]);
  })();

  /* ================= 2. 雙轉換漏斗 ================= */
  (function () {
    var formSteps = ["Session 開始", "瀏覽商品", "開始填寫表單", "送出詢價表單"];
    var formVals = [48200, 34700, 2150, 312];
    var formColors = formVals.map(function (_, i) { return lerpColor(COLORS.accent2, COLORS.accent, i / (formVals.length - 1)); });
    var traceForm = {
      type: "funnel", y: formSteps, x: formVals,
      textinfo: "value+percent initial",
      marker: { color: formColors },
      connector: { line: { color: COLORS.border2, width: 1 } }
    };
    Plotly.newPlot("funnelForm", [traceForm], mergeLayout({ margin: { t: 10, r: 10, b: 10, l: 110 }, showlegend: false }), PLY_CONFIG);

    var lineSteps = ["Session 開始", "瀏覽商品", "LINE 點擊轉換"];
    var lineVals = [48200, 34700, 1860];
    var lineColors = lineVals.map(function (_, i) { return lerpColor("#bdf5d4", COLORS.line, i / (lineVals.length - 1)); });
    var traceLine = {
      type: "funnel", y: lineSteps, x: lineVals,
      textinfo: "value+percent initial",
      marker: { color: lineColors },
      connector: { line: { color: COLORS.border2, width: 1 } }
    };
    Plotly.newPlot("funnelLine", [traceLine], mergeLayout({ margin: { t: 10, r: 10, b: 10, l: 110 }, showlegend: false }), PLY_CONFIG);
  })();

  /* ---------- GTM 版本控制 diff ---------- */
  (function () {
    var G = {
      cur: "v42（正式）", prev: "wsp-debug-mode（草稿）", by: "Jason",
      at: "2026-06-30 15:20", container: "GTM-XXXXXXX",
      groups: [
        { name: "變數 Variables", rows: [
          { op: "add", nm: "URL 變數 - debug_param", note: "讀取網址查詢字串 debug" },
          { op: "add", nm: "查詢表變數 - debug_mode_lookup", note: '"1"→"true"，其餘輸入→undefined' }
        ] },
        { name: "標籤 Tags", rows: [
          { op: "mod", nm: "Google 代碼設定標籤（Google tag）", note: "configSettings 新增 debug_mode，綁定 debug_mode_lookup" }
        ] }
      ]
    };
    var SYM = { add: "＋", mod: "～", del: "－" };
    document.getElementById("gvCur").textContent = G.cur;
    document.getElementById("gvPrev").textContent = G.prev;
    document.getElementById("gtmMeta").innerHTML =
      "容器：<b>" + G.container + "</b>　·　變更人：<b>" + G.by + "</b>　·　時間：<b>" + G.at + "</b>　·　狀態：<b>待人工審核，尚未發布</b>";
    var diff = document.getElementById("gtmDiff");
    G.groups.forEach(function (g) {
      var wrap = document.createElement("div"); wrap.className = "gtm-group";
      wrap.innerHTML = "<h4>" + g.name + "</h4>" + g.rows.map(function (r) {
        return '<div class="diff-row ' + r.op + '"><span class="op">' + SYM[r.op] + '</span><span class="nm">' + r.nm + '</span><span class="note">' + r.note + '</span></div>';
      }).join("");
      diff.appendChild(wrap);
    });
  })();

  /* ================= 7. 熱門進站頁（橫向長條，含疑似機器人流量標色） ================= */
  (function () {
    var LANDING = [
      { nm: "/products", sessions: 8200, eng: 96, bounce: 38, bot: false },
      { nm: "/", sessions: 6400, eng: 52, bounce: 45, bot: false },
      { nm: "/eco-bags", sessions: 4100, eng: 118, bounce: 31, bot: false },
      { nm: "/about", sessions: 2600, eng: 74, bounce: 40, bot: false },
      { nm: "/contact", sessions: 2100, eng: 61, bounce: 48, bot: false },
      { nm: "/blog/gift-guide", sessions: 1700, eng: 145, bounce: 28, bot: false },
      { nm: "/faq", sessions: 1200, eng: 55, bounce: 50, bot: false },
      { nm: "/campaign/flash-sale", sessions: 980, eng: 4, bounce: 92, bot: true }
    ];
    var n = LANDING.length;
    var colors = LANDING.map(function (d, i) {
      return d.bot ? COLORS.gold : lerpColor(COLORS.accent2, COLORS.accent, i / (n - 1));
    });
    var customdata = LANDING.map(function (d) {
      return [d.eng, d.bounce, d.bot ? "⚠ 互動時間異常偏低、疑似機器人流量" : ""];
    });
    var trace = {
      type: "bar", orientation: "h",
      x: LANDING.map(function (d) { return d.sessions; }),
      y: LANDING.map(function (d) { return d.nm; }),
      marker: { color: colors },
      customdata: customdata,
      hovertemplate: "<b>%{y}</b><br>Sessions %{x:,}<br>平均互動時間 %{customdata[0]}s ・跳出率 %{customdata[1]}%<br>%{customdata[2]}<extra></extra>"
    };
    var layout = mergeLayout({
      margin: { t: 10, r: 30, b: 30, l: 130 },
      xaxis: { title: { text: "Sessions", font: { size: 10, color: COLORS.text3 } }, tickfont: { size: 10, color: COLORS.text3 }, gridcolor: "rgba(255,255,255,.06)" },
      yaxis: { autorange: "reversed", tickfont: { size: 11, color: COLORS.text2 } },
      showlegend: false
    });
    Plotly.newPlot("landingPagesChart", [trace], layout, PLY_CONFIG);
  })();

  /* ---------- 載入自動播一次資料流程動畫 ---------- */
  setTimeout(function () { playFlow(); }, 400);
})();
