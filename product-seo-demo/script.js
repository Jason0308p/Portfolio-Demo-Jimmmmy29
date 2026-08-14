/* product-seo-demo — 前端模擬（無真實 API；商品/數據皆虛構，Shopify 為情境示意，非真實店鋪資料） */
(function () {
  "use strict";

  /* ---------- Plotly 深色主題樣板（比照 ga-mcp-demo） ---------- */
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

  /* ---------- 共用小工具 ---------- */
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function typeInto(el, text, done) {
    el.textContent = ""; var i = 0;
    (function step() {
      if (i <= text.length) {
        el.textContent = text.slice(0, i);
        var c = document.createElement("span"); c.className = "typing-cur"; c.textContent = "▌"; el.appendChild(c);
        i += 2; setTimeout(step, 14);
      } else { el.textContent = text; if (done) done(); }
    })();
  }
  function typeIntoProgress(el, text, onStep, done) {
    el.textContent = ""; var i = 0;
    (function step() {
      if (i <= text.length) {
        var slice = text.slice(0, i);
        el.textContent = slice;
        var c = document.createElement("span"); c.className = "typing-cur"; c.textContent = "▌"; el.appendChild(c);
        if (onStep) onStep(slice);
        i += 2; setTimeout(step, 14);
      } else { el.textContent = text; if (onStep) onStep(text); if (done) done(); }
    })();
  }

  /* ================= 區塊3：AI 生成 SEO/GEO 商品文案（沿用既有 PRODUCTS/loadBefore/runGen） ================= */
  var PRODUCTS = [
    {
      id: "P-001", emoji: "🧴",
      bName: "保溫瓶 500ml 不鏽鋼",
      handleBefore: "bottle-500",
      handleAfter: "insulated-bottle-500ml-corporate-gift",
      aName: "客製保溫瓶 500ml｜304 雙層不鏽鋼真空｜企業送禮 / 活動贈品 / 員工福利",
      bullets: [
        "容量 500ml，304 食品級不鏽鋼雙層真空",
        "保溫 12 小時、保冷 24 小時，四季皆宜",
        "瓶身可雷雕或彩印企業 LOGO，質感耐久",
        "防漏旋蓋設計，通勤、健身、露營皆適用",
        "最小訂製量 50 個起，多色可選"
      ],
      geo: "在「企業送禮」與「活動贈品」情境中，保溫瓶是詢問度最高的實用型贈品之一。它兼具日常高頻使用與長期品牌曝光，適合作為員工福利禮、週年慶贈品或展會禮；少量即可客製 LOGO，是預算有限也能兼顧質感與實用的送禮選擇。",
      tags: ["保溫瓶", "客製保溫杯", "不鏽鋼保溫瓶", "企業送禮", "活動贈品", "員工福利禮", "雷雕LOGO"],
      moq: 50, tiers: [{ q: 50, p: 220 }, { q: 100, p: 195 }, { q: 300, p: 170 }, { q: 500, p: 155 }]
    },
    {
      id: "P-002", emoji: "👜",
      bName: "帆布袋 米白",
      handleBefore: "canvas-bag",
      handleAfter: "heavy-canvas-tote-bag-custom-logo",
      aName: "厚磅帆布托特包｜12oz 加厚｜可印 LOGO｜環保購物袋 / 展會贈品",
      bullets: [
        "12oz 厚磅純棉帆布，耐重耐用不易變形",
        "大容量托特版型，A4 文件、日用品輕鬆裝",
        "可單面 / 雙面網版印刷企業圖樣",
        "環保可重複使用，呼應永續 ESG 訴求",
        "最小訂製量 80 個起，尺寸與提帶長度可調"
      ],
      geo: "隨環保意識與 ESG 訴求抬頭，客製帆布袋成為兼顧企業形象與永續價值的熱門贈品。適合展會發放、會員禮、開幕活動與品牌聯名；厚磅材質提升質感與重複使用率，讓品牌 LOGO 在日常通勤中持續曝光。",
      tags: ["帆布袋", "托特包", "客製帆布袋", "環保袋", "展會贈品", "購物袋", "ESG永續"],
      moq: 80, tiers: [{ q: 80, p: 145 }, { q: 200, p: 128 }, { q: 500, p: 110 }, { q: 1000, p: 98 }]
    },
    {
      id: "P-003", emoji: "🔌",
      bName: "行動電源 10000",
      handleBefore: "powerbank-10000",
      handleAfter: "10000mah-power-bank-pd-fast-charge-gift",
      aName: "10000mAh 行動電源｜PD 快充 Type-C｜客製 LOGO 科技質感贈品",
      bullets: [
        "10000mAh 大容量，支援 PD / QC 快充",
        "Type-C 雙向輸入輸出，一條線搞定",
        "輕薄鋁合金機身，可雷雕或印刷 LOGO",
        "通過 BSMI 安規認證，安全有保障",
        "最小訂製量 100 個起，附收納袋可加購"
      ],
      geo: "3C 快充類贈品在科技業、金融業與大型展會的詢問度長年居高不下。行動電源使用頻率高、攜帶時間長，品牌 LOGO 曝光效益佳；金屬機身呈現科技質感，適合高階客戶禮、股東會贈品與新品發表活動。",
      tags: ["行動電源", "PD快充", "客製行動電源", "科技贈品", "商務禮品", "Type-C", "BSMI認證"],
      moq: 100, tiers: [{ q: 100, p: 320 }, { q: 300, p: 295 }, { q: 500, p: 275 }, { q: 1000, p: 255 }]
    }
  ];

  var picker = document.getElementById("picker");
  var cur = PRODUCTS[0];
  var processed = false;

  var bImg = document.getElementById("bImg"), bName = document.getElementById("bName"), bHandle = document.getElementById("bHandle");
  var aImg = document.getElementById("aImg"), aName = document.getElementById("aName"), aHandle = document.getElementById("aHandle");
  var handleBadge = document.getElementById("handleBadge");
  var aDesc = document.getElementById("aDesc"), aTags = document.getElementById("aTags"), aPrice = document.getElementById("aPrice"), aMeta = document.getElementById("aMeta");
  var genBtn = document.getElementById("genBtn"), postBtn = document.getElementById("postBtn");
  var socialOut = document.getElementById("socialOut");
  var ppUrl = document.getElementById("ppUrl"), ppBody = document.getElementById("ppBody");
  var PP_EMPTY = '<div class="pp-empty">尚未生成，點擊上方「執行 AI 上架處理」後，這裡會即時顯示商品頁面實際上線的樣子</div>';

  function loadBefore(p) {
    cur = p; processed = false;
    bImg.className = "pimg empty"; bImg.textContent = "無商品圖";
    bName.textContent = p.bName;
    bHandle.textContent = p.handleBefore;
    aImg.className = "pimg empty"; aImg.textContent = "尚未處理";
    aName.textContent = "—"; aName.classList.remove("done");
    aHandle.textContent = "—"; handleBadge.classList.remove("show");
    aDesc.innerHTML = "—"; aPrice.innerHTML = "—"; aTags.innerHTML = ""; aMeta.innerHTML = "";
    postBtn.disabled = true; socialOut.classList.remove("show");
    ppUrl.textContent = "example-shop.com/products/" + p.handleBefore;
    ppBody.innerHTML = PP_EMPTY;
    document.querySelectorAll(".pchip").forEach(function (c) { c.classList.toggle("sel", c.dataset.id === p.id); });
  }

  PRODUCTS.forEach(function (p) {
    var b = document.createElement("button");
    b.className = "pchip"; b.dataset.id = p.id;
    b.textContent = p.emoji + " " + p.id + "（" + p.bName + "）";
    b.onclick = function () { if (!busy) loadBefore(p); };
    picker.appendChild(b);
  });

  var busy = false;
  var genBtnLabel = genBtn.innerHTML;
  function runGen() {
    if (busy) return; busy = true; genBtn.disabled = true; postBtn.disabled = true;
    genBtn.classList.add("busy");
    genBtn.innerHTML = '<span class="btn-spin"></span>生成中…';
    document.querySelector(".ba").scrollIntoView({ behavior: "smooth", block: "center" });
    var p = cur;
    ppUrl.textContent = "example-shop.com/products/" + p.handleBefore;
    ppBody.innerHTML = '<div class="pp-empty">生成中，AI 正在為這個商品建立完整頁面…</div>';
    setTimeout(function () { aImg.className = "pimg full"; aImg.textContent = p.emoji; }, 350);
    setTimeout(function () {
      typeInto(aName, p.aName, function () {
        aHandle.textContent = p.handleAfter;
        handleBadge.classList.add("show");
        var html = "<ul>" + p.bullets.map(function (x) { return "<li>" + x + "</li>"; }).join("") + "</ul>" +
          '<p style="margin:6px 0 0;color:var(--text2)">' + p.geo + "</p>";
        aDesc.innerHTML = html;
        aPrice.innerHTML = '最小訂購量 <b style="color:#fff">' + p.moq + ' 個</b> 起，量大越優惠：<br>' +
          p.tiers.map(function (t) { return '・' + t.q + ' 個 → NT$ <b style="color:var(--accent2)">' + t.p + '</b> / 個'; }).join('<br>');
        aTags.innerHTML = "";
        p.tags.forEach(function (t, i) {
          setTimeout(function () {
            var s = document.createElement("span"); s.className = "ptg"; s.textContent = "#" + t; aTags.appendChild(s);
          }, 120 * i);
        });
        setTimeout(function () {
          aMeta.innerHTML = "";
          var jc = document.createElement("span"); jc.className = "ptg jsonld"; jc.textContent = "已產出 JSON-LD Product 結構化資料"; aMeta.appendChild(jc);
          setTimeout(function () {
            var sc = document.createElement("span"); sc.className = "ptg sync"; sc.textContent = "✓ 已同步宜搭(Yida)狀態"; aMeta.appendChild(sc);
            busy = false; genBtn.disabled = false; postBtn.disabled = false; processed = true;
            genBtn.classList.remove("busy"); genBtn.innerHTML = "✓ 已生成 " + genBtnLabel;
            var afterCard = document.querySelector(".pcard.after");
            afterCard.classList.add("flash");
            setTimeout(function () { afterCard.classList.remove("flash"); }, 1600);
            setTimeout(function () { genBtn.innerHTML = genBtnLabel; }, 1800);
            renderProductPage(p);
          }, 220);
        }, 120 * p.tags.length + 200);
      });
    }, 600);
  }
  genBtn.onclick = runGen;

  function renderProductPage(p) {
    ppUrl.textContent = "example-shop.com/products/" + p.handleAfter;
    var metaDesc = p.geo.length > 120 ? p.geo.slice(0, 120) + "…" : p.geo;
    ppBody.innerHTML =
      '<div class="pp-layout">' +
      '<div class="pp-media"><span class="pp-media-ic">' + p.emoji + '</span></div>' +
      '<div class="pp-info">' +
      '<h4 class="pp-title">' + escapeHtml(p.aName.split("｜")[0]) + '</h4>' +
      '<div class="pp-price">NT$ ' + p.tiers[0].p + ' <span>/ 個｜最小訂購 ' + p.moq + ' 個</span></div>' +
      '<ul class="pp-bullets">' + p.bullets.slice(0, 3).map(function (b) { return "<li>" + escapeHtml(b) + "</li>"; }).join("") + '</ul>' +
      '<button class="pp-cta" disabled>加入購物車（示意）</button>' +
      '</div></div>' +
      '<div class="pp-seo-strip">' +
      '<span class="pp-seo-tag">✓ Meta：' + escapeHtml(metaDesc) + '</span>' +
      '<span class="pp-seo-tag">✓ 圖片 Alt：' + escapeHtml(p.aName.split("｜")[0]) + ' 商品實拍圖</span>' +
      '<span class="pp-seo-tag">✓ Product JSON-LD</span>' +
      '</div>';
  }

  var spBody = document.getElementById("spBody");
  function runPost() {
    if (!processed || busy) return;
    var p = cur;
    socialOut.classList.add("show");
    var tierline = p.tiers.map(function (t) { return t.q + "個 NT$" + t.p; }).join("｜");
    var post = "🎁【新品上架】" + p.aName.split("｜")[0] + "\n\n" +
      p.bullets.slice(0, 3).map(function (b) { return "✓ " + b; }).join("\n") + "\n\n" +
      p.geo + "\n\n" +
      "📦 最小訂購量 " + p.moq + " 個起｜" + tierline + "\n" +
      "🎨 可客製印刷／雷雕 LOGO，歡迎索取樣品\n" +
      "👉 詢價・報價請私訊小編\n\n" +
      "#" + p.tags.join(" #");
    spBody.textContent = "";
    var i = 0;
    (function step() {
      if (i <= post.length) { spBody.textContent = post.slice(0, i); i += 3; setTimeout(step, 12); }
      else {
        spBody.textContent = post;
        var seed = p.id.charCodeAt(2);
        animNum("mView", 1800 + seed * 11);
        animNum("mLike", 90 + seed % 40);
        animNum("mShare", 12 + seed % 9);
        animNum("mClick", 140 + seed % 60);
      }
    })();
    socialOut.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
  function animNum(id, target) {
    var el = document.getElementById(id), n = 0, step = Math.max(1, Math.round(target / 30));
    (function go() { n += step; if (n >= target) { el.textContent = target.toLocaleString(); } else { el.textContent = n.toLocaleString(); setTimeout(go, 24); } })();
  }
  postBtn.onclick = runPost;

  /* ================= 區塊2：上架與下架流程總覽 ================= */
  var STEPS = ["excel", "read", "ai", "write", "yida", "post"];
  var runBtn = document.getElementById("runBtn");
  function setNode(k, st) { var n = document.querySelector('.node[data-k="' + k + '"]'); if (n) { n.classList.remove("active", "done"); if (st) n.classList.add(st); } }
  function playFlow() {
    if (runBtn.disabled) return; runBtn.disabled = true;
    document.querySelectorAll("#pipe .node").forEach(function (n) { n.classList.remove("active", "done"); });
    var i = 0;
    (function tick() {
      if (i > 0) setNode(STEPS[i - 1], "done");
      if (i < STEPS.length) { setNode(STEPS[i], "active"); i++; setTimeout(tick, 480); }
      else { runBtn.disabled = false; }
    })();
  }
  runBtn.addEventListener("click", playFlow);

  /* ================= 區塊4A：批次下架跨平台整合流程 ================= */
  var ARCHIVE_STEPS = ["a1", "a2", "a3", "a4", "a5"];
  var archiveBtn = document.getElementById("archiveBtn");
  var archiveReport = document.getElementById("archiveReport");
  var ARCHIVE_EMPTY = '<div class="ar-empty" id="arEmpty">尚未執行，點上方按鈕模擬跨平台批次下架流程</div>';
  var ARCHIVE_LOG_SAMPLES = [
    { ok: true, handle: "bottle-500-legacy", note: "Shopify 下架成功 → 宜搭狀態已更新" },
    { ok: true, handle: "canvas-bag-2025q2", note: "Shopify 下架成功 → 宜搭狀態已更新" },
    { ok: false, handle: "powerbank-legacy-v1", note: "查無此 handle，已略過並記錄" }
  ];
  function setArchiveNode(k, st) { var n = document.querySelector('#archiveFlow .cf-chip[data-k="' + k + '"]'); if (n) { n.classList.remove("active", "done"); if (st) n.classList.add(st); } }
  function playArchiveFlow() {
    if (archiveBtn.disabled) return; archiveBtn.disabled = true;
    document.querySelectorAll("#archiveFlow .cf-chip").forEach(function (n) { n.classList.remove("active", "done"); });
    archiveReport.innerHTML = ARCHIVE_EMPTY;
    var i = 0;
    (function tick() {
      if (i > 0) setArchiveNode(ARCHIVE_STEPS[i - 1], "done");
      if (i < ARCHIVE_STEPS.length) { setArchiveNode(ARCHIVE_STEPS[i], "active"); i++; setTimeout(tick, 480); }
      else {
        archiveBtn.disabled = false;
        archiveReport.innerHTML =
          '<div class="ar-stats">' +
          '<div class="ar-stat"><div class="ar-v">81</div><div class="ar-k">Excel 匯入筆數</div></div>' +
          '<div class="ar-stat good"><div class="ar-v">79</div><div class="ar-k">Shopify 下架成功</div></div>' +
          '<div class="ar-stat good"><div class="ar-v">79</div><div class="ar-k">宜搭已同步</div></div>' +
          '<div class="ar-stat warn"><div class="ar-v">2</div><div class="ar-k">失敗／略過</div></div>' +
          '</div>' +
          '<div class="ar-log">' +
          ARCHIVE_LOG_SAMPLES.map(function (l) {
            return '<div class="ar-log-line ' + (l.ok ? "ok" : "bad") + '">' + (l.ok ? "✓" : "✗") + ' <b>' + escapeHtml(l.handle) + '</b> → ' + escapeHtml(l.note) + '</div>';
          }).join("") +
          '</div>';
      }
    })();
  }
  archiveBtn.addEventListener("click", playArchiveFlow);

  /* ================= 區塊4B：Collection 縮圖生成 Pipeline ================= */
  var CF_STEPS = ["prompt", "draw", "upload", "cwrite", "verify"];
  var cfBtn = document.getElementById("cfBtn"), cfHint = document.getElementById("cfHint");
  var cfThumbBefore = document.getElementById("cfThumbBefore"), cfThumbAfter = document.getElementById("cfThumbAfter");
  var CF_THUMBS = [
    { icon: "🎁", name: "企業贈品精選", grad: "linear-gradient(135deg,#1d4ed8,#0891b2)", handle: "corporate-gift-picks",
      seoTitle: "企業贈品精選｜客製化禮贈品收藏 - Example Shop", seoMeta: "企業送禮、活動贈品、員工福利首選——保溫瓶、帆布袋、行動電源等熱門客製贈品，最小訂製量低，支援 LOGO 雷雕與印刷。",
      alt: "企業贈品精選集合封面圖，展示保溫瓶、帆布袋與行動電源等熱門客製贈品組合" },
    { icon: "🧵", name: "環保提袋系列", grad: "linear-gradient(135deg,#065f46,#22c55e)", handle: "eco-tote-series",
      seoTitle: "環保提袋系列｜客製帆布托特包 - Example Shop", seoMeta: "12oz 厚磅純棉帆布托特包，可單面／雙面印刷企業圖樣，呼應 ESG 永續訴求，適合展會發放與會員禮。",
      alt: "環保提袋系列集合封面圖，展示多款客製帆布托特包" },
    { icon: "🔋", name: "科技配件禮盒", grad: "linear-gradient(135deg,#6d28d9,#a78bfa)", handle: "tech-gift-sets",
      seoTitle: "科技配件禮盒｜客製行動電源與3C贈品 - Example Shop", seoMeta: "10000mAh PD 快充行動電源與熱門 3C 配件禮盒，鋁合金質感機身可雷雕 LOGO，適合科技業客戶禮與股東會贈品。",
      alt: "科技配件禮盒集合封面圖，展示行動電源與3C周邊禮盒組合" },
    { icon: "☕", name: "辦公室小物", grad: "linear-gradient(135deg,#9a3412,#f59e0b)", handle: "office-essentials",
      seoTitle: "辦公室小物｜客製文具與桌面禮品 - Example Shop", seoMeta: "馬克杯、筆記本、桌面小物等辦公室實用贈品，小量客製、交期彈性，適合日常員工福利與訪客禮。",
      alt: "辦公室小物集合封面圖，展示馬克杯與文具類桌面禮品" }
  ];
  var cfThumbIdx = 0;
  var cfPageUrl = document.getElementById("cfPageUrl"), cfPageBody = document.getElementById("cfPageBody");
  var cfSeoPanel = document.getElementById("cfSeoPanel");
  var cfSeoTitle = document.getElementById("cfSeoTitle"), cfSeoMeta = document.getElementById("cfSeoMeta");
  var cfSeoAlt = document.getElementById("cfSeoAlt"), cfSeoSchema = document.getElementById("cfSeoSchema");
  function setCF(k, st) { var n = document.querySelector('#chipFlow .cf-chip[data-k="' + k + '"]'); if (n) { n.classList.remove("active", "done"); if (st) n.classList.add(st); } }
  function playCF() {
    if (cfBtn.disabled) return; cfBtn.disabled = true; cfHint.textContent = "";
    document.querySelectorAll("#chipFlow .cf-chip").forEach(function (n) { n.classList.remove("active", "done"); });
    cfThumbAfter.className = "cf-thumb empty"; cfThumbAfter.innerHTML = "生成中…";
    cfSeoPanel.classList.remove("show");
    cfPageBody.innerHTML = '<div class="cf-page-empty">生成中，稍候將自動推送到集合頁…</div>';
    var i = 0;
    (function tick() {
      if (i > 0) setCF(CF_STEPS[i - 1], "done");
      if (i < CF_STEPS.length) { setCF(CF_STEPS[i], "active"); i++; setTimeout(tick, 420); }
      else {
        cfBtn.disabled = false; cfHint.textContent = "✓ 已重新讀取確認上線";
        var t = CF_THUMBS[cfThumbIdx % CF_THUMBS.length]; cfThumbIdx++;
        cfThumbAfter.className = "cf-thumb"; cfThumbAfter.style.background = t.grad;
        cfThumbAfter.innerHTML = '<span class="cf-thumb-badge">✓ 已上線</span>' +
          '<span class="cf-thumb-ic">' + t.icon + '</span><span class="cf-thumb-nm">' + t.name + '</span>';
        cfPageUrl.textContent = "example-shop.com/collections/" + t.handle;
        cfPageBody.innerHTML =
          '<div class="cf-page-banner" style="background:' + t.grad + '">' +
          '<span class="cf-page-banner-ic">' + t.icon + '</span><span class="cf-page-banner-nm">' + escapeHtml(t.name) + '</span>' +
          '</div>' +
          '<div class="cf-page-grid"><div class="cf-page-sw"></div><div class="cf-page-sw"></div><div class="cf-page-sw"></div><div class="cf-page-sw"></div></div>';
        cfSeoTitle.textContent = t.seoTitle;
        cfSeoMeta.textContent = t.seoMeta;
        cfSeoAlt.textContent = t.alt;
        cfSeoSchema.textContent = "✓ CollectionPage + ItemList JSON-LD 已產出";
        cfSeoPanel.classList.add("show");
      }
    })();
  }
  cfBtn.addEventListener("click", playCF);

  /* ================= 區塊5a：版型 tabs + 頁面線框預覽 ================= */
  var PG_TYPES = {
    guide: {
      desc: "面向「還在比較怎麼選」的訪客，結構為 Hero → 目錄 TOC → 選購重點 → FAQ → CTA，適合品類介紹頁與新品導購頁。",
      url: "example-shop.com/pages/insulated-bottle-buying-guide",
      wire: '<div class="wf-hero"><div class="wf-h1">保溫瓶挑選完整指南</div><div class="wf-h2">3 分鐘搞懂容量、保冷效果與材質怎麼選</div><div class="wf-cta">查看推薦組合 →</div></div>' +
        '<div class="wf-row"><div class="wf-pill">容量怎麼選</div><div class="wf-pill">保冷效果</div><div class="wf-pill">材質差異</div><div class="wf-pill">常見問題</div></div>' +
        '<div class="wf-grid3">' +
        '<div class="wf-card"><div class="wf-ic">📏</div><b>容量指南</b><div class="wf-ln">500ml 適合日常，750ml 適合戶外</div></div>' +
        '<div class="wf-card"><div class="wf-ic">❄️</div><b>保冷效果</b><div class="wf-ln">304 雙層真空，24 小時仍保冷</div></div>' +
        '<div class="wf-card"><div class="wf-ic">🎨</div><b>客製化</b><div class="wf-ln">雷射雕刻／絲印，50 件起訂</div></div></div>' +
        '<div class="wf-faq"><span>保溫效果能維持多久？</span><span class="wf-a">24 小時仍維持 84% 保冷率</span></div>' +
        '<div class="wf-faq"><span>可以客製 LOGO 嗎？</span><span class="wf-a">支援雷射雕刻與絲網印刷</span></div>' +
        '<div class="wf-faq"><span>MOQ 最低訂購量是多少？</span><span class="wf-a">50 件起，滿 300 件享分級折扣</span></div>'
    },
    landing: {
      desc: "面向特定產業（如展會、企業採購）的到達頁，結構為 Hero → 情境痛點 → 比較表 → 案例重點 → Sticky Bar CTA。",
      url: "example-shop.com/pages/corporate-gift-2026-expo",
      wire: '<div class="wf-hero"><div class="wf-h1">2026 企業贈品展覽會 專屬採購方案</div><div class="wf-h2">展會前 14 天完成打樣交貨的加急方案</div><div class="wf-cta">索取採購方案 →</div></div>' +
        '<div class="wf-grid3">' +
        '<div class="wf-card"><div class="wf-ic">⏱️</div><b>交期太趕</b><div class="wf-ln">展會前才確認需求，怕來不及</div></div>' +
        '<div class="wf-card"><div class="wf-ic">📦</div><b>量少不受理</b><div class="wf-ln">試訂量小，供應商不願意接單</div></div>' +
        '<div class="wf-card"><div class="wf-ic">🎯</div><b>品牌質感</b><div class="wf-ln">怕贈品太廉價，拉低品牌形象</div></div></div>' +
        '<table class="wf-cmp"><tr><th></th><th>標準方案</th><th>展會加急方案</th></tr>' +
        '<tr><td>交期</td><td>20 個工作天</td><td>14 天內交貨</td></tr>' +
        '<tr><td>起訂量</td><td>300 件</td><td>100 件</td></tr>' +
        '<tr><td>打樣</td><td>7 天</td><td>3 天快樣</td></tr></table>' +
        '<div class="wf-sticky">📌 Sticky Bar CTA：立即索取展會加急方案</div>'
    }
  };
  var pgTabs = document.getElementById("pgTabs"), pgTypeDesc = document.getElementById("pgTypeDesc");
  var pgWireUrl = document.getElementById("pgWireUrl"), pgWireBody = document.getElementById("pgWireBody");
  function renderPgType(key) {
    var t = PG_TYPES[key]; if (!t) return;
    pgTypeDesc.textContent = t.desc; pgWireUrl.textContent = t.url; pgWireBody.innerHTML = t.wire;
  }
  pgTabs.addEventListener("click", function (e) {
    var btn = e.target.closest(".pg-tab"); if (!btn) return;
    pgTabs.querySelectorAll(".pg-tab").forEach(function (b) { b.classList.toggle("active", b === btn); });
    renderPgType(btn.dataset.type);
  });
  renderPgType("guide");

  /* ================= 區塊5b：安全發布模擬（獨立 STEPS2/playFlow2，避免與區塊2衝突） ================= */
  var STEPS2 = ["pbackup", "pslice", "pverify", "pwrite", "preread"];
  var runBtn2 = document.getElementById("runBtn2");
  var pgPatchBlock = document.getElementById("pgPatchBlock");
  var pgDiffBlock = document.getElementById("pgDiffBlock");
  var PG_PATCH_EMPTY = '<div class="pg-patch-empty" id="pgPatchEmpty">〔待寫入〕點上方按鈕模擬安全發布，將插入下方保冷效果實測表格</div>';
  var PG_PATCH_ADDED = '<div class="pg-patch-added"><div class="pg-patch-added-inner">' +
    '<div class="pg-patch-banner"><span class="pg-patch-badge">＋ 新增區塊</span><b>保冷效果實測數據</b></div>' +
    '<div id="coolChart" class="pchart" style="height:180px"></div>' +
    '<div class="pg-patch-note">靜置 <b>24 小時</b>仍維持 <b>84%</b> 保冷率（4°C → 11°C）</div>' +
    '</div></div>';
  var PGD_GAP = "（尚無保冷效果實測數據）";
  var PGD_NEW = "＋ 保冷效果實測數據圖表";
  function renderCoolChart() {
    var hours = [0, 6, 12, 24], temp = [4, 6, 8, 11], retention = [100, 96, 91, 84];
    var traces = [
      {
        type: "scatter", mode: "lines+markers", name: "保冷率",
        x: hours, y: retention, yaxis: "y", fill: "tozeroy",
        line: { color: COLORS.accent2, width: 2 }, marker: { size: 5, color: COLORS.accent2 },
        fillcolor: "rgba(34,211,238,.12)",
        hovertemplate: "靜置 %{x} 小時<br>保冷率 %{y}%<extra></extra>"
      },
      {
        type: "scatter", mode: "lines+markers", name: "內容物溫度",
        x: hours, y: temp, yaxis: "y2",
        line: { color: COLORS.gold, width: 2, dash: "dot" }, marker: { size: 5, color: COLORS.gold },
        hovertemplate: "靜置 %{x} 小時<br>溫度 %{y}°C<extra></extra>"
      }
    ];
    var layout = mergeLayout({
      margin: { t: 10, r: 34, b: 30, l: 34 }, showlegend: true,
      legend: { orientation: "h", y: 1.2, font: { size: 9, color: COLORS.text3 } },
      xaxis: { title: { text: "靜置時間（小時）", font: { size: 9, color: COLORS.text3 } }, tickvals: hours, tickfont: { size: 9, color: COLORS.text3 }, gridcolor: "rgba(255,255,255,.05)" },
      yaxis: { title: { text: "保冷率 %", font: { size: 9, color: COLORS.accent2 } }, range: [0, 105], tickfont: { size: 9, color: COLORS.text3 }, gridcolor: "rgba(255,255,255,.06)" },
      yaxis2: { title: { text: "°C", font: { size: 9, color: COLORS.gold } }, overlaying: "y", side: "right", range: [0, 20], tickfont: { size: 9, color: COLORS.text3 }, showgrid: false }
    });
    Plotly.newPlot("coolChart", traces, layout, PLY_CONFIG);
  }
  function setNode2(k, st) { var n = document.querySelector('#pipe2 .node[data-k="' + k + '"]'); if (n) { n.classList.remove("active", "done"); if (st) n.classList.add(st); } }
  function playFlow2() {
    if (runBtn2.disabled) return; runBtn2.disabled = true;
    document.querySelectorAll("#pipe2 .node").forEach(function (n) { n.classList.remove("active", "done"); });
    pgPatchBlock.innerHTML = PG_PATCH_EMPTY;
    pgDiffBlock.className = "pgd-gap"; pgDiffBlock.textContent = PGD_GAP;
    var i = 0;
    (function tick() {
      if (i > 0) setNode2(STEPS2[i - 1], "done");
      if (i < STEPS2.length) { setNode2(STEPS2[i], "active"); i++; setTimeout(tick, 460); }
      else {
        runBtn2.disabled = false;
        pgPatchBlock.innerHTML = PG_PATCH_ADDED;
        pgDiffBlock.className = "pgd-new"; pgDiffBlock.textContent = PGD_NEW;
        renderCoolChart();
      }
    })();
  }
  runBtn2.addEventListener("click", playFlow2);

  /* ================= 區塊6：部落格文章生成與文案規則 ================= */
  var BLOG_TOPICS = {
    gift: {
      title: "企業送禮攻略：保溫瓶、帆布袋、行動電源怎麼挑才不失禮",
      meta: "企業送禮怎麼挑才得體？從保溫瓶、帆布袋到行動電源，比較各類贈品的實用度與訂製門檻，教你依預算、場合與收禮對象，挑出對方真的會長期使用的客製贈品。"
    },
    canvas: {
      title: "帆布袋為什麼成為企業ESG首選？永續贈品趨勢解析",
      meta: "ESG浪潮下帆布袋成為企業贈品新寵，厚磅純棉材質耐用又可重複使用，本文說明永續贈品的挑選邏輯、常見尺寸差異，以及客製印刷前該注意的版型與工期重點。"
    },
    power: {
      title: "行動電源選購指南：容量、快充規格與客製贈品怎麼選",
      meta: "挑選企業贈品用行動電源前要注意什麼？從容量、快充規格到機身材質與安全認證，說明常見規格重點，並提醒客製LOGO印刷位置與最小訂購量的實務注意事項。"
    }
  };
  var blogTitle = document.getElementById("blogTitle"), blogMeta = document.getElementById("blogMeta");
  var ruleLenItem = document.getElementById("ruleLen"), ruleLenVal = document.getElementById("ruleLenVal");
  var topicChips = document.querySelectorAll("#topicChips .tchip");
  var blogBusy = false;
  function updateLenIndicator(text) {
    var len = text.length;
    ruleLenVal.textContent = len + "/80字";
    ruleLenItem.classList.remove("good", "warn", "bad");
    if (len >= 70 && len <= 80) ruleLenItem.classList.add("good");
    else if (len >= 55 && len <= 90) ruleLenItem.classList.add("warn");
    else ruleLenItem.classList.add("bad");
  }
  var topicLabels = {};
  topicChips.forEach(function (b) { topicLabels[b.dataset.topic] = b.innerHTML; });
  topicChips.forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (blogBusy) return; blogBusy = true;
      topicChips.forEach(function (b) { b.classList.remove("sel"); b.disabled = true; });
      btn.classList.add("sel");
      btn.innerHTML = '<span class="btn-spin"></span>生成中…';
      blogTitle.textContent = "生成中…";
      blogMeta.textContent = "—";
      document.querySelector(".blog-out").scrollIntoView({ behavior: "smooth", block: "center" });
      var topic = BLOG_TOPICS[btn.dataset.topic];
      typeInto(blogTitle, topic.title, function () {
        typeIntoProgress(blogMeta, topic.meta, function (slice) { updateLenIndicator(slice); }, function () {
          blogBusy = false;
          topicChips.forEach(function (b) { b.disabled = false; });
          btn.innerHTML = "✓ 已生成";
          setTimeout(function () { btn.innerHTML = topicLabels[btn.dataset.topic]; }, 1800);
        });
      });
    });
  });

  /* ================= 區塊7：搜尋過濾與加權再排序 ================= */
  var SEARCH_ITEMS = [
    { title: "客製保溫瓶 500ml｜304不鏽鋼真空保溫杯", vendor: "禮贈品工坊", type: "保溫瓶", metaSnippet: "304不鏽鋼雙層真空，保溫12小時，企業送禮首選。" },
    { title: "厚磅帆布托特包 12oz｜可印LOGO環保袋", vendor: "禮贈品工坊", type: "袋類", metaSnippet: "12oz厚磅純棉帆布，耐重耐用，ESG永續贈品。" },
    { title: "10000mAh行動電源｜PD快充Type-C", vendor: "科技贈品社", type: "3C科技", metaSnippet: "支援PD/QC快充，鋁合金機身，商務贈品熱門款。" },
    { title: "陶瓷馬克杯 350ml｜可客製Logo", vendor: "禮贈品工坊", type: "杯具", metaSnippet: "陶瓷材質手感佳，適合會議贈品與員工福利。" },
    { title: "開幕活動禮盒組｜三件式伴手禮", vendor: "禮盒精選", type: "禮盒", metaSnippet: "組合保溫瓶與文具，適合展會與開幕活動發放。" },
    { title: "藍牙耳機｜無線降噪科技贈品", vendor: "科技贈品社", type: "3C科技", metaSnippet: "無線藍牙5.3，續航12小時，科技感十足。" },
    { title: "抱枕毛毯組｜居家質感贈禮", vendor: "居家選物", type: "居家生活", metaSnippet: "柔軟法蘭絨材質，適合尾牙抽獎與客戶關懷禮。" },
    { title: "客製筆記本套組｜文具贈品", vendor: "文具良品", type: "文具", metaSnippet: "PU封面筆記本＋原子筆組合，會議與展會實用款。" }
  ];
  (function () {
    var y = ["標題完全命中 (Title Match)", "供應商／類型命中 (Vendor / Product Type)", "描述／Meta 命中 (Meta Description)"];
    var x = [20, 10, 3];
    var trace = {
      type: "bar", orientation: "h", y: y, x: x,
      text: ["+20", "+10", "+3"], textposition: "outside", textfont: { color: COLORS.text2, size: 11 },
      marker: { color: [COLORS.accent, COLORS.accent2, COLORS.text3] },
      hovertemplate: "%{y}：+%{x}<extra></extra>"
    };
    var layout = mergeLayout({
      margin: { t: 10, r: 40, b: 34, l: 170 },
      xaxis: { title: { text: "加權分數", font: { size: 10, color: COLORS.text3 } }, tickfont: { size: 10, color: COLORS.text3 }, gridcolor: "rgba(255,255,255,.06)" },
      yaxis: { tickfont: { size: 11, color: COLORS.text2 } },
      showlegend: false
    });
    Plotly.newPlot("rerankWeightChart", [trace], layout, PLY_CONFIG);
  })();

  /* ---------- 優化前後效果對比（詞彙分類：同義詞／停用詞／單位正規化） ---------- */
  var SQ_PRESETS = [
    {
      key: "bottle", label: "保溫瓶 500", query: "500ml",
      before: 1024,
      after: 14,
      noise: [
        "保鮮盒 500ml 密封分裝款（純數字 500ml 巧合命中，非保溫瓶）",
        "暖手寶 USB 充電（「保溫」語意相近但非保溫容器）",
        "零錢包 皮革 500 系列限定（純數字 500 巧合命中）"
      ],
      trace: ["保溫瓶 500", "移除停用詞「系列／限定」→ 保溫瓶 500", "單位正規化：500 → 500ml", "同義詞展開：保溫瓶 ≈ 保溫杯 ≈ tumbler", "最終比對條件：(保溫瓶｜保溫杯｜tumbler) AND 500ml"]
    },
    {
      key: "tote", label: "帆布 提袋", query: "帆布",
      before: 856,
      after: 9,
      noise: [
        "帆布材質工作手套（材質詞「帆布」巧合命中，非提袋）",
        "居家帆布收納籃（同材質字詞但用途不符）",
        "帆布鞋墊耗材組（同材質字詞但非贈品類）"
      ],
      trace: ["帆布 提袋", "移除停用詞「的」→ 帆布 提袋", "同義詞展開：提袋 ≈ 托特包 ≈ tote bag", "最終比對條件：帆布 AND (提袋｜托特包｜tote bag)"]
    },
    {
      key: "power", label: "行動電源 快充", query: "行動電源",
      before: 612,
      after: 21,
      noise: [
        "快充頭轉接充電線材（只命中「快充」，非行動電源本體）",
        "電源延長線工業用（只命中「電源」關鍵字片段）",
        "行動辦公文具套組（只命中「行動」關鍵字片段）"
      ],
      trace: ["行動電源 快充", "同義詞展開：行動電源 ≈ 充電寶 ≈ power bank", "停用詞過濾「頭／線／組」等零件詞，避免只命中局部字詞", "最終比對條件：(行動電源｜充電寶｜power bank) AND 快充"]
    }
  ];
  var sqChipsWrap = document.getElementById("sqChips");
  var sqBeforeCount = document.getElementById("sqBeforeCount");
  var sqAfterCount = document.getElementById("sqAfterCount");
  var sqNoiseList = document.getElementById("sqNoiseList");
  var sqTrace = document.getElementById("sqTrace");
  function renderSqPreset(p) {
    sqBeforeCount.innerHTML = p.before.toLocaleString() + " <span>筆結果</span>";
    sqAfterCount.innerHTML = p.after.toLocaleString() + " <span>筆精準結果</span>";
    sqNoiseList.innerHTML = p.noise.map(function (n) { return "<li>" + escapeHtml(n) + "</li>"; }).join("");
    sqTrace.innerHTML = p.trace.map(function (t, i) {
      return '<span class="sq-step">' + escapeHtml(t) + "</span>" + (i < p.trace.length - 1 ? '<span class="sq-step-arrow">→</span>' : "");
    }).join("");
  }
  SQ_PRESETS.forEach(function (p, i) {
    var b = document.createElement("button");
    b.className = "tchip" + (i === 0 ? " sel" : "");
    b.textContent = p.label;
    b.addEventListener("click", function () {
      sqChipsWrap.querySelectorAll(".tchip").forEach(function (c) { c.classList.remove("sel"); });
      b.classList.add("sel");
      renderSqPreset(p);
      searchInput.value = p.query; curQuery = p.query; renderSearchList();
    });
    sqChipsWrap.appendChild(b);
  });
  renderSqPreset(SQ_PRESETS[0]);

  var searchInput = document.getElementById("searchInput");
  var typeChipsWrap = document.getElementById("typeChips");
  var searchList = document.getElementById("searchList");
  var curType = "全部", curQuery = "";
  function normalizeSearch(s) { return (s || "").toLowerCase().replace(/　/g, "").replace(/\s+/g, ""); }
  function scoreItem(item, qNorm) {
    if (!qNorm) return { score: 0, reasons: [] };
    var reasons = [], score = 0;
    var t = normalizeSearch(item.title), v = normalizeSearch(item.vendor), ty = normalizeSearch(item.type), m = normalizeSearch(item.metaSnippet);
    if (t.indexOf(qNorm) !== -1) { score += 20; reasons.push("+20 標題"); }
    if (v.indexOf(qNorm) !== -1 || ty.indexOf(qNorm) !== -1) { score += 10; reasons.push("+10 供應商/類型"); }
    if (m.indexOf(qNorm) !== -1) { score += 3; reasons.push("+3 Meta"); }
    return { score: score, reasons: reasons };
  }
  function renderSearchList() {
    var qNorm = normalizeSearch(curQuery);
    var list = SEARCH_ITEMS
      .map(function (it, i) { return { item: it, idx: i }; })
      .filter(function (r) { return curType === "全部" || r.item.type === curType; })
      .map(function (r) {
        var s = scoreItem(r.item, qNorm);
        return { item: r.item, idx: r.idx, score: s.score, reasons: s.reasons };
      });
    if (qNorm) list.sort(function (a, b) { return b.score - a.score || a.idx - b.idx; });
    else list.sort(function (a, b) { return a.idx - b.idx; });
    searchList.innerHTML = "";
    list.forEach(function (r) {
      var dim = qNorm && r.score === 0;
      var div = document.createElement("div");
      div.className = "s-item" + (dim ? " dim" : "");
      div.innerHTML =
        '<div class="s-top"><div class="s-title">' + escapeHtml(r.item.title) + '</div><div class="s-score">' + (qNorm ? "score " + r.score : "") + '</div></div>' +
        '<div class="s-meta"><span class="s-vendor">' + escapeHtml(r.item.vendor) + '</span><span class="s-type">' + escapeHtml(r.item.type) + '</span></div>' +
        '<div class="s-snip">' + escapeHtml(r.item.metaSnippet) + '</div>' +
        (r.reasons.length ? '<div class="s-badges">' + r.reasons.map(function (x) { return '<span class="s-badge">' + x + '</span>'; }).join("") + '</div>' : '');
      searchList.appendChild(div);
    });
  }
  var TYPES = ["全部"].concat(SEARCH_ITEMS.map(function (it) { return it.type; }).filter(function (t, i, arr) { return arr.indexOf(t) === i; }));
  TYPES.forEach(function (t) {
    var b = document.createElement("button");
    b.className = "tchip" + (t === "全部" ? " sel" : "");
    b.textContent = t;
    b.addEventListener("click", function () {
      curType = t;
      typeChipsWrap.querySelectorAll(".tchip").forEach(function (c) { c.classList.remove("sel"); });
      b.classList.add("sel");
      renderSearchList();
    });
    typeChipsWrap.appendChild(b);
  });
  var searchTimer = null;
  searchInput.addEventListener("input", function () {
    var v = searchInput.value;
    clearTimeout(searchTimer);
    searchTimer = setTimeout(function () { curQuery = v; renderSearchList(); }, 150);
  });

  /* ---------- 初始化 ---------- */
  loadBefore(PRODUCTS[0]);
  renderSearchList();
  setTimeout(playFlow, 400);
})();
