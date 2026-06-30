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
      "📊 本月整體成效摘要\n\n" +
      "・流量較上月成長 12.4%，互動率同步提升，顯示新進站來源品質佳。\n" +
      "・自然搜尋點擊成長 6.7%，平均排名前進 1.4，SEO 投入開始發酵。\n" +
      "・推估詢價 +18，轉換動能來自 /products 與 /eco-bags 兩個頁面。\n\n" +
      "🎯 建議：擴大表現最佳的 /eco-bags 內容，並為其建立內部連結強化權重。",
    seo:
      "🔍 自然搜尋 / SEO 機會\n\n" +
      "・有 3 組關鍵字停在第 11–15 名（第二頁前段），小幅優化即可進首頁。\n" +
      "・/blog/gift-guide 曝光高但 CTR 偏低，建議改寫 title 與 meta description。\n" +
      "・行動裝置佔點擊 68%，需確認核心頁面行動體驗與載入速度。\n\n" +
      "🎯 優先處理：先優化已接近首頁的關鍵字，投報率最高。",
    conv:
      "💰 轉換與詢價分析\n\n" +
      "・詢價漏斗主要流失在「商品頁 → 詢價表單」這一步。\n" +
      "・帶 GTM 事件的 CTA 點擊率，桌機高於行動 1.8 倍。\n" +
      "・/products 進站者詢價率最高，是最值得加大投放的入口。\n\n" +
      "🎯 建議：簡化行動版詢價表單欄位，並在商品頁強化 CTA。"
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

  /* ---------- 渲染長條圖 ---------- */
  var bars = document.getElementById("bars");
  var maxV = Math.max.apply(null, PAGES.map(function (p) { return p.v; }));
  var fills = [];
  PAGES.forEach(function (p) {
    var row = document.createElement("div");
    row.className = "bar-row";
    row.innerHTML = '<div class="nm">' + p.nm + "</div>" +
      '<div class="bar-track"><div class="bar-fill"></div></div>' +
      '<div class="v">' + p.v.toLocaleString() + "</div>";
    bars.appendChild(row);
    fills.push({ el: row.querySelector(".bar-fill"), pct: Math.round(p.v / maxV * 100) });
  });
  function animateBars() {
    fills.forEach(function (f) { f.el.style.width = "0"; });
    setTimeout(function () { fills.forEach(function (f) { f.el.style.width = f.pct + "%"; }); }, 120);
  }

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
        if (i === 0) animateBars();
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

  /* ---------- 載入自動播一次 ---------- */
  setTimeout(playFlow, 400);
})();
