/* ===================================================================
   腳本情境設定 + 對話數據分析
   - 情境切換：點左側情境 → 右側四段流程內容更新
   - 長條圖：捲到可視範圍才動畫展開
   展示資料皆為虛構範例
   =================================================================== */
(function () {
  "use strict";

  /* ---------- A. 情境設定資料 ---------- */
  var SCENARIOS = [
    {
      id: "quote",
      icon: "💰",
      name: "報價詢問情境",
      kind: "ai",
      kindLabel: "AI 對話",
      priority: 100,
      updated: "2026/08/14 10:22",
      trigger: "客戶提到報價、多少錢、費用、預算、想估價等詢價語意時觸發，先進行下一步資訊收集。",
      triggerNote: "AI 以語意判斷為主，用詞不需完全一致即可觸發",
      fields: [
        { name: "產品品項", type: "文字", required: true },
        { name: "數量", type: "數字", required: true },
        { name: "尺寸 / 規格", type: "文字", required: true },
        { name: "材質", type: "文字", required: false },
        { name: "希望交期", type: "日期", required: false }
      ],
      fieldNote: "收集客戶詢價所需的必要條件，缺一項就不進入報價",
      apis: [
        { name: "Google Sheet · 牌價表", on: true },
        { name: "Google Sheet · 產品規格", on: true },
        { name: "公司主機 · 產品資料", on: true },
        { name: "宜搭 · 建立詢價單", on: true },
        { name: "Shopify · 商品資料", on: false },
        { name: "GA / GSC · 成效數據", on: false }
      ],
      rules: [
        "先查<b>牌價表</b>是否有對應品項與級距，命中才報價",
        "牌價<b>查無對應</b>時不臆測價格，改回「需人工確認」",
        "同時自動建立<b>宜搭詢價單</b>並通知內部群組",
        "報價一律附上<b>數量級距與有效期限</b>，避免口頭承諾"
      ]
    },
    {
      id: "spec",
      icon: "📐",
      name: "規格確認情境",
      kind: "ai",
      kindLabel: "AI 對話",
      priority: 90,
      updated: "2026/08/02 16:40",
      trigger: "客戶詢問尺寸、材質、印刷方式、可否客製、有沒有其他顏色等規格類問題時觸發。",
      triggerNote: "與報價情境共用品項辨識，但不進入價格流程",
      fields: [
        { name: "產品品項", type: "文字", required: true },
        { name: "想確認的項目", type: "文字", required: true },
        { name: "用途 / 使用場景", type: "文字", required: false }
      ],
      fieldNote: "只收集辨識產品與問題範圍所需的最小欄位",
      apis: [
        { name: "Google Sheet · 產品規格", on: true },
        { name: "Google Sheet · FAQ", on: true },
        { name: "公司主機 · 產品資料", on: true },
        { name: "Shopify · 商品資料", on: true },
        { name: "宜搭 · 建立詢價單", on: false },
        { name: "GA / GSC · 成效數據", on: false }
      ],
      rules: [
        "先走<b>精準比對</b>（品號／關鍵字），命中直接回覆",
        "找不到才動用<b>AI 語意檢索</b>，兼顧準確度與成本",
        "規格有多種版本時<b>並列呈現</b>，不擅自挑一個回答",
        "回覆附上<b>資料來源</b>（品號或規格表列），方便追溯"
      ]
    },
    {
      id: "human",
      icon: "🙋",
      name: "真人客服轉接情境",
      kind: "rule",
      kindLabel: "規則流程",
      priority: 120,
      updated: "2026/08/21 09:05",
      trigger: "客戶明確要求轉真人、客訴、急件處理，或 AI 連續兩輪無法解決時觸發。",
      triggerNote: "優先度最高，可中斷其他情境",
      fields: [
        { name: "聯絡人姓名", type: "文字", required: true },
        { name: "聯絡電話", type: "電話", required: true },
        { name: "需求摘要", type: "文字", required: true },
        { name: "公司 / 單位名稱", type: "文字", required: false }
      ],
      fieldNote: "蒐集完整資訊再轉接，避免真人客服重複詢問",
      apis: [
        { name: "宜搭 · 建立服務單", on: true },
        { name: "群組通知 · 內部 LINE", on: true },
        { name: "Google Sheet · FAQ", on: false },
        { name: "公司主機 · 產品資料", on: false },
        { name: "Shopify · 商品資料", on: false },
        { name: "GA / GSC · 成效數據", on: false }
      ],
      rules: [
        "轉接前<b>先查詢對話歷史</b>，已問過的不重複詢問",
        "告知客戶<b>已轉接負責團隊</b>與服務時間（平日 09:00–18:00）",
        "同步建立<b>宜搭服務單</b>並推播內部群組，不漏單",
        "非服務時間改為<b>留言登記</b>，明確告知回覆時段"
      ]
    },
    {
      id: "sample",
      icon: "🧾",
      name: "打樣需求情境",
      kind: "ai",
      kindLabel: "AI 對話",
      priority: 80,
      updated: "2026/07/28 14:12",
      trigger: "客戶提到打樣、看樣品、試做、先做一個看看等語意時觸發。",
      triggerNote: "打樣涉及費用與工期，一律走保守回覆",
      fields: [
        { name: "打樣品項", type: "文字", required: true },
        { name: "打樣數量", type: "數字", required: true },
        { name: "是否需上稿 / 印刷", type: "文字", required: true },
        { name: "希望取得日期", type: "日期", required: false }
      ],
      fieldNote: "打樣工期與費用差異大，欄位收齊才進人工評估",
      apis: [
        { name: "Google Sheet · 打樣費用表", on: true },
        { name: "宜搭 · 建立打樣單", on: true },
        { name: "群組通知 · 內部 LINE", on: true },
        { name: "公司主機 · 產品資料", on: true },
        { name: "Shopify · 商品資料", on: false },
        { name: "GA / GSC · 成效數據", on: false }
      ],
      rules: [
        "打樣費用與工期<b>一律標示為估算</b>，以業務確認為準",
        "需上稿的案件先提醒<b>稿件格式與出血規範</b>",
        "自動建立<b>宜搭打樣單</b>，附上已收集的完整需求",
        "急件另外標記，<b>推播給負責窗口</b>而非一般群組"
      ]
    }
  ];

  var elScn = document.getElementById("sbScn");
  var elFlow = document.getElementById("sbFlow");
  if (!elScn || !elFlow) return;

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  /* 左側情境清單 */
  function renderList(activeId) {
    elScn.innerHTML = SCENARIOS.map(function (s) {
      return (
        '<button type="button" class="sb-item' + (s.id === activeId ? " on" : "") +
        '" data-id="' + s.id + '">' +
        '<span class="sb-nm">' + s.icon + " " + esc(s.name) + "</span>" +
        '<span class="sb-meta">' +
        '<span class="sb-kind ' + s.kind + '">' + esc(s.kindLabel) + "</span>" +
        '<span class="sb-pri">優先度 ' + s.priority + "</span>" +
        "</span></button>"
      );
    }).join("");
  }

  /* 右側四段流程 */
  function renderFlow(s) {
    var fieldRows = s.fields.map(function (f) {
      return (
        '<div class="sb-req">' +
        (f.required ? '<span class="rq">✱</span>' : '<span class="rq" style="opacity:.25">✱</span>') +
        "<span>" + esc(f.name) + "</span>" +
        '<span class="sb-type">' + esc(f.type) + "</span></div>"
      );
    }).join("");

    var apiRows = s.apis.map(function (a) {
      return (
        '<div class="sb-api' + (a.on ? " on" : "") + '">' +
        '<span class="bx">' + (a.on ? "✓" : "") + "</span>" +
        "<span>" + esc(a.name) + "</span></div>"
      );
    }).join("");

    var ruleItems = s.rules.map(function (r) {
      return "<li>" + r + "</li>";
    }).join("");

    elFlow.innerHTML =
      /* 1 觸發條件 */
      '<div class="sb-step">' +
        '<div class="sb-head"><span class="sb-no">1</span>' +
        '<div><div class="sb-tl">觸發條件</div><div class="sb-sub">偵測使用者情境</div></div></div>' +
        '<div class="sb-body">' +
          '<div class="sb-field"><div class="fl">情境設定 ✱</div>' +
          '<div class="fv">' + esc(s.trigger) + "</div></div>" +
          '<div class="sb-field hl"><div class="fl">⚠ 判斷方式</div>' +
          '<div class="fv">' + esc(s.triggerNote) + "</div></div>" +
        "</div></div>" +

      /* 2 資訊收集 */
      '<div class="sb-step">' +
        '<div class="sb-head"><span class="sb-no">2</span>' +
        '<div><div class="sb-tl">資訊收集</div><div class="sb-sub">收集必要欄位</div></div></div>' +
        '<div class="sb-body">' +
          '<div class="sb-field"><div class="fl">欄位設定（' + s.fields.length + ' 個）</div>' +
          "<div>" + fieldRows + "</div></div>" +
          '<div class="sb-field"><div class="fl">說明</div>' +
          '<div class="fv">' + esc(s.fieldNote) + "</div></div>" +
        "</div></div>" +

      /* 3 API 工具 */
      '<div class="sb-step">' +
        '<div class="sb-head"><span class="sb-no">3</span>' +
        '<div><div class="sb-tl">API 工具</div><div class="sb-sub">提供給 AI 的資料源</div></div></div>' +
        '<div class="sb-body">' +
          '<div class="sb-field"><div class="fl">可用模組（勾選啟用）</div>' +
          "<div>" + apiRows + "</div></div>" +
        "</div></div>" +

      /* 4 回覆規則 */
      '<div class="sb-step">' +
        '<div class="sb-head"><span class="sb-no">4</span>' +
        '<div><div class="sb-tl">回覆規則</div><div class="sb-sub">設定 AI 執行流程與規則</div></div></div>' +
        '<div class="sb-body">' +
          '<div class="sb-field"><div class="fl">流程與規則設定 ✱</div>' +
          '<ol class="sb-rules">' + ruleItems + "</ol></div>" +
        "</div></div>";
  }

  function select(id) {
    var s = SCENARIOS.filter(function (x) { return x.id === id; })[0] || SCENARIOS[0];
    renderList(s.id);
    renderFlow(s);
  }

  elScn.addEventListener("click", function (e) {
    var btn = e.target.closest ? e.target.closest(".sb-item") : null;
    if (btn && btn.dataset.id) select(btn.dataset.id);
  });

  select(SCENARIOS[0].id);

  /* ---------- Tab 切換 ---------- */
  var tabBar = document.querySelector(".tab-bar");
  if (tabBar) {
    var btns = [].slice.call(tabBar.querySelectorAll(".tab-btn"));
    var panels = [].slice.call(document.querySelectorAll(".tab-panel"));

    function showTab(key) {
      btns.forEach(function (b) {
        var on = b.dataset.tab === key;
        b.classList.toggle("on", on);
        b.setAttribute("aria-selected", on ? "true" : "false");
      });
      panels.forEach(function (p) {
        p.hidden = p.dataset.panel !== key;
      });
      // 切到數據頁時，若長條尚未展開則補跑一次（隱藏時 IntersectionObserver 不會觸發）
      if (key === "ins" || key === "qa") fillBars();
    }

    tabBar.addEventListener("click", function (e) {
      var b = e.target.closest ? e.target.closest(".tab-btn") : null;
      if (b && b.dataset.tab) showTab(b.dataset.tab);
    });

    // 鍵盤左右鍵切換
    tabBar.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      var i = btns.indexOf(document.activeElement);
      if (i < 0) return;
      var n = e.key === "ArrowRight" ? (i + 1) % btns.length : (i - 1 + btns.length) % btns.length;
      btns[n].focus();
      showTab(btns[n].dataset.tab);
    });
  }

  /* ---------- B. 長條圖進場動畫 ---------- */
  function fillBars() {
    document.querySelectorAll(".bar-fl[data-w]").forEach(function (b) {
      if (b.offsetParent !== null && !b.style.width) {
        b.style.width = b.getAttribute("data-w") + "%";
      }
    });
  }

  // 可見的長條捲入視野即展開；隱藏 tab 內的等切換過去再由 fillBars() 補上
  var bars = [].slice.call(document.querySelectorAll(".bar-fl[data-w]"));
  if (bars.length) {
    if (typeof IntersectionObserver === "function") {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.style.width = en.target.getAttribute("data-w") + "%";
            io.unobserve(en.target);
          }
        });
      }, { threshold: 0.25 });
      bars.forEach(function (b) { io.observe(b); });
    } else {
      bars.forEach(function (b) { b.style.width = b.getAttribute("data-w") + "%"; });
    }
  }
})();
