/* job-automation-demo — 前端模擬（無真實 API；職缺/公司/薪資皆虛構） */
(function () {
  "use strict";

  /* ---------- 虛構職缺資料 ---------- */
  var JOBS = [
    { id: 1, title: "資料工程師", co: "晶宇科技", loc: "台北", pay: "70k–95k", score: "A", reason: "JD 高度匹配：Python、ETL、雲端資料管線", src: "104" },
    { id: 2, title: "AI 應用工程師", co: "泰科系統", loc: "新竹", pay: "80k–110k", score: "A", reason: "命中 RAG / LLM / 向量資料庫關鍵字", src: "1111" },
    { id: 3, title: "數據分析師", co: "宏睿數位", loc: "台北", pay: "55k–75k", score: "B", reason: "分析技能符合，雲端經驗為加分項", src: "104" },
    { id: 4, title: "自動化工程師", co: "立群智能", loc: "新北", pay: "60k–80k", score: "B", reason: "n8n / 爬蟲符合，產業略有落差", src: "1111" },
    { id: 5, title: "後端工程師", co: "佳威網路", loc: "高雄", pay: "50k–70k", score: "C", reason: "技能部分符合，地點偏遠", src: "104" },
    { id: 6, title: "行銷數據專員", co: "睿成行銷", loc: "台北", pay: "45k–60k", score: "C", reason: "偏行銷導向，技術成分較低", src: "1111" }
  ];
  var GROUPS = [
    { key: "A", label: "🔴 A 級（高匹配）", open: true },
    { key: "B", label: "🟡 B 級（中匹配）", open: false },
    { key: "C", label: "⚪ C 級（參考）", open: false }
  ];

  /* ---------- AI 生成內容（模擬） ---------- */
  function cvText(j) {
    return "📝 客製 CV 重點 — " + j.title + "（" + j.co + "）\n\n" +
      "・將「" + j.title + "」相關專案前置，量化成果（效率 / 成本 / 規模）。\n" +
      "・對齊 JD 關鍵字：" + j.reason.replace(/^[^：]*：?/, "") + "。\n" +
      "・摘要句改寫：以該職缺核心職責為主軸，一句點出可立即上手。\n" +
      "・技能區排序：把與此職缺最相關的技術放最前面。\n\n" +
      "🎯 一句版求職信開場：「我曾用相同技術解決類似問題，可為貴司的 " + j.title + " 職務快速貢獻。」";
  }
  function qaText(j) {
    return "💬 面試 QA — " + j.title + "（" + j.co + "）\n\n" +
      "Q1. 請簡述一個與此職務最相關的專案？\n" +
      "→ 用 STAR 法：情境、任務、行動、結果（附量化數字）。\n\n" +
      "Q2. 遇到資料 / 系統異常你怎麼排查？\n" +
      "→ 先定位、再驗證假設、最後加上監控或測試避免再犯。\n\n" +
      "Q3. 為何想加入「" + j.co + "」？\n" +
      "→ 連結該公司產品方向與自身技能（" + j.src + " 平台 JD 提到的重點）。";
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
      c.classList.add("sel"); selected = j;
      aiOut.innerHTML = '<div class="ai-placeholder">已選擇：<b style="color:#fff">' + j.title + " · " + j.co + "</b>\n選下方按鈕生成內容。</div>";
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
  genCV.onclick = function () { selected ? typeOut(cvText(selected)) : needSel(); };
  genQA.onclick = function () { selected ? typeOut(qaText(selected)) : needSel(); };

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
