/* ga-mcp-demo — 前端模擬（無真實 API；所有數字為假資料，圖表以純手刻 inline SVG 繪製，
   完全不依賴任何外部 JS 圖表庫或 CDN，離線亦可 100% 顯示。結構仿真實 GA4/GSC/GTM 專案） */
(function () {
  "use strict";

  var COLORS = {
    accent: "#3b82f6", accent2: "#22d3ee", green: "#22c55e", gold: "#f59e0b",
    red: "#ef4444", line: "#06c755", purple: "#a78bfa",
    text: "#e6edf7", text2: "#9fb2cc", text3: "#6b809e",
    card: "#13213a", card2: "#0e1830", border: "#22324f", border2: "#2c4061"
  };
  function lerpColor(a, b, t) {
    var ah = parseInt(a.slice(1), 16), bh = parseInt(b.slice(1), 16);
    var ar = (ah >> 16) & 255, ag = (ah >> 8) & 255, ab = ah & 255;
    var br = (bh >> 16) & 255, bg = (bh >> 8) & 255, bb = bh & 255;
    var rr = Math.round(ar + (br - ar) * t), rg = Math.round(ag + (bg - ag) * t), rb = Math.round(ab + (bb - ab) * t);
    return "rgb(" + rr + "," + rg + "," + rb + ")";
  }

  /* ================= 共用 SVG 繪圖工具（純手刻，不依賴任何圖表庫） ================= */
  var SVG_NS = "http://www.w3.org/2000/svg";
  function svgEl(tag, attrs) {
    var el = document.createElementNS(SVG_NS, tag);
    for (var k in attrs) if (attrs[k] !== undefined && attrs[k] !== null) el.setAttribute(k, attrs[k]);
    return el;
  }
  function svgRoot(w, h, extraClass) {
    var svg = svgEl("svg", { viewBox: "0 0 " + w + " " + h, preserveAspectRatio: "none", class: "hchart" + (extraClass ? " " + extraClass : "") });
    svg.style.width = "100%"; svg.style.height = "100%"; svg.style.display = "block";
    return svg;
  }
  function scaleLinear(domain, range) {
    var d0 = domain[0], d1 = domain[1], r0 = range[0], r1 = range[1];
    var span = (d1 - d0) || 1;
    return function (v) { return r0 + ((v - d0) / span) * (r1 - r0); };
  }

  /* 共用浮動 tooltip（取代 Plotly hoverlabel） */
  var tipEl = document.createElement("div");
  tipEl.className = "hchart-tip";
  document.body.appendChild(tipEl);
  function showTip(evt, html) {
    tipEl.innerHTML = html;
    tipEl.style.display = "block";
    moveTip(evt);
  }
  function moveTip(evt) {
    var pad = 14;
    var x = evt.clientX + pad, y = evt.clientY + pad;
    var vw = window.innerWidth, vh = window.innerHeight;
    var rect = tipEl.getBoundingClientRect();
    if (x + rect.width > vw - 8) x = evt.clientX - rect.width - pad;
    if (y + rect.height > vh - 8) y = evt.clientY - rect.height - pad;
    tipEl.style.left = x + "px"; tipEl.style.top = y + "px";
  }
  function hideTip() { tipEl.style.display = "none"; }
  function bindTip(el, htmlFn) {
    el.addEventListener("mousemove", function (evt) { showTip(evt, htmlFn()); });
    el.addEventListener("mouseleave", hideTip);
  }

  function chartWrap(container, legendItems) {
    container.innerHTML = "";
    var host = document.createElement("div");
    host.className = "hchart-host";
    container.appendChild(host);
    if (legendItems && legendItems.length > 1) {
      var lg = document.createElement("div");
      lg.className = "hchart-legend";
      legendItems.forEach(function (it) {
        var chip = document.createElement("span");
        chip.className = "hchart-legend-chip";
        chip.innerHTML = '<i style="background:' + it.color + '"></i>' + it.name;
        lg.appendChild(chip);
      });
      container.appendChild(lg);
    }
    return host;
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

  /* ================= 1. GSC 三軸組合趨勢圖（SVG：面積 + 長條 + 折線，三個獨立比例尺） ================= */
  (function () {
    var DAYS = ["06/17", "06/18", "06/19", "06/20", "06/21", "06/22", "06/23", "06/24", "06/25", "06/26", "06/27", "06/28", "06/29", "06/30"];
    var IMP = [14200, 14800, 13950, 15100, 16200, 15800, 14650, 15950, 16700, 17200, 16850, 17950, 18400, 19200];
    var CLICKS = [680, 712, 655, 742, 806, 774, 690, 760, 812, 845, 820, 875, 905, 948];
    var POS = [12.8, 12.6, 12.9, 12.4, 12.1, 12.3, 12.5, 12.0, 11.7, 11.6, 11.9, 11.4, 11.1, 10.8];

    var container = document.getElementById("gscTrendChart");
    var host = chartWrap(container, [
      { name: "曝光 Impressions", color: COLORS.accent2 },
      { name: "點擊 Clicks", color: COLORS.accent },
      { name: "平均排名（軸反轉，越靠上越好）", color: COLORS.gold }
    ]);
    var W = 900, H = 340, padL = 46, padR = 46, padT = 18, padB = 40;
    var plotW = W - padL - padR, plotH = H - padT - padB;
    var n = DAYS.length;
    var x = scaleLinear([0, n - 1], [padL, padL + plotW]);
    var yImp = scaleLinear([0, Math.max.apply(null, IMP) * 1.1], [padT + plotH, padT]);
    var maxClicks = Math.max.apply(null, CLICKS) * 1.35;
    var yClicks = scaleLinear([0, maxClicks], [padT + plotH, padT]);
    var yPos = scaleLinear([Math.max.apply(null, POS) + 1, Math.min.apply(null, POS) - 1], [padT + plotH, padT]); /* 反轉 */

    var svg = svgRoot(W, H);
    /* 格線 */
    for (var g = 0; g <= 4; g++) {
      var gy = padT + (plotH / 4) * g;
      svg.appendChild(svgEl("line", { x1: padL, x2: padL + plotW, y1: gy, y2: gy, stroke: "rgba(255,255,255,.06)", "stroke-width": 1 }));
    }
    /* 長條：點擊 */
    var barW = plotW / n * 0.42;
    CLICKS.forEach(function (v, i) {
      var bx = x(i) - barW / 2, by = yClicks(v);
      var rect = svgEl("rect", { x: bx, y: by, width: barW, height: (padT + plotH) - by, rx: 3, fill: "rgba(59,130,246,.75)" });
      bindTip(rect, function () { return "<b>" + DAYS[i] + "</b><br>點擊 " + v.toLocaleString(); });
      svg.appendChild(rect);
    });
    /* 面積：曝光 */
    var areaPts = IMP.map(function (v, i) { return x(i) + "," + yImp(v); }).join(" L ");
    var areaPath = "M " + x(0) + "," + (padT + plotH) + " L " + areaPts + " L " + x(n - 1) + "," + (padT + plotH) + " Z";
    svg.appendChild(svgEl("path", { d: areaPath, fill: "rgba(34,211,238,.16)", stroke: "none" }));
    var impLine = "M " + IMP.map(function (v, i) { return x(i) + "," + yImp(v); }).join(" L ");
    svg.appendChild(svgEl("path", { d: impLine, fill: "none", stroke: COLORS.accent2, "stroke-width": 2 }));
    IMP.forEach(function (v, i) {
      var c = svgEl("circle", { cx: x(i), cy: yImp(v), r: 7, fill: "transparent", stroke: "none" });
      bindTip(c, function () { return "<b>" + DAYS[i] + "</b><br>曝光 " + v.toLocaleString(); });
      svg.appendChild(c);
    });
    /* 折線：平均排名 */
    var posLine = "M " + POS.map(function (v, i) { return x(i) + "," + yPos(v); }).join(" L ");
    svg.appendChild(svgEl("path", { d: posLine, fill: "none", stroke: COLORS.gold, "stroke-width": 2 }));
    POS.forEach(function (v, i) {
      var c = svgEl("circle", { cx: x(i), cy: yPos(v), r: 4, fill: COLORS.gold });
      bindTip(c, function () { return "<b>" + DAYS[i] + "</b><br>平均排名 " + v; });
      svg.appendChild(c);
    });
    /* X 軸標籤（每 2 天） */
    DAYS.forEach(function (d, i) {
      if (i % 2 !== 0) return;
      svg.appendChild(svgEl("text", { x: x(i), y: H - 12, "text-anchor": "middle", class: "hchart-axis" })).textContent = d;
    });
    /* Y 軸標題 */
    svg.appendChild(svgEl("text", { x: 6, y: padT - 4, class: "hchart-axis", fill: COLORS.text3 })).textContent = "曝光/點擊";
    svg.appendChild(svgEl("text", { x: W - 6, y: padT - 4, "text-anchor": "end", class: "hchart-axis", fill: COLORS.gold })).textContent = "平均排名";
    host.appendChild(svg);
  })();

  /* ================= 流量來源結構（水平長條） ================= */
  (function () {
    var SRC = [{ n: "自然搜尋", v: 42 }, { n: "直接", v: 27 }, { n: "社群", v: 18 }, { n: "推薦", v: 13 }];
    var container = document.getElementById("srcChart");
    var host = chartWrap(container);
    var W = 420, rowH = 46, padL = 84, padR = 46, padT = 8;
    var H = padT + rowH * SRC.length + 8;
    var maxV = Math.max.apply(null, SRC.map(function (d) { return d.v; }));
    var xw = scaleLinear([0, maxV], [0, W - padL - padR]);
    var svg = svgRoot(W, H);
    SRC.forEach(function (d, i) {
      var y = padT + i * rowH;
      var barH = rowH * 0.5;
      svg.appendChild(svgEl("text", { x: padL - 10, y: y + barH / 2 + 4, "text-anchor": "end", class: "hchart-axis" })).textContent = d.n;
      var rect = svgEl("rect", { x: padL, y: y, width: xw(d.v), height: barH, rx: 4, fill: COLORS.accent2 });
      bindTip(rect, function () { return "<b>" + d.n + "</b>：" + d.v + "%"; });
      svg.appendChild(rect);
      svg.appendChild(svgEl("text", { x: padL + xw(d.v) + 8, y: y + barH / 2 + 4, class: "hchart-val" })).textContent = d.v + "%";
    });
    host.appendChild(svg);
  })();

  /* ================= 6. 裝置圓餅圖（donut，stroke-dasharray） ================= */
  (function () {
    var DEV = [
      { n: "行動", v: 64, clicks: 6200, imp: 132000, color: COLORS.accent2 },
      { n: "桌機", v: 31, clicks: 3300, imp: 66300, color: COLORS.accent },
      { n: "平板", v: 5, clicks: 340, imp: 6900, color: COLORS.text3 }
    ];
    var container = document.getElementById("deviceChart");
    var host = chartWrap(container, DEV.map(function (d) { return { name: d.n, color: d.color }; }));
    var size = 220, cx = size / 2, cy = size / 2, r = 78, strokeW = 34;
    var circumference = 2 * Math.PI * r;
    var svg = svgRoot(size, size);
    var offset = 0;
    var total = DEV.reduce(function (a, d) { return a + d.v; }, 0);
    DEV.forEach(function (d) {
      var frac = d.v / total;
      var len = circumference * frac;
      var circle = svgEl("circle", {
        cx: cx, cy: cy, r: r, fill: "none", stroke: d.color, "stroke-width": strokeW,
        "stroke-dasharray": len + " " + (circumference - len),
        "stroke-dashoffset": -offset, transform: "rotate(-90 " + cx + " " + cy + ")"
      });
      var ctr = d.clicks / d.imp * 100;
      bindTip(circle, function () {
        return "<b>" + d.n + "</b><br>佔比 " + d.v + "%<br>點擊 " + d.clicks.toLocaleString() +
          "<br>曝光 " + d.imp.toLocaleString() + "<br>CTR " + ctr.toFixed(1) + "%";
      });
      svg.appendChild(circle);
      offset += len;
    });
    var labelC = svgEl("text", { x: cx, y: cy - 4, "text-anchor": "middle", class: "hchart-donut-big" });
    labelC.textContent = DEV[0].v + "%";
    svg.appendChild(labelC);
    var labelC2 = svgEl("text", { x: cx, y: cy + 16, "text-anchor": "middle", class: "hchart-axis" });
    labelC2.textContent = DEV[0].n + "為主";
    svg.appendChild(labelC2);
    host.appendChild(svg);
  })();

  /* ================= 3. Day × Hour Sessions Heatmap（矩形網格 + 顏色映照） ================= */
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
    var flat = z.reduce(function (a, row) { return a.concat(row); }, []);
    var zMin = Math.min.apply(null, flat), zMax = Math.max.apply(null, flat);
    function colorFor(v) {
      var t = (v - zMin) / (zMax - zMin || 1);
      if (t < 0.5) return lerpColor(COLORS.card2, "#1c3a5e", t / 0.5);
      return lerpColor("#1c3a5e", COLORS.accent2, (t - 0.5) / 0.5);
    }
    var container = document.getElementById("heatmapChart");
    var host = chartWrap(container);
    var W = 900, padL = 50, padR = 60, padT = 8, padB = 30;
    var cellW = (W - padL - padR) / HOURS.length;
    var cellH = 26;
    var H = padT + cellH * DAYS.length + padB;
    var svg = svgRoot(W, H);
    DAYS.forEach(function (dname, r) {
      svg.appendChild(svgEl("text", { x: padL - 8, y: padT + r * cellH + cellH / 2 + 4, "text-anchor": "end", class: "hchart-axis" })).textContent = dname;
      HOURS.forEach(function (hh, c) {
        var v = z[r][c];
        var rect = svgEl("rect", {
          x: padL + c * cellW, y: padT + r * cellH, width: cellW - 1.5, height: cellH - 1.5,
          rx: 2, fill: colorFor(v)
        });
        bindTip(rect, function () { return "<b>" + dname + " " + hh + ":00</b><br>" + v + " sessions"; });
        svg.appendChild(rect);
      });
    });
    for (var hh2 = 0; hh2 < 24; hh2 += 2) {
      svg.appendChild(svgEl("text", { x: padL + hh2 * cellW + cellW / 2, y: padT + cellH * DAYS.length + 16, "text-anchor": "middle", class: "hchart-axis" })).textContent = hh2;
    }
    /* 顏色圖例（色階條） */
    var legW = 140, legX = W - padR + 4, legY = padT;
    var grad = svgEl("linearGradient", { id: "heatGrad", x1: "0", x2: "1", y1: "0", y2: "0" });
    grad.appendChild(svgEl("stop", { offset: "0%", "stop-color": COLORS.card2 }));
    grad.appendChild(svgEl("stop", { offset: "50%", "stop-color": "#1c3a5e" }));
    grad.appendChild(svgEl("stop", { offset: "100%", "stop-color": COLORS.accent2 }));
    var defs = svgEl("defs", {}); defs.appendChild(grad); svg.appendChild(defs);
    svg.appendChild(svgEl("rect", { x: legX, y: legY, width: legW, height: 8, fill: "url(#heatGrad)", rx: 3 }));
    svg.appendChild(svgEl("text", { x: legX, y: legY + 20, class: "hchart-axis" })).textContent = zMin;
    svg.appendChild(svgEl("text", { x: legX + legW, y: legY + 20, "text-anchor": "end", class: "hchart-axis" })).textContent = zMax;
    host.appendChild(svg);
  })();

  /* ================= 4. 頁面類型多線趨勢 + 下拉選單（原生 select，重繪 SVG） ================= */
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
    /* Users/Pageviews 不是單純等比例縮放 Sessions：每個頁面類型有不同的「新舊訪客比」與「每工作階段瀏覽頁數」，
       且比例會隨時間微幅漂移（貼近真實 GA 數據），這樣切換指標時線形會真的不一樣，不會只是縮放同一條線。 */
    var PT_USER_RATIO_BASE = [0.82, 0.88, 0.90, 0.70];
    var PT_USER_RATIO_DRIFT = [-0.04, 0.02, -0.01, 0.10];
    var PT_PV_RATIO_BASE = [1.35, 1.15, 1.20, 2.60];
    var PT_PV_RATIO_DRIFT = [0.10, -0.05, 0.05, 0.90];

    var PT_USERS = PT_SESSIONS.map(function (arr, i) {
      return arr.map(function (v, d) {
        var t = d / (arr.length - 1);
        var ratio = PT_USER_RATIO_BASE[i] + PT_USER_RATIO_DRIFT[i] * t;
        return Math.round(v * ratio);
      });
    });
    var PT_PAGEVIEWS = PT_SESSIONS.map(function (arr, i) {
      return arr.map(function (v, d) {
        var t = d / (arr.length - 1);
        var ratio = PT_PV_RATIO_BASE[i] + PT_PV_RATIO_DRIFT[i] * t;
        return Math.round(v * ratio);
      });
    });
    var METRICS = { "Sessions": PT_SESSIONS, "Users": PT_USERS, "Pageviews": PT_PAGEVIEWS };

    var container = document.getElementById("pageTypeChart");
    container.innerHTML = "";
    var ctrlRow = document.createElement("div");
    ctrlRow.className = "hchart-controls";
    var sel = document.createElement("select");
    sel.className = "hchart-select";
    ["Sessions", "Users", "Pageviews"].forEach(function (m) {
      var opt = document.createElement("option"); opt.value = m; opt.textContent = "指標：" + m; sel.appendChild(opt);
    });
    ctrlRow.appendChild(sel);
    container.appendChild(ctrlRow);
    var host = chartWrap2(container, PT_NAMES.map(function (nm, i) { return { name: nm, color: PT_COLORS[i] }; }));

    function chartWrap2(cont, legendItems) {
      var h = document.createElement("div");
      h.className = "hchart-host";
      cont.appendChild(h);
      if (legendItems && legendItems.length > 1) {
        var lg = document.createElement("div");
        lg.className = "hchart-legend";
        legendItems.forEach(function (it) {
          var chip = document.createElement("span");
          chip.className = "hchart-legend-chip";
          chip.innerHTML = '<i style="background:' + it.color + '"></i>' + it.name;
          lg.appendChild(chip);
        });
        cont.appendChild(lg);
      }
      return h;
    }

    function render(metricName) {
      host.innerHTML = "";
      var series = METRICS[metricName];
      var W = 900, H = 340, padL = 54, padR = 20, padT = 18, padB = 40;
      var plotW = W - padL - padR, plotH = H - padT - padB;
      var n = PT_DAYS.length;
      var allVals = series.reduce(function (a, s) { return a.concat(s); }, []);
      var maxV = Math.max.apply(null, allVals) * 1.08;
      var x = scaleLinear([0, n - 1], [padL, padL + plotW]);
      var y = scaleLinear([0, maxV], [padT + plotH, padT]);
      var svg = svgRoot(W, H);
      for (var g = 0; g <= 4; g++) {
        var gy = padT + (plotH / 4) * g;
        svg.appendChild(svgEl("line", { x1: padL, x2: padL + plotW, y1: gy, y2: gy, stroke: "rgba(255,255,255,.06)", "stroke-width": 1 }));
        var val = Math.round(maxV * (1 - g / 4));
        svg.appendChild(svgEl("text", { x: padL - 8, y: gy + 3, "text-anchor": "end", class: "hchart-axis" })).textContent = val.toLocaleString();
      }
      series.forEach(function (arr, i) {
        var d = "M " + arr.map(function (v, di) { return x(di) + "," + y(v); }).join(" L ");
        svg.appendChild(svgEl("path", { d: d, fill: "none", stroke: PT_COLORS[i], "stroke-width": 2 }));
        arr.forEach(function (v, di) {
          var c = svgEl("circle", { cx: x(di), cy: y(v), r: 6, fill: "transparent" });
          bindTip(c, function () { return "<b>" + PT_NAMES[i] + "</b><br>" + PT_DAYS[di] + "：" + v.toLocaleString(); });
          svg.appendChild(c);
          var dot = svgEl("circle", { cx: x(di), cy: y(v), r: 3, fill: PT_COLORS[i] });
          svg.appendChild(dot);
        });
      });
      PT_DAYS.forEach(function (dd, i) {
        if (i % 2 !== 0) return;
        svg.appendChild(svgEl("text", { x: x(i), y: H - 12, "text-anchor": "middle", class: "hchart-axis" })).textContent = dd;
      });
      host.appendChild(svg);
    }
    sel.addEventListener("change", function () { render(sel.value); });
    render("Sessions");
  })();

  /* ================= 5. Session Duration Histogram（全站 + 頁面大類拆解，SVG 長條直方圖） ================= */
  (function () {
    function mulberry32(seed) {
      return function () {
        seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
        var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    }
    function genDurations(seed, n, mu, sigma, cap) {
      var rng = mulberry32(seed), out = [];
      for (var i = 0; i < n; i++) {
        var u1 = Math.max(1e-6, rng()), u2 = rng();
        var z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        out.push(Math.min(cap, Math.round(Math.exp(mu + sigma * z))));
      }
      return out;
    }
    var CATS = [
      { key: "home", id: "durCatHome", name: "首頁", mu: 3.25, sigma: 0.5, cap: 900, color: COLORS.text2 },
      { key: "product", id: "durCatProduct", name: "商品頁", mu: 4.1, sigma: 0.58, cap: 1500, color: COLORS.accent },
      { key: "collection", id: "durCatCollection", name: "分類頁", mu: 3.85, sigma: 0.5, cap: 1200, color: COLORS.accent2 },
      { key: "page", id: "durCatPage", name: "內容頁", mu: 3.7, sigma: 0.48, cap: 1000, color: COLORS.gold },
      { key: "blog", id: "durCatBlog", name: "部落格", mu: 4.55, sigma: 0.6, cap: 1800, color: COLORS.purple }
    ];
    CATS.forEach(function (c, i) { c.durations = genDurations(20260630 + i * 97, 220, c.mu, c.sigma, c.cap); });
    var allDurations = CATS.reduce(function (acc, c) { return acc.concat(c.durations); }, []);

    function avg(arr) { return Math.round(arr.reduce(function (a, b) { return a + b; }, 0) / arr.length); }

    function renderHistogram(containerId, data, opts) {
      opts = opts || {};
      var start = opts.start || 0, end = opts.end, binSize = opts.binSize;
      var binCount = Math.ceil((end - start) / binSize);
      var bins = new Array(binCount).fill(0);
      data.forEach(function (v) {
        var idx = Math.min(binCount - 1, Math.floor((v - start) / binSize));
        if (idx >= 0) bins[idx]++;
      });
      var maxCount = Math.max.apply(null, bins) || 1;
      var container = document.getElementById(containerId);
      container.innerHTML = "";
      var host = document.createElement("div"); host.className = "hchart-host"; container.appendChild(host);
      var W = 400, H = 170, padL = 34, padR = 8, padT = 8, padB = 22;
      var plotW = W - padL - padR, plotH = H - padT - padB;
      var barW = plotW / binCount;
      var svg = svgRoot(W, H);
      bins.forEach(function (cnt, i) {
        var bh = (cnt / maxCount) * plotH;
        var rect = svgEl("rect", {
          x: padL + i * barW, y: padT + plotH - bh, width: Math.max(0.6, barW - 1), height: bh,
          fill: opts.color || "rgba(34,211,238,.55)"
        });
        var binStart = start + i * binSize;
        bindTip(rect, function () { return (binStart) + "–" + (binStart + binSize) + " 秒<br>" + cnt + " 筆"; });
        svg.appendChild(rect);
      });
      svg.appendChild(svgEl("text", { x: padL, y: H - 6, class: "hchart-axis" })).textContent = start + "s";
      svg.appendChild(svgEl("text", { x: padL + plotW, y: H - 6, "text-anchor": "end", class: "hchart-axis" })).textContent = end + "s";
      host.appendChild(svg);
    }

    renderHistogram("sessionDurChart", allDurations, { start: 0, end: 1800, binSize: 50, color: "rgba(34,211,238,.55)" });
    CATS.forEach(function (c) {
      renderHistogram(c.id, c.durations, { start: 0, end: c.cap, binSize: Math.round(c.cap / 24), color: c.color });
    });

    var legend = document.getElementById("durcatLegend");
    var rows = [{ name: "全站平均", color: COLORS.accent2, val: avg(allDurations) }].concat(
      CATS.map(function (c) { return { name: c.name, color: c.color, val: avg(c.durations) }; })
    );
    legend.innerHTML = rows.map(function (r) {
      return '<div class="durcat-chip"><span class="durcat-dot" style="background:' + r.color + '"></span>' +
        r.name + ' 平均 <span class="durcat-val">' + r.val + ' 秒</span></div>';
    }).join("");
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

  /* ================= 2. 雙轉換漏斗（SVG 梯形 polygon，寬度依比例遞減） ================= */
  (function () {
    function renderFunnel(containerId, steps, vals, colorFn) {
      var container = document.getElementById(containerId);
      container.innerHTML = "";
      var host = document.createElement("div"); host.className = "hchart-host hchart-funnel-host"; container.appendChild(host);
      var W = 420, rowH = 62, padT = 6;
      var H = padT + rowH * steps.length + 6;
      var maxV = vals[0];
      var maxW = W * 0.86;
      var svg = svgRoot(W, H);
      var initial = vals[0];
      steps.forEach(function (label, i) {
        var v = vals[i];
        var wTop = i === 0 ? maxW : maxW * (vals[i - 1] / maxV);
        var wBot = maxW * (v / maxV);
        var y0 = padT + i * rowH, y1 = y0 + rowH - 6;
        var cx = W / 2;
        var xTL = cx - wTop / 2, xTR = cx + wTop / 2;
        var xBL = cx - wBot / 2, xBR = cx + wBot / 2;
        var poly = svgEl("polygon", {
          points: [xTL + "," + y0, xTR + "," + y0, xBR + "," + y1, xBL + "," + y1].join(" "),
          fill: colorFn(i), stroke: COLORS.border2, "stroke-width": 1
        });
        var pct = ((v / initial) * 100).toFixed(1);
        bindTip(poly, function () { return "<b>" + label + "</b><br>" + v.toLocaleString() + "（" + pct + "%）"; });
        svg.appendChild(poly);
        var labelY = (y0 + y1) / 2;
        svg.appendChild(svgEl("text", { x: cx, y: labelY - 5, "text-anchor": "middle", class: "hchart-funnel-label" })).textContent = label;
        svg.appendChild(svgEl("text", { x: cx, y: labelY + 13, "text-anchor": "middle", class: "hchart-funnel-val" })).textContent = v.toLocaleString() + "（" + pct + "%）";
      });
      host.appendChild(svg);
    }

    var formSteps = ["Session 開始", "瀏覽商品", "開始填寫表單", "送出詢價表單"];
    var formVals = [48200, 34700, 2150, 312];
    renderFunnel("funnelForm", formSteps, formVals, function (i) {
      return lerpColor(COLORS.accent2, COLORS.accent, i / (formVals.length - 1));
    });

    var lineSteps = ["Session 開始", "瀏覽商品", "LINE 點擊轉換"];
    var lineVals = [48200, 34700, 1860];
    renderFunnel("funnelLine", lineSteps, lineVals, function (i) {
      return lerpColor("#bdf5d4", COLORS.line, i / (lineVals.length - 1));
    });
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

  /* ================= 7. 熱門進站頁（水平長條，含疑似機器人流量標色） ================= */
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
    var container = document.getElementById("landingPagesChart");
    var host = chartWrap(container);
    var W = 760, rowH = 40, padL = 128, padR = 40, padT = 6;
    var H = padT + rowH * n + 6;
    var maxV = Math.max.apply(null, LANDING.map(function (d) { return d.sessions; }));
    var xw = scaleLinear([0, maxV], [0, W - padL - padR]);
    var svg = svgRoot(W, H);
    LANDING.forEach(function (d, i) {
      var y = padT + i * rowH;
      var barH = rowH * 0.55;
      svg.appendChild(svgEl("text", { x: padL - 10, y: y + barH / 2 + 4, "text-anchor": "end", class: "hchart-axis" })).textContent = d.nm;
      var rect = svgEl("rect", { x: padL, y: y, width: xw(d.sessions), height: barH, rx: 4, fill: colors[i] });
      bindTip(rect, function () {
        return "<b>" + d.nm + "</b><br>Sessions " + d.sessions.toLocaleString() +
          "<br>平均互動時間 " + d.eng + "s ・跳出率 " + d.bounce + "%" +
          (d.bot ? "<br>⚠ 互動時間異常偏低、疑似機器人流量" : "");
      });
      svg.appendChild(rect);
      svg.appendChild(svgEl("text", { x: padL + xw(d.sessions) + 8, y: y + barH / 2 + 4, class: "hchart-val" })).textContent = d.sessions.toLocaleString() + (d.bot ? " ⚠" : "");
    });
    host.appendChild(svg);
  })();

  /* ---------- 載入自動播一次資料流程動畫 ---------- */
  setTimeout(function () { playFlow(); }, 400);
})();
