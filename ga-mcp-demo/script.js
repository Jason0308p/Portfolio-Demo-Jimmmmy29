/* ga-mcp-demo — 前端模擬（無真實 API；數字皆虛構脫敏） */
(function () {
  "use strict";

  /* ---------- KPI 假數據 ---------- */
  var KPI = [
    { lab: "Sessions", val: "48.2k", chg: "▲ +12.4% MoM", dir: "up" },
    { lab: "互動率", val: "63.1%", chg: "▲ +3.2%", dir: "up" },
    { lab: "推估詢價", val: "312", chg: "▲ +18", dir: "up" },
    { lab: "GSC 點擊", val: "9,840", chg: "▲ +6.7%", dir: "up", gsc: true },
    { lab: "平均 CTR", val: "4.8%", chg: "▼ -0.3%", dir: "down", gsc: true },
    { lab: "平均排名", val: "11.2", chg: "▲ 名次前進 1.4", dir: "up", gsc: true }
  ];
  /* ---------- 進站頁流量 Top 8（虛構） ---------- */
  var PAGES = [
    { nm: "/products", v: 8200 }, { nm: "/", v: 6400 },
    { nm: "/eco-bags", v: 4100 }, { nm: "/about", v: 2600 },
    { nm: "/contact", v: 2100 }, { nm: "/blog/gift-guide", v: 1700 },
    { nm: "/faq", v: 1200 }, { nm: "/mugs", v: 900 }
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
      "・進站 → 瀏覽商品 72% → 點詢價 CTA 9% → 送出表單 41%。\n" +
      "・最大流失在「商品頁 → 點詢價 CTA」，僅 9% 點擊。\n\n" +
      "【裝置差異】\n" +
      "・帶 GTM 事件的 CTA 點擊率，桌機為行動的 1.8 倍。\n" +
      "・行動版表單欄位過多，送出率明顯偏低。\n\n" +
      "【高價值入口】\n" +
      "・/products 進站者詢價率最高（1.2%），/eco-bags 次之。\n" +
      "・付費流量中，搜尋廣告帶來的詢價品質優於多數社群受眾。\n\n" +
      "🎯 建議：\n" +
      "1. 商品頁 CTA 上移並加對比色，提高點擊。\n" +
      "2. 行動版詢價表單精簡為 3–4 欄，其餘改為送出後補填。\n" +
      "3. 將預算向 /products 與搜尋廣告傾斜。"
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

  /* ---------- 進站頁排名卡片 ---------- */
  var rankEl = document.getElementById("rankCards");
  var maxV = Math.max.apply(null, PAGES.map(function (p) { return p.v; }));
  var rankFills = [];
  PAGES.forEach(function (p, i) {
    var d = document.createElement("div");
    d.className = "rc" + (i < 3 ? " top" : "");
    d.innerHTML = '<div class="rc-rank">' + (i + 1) + '</div>' +
      '<div class="rc-body"><div class="rc-nm">' + p.nm + '</div><div class="rc-bar"><i data-w="' + Math.round(p.v / maxV * 100) + '"></i></div></div>' +
      '<div class="rc-v">' + p.v.toLocaleString() + '</div>';
    rankEl.appendChild(d);
    rankFills.push(d.querySelector(".rc-bar i"));
  });

  /* ---------- 流程動畫 ---------- */
  var STEPS = [["ga", "gsc", "gtm"], ["mcp"], ["ai"], ["out"]];
  var SIDE_AT = { 1: "gen", 3: "viz" }; // mcp 時亮產生器、out 時亮視覺化
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

  /* ---------- AI 逐字輸出 ---------- */
  var aiBtn = document.getElementById("aiBtn");
  var aiOut = document.getElementById("aiOut");
  var aiScene = document.getElementById("aiScene");
  var typing = false;
  function typeOut(text) {
    if (typing) return; typing = true; aiBtn.disabled = true;
    aiOut.textContent = ""; var i = 0;
    (function step() {
      if (i <= text.length) {
        aiOut.textContent = text.slice(0, i);
        var cur = document.createElement("span"); cur.className = "cursor"; cur.textContent = "▌";
        aiOut.appendChild(cur);
        i += 2; setTimeout(step, 12);
      } else { aiOut.textContent = text; typing = false; aiBtn.disabled = false; }
    })();
  }
  aiBtn.addEventListener("click", function () { typeOut(AI_TEXT[aiScene.value] || AI_TEXT.overview); });

  /* ---------- 更多圖表：每日趨勢 / 來源 / 裝置 / 關鍵字 / 漏斗 ---------- */
  var TREND = [32, 35, 31, 38, 42, 40, 45, 43, 48, 46, 44, 49, 47, 48];
  var tmax = Math.max.apply(null, TREND);
  var trendEl = document.getElementById("trend");
  TREND.forEach(function (v, i) {
    var c = document.createElement("div"); c.className = "tcol";
    var th = Math.round(v / tmax * 130);
    c.innerHTML = '<div class="tbar" data-h="' + th + '" style="height:' + th + 'px" title="' + v + 'k"></div><div class="tlab">' + (i + 1) + '</div>';
    trendEl.appendChild(c);
  });

  function makeBars(id, arr, unit) {
    var el = document.getElementById(id), mx = Math.max.apply(null, arr.map(function (x) { return x.v; })), fs = [];
    arr.forEach(function (x) {
      var r = document.createElement("div"); r.className = "bar-row";
      r.innerHTML = '<div class="nm">' + x.n + '</div><div class="bar-track"><div class="bar-fill"></div></div><div class="v">' + x.v + unit + '</div>';
      el.appendChild(r); fs.push({ el: r.querySelector(".bar-fill"), pct: Math.round(x.v / mx * 100) });
    });
    return fs;
  }
  var srcFills = makeBars("srcBars", [{ n: "自然搜尋", v: 42 }, { n: "直接", v: 27 }, { n: "社群", v: 18 }, { n: "推薦", v: 13 }], "%");

  /* 裝置分佈：甜甜圈圖（conic-gradient） */
  (function () {
    var DEV = [{ n: "行動", v: 64, c: "#22d3ee" }, { n: "桌機", v: 31, c: "#3b82f6" }, { n: "平板", v: 5, c: "#6b809e" }];
    var acc = 0, segs = DEV.map(function (d) { var s = acc; acc += d.v; return d.c + " " + s + "% " + acc + "%"; }).join(", ");
    document.getElementById("deviceDonut").innerHTML =
      '<div class="donut" style="background:conic-gradient(' + segs + ')"><div class="donut-c"><div class="cv">' + DEV[0].v + '%</div><div class="cl">' + DEV[0].n + '</div></div></div>' +
      '<div class="donut-legend">' + DEV.map(function (d) { return '<div class="li"><span class="dot" style="background:' + d.c + '"></span>' + d.n + '<b>' + d.v + '%</b></div>'; }).join('') + '</div>';
  })();

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
    tr.innerHTML = "<td>" + r.k + "</td><td>" + r.c.toLocaleString() + "</td><td>" + r.i.toLocaleString() +
      "</td><td>" + r.ctr + "%</td><td class='" + (r.up ? "up" : "down") + "'>" + r.pos + (r.up ? " ▲" : " ▼") + "</td>";
    kwBody.appendChild(tr);
  });

  var FUN = [
    { n: "進站", v: 48200, w: 100 },
    { n: "瀏覽商品", v: 34700, w: 72 },
    { n: "點詢價 CTA", v: 4340, w: 9 },
    { n: "送出詢價", v: 312, w: 3 }
  ];
  var funEl = document.getElementById("funnel"), funFills = [];
  FUN.forEach(function (f) {
    var row = document.createElement("div"); row.className = "frow";
    row.innerHTML = '<div class="fname">' + f.n + '</div><div class="ftrack"><div class="ffill"></div></div><div class="fval">' + f.v.toLocaleString() + '</div>';
    funEl.appendChild(row); funFills.push({ el: row.querySelector(".ffill"), pct: f.w });
  });

  /* ---------- GTM 版本控制 diff ---------- */
  (function () {
    var G = {
      cur: "v18", prev: "v17", by: "Jason", at: "2026-06-30 15:20",
      note: "新增詢價轉換追蹤、清理舊版 UA",
      groups: [
        { name: "標籤 Tags", rows: [
          { op: "add", nm: "GA4 事件 - 詢價完成（generate_lead）", note: "新增" },
          { op: "mod", nm: "GA4 設定標籤", note: "加入 user_id 參數" },
          { op: "del", nm: "UA 舊版通用分析（GA3）", note: "停用" }
        ] },
        { name: "觸發條件 Triggers", rows: [
          { op: "add", nm: "表單送出 - 詢價表單", note: "新增" },
          { op: "mod", nm: "全部頁面瀏覽", note: "排除 /admin 路徑" }
        ] },
        { name: "變數 Variables", rows: [
          { op: "add", nm: "DLV - lead_value", note: "新增" },
          { op: "add", nm: "常數 - GA4 Measurement ID", note: "新增" }
        ] }
      ]
    };
    var SYM = { add: "＋", mod: "～", del: "－" };
    document.getElementById("gvCur").textContent = G.cur;
    document.getElementById("gvPrev").textContent = G.prev;
    document.getElementById("gtmMeta").innerHTML = "發布者：<b>" + G.by + "</b>　·　時間：<b>" + G.at + "</b>　·　版本說明：<b>" + G.note + "</b>";
    var diff = document.getElementById("gtmDiff");
    G.groups.forEach(function (g) {
      var wrap = document.createElement("div"); wrap.className = "gtm-group";
      wrap.innerHTML = "<h4>" + g.name + "</h4>" + g.rows.map(function (r) {
        return '<div class="diff-row ' + r.op + '"><span class="op">' + SYM[r.op] + '</span><span class="nm">' + r.nm + '</span><span class="note">' + r.note + '</span></div>';
      }).join("");
      diff.appendChild(wrap);
    });
  })();

  /* ---------- 流量熱力圖（星期 × 時段） ---------- */
  (function () {
    var DAYS = ["一", "二", "三", "四", "五", "六", "日"];
    var heat = document.getElementById("heatmap");
    var head = document.createElement("div"); head.className = "hm-row";
    var hh = '<div class="hm-lab"></div>';
    for (var c = 0; c < 12; c++) hh += '<div class="hm-colhead">' + (c * 2) + '</div>';
    head.innerHTML = hh; heat.appendChild(head);
    DAYS.forEach(function (d, r) {
      var row = document.createElement("div"); row.className = "hm-row";
      var cells = '<div class="hm-lab">' + d + '</div>';
      for (var c = 0; c < 12; c++) {
        var hour = c * 2;
        var base = (r < 5) ? ((hour >= 8 && hour <= 20) ? 0.82 : 0.18) : ((hour >= 10 && hour <= 22) ? 0.6 : 0.22);
        var v = Math.max(0.06, Math.min(1, base + ((r * 5 + c) % 5) * 0.05 - 0.1));
        cells += '<div class="hm-cell" title="週' + d + ' ' + hour + ':00｜熱度 ' + Math.round(v * 100) + '" style="background:rgba(34,211,238,' + v.toFixed(2) + ')"></div>';
      }
      row.innerHTML = cells; heat.appendChild(row);
    });
  })();

  function animateExtras() {
    document.querySelectorAll("#trend .tbar").forEach(function (b) { b.style.height = "0"; });
    srcFills.concat(funFills).forEach(function (f) { f.el.style.width = "0"; });
    rankFills.forEach(function (el) { el.style.width = "0"; });
    setTimeout(function () {
      document.querySelectorAll("#trend .tbar").forEach(function (b) { b.style.height = b.dataset.h + "px"; });
      srcFills.concat(funFills).forEach(function (f) { f.el.style.width = f.pct + "%"; });
      rankFills.forEach(function (el) { el.style.width = el.dataset.w + "%"; });
    }, 130);
  }
  runBtn.addEventListener("click", animateExtras);

  /* ---------- 載入自動播一次 ---------- */
  setTimeout(function () { playFlow(); animateExtras(); }, 400);
})();
