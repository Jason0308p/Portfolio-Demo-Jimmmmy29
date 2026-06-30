/* line-rag-demo — 前端模擬（無任何真實 API；資料為虛構範例） */
(function () {
  "use strict";

  /* ---------- 虛構範例資料（非真實營運資料） ---------- */
  var PRODUCTS = [
    { code: "GIFT-1001", name: "客製不織布環保袋（W29×H28）", moq: 100, price: 38, tags: ["不織布袋", "環保袋", "袋"] },
    { code: "GIFT-1002", name: "雙層不鏽鋼保溫杯 500ml", moq: 50, price: 220, tags: ["保溫杯", "杯"] },
    { code: "GIFT-1007", name: "厚磅帆布托特包", moq: 80, price: 145, tags: ["帆布袋", "環保袋", "袋"] },
    { code: "GIFT-1012", name: "客製金屬鑰匙圈", moq: 200, price: 25, tags: ["鑰匙圈"] },
    { code: "GIFT-1020", name: "霧面玻璃隨行杯", moq: 100, price: 130, tags: ["保溫杯", "杯"] },
    { code: "GIFT-2003", name: "無線充電滑鼠墊", moq: 100, price: 0, tags: ["滑鼠墊", "3c"] }, // 0 = 無精準牌價
    { code: "GIFT-2008", name: "10000mAh 行動電源", moq: 100, price: 0, tags: ["行動電源", "3c"] }, // 無牌價
    { code: "GIFT-2010", name: "竹纖維折疊餐具組", moq: 200, price: 56, tags: ["餐具", "環保"] }
  ];
  var CATEGORY = {
    "環保袋": ["GIFT-1001", "GIFT-1007", "GIFT-2010"],
    "帆布袋": ["GIFT-1007"],
    "不織布袋": ["GIFT-1001"],
    "保溫杯": ["GIFT-1002", "GIFT-1020"],
    "鑰匙圈": ["GIFT-1012"],
    "滑鼠墊": ["GIFT-2003"],
    "行動電源": ["GIFT-2008"],
    "餐具": ["GIFT-2010"]
  };
  // 知識庫（每則含多個觸發詞，展示語意分流）
  var FAQ = [
    { topic: "寄送 / 運費", keys: ["寄送", "運費", "運送", "物流", "宅配", "貨運", "到貨", "出貨方式"],
      a: "商品多以宅配寄送，運費依重量與材積計算；大量訂單可安排貨運或門市自取，實際費用會在報價時一併列出。" },
    { topic: "交期", keys: ["交期", "多久", "幾天", "工作天", "幾個工作天", "出貨時間", "趕件", "急件"],
      a: "一般量產交期約 10–15 個工作天；急件可協助評估排程，確認品項與數量後提供更精準時程。" },
    { topic: "打樣 / 樣品", keys: ["打樣", "樣品", "借測", "看樣", "試做", "單件"],
      a: "打樣約 3–5 個工作天；部分品項可用樣品價購買或借測，確認品質後若下單，樣品費可折抵貨款。" },
    { topic: "付款 / 發票", keys: ["付款", "發票", "含稅", "稅", "匯款", "結帳", "三聯", "報帳"],
      a: "正式報價單會列出未稅與含稅金額，一律開立三聯式發票；首次合作多採訂金 + 尾款，依訂單金額調整。" },
    { topic: "營業時間", keys: ["營業", "上班", "客服時間", "幾點", "假日", "週末"],
      a: "營業時間為週一至週五 09:00–18:00；LINE 非即時回覆，小編會依序處理，敬請耐心等候。" },
    { topic: "印刷方式", keys: ["印刷", "印製", "印logo", "logo", "網版", "雷雕", "雷射", "熱轉", "燙金"],
      a: "常見印刷有網版、熱轉印、雷射雕刻、燙金等；會依材質與圖樣建議最合適的方式並說明版費。" },
    { topic: "詢價方式", keys: ["詢價", "第一次", "提供什麼", "怎麼問", "加好友", "要給什麼"],
      a: "歡迎提供：① 產品編號或參考圖、② 規格需求、③ 數量，並留下聯絡人與 email，我們會儘快回覆報價。" },
    { topic: "客製化", keys: ["客製", "訂製", "客自", "客製化", "改尺寸", "改顏色"],
      a: "多數品項可客製尺寸、顏色與印刷；最小量與費用依品項而定，提供需求後為您評估。" }
  ];

  /* ---------- 範例問題：依「技術路徑」分類，讓測試者看懂分流 ---------- */
  var ROUTE_LABEL = { product: "精準查詢", faq: "知識庫檢索", mixed: "混合檢索" };
  var SAMPLE_GROUPS = [
    {
      label: "🎯 產品 / 報價查詢",
      tech: "本地精準索引（產品編號 / 品類）→ 直接命中，<b>跳過向量搜尋</b>，最快也最準。",
      route: "product",
      items: [
        { q: "GIFT-1001 的最小訂購量？", hint: "產品編號精準命中" },
        { q: "GIFT-2008 報價多少", hint: "無牌價 → 保守處理 + 自動建單" },
        { q: "100 個帆布袋幫我抓報價", hint: "品類 + 數量 → 推薦清單" }
      ]
    },
    {
      label: "💡 模糊推薦選品",
      tech: "需求不明確 → <b>AI 向量語意檢索</b>，依語意挑選相近商品再生成推薦。",
      route: "product",
      items: [
        { q: "想送客戶有質感的禮物，有推薦嗎", hint: "模糊需求 → 語意推薦" },
        { q: "預算不多想送實用的小禮", hint: "模糊需求 → 語意推薦" }
      ]
    },
    {
      label: "❓ 一般客服 FAQ",
      tech: "對知識庫做<b>向量檢索</b>命中主題 → 交給 AI 生成回答（同義詞也能命中）。",
      route: "faq",
      items: [
        { q: "寄送要運費嗎？", hint: "→ 寄送 / 運費" },
        { q: "你們營業時間？", hint: "→ 營業時間" },
        { q: "報價是含稅嗎？發票怎麼開", hint: "→ 付款 / 發票" },
        { q: "可以先打樣看品質嗎", hint: "→ 打樣 / 樣品" },
        { q: "第一次詢價要提供什麼資料", hint: "→ 詢價方式" }
      ]
    },
    {
      label: "🔀 混合問題（產品 + FAQ）",
      tech: "同時含商品與一般問題 → <b>雙路檢索</b>，產品精準查 + 知識庫補充，合併回答。",
      route: "mixed",
      items: [
        { q: "保溫杯有哪些款式？交期多久", hint: "產品推薦 + 交期 FAQ" },
        { q: "GIFT-1007 可以客製印 logo 嗎", hint: "產品 + 印刷 FAQ" }
      ]
    }
  ];

  /* ---------- 路由判斷（簡化示意，非真實規則） ---------- */
  function detectCode(t) {
    var m = t.toUpperCase().match(/GIFT-\d{3,4}/);
    return m ? m[0] : null;
  }
  function detectCategory(t) {
    for (var k in CATEGORY) if (t.toLowerCase().indexOf(k.toLowerCase()) >= 0) return k;
    return null;
  }
  function detectFaq(t) {
    for (var i = 0; i < FAQ.length; i++) {
      for (var j = 0; j < FAQ[i].keys.length; j++) {
        if (t.toLowerCase().indexOf(FAQ[i].keys[j].toLowerCase()) >= 0) return FAQ[i];
      }
    }
    return null;
  }
  function isFuzzyGift(t) {
    return /送禮|禮物|小禮|質感|沒頭緒|沒有頭緒|不知道.*送|推薦.*禮|送.*實用|實用.*禮|有什麼好|該送什麼|預算.*送/.test(t);
  }
  function chooseRoute(t) {
    var isProd = !!(detectCode(t) || detectCategory(t) || isFuzzyGift(t) ||
      /推薦|產品|商品|報價|moq|訂購|價格|多少|幾款|款式/i.test(t));
    var isFaq = !!detectFaq(t);
    if (isProd && isFaq) return "mixed";
    if (isProd) return "product";
    return "faq";
  }

  /* ---------- 產生回覆 + 流程腳本（含模擬耗時） ---------- */
  function buildPlan(text) {
    var route = chooseRoute(text);
    var steps = [
      { k: "line", ms: 3, label: "接收訊息" },
      { k: "n8n", ms: 12, label: "去抖動 / 驗證" },
      { k: "route", ms: 6, label: "路由：" + route }
    ];
    var reply = "", code = detectCode(text), cat = detectCategory(text),
        faq = detectFaq(text), fuzzy = isFuzzyGift(text);

    if (code) {
      steps.push({ k: "rag", ms: 4, label: "產品編號精準命中（跳過向量搜尋）", side: "vec" });
      var p = findByCode(code);
      if (p) {
        steps.push({ k: "ai", ms: 280, label: "組裝產品回覆" });
        reply = p.price > 0
          ? "為您查到 【" + p.code + "】\n" + p.name +
            "\n・最小訂購量：" + p.moq + " 個\n・參考單價：NT$" + p.price + " 起"
          : "為您查到 【" + p.code + "】\n" + p.name +
            "\n・最小訂購量：" + p.moq + " 個\n・此品項目前沒有精準牌價，將由專人為您報價 🙋\n（已為您建立詢價單）";
        if (p.price === 0) steps.push({ k: "ai", ms: 8, label: "建立宜搭詢價單", side: "yida" });
      } else {
        steps.push({ k: "ai", ms: 200, label: "查無此編號，引導重問" });
        reply = "查無「" + code + "」這個編號，請再確認一下，或直接描述想找的品項，我幫您找 🙆";
      }
    } else if (cat) {
      steps.push({ k: "rag", ms: 5, label: "品類命中：" + cat + "（本地索引）" });
      steps.push({ k: "ai", ms: 320, label: "整理推薦清單" });
      reply = "為您推薦幾款「" + cat + "」可優先參考：\n" +
        CATEGORY[cat].map(function (c, i) {
          var pp = findByCode(c);
          return (i + 1) + ". 【" + pp.code + "】 " + pp.name +
            (pp.price > 0 ? "（單價 NT$" + pp.price + " 起）" : "（價格需人工確認）");
        }).join("\n");
    } else if (fuzzy) {
      steps.push({ k: "rag", ms: 41, label: "需求模糊 → 向量語意檢索", side: "vec" });
      steps.push({ k: "ai", ms: 380, label: "依語意挑選並生成推薦" });
      var picks = ["GIFT-1002", "GIFT-1020", "GIFT-1007"];
      reply = "了解！送客戶的話，這幾款質感與實用度都不錯，可優先參考：\n" +
        picks.map(function (c, i) {
          var pp = findByCode(c);
          return (i + 1) + ". 【" + pp.code + "】 " + pp.name;
        }).join("\n") +
        "\n方便的話，告訴我預算與數量，我再幫您縮小範圍 😊";
    } else if (faq) {
      steps.push({ k: "rag", ms: 36, label: "向量檢索知識庫 → " + faq.topic, side: "vec" });
      steps.push({ k: "ai", ms: 340, label: "依檢索內容生成回答" });
      reply = faq.a;
    }

    if (route === "mixed" && faq && (code || cat)) {
      reply += "\n\n另外關於「" + faq.topic + "」：" + faq.a;
      steps.push({ k: "rag", ms: 30, label: "補查知識庫：" + faq.topic, side: "vec" });
    }
    if (!reply) {
      steps.push({ k: "rag", ms: 34, label: "語意檢索（無精準命中）", side: "vec" });
      steps.push({ k: "ai", ms: 300, label: "生成一般回答" });
      reply = "感謝您的詢問！這題我先幫您記下並轉給專人，稍後為您回覆 🙋\n（您也可以換個說法，或提供產品編號／品項與數量）";
    }
    steps.push({ k: "reply", ms: 14, label: "回覆 LINE + 通知內部群組", side: null });
    return { route: route, steps: steps, reply: reply };
  }

  function findByCode(c) {
    for (var i = 0; i < PRODUCTS.length; i++) if (PRODUCTS[i].code === c) return PRODUCTS[i];
    return null;
  }

  /* ---------- DOM ---------- */
  var msgs = document.getElementById("msgs");
  var inp = document.getElementById("inp");
  var sendBtn = document.getElementById("send");
  var timeline = document.getElementById("timeline");
  var busy = false;

  function addMsg(text, who, route) {
    var row = document.createElement("div");
    row.className = "row-" + who;
    if (who === "bot") {
      var av = document.createElement("div");
      av.className = "av-bot"; av.textContent = "🤖";
      var col = document.createElement("div");
      col.className = "bcol";
      var nm = document.createElement("div");
      nm.className = "sender";
      nm.innerHTML = 'AI 客服<span class="badge-ai">AI</span>';
      col.appendChild(nm);
      var d = document.createElement("div");
      d.className = "msg bot";
      if (route) {
        var r = document.createElement("div");
        r.className = "route";
        r.textContent = "🧭 " + (ROUTE_LABEL[route] || route) + " · " + route;
        d.appendChild(r);
        d.appendChild(document.createTextNode(text));
      } else {
        d.textContent = text;
      }
      col.appendChild(d);
      row.appendChild(av); row.appendChild(col);
    } else {
      var dm = document.createElement("div");
      dm.className = "msg me";
      dm.textContent = text;
      row.appendChild(dm);
    }
    msgs.appendChild(row);
    msgs.scrollTop = msgs.scrollHeight;
    return row;
  }

  function setNode(k, state) {
    var sel = document.querySelector('.node[data-k="' + k + '"]');
    if (!sel) return;
    sel.classList.remove("active", "done");
    if (state) sel.classList.add(state);
  }
  function pingSide(k) {
    var sel = document.querySelector('.node.side[data-k="' + k + '"]');
    if (sel) { sel.classList.add("ping"); setTimeout(function () { sel.classList.remove("ping"); }, 1400); }
  }
  function clearNodes() {
    document.querySelectorAll(".node").forEach(function (n) { n.classList.remove("active", "done"); });
    document.querySelectorAll(".ms").forEach(function (m) { m.textContent = ""; });
  }
  function setMs(k, ms) {
    var el = document.querySelector('.ms[data-ms="' + k + '"]');
    if (el) el.textContent = ms + "ms";
  }

  function renderTimeline(steps, total) {
    timeline.innerHTML = "";
    steps.forEach(function (s) {
      var row = document.createElement("div");
      row.className = "row" + (s.ms < 8 ? " skip" : "");
      row.innerHTML = "<span>" + s.label + "</span><span>" + s.ms + "ms</span>";
      timeline.appendChild(row);
    });
    var t = document.createElement("div");
    t.className = "row";
    t.style.borderBottom = "none";
    t.innerHTML = "<span style='color:#fff;font-weight:700'>合計</span><span style='color:#22c55e;font-weight:700'>" + total + "ms</span>";
    timeline.appendChild(t);
  }

  function run(text) {
    if (busy || !text.trim()) return;
    busy = true; sendBtn.disabled = true;
    addMsg(text, "me");
    inp.value = "";

    var plan = buildPlan(text);
    clearNodes();

    // 打字中（含頭像）
    var typing = document.createElement("div");
    typing.className = "row-bot";
    typing.innerHTML =
      '<div class="av-bot">🤖</div>' +
      '<div class="bcol"><div class="sender">AI 客服<span class="badge-ai">AI</span></div>' +
      '<div class="typing">輸入中 <span>●</span><span>●</span><span>●</span></div></div>';
    msgs.appendChild(typing);
    msgs.scrollTop = msgs.scrollHeight;

    // 依步驟亮燈（壓縮動畫節奏，非真實耗時比例）
    var i = 0, total = 0;
    plan.steps.forEach(function (s) { total += s.ms; });
    var nodeOrder = ["line", "n8n", "route", "rag", "ai", "reply"];
    var ni = 0;
    function tick() {
      if (ni > 0) setNode(nodeOrder[ni - 1], "done");
      if (ni < nodeOrder.length) {
        var k = nodeOrder[ni];
        setNode(k, "active");
        // 對應步驟的耗時標註
        var acc = plan.steps.filter(function (s) { return s.k === k; });
        if (acc.length) setMs(k, acc.reduce(function (a, s) { return a + s.ms; }, 0));
        // side 效果
        plan.steps.forEach(function (s) { if (s.k === k && s.side) pingSide(s.side); });
        // 宜搭特例
        if (plan.steps.some(function (s) { return s.side === "yida" && (k === "ai"); })) pingSide("yida");
        ni++;
        setTimeout(tick, 360);
      } else {
        finish();
      }
    }
    function finish() {
      typing.remove();
      addMsg(plan.reply, "bot", plan.route);
      renderTimeline(plan.steps, total);
      setNode("reply", "done");
      busy = false; sendBtn.disabled = false;
      inp.focus();
    }
    setTimeout(tick, 250);
  }

  /* ---------- 範例：分類摺疊 ---------- */
  var chips = document.getElementById("chips");
  SAMPLE_GROUPS.forEach(function (g, gi) {
    var det = document.createElement("details");
    det.className = "acc";
    if (gi === 0) det.open = true;
    var sum = document.createElement("summary");
    sum.innerHTML = g.label + '<span class="cnt">' + g.items.length + " 題</span>";
    det.appendChild(sum);
    var body = document.createElement("div");
    body.className = "abody";
    var tech = document.createElement("div");
    tech.className = "grp-tech";
    tech.innerHTML = "⚙️ " + g.tech;
    body.appendChild(tech);
    var box = document.createElement("div");
    box.className = "chips";
    g.items.forEach(function (s) {
      var b = document.createElement("button");
      b.className = "chip";
      b.innerHTML = s.q + "<small>" + s.hint + "</small>";
      b.onclick = function () {
        if (busy) return;
        // 點擊後自動展開對應流程，讓測試者看清技術路徑
        run(s.q);
      };
      box.appendChild(b);
    });
    body.appendChild(box);
    det.appendChild(body);
    chips.appendChild(det);
  });

  sendBtn.onclick = function () { run(inp.value); };
  inp.addEventListener("keydown", function (e) { if (e.key === "Enter") run(inp.value); });

  /* ---------- 開場 ---------- */
  setTimeout(function () {
    addMsg("您好！我是禮品小幫手 🎁\n可以幫您查產品、報價、交期與常見問題。\n試著問問看，或點右側範例 👉", "bot");
  }, 300);
})();
