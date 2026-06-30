/* product-seo-demo — 前端模擬（無真實 API；商品/數據皆虛構） */
(function () {
  "use strict";

  /* ---------- 虛構商品（before / after） ---------- */
  var PRODUCTS = [
    {
      id: "P-001", emoji: "🧴",
      bName: "保溫瓶 500ml 不鏽鋼",
      aName: "客製保溫瓶 500ml｜雙層不鏽鋼真空｜企業送禮 / 活動贈品",
      bullets: ["容量 500ml，雙層不鏽鋼真空保溫", "可雷雕 / 印刷企業 LOGO", "保溫 12 小時、保冷 24 小時"],
      geo: "適合作為企業活動贈品與員工福利禮，少量也可客製，是兼具實用與品牌曝光的送禮選擇。",
      tags: ["保溫瓶", "客製保溫杯", "企業送禮", "活動贈品", "不鏽鋼"]
    },
    {
      id: "P-002", emoji: "👜",
      bName: "帆布袋 米白",
      aName: "厚磅帆布托特包｜可印 LOGO｜環保購物袋 / 展會贈品",
      bullets: ["12oz 厚磅帆布，耐重耐用", "大容量托特版型，日常與展會皆適用", "可雙面印刷企業圖樣"],
      geo: "環保意識抬頭，客製帆布袋是企業形象與永續訴求兼顧的熱門贈品，適合展會與會員禮。",
      tags: ["帆布袋", "托特包", "客製帆布袋", "環保袋", "展會贈品"]
    },
    {
      id: "P-003", emoji: "🔌",
      bName: "行動電源 10000",
      aName: "10000mAh 行動電源｜PD 快充｜客製 LOGO 科技贈品",
      bullets: ["10000mAh 大容量，支援 PD 快充", "輕薄機身，可印刷 / 雷雕 LOGO", "通過安規認證"],
      geo: "3C 快充類贈品在科技業與展會詢問度高，客製 LOGO 行動電源實用且品牌曝光時間長。",
      tags: ["行動電源", "快充", "客製行動電源", "科技贈品", "PD"]
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
