/* product-seo-demo — 前端模擬（無真實 API；商品/數據皆虛構） */
(function () {
  "use strict";

  /* ---------- 虛構商品（before / after） ---------- */
  var PRODUCTS = [
    {
      id: "P-001", emoji: "🧴",
      bName: "保溫瓶 500ml 不鏽鋼",
      aName: "客製保溫瓶 500ml｜304 雙層不鏽鋼真空｜企業送禮 / 活動贈品 / 員工福利",
      bullets: [
        "容量 500ml，304 食品級不鏽鋼雙層真空",
        "保溫 12 小時、保冷 24 小時，四季皆宜",
        "瓶身可雷雕或彩印企業 LOGO，質感耐久",
        "防漏旋蓋設計，通勤、健身、露營皆適用",
        "最小訂製量 50 個起，多色可選"
      ],
      geo: "在「企業送禮」與「活動贈品」情境中，保溫瓶是詢問度最高的實用型贈品之一。它兼具日常高頻使用與長期品牌曝光，適合作為員工福利禮、週年慶贈品或展會禮；少量即可客製 LOGO，是預算有限也能兼顧質感與實用的送禮選擇。",
      tags: ["保溫瓶", "客製保溫杯", "不鏽鋼保溫瓶", "企業送禮", "活動贈品", "員工福利禮", "雷雕LOGO"]
    },
    {
      id: "P-002", emoji: "👜",
      bName: "帆布袋 米白",
      aName: "厚磅帆布托特包｜12oz 加厚｜可印 LOGO｜環保購物袋 / 展會贈品",
      bullets: [
        "12oz 厚磅純棉帆布，耐重耐用不易變形",
        "大容量托特版型，A4 文件、日用品輕鬆裝",
        "可單面 / 雙面網版印刷企業圖樣",
        "環保可重複使用，呼應永續 ESG 訴求",
        "最小訂製量 80 個起，尺寸與提帶長度可調"
      ],
      geo: "隨環保意識與 ESG 訴求抬頭，客製帆布袋成為兼顧企業形象與永續價值的熱門贈品。適合展會發放、會員禮、開幕活動與品牌聯名；厚磅材質提升質感與重複使用率，讓品牌 LOGO 在日常通勤中持續曝光。",
      tags: ["帆布袋", "托特包", "客製帆布袋", "環保袋", "展會贈品", "購物袋", "ESG永續"]
    },
    {
      id: "P-003", emoji: "🔌",
      bName: "行動電源 10000",
      aName: "10000mAh 行動電源｜PD 快充 Type-C｜客製 LOGO 科技質感贈品",
      bullets: [
        "10000mAh 大容量，支援 PD / QC 快充",
        "Type-C 雙向輸入輸出，一條線搞定",
        "輕薄鋁合金機身，可雷雕或印刷 LOGO",
        "通過 BSMI 安規認證，安全有保障",
        "最小訂製量 100 個起，附收納袋可加購"
      ],
      geo: "3C 快充類贈品在科技業、金融業與大型展會的詢問度長年居高不下。行動電源使用頻率高、攜帶時間長，品牌 LOGO 曝光效益佳；金屬機身呈現科技質感，適合高階客戶禮、股東會贈品與新品發表活動。",
      tags: ["行動電源", "PD快充", "客製行動電源", "科技贈品", "商務禮品", "Type-C", "BSMI認證"]
    }
  ];

  var picker = document.getElementById("picker");
  var cur = PRODUCTS[0];
  var processed = false;

  // before/after DOM
  var bImg = document.getElementById("bImg"), bName = document.getElementById("bName");
  var aImg = document.getElementById("aImg"), aName = document.getElementById("aName");
  var aDesc = document.getElementById("aDesc"), aTags = document.getElementById("aTags");
  var genBtn = document.getElementById("genBtn"), postBtn = document.getElementById("postBtn");
  var socialOut = document.getElementById("socialOut");

  function loadBefore(p) {
    cur = p; processed = false;
    bImg.className = "pimg empty"; bImg.textContent = "無商品圖";
    bName.textContent = p.bName;
    aImg.className = "pimg empty"; aImg.textContent = "尚未處理";
    aName.textContent = "—"; aName.classList.remove("done");
    aDesc.innerHTML = "—"; aTags.innerHTML = "";
    postBtn.disabled = true; socialOut.classList.remove("show");
    document.querySelectorAll(".pchip").forEach(function (c) { c.classList.toggle("sel", c.dataset.id === p.id); });
  }

  PRODUCTS.forEach(function (p) {
    var b = document.createElement("button");
    b.className = "pchip"; b.dataset.id = p.id;
    b.textContent = p.emoji + " " + p.id + "（" + p.bName + "）";
    b.onclick = function () { if (!busy) loadBefore(p); };
    picker.appendChild(b);
  });

  /* ---------- AI 上架處理（逐步顯示） ---------- */
  var busy = false;
  function runGen() {
    if (busy) return; busy = true; genBtn.disabled = true; postBtn.disabled = true;
    var p = cur;
    // 1. 補圖
    setTimeout(function () { aImg.className = "pimg full"; aImg.textContent = p.emoji; }, 350);
    // 2. 打字 AI 名稱
    setTimeout(function () { typeInto(aName, p.aName, function () {
      // 3. 敘述（列點 + GEO）
      var html = "<ul>" + p.bullets.map(function (x) { return "<li>" + x + "</li>"; }).join("") + "</ul>" +
        '<p style="margin:6px 0 0;color:var(--text2)">' + p.geo + "</p>";
      aDesc.innerHTML = html;
      // 4. 標籤逐一出現
      aTags.innerHTML = "";
      p.tags.forEach(function (t, i) {
        setTimeout(function () {
          var s = document.createElement("span"); s.className = "ptg"; s.textContent = "#" + t; aTags.appendChild(s);
        }, 120 * i);
      });
      setTimeout(function () { busy = false; genBtn.disabled = false; postBtn.disabled = false; processed = true; }, 120 * p.tags.length + 200);
    }); }, 600);
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
  genBtn.onclick = runGen;

  /* ---------- 發佈社群 + 回收數據 ---------- */
  var spBody = document.getElementById("spBody");
  function runPost() {
    if (!processed || busy) return;
    var p = cur;
    socialOut.classList.add("show");
    var post = "🎁 新品上架｜" + p.aName.split("｜")[0] + "\n\n" +
      p.geo + "\n\n#" + p.tags.slice(0, 4).join(" #") + "\n👉 詢問請私訊";
    spBody.textContent = "";
    var i = 0;
    (function step() {
      if (i <= post.length) { spBody.textContent = post.slice(0, i); i += 3; setTimeout(step, 12); }
      else {
        spBody.textContent = post;
        // 回收數據（虛構，依商品略有差異）
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

  /* ---------- 流程動畫 ---------- */
  var STEPS = ["scrape", "read", "ai", "write", "post", "data"];
  var runBtn = document.getElementById("runBtn");
  function setNode(k, st) { var n = document.querySelector('.node[data-k="' + k + '"]'); if (n) { n.classList.remove("active", "done"); if (st) n.classList.add(st); } }
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

  /* ---------- 初始化 ---------- */
  loadBefore(PRODUCTS[0]);
  setTimeout(playFlow, 400);
})();
