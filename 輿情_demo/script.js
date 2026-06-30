document.addEventListener('DOMContentLoaded', function(){

/* ============================================================
   1. TABS — build from h2[id^="sec-"], then inject watchlist strip
   ============================================================ */
(function(){
  var hdrs = Array.from(document.querySelectorAll('h2[id^="sec-"]'));
  if (hdrs.length < 2) return;

  function getNodes(h2, nextH2) {
    var arr = [h2];
    var el = h2.nextSibling;
    while (el && el !== nextH2) { arr.push(el); el = el.nextSibling; }
    return arr;
  }

  function scrollWithOffset(el) {
    if (!el) return;
    var stickyOffset = 12;
    var topNav = document.querySelector('nav');
    var tabWrap = document.querySelector('.rwd-tab-wrap');
    if (topNav) stickyOffset += Math.ceil(topNav.getBoundingClientRect().height || 0);
    if (tabWrap) stickyOffset += Math.ceil(tabWrap.getBoundingClientRect().height || 0);
    var y = el.getBoundingClientRect().top + window.pageYOffset - stickyOffset;
    window.scrollTo({top: Math.max(0, y), behavior: 'smooth'});
  }

  function showTab(idx) {
    hdrs.forEach(function(h2, i) {
      var nodes = getNodes(h2, hdrs[i + 1] || null);
      var hide = (i !== idx);
      nodes.forEach(function(n){
        if (n.nodeType === 1) n.classList.toggle('rwd-tab-hidden', hide);
      });
    });
  }

  var nav = document.createElement('div');
  nav.className = 'rwd-tab-nav';

  var LABELS = {
    'sec-groups':'族群','sec-trending':'攀升','sec-news':'新聞',
    'sec-alerts':'警示','sec-buzz':'熱議','sec-overview':'個股情緒',
    'sec-detail':'個股詳情','sec-volume':'成交'
  };

  hdrs.forEach(function(h2, i) {
    var label = LABELS[h2.id] ||
      (h2.childNodes[0] && h2.childNodes[0].textContent || h2.textContent)
        .trim().replace(/[(（].*$/, '').trim().slice(0, 6);
    var btn = document.createElement('button');
    btn.className = 'rwd-tab-btn' + (i === 0 ? ' active' : '');
    btn.textContent = label;
    btn.addEventListener('click', function() {
      showTab(i);
      nav.querySelectorAll('.rwd-tab-btn').forEach(function(b){ b.classList.remove('active'); });
      btn.classList.add('active');
      scrollWithOffset(h2);
      
    });
    nav.appendChild(btn);
  });

  showTab(0);

  // Hide 快速導覽 — tabs replace it
  var pageTop = document.getElementById('page-top');
  if (pageTop) pageTop.style.display = 'none';

  // Swap nav button on test version (/test/)
  if (window.location.pathname.indexOf('/test') !== -1) {
    document.querySelectorAll('nav a').forEach(function(a) {
      if (a.href && a.href.indexOf('/test') !== -1) {
        a.href = '../';
        a.innerHTML = '&#8592; 前往正式版';
        a.style.background = 'rgba(230,57,70,.18)';
        a.style.border = '1.5px solid rgba(230,57,70,.6)';
        a.style.color = '#e63946';
        a.style.boxShadow = '0 0 10px rgba(230,57,70,.15)';
        a.removeAttribute('onmouseover');
        a.removeAttribute('onmouseout');
        a.onmouseover = function(){ this.style.background='rgba(230,57,70,.3)'; };
        a.onmouseout  = function(){ this.style.background='rgba(230,57,70,.18)'; };
      }
    });
  }

  // Wrap nav in a container for sticky + scroll-arrow handling
  var wrap = document.createElement('div');
  wrap.className = 'rwd-tab-wrap';

  var arrL = document.createElement('button');
  arrL.className = 'rwd-tab-arr rwd-tab-arr-l';
  arrL.innerHTML = '&#8249;';
  arrL.title = '向左';
  arrL.style.display = 'none';

  var arrR = document.createElement('button');
  arrR.className = 'rwd-tab-arr rwd-tab-arr-r';
  arrR.innerHTML = '&#8250;';
  arrR.title = '向右';
  arrR.style.display = 'none';

  wrap.appendChild(nav);
  wrap.appendChild(arrL);
  wrap.appendChild(arrR);

  function _updateArrows() {
    var sl  = nav.scrollLeft;
    var max = nav.scrollWidth - nav.clientWidth;
    arrL.style.display = sl > 2 ? '' : 'none';
    arrR.style.display = sl < max - 2 ? '' : 'none';
    if (sl <= 2) wrap.setAttribute('data-at-start',''); else wrap.removeAttribute('data-at-start');
    if (sl >= max - 2) wrap.setAttribute('data-at-end',''); else wrap.removeAttribute('data-at-end');
  }
  arrL.addEventListener('click', function(){ nav.scrollBy({left:-130, behavior:'smooth'}); });
  arrR.addEventListener('click', function(){ nav.scrollBy({left:130, behavior:'smooth'}); });
  nav.addEventListener('scroll', _updateArrows);
  window.addEventListener('resize', _updateArrows);
  setTimeout(_updateArrows, 200);

  // Insert wrap after test banner
  var banner = document.getElementById('rwd-test-banner');
  if (banner) {
    banner.parentNode.insertBefore(wrap, banner.nextSibling);
  } else {
    hdrs[0].parentNode.insertBefore(wrap, hdrs[0]);
  }

  // Theme lab for test version
  (function(){
    var THEME_KEY = 'twstock_rwd_theme_v1';
    var TEXT_KEY  = 'twstock_rwd_text_v1';
    var BG_KEY    = 'twstock_rwd_bg_v1';
    var themes = [
      {id:'ember',  name:'Ember',  accent:'#e63946', accent2:'#ff6b6b', bg:'#1d2b3a', surface:'#22334a', card:'#263649', card2:'#2e4158', border:'#3a526b', blue:'#7dd3fc', gold:'#f59e0b'},
      {id:'ocean',  name:'Ocean',  accent:'#0ea5e9', accent2:'#38bdf8', bg:'#112433', surface:'#173348', card:'#1b425b', card2:'#24526f', border:'#356785', blue:'#93c5fd', gold:'#fbbf24'},
      {id:'forest', name:'Forest', accent:'#22c55e', accent2:'#4ade80', bg:'#16261f', surface:'#203329', card:'#294133', card2:'#345040', border:'#4b6653', blue:'#86efac', gold:'#facc15'},
      {id:'royal',  name:'Royal',  accent:'#8b5cf6', accent2:'#a78bfa', bg:'#211a33', surface:'#2b2343', card:'#342b52', card2:'#43336a', border:'#5c4c86', blue:'#c4b5fd', gold:'#f9a8d4'},
      {id:'sunset', name:'Sunset', accent:'#f97316', accent2:'#fb923c', bg:'#2b1f1b', surface:'#382722', card:'#47312a', card2:'#5a3f35', border:'#7a5b4a', blue:'#fdba74', gold:'#fde68a'}
    ];
    var textThemes = [
      {id:'frost',  name:'Frost',  text:'#f0f6ff', text2:'#9fb8d0', text3:'#6b8fa8'},
      {id:'ivory',  name:'Ivory',  text:'#fff7ed', text2:'#e7d8c9', text3:'#c4a998'},
      {id:'mint',   name:'Mint',   text:'#ecfdf5', text2:'#b7e4d2', text3:'#82b8a5'},
      {id:'silver', name:'Silver', text:'#f3f4f6', text2:'#d1d5db', text3:'#9ca3af'},
      {id:'rose',   name:'Rose',   text:'#fff1f2', text2:'#fecdd3', text3:'#f9a8b8'}
    ];
    var backgroundThemes = [
      {id:'midnight', name:'Midnight', bg:'#1d2b3a'},
      {id:'ink',      name:'Ink',      bg:'#111827'},
      {id:'slate',    name:'Slate',    bg:'#243447'},
      {id:'pine',     name:'Pine',     bg:'#15241e'},
      {id:'sand',     name:'Sand',     bg:'#2f261f'}
    ];

    function byId(list, id) {
      for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
      return list[0];
    }
    function applyTheme(theme) {
      var root = document.documentElement;
      ['bg','surface','card','card2','border','accent','accent2','blue','gold'].forEach(function(key){
        root.style.setProperty('--' + key, theme[key]);
      });
      try { localStorage.setItem(THEME_KEY, theme.id); } catch(e){}
      document.querySelectorAll('[data-theme-id]').forEach(function(el){
        el.classList.toggle('active', el.getAttribute('data-theme-id') === theme.id);
      });
      updateCurrent();
    }
    function applyTextTheme(theme) {
      var root = document.documentElement;
      ['text','text2','text3'].forEach(function(key){
        root.style.setProperty('--' + key, theme[key]);
      });
      try { localStorage.setItem(TEXT_KEY, theme.id); } catch(e){}
      document.querySelectorAll('[data-text-id]').forEach(function(el){
        el.classList.toggle('active', el.getAttribute('data-text-id') === theme.id);
      });
      updateCurrent();
    }
    function applyBackgroundTheme(theme) {
      var root = document.documentElement;
      root.style.setProperty('--bg', theme.bg);
      try { localStorage.setItem(BG_KEY, theme.id); } catch(e){}
      document.querySelectorAll('[data-bg-id]').forEach(function(el){
        el.classList.toggle('active', el.getAttribute('data-bg-id') === theme.id);
      });
      updateCurrent();
    }
    function currentTheme() {
      var saved = '';
      try { saved = localStorage.getItem(THEME_KEY) || ''; } catch(e){}
      return byId(themes, saved || 'ember');
    }
    function currentTextTheme() {
      var saved = '';
      try { saved = localStorage.getItem(TEXT_KEY) || ''; } catch(e){}
      return byId(textThemes, saved || 'frost');
    }
    function currentBackgroundTheme() {
      var saved = '';
      try { saved = localStorage.getItem(BG_KEY) || ''; } catch(e){}
      return byId(backgroundThemes, saved || 'midnight');
    }
    function updateCurrent() {
      var meta = document.getElementById('rwd-theme-current');
      if (!meta) return;
      var b = currentBackgroundTheme();
      var t = currentTheme();
      var x = currentTextTheme();
      meta.innerHTML = '背景 ' + b.bg + ' ・ 主題 ' + t.accent + ' ・ 文字 ' + x.text;
    }
    function swatchHTML(theme, type) {
      var attr = type === 'theme' ? 'data-theme-id' : (type === 'text' ? 'data-text-id' : 'data-bg-id');
      var color = type === 'theme' ? theme.accent : (type === 'text' ? theme.text : theme.bg);
      var hex = type === 'theme' ? theme.accent : (type === 'text' ? theme.text : theme.bg);
      return '<button class="rwd-theme-swatch" ' + attr + '="' + theme.id + '" type="button">' +
             '<span class="rwd-theme-chip" style="background:' + color + '"></span>' +
             '<span class="rwd-theme-name">' + theme.name + '</span>' +
             '<span class="rwd-theme-hex">' + hex + '</span>' +
             '</button>';
    }

    var panel = document.createElement('section');
    panel.className = 'rwd-theme-lab';
    panel.id = 'rwd-theme-lab';
    panel.innerHTML = [
      '<div class="rwd-theme-lab-head">',
      '  <div>',
      '    <div class="rwd-theme-lab-title">測試版配色切換</div>',
      '    <div class="rwd-theme-lab-sub">點擊下方色票即可立即切換整站背景色、主題色與文字色。每個色票下方都有 hex 色號，選到的色票會高亮。</div>',
      '  </div>',
      '  <div class="rwd-theme-lab-current" id="rwd-theme-current"></div>',
      '</div>',
      '<div class="rwd-theme-lab-grid">',
      '  <div class="rwd-theme-lab-sec">',
      '    <h3>背景色</h3>',
      '    <div class="rwd-theme-swatches">' + backgroundThemes.map(function(t){ return swatchHTML(t, "bg"); }).join('') + '</div>',
      '  </div>',
      '  <div class="rwd-theme-lab-sec">',
      '    <h3>主題色</h3>',
      '    <div class="rwd-theme-swatches">' + themes.map(function(t){ return swatchHTML(t, "theme"); }).join('') + '</div>',
      '  </div>',
      '  <div class="rwd-theme-lab-sec">',
      '    <h3>文字色</h3>',
      '    <div class="rwd-theme-swatches">' + textThemes.map(function(t){ return swatchHTML(t, "text"); }).join('') + '</div>',
      '  </div>',
      '</div>'
    ].join('');

    if (banner) {
      banner.parentNode.insertBefore(panel, wrap);
    } else {
      wrap.parentNode.insertBefore(panel, wrap);
    }

    panel.querySelectorAll('[data-theme-id]').forEach(function(btn){
      btn.addEventListener('click', function(){
        applyTheme(byId(themes, btn.getAttribute('data-theme-id')));
      });
    });
    panel.querySelectorAll('[data-bg-id]').forEach(function(btn){
      btn.addEventListener('click', function(){
        applyBackgroundTheme(byId(backgroundThemes, btn.getAttribute('data-bg-id')));
      });
    });
    panel.querySelectorAll('[data-text-id]').forEach(function(btn){
      btn.addEventListener('click', function(){
        applyTextTheme(byId(textThemes, btn.getAttribute('data-text-id')));
      });
    });

    applyBackgroundTheme(currentBackgroundTheme());
    applyTheme(currentTheme());
    applyTextTheme(currentTextTheme());
  })();

  // Stock search strip (replaces watchlist)
  var strip = document.createElement('div');
  strip.className = 'sw-strip';
  strip.id = 'sw-strip';
  strip.innerHTML = [
    '<div class="sw-strip-row" style="gap:10px;align-items:center">',
    '  <span class="sw-strip-lbl" style="white-space:nowrap">🔍 個股搜尋</span>',
    '  <div class="sw-ac-wrap" style="flex:1;max-width:380px">',
    '    <input id="sw-inp" class="sw-inp" type="text"',
    '           placeholder="2330 / 台積電 / 輸入代號或名稱跳轉至個股詳情…" autocomplete="off">',
    '    <div id="sw-drop" class="sw-drop"></div>',
    '  </div>',
    '  <span id="sw-hint" style="font-size:11px;color:#6b8fa8;white-space:nowrap"></span>',
    '</div>',
  ].join('');
  wrap.parentNode.insertBefore(strip, wrap.nextSibling);

  window._rwdShowTab = showTab;
  window._rwdScrollWithOffset = scrollWithOffset;
  window._rwdHdrs = hdrs;
  window._rwdNav = nav;
})();

/* ============================================================
   2. STOCK SEARCH — jump to 個股詳情 by name/code + URL hash routing
   ============================================================ */
(function(){
  var stocks = (typeof window.STOCK_LIST !== 'undefined') ? window.STOCK_LIST : [];
  var hiIdx = -1;

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }

  function filterStocks(q) {
    if (!q) return [];
    var kw = q.toLowerCase().replace(/\s+/g, '');
    if (!kw) return [];
    return stocks.filter(function(s) {
      var c = s.code.toLowerCase();
      var n = s.short_name.toLowerCase().replace(/\s+/g, '');
      return c.indexOf(kw) === 0 || n.indexOf(kw) !== -1 || (c + n).indexOf(kw) !== -1;
    }).slice(0, 8);
  }

  function renderDrop(matches) {
    var drop = document.getElementById('sw-drop');
    if (!drop) return;
    if (!matches.length) { drop.style.display = 'none'; return; }
    drop.innerHTML = matches.map(function(s) {
      return '<div class="sw-opt" data-code="' + esc(s.code) + '">' +
             '<span class="sw-opt-code">' + esc(s.code) + '</span>' +
             '<span class="sw-opt-name">' + esc(s.short_name) + '</span></div>';
    }).join('');
    drop.style.display = 'block';
    hiIdx = -1;
    drop.querySelectorAll('.sw-opt').forEach(function(opt) {
      opt.addEventListener('mousedown', function(e) {
        e.preventDefault();
        jumpToStock(opt.getAttribute('data-code'));
      });
    });
  }

  function jumpToStock(code) {
    var hdrs = window._rwdHdrs;
    var nav  = window._rwdNav;
    var scrollWithOffset = window._rwdScrollWithOffset;
    // 1. Switch to 個股詳情 tab
    if (hdrs && nav && window._rwdShowTab) {
      var detailIdx = -1;
      hdrs.forEach(function(h, i){ if (h.id === 'sec-detail') detailIdx = i; });
      if (detailIdx >= 0) {
        window._rwdShowTab(detailIdx);
        nav.querySelectorAll('.rwd-tab-btn').forEach(function(b, i){
          b.classList.toggle('active', i === detailIdx);
        });
      }
    }
    // 2. Open the <details> group containing this stock and scroll
    var anchor = document.getElementById('stock-' + code);
    if (anchor) {
      var det = anchor.closest('details');
      if (det) det.open = true;
      setTimeout(function(){
        if (scrollWithOffset) scrollWithOffset(anchor);
        else anchor.scrollIntoView({behavior: 'smooth', block: 'start'});
      }, 160);
    }
    // 3. Update URL hash for shareable links
    try { history.replaceState(null, '', '#' + code); } catch(e){}
    // 4. Feedback
    var hint = document.getElementById('sw-hint');
    if (hint) { hint.textContent = '已跳轉 ↑'; setTimeout(function(){ hint.textContent = ''; }, 1800); }
    
  }

  window._jumpToStock = jumpToStock;

  function jumpToSection(sectionId) {
    var hdrs = window._rwdHdrs || [];
    var nav  = window._rwdNav;
    var scrollWithOffset = window._rwdScrollWithOffset;
    var idx = -1;
    hdrs.forEach(function(h, i){ if (h.id === sectionId) idx = i; });
    if (idx < 0) return;
    if (window._rwdShowTab) window._rwdShowTab(idx);
    if (nav) {
      nav.querySelectorAll('.rwd-tab-btn').forEach(function(b, i){
        b.classList.toggle('active', i === idx);
      });
    }
    if (scrollWithOffset) scrollWithOffset(hdrs[idx]);
    try { history.replaceState(null, '', '#' + sectionId); } catch(e){}
  }

  setTimeout(function() {
    var inp  = document.getElementById('sw-inp');
    var drop = document.getElementById('sw-drop');
    if (!inp || !drop) return;

    inp.addEventListener('input', function() {
      renderDrop(filterStocks(inp.value.trim()));
      // Scroll to first visible card after search
      var first = document.querySelector('[data-detail-id]:not([style*="display:none"])');
      if (first && inp.value.trim()) {
        setTimeout(function(){ first.scrollIntoView({behavior:'smooth', block:'nearest'}); }, 100);
      }
    });

    inp.addEventListener('keydown', function(e) {
      var opts = drop.querySelectorAll('.sw-opt');
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        hiIdx = Math.min(hiIdx + 1, opts.length - 1);
        opts.forEach(function(o, i){ o.classList.toggle('sw-opt-hi', i === hiIdx); });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        hiIdx = Math.max(hiIdx - 1, -1);
        opts.forEach(function(o, i){ o.classList.toggle('sw-opt-hi', i === hiIdx); });
      } else if (e.key === 'Enter') {
        if (hiIdx >= 0 && opts[hiIdx]) {
          jumpToStock(opts[hiIdx].getAttribute('data-code'));
        } else {
          var m = filterStocks(inp.value.trim());
          if (m.length > 0) jumpToStock(m[0].code);
        }
        inp.value = '';
        drop.style.display = 'none';
      } else if (e.key === 'Escape') {
        drop.style.display = 'none';
      }
    });

    inp.addEventListener('blur', function() {
      setTimeout(function(){ drop.style.display = 'none'; }, 150);
    });

    // "/" key focuses search (when not already in an input)
    document.addEventListener('keydown', function(e) {
      if (e.key === '/' && !['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)) {
        e.preventDefault();
        inp.focus();
        inp.select();
      }
    });

    // URL hash routing on page load — #2330 or #stock-2330
    var hash = window.location.hash.replace(/^#(stock-)?/, '');
    if (hash && /^\d{4}[A-Z0-9]*L?$/.test(hash)) {
      setTimeout(function(){ jumpToStock(hash); }, 600);
    }
  }, 100);

  document.addEventListener('click', function(e) {
    var stockLink = e.target && e.target.closest && e.target.closest('a[href^="#stock-"]');
    if (stockLink) {
      e.preventDefault();
      var code = (stockLink.getAttribute('href') || '').replace(/^#stock-/, '');
      if (code) jumpToStock(code);
      return;
    }
    var secLink = e.target && e.target.closest && e.target.closest('a[href^="#sec-"]');
    if (secLink) {
      e.preventDefault();
      var sectionId = (secLink.getAttribute('href') || '').replace(/^#/, '');
      if (sectionId) jumpToSection(sectionId);
    }
  });

  document.addEventListener('click', function(e) {
    var drop = document.getElementById('sw-drop');
    var inp  = document.getElementById('sw-inp');
    if (drop && inp && e.target !== inp && !drop.contains(e.target)) {
      drop.style.display = 'none';
    }
  });
})();

/* ============================================================
   3. FOOTER — like → comments → info grid → risk → bar
   ============================================================ */
(function(){
  var footer = document.createElement('div');
  footer.className = 'rwd-footer';
  footer.innerHTML = [
    '<div class="rwd-like-row">',
    '  <button id="rwd-like-btn">👍 &nbsp;<span id="rwd-like-c">0</span>&nbsp; 人覺得有幫助</button>',
    '  <span class="rwd-like-note">你的支持是持續更新的動力</span>',
    '</div>',

    '<div class="rwd-cmt-hdr">💬 留言 / 討論</div>',
    '<div id="rwd-giscus"></div>',
    '<p class="rwd-giscus-note">留言由 <a href="https://giscus.app" target="_blank" rel="noopener" style="color:#60a5fa">Giscus</a> 提供，需登入 GitHub 帳號。</p>',

    '<div class="rwd-footer-grid">',
    '  <div class="rwd-fc">',
    '    <div class="rwd-fc-t">關於</div>',
    '    <span>Jimmy229 / Jason0308p</span>',
    '    <span>台股情緒研究員</span>',
    '    <span>AI × 多平台輿情分析</span>',
    '  </div>',
    '  <div class="rwd-fc">',
    '    <div class="rwd-fc-t">主題</div>',
    '    <div class="rwd-themes-sm">',
    '      <span class="rwd-theme-sm">AI</span>',
    '      <span class="rwd-theme-sm">半導體</span>',
    '      <span class="rwd-theme-sm">ETF</span>',
    '      <span class="rwd-theme-sm">金融</span>',
    '      <span class="rwd-theme-sm">電動車</span>',
    '      <span class="rwd-theme-sm">記憶體</span>',
    '    </div>',
    '  </div>',
    '  <div class="rwd-fc">',
    '    <div class="rwd-fc-t">聯絡</div>',
    '    <a href="mailto:jason0308p@gmail.com">Email</a>',
    '    <a href="https://github.com/Jason0308p/tw-stock-report" target="_blank" rel="noopener">GitHub</a>',
    '  </div>',
    '</div>',

    '<div class="rwd-risk-bar">',
    '  ⚠️ 本站所有分析結果僅供個人研究參考，<strong>不構成任何投資建議或買賣推薦</strong>。股市投資具有風險，請審慎評估自身風險承受能力並自負損益。',
    '</div>',

    '<div class="rwd-footer-bar">',
    '  <span>© 2026 Jason0308p &nbsp;·&nbsp; 僅供研究，非投資建議</span>',
    '  <a href="https://github.com/Jason0308p/tw-stock-report" target="_blank" rel="noopener">Source</a>',
    '</div>',
  ].join('');

  var content = document.querySelector('.content') || document.body;
  content.appendChild(footer);

  // Giscus
  var giscusEl = document.getElementById('rwd-giscus');
  if (giscusEl) {
    var gs = document.createElement('script');
    gs.src = 'https://giscus.app/client.js';
    gs.setAttribute('data-repo', 'Jason0308p/tw-stock-report');
    gs.setAttribute('data-repo-id', 'R_kgDOSkgKVQ');
    gs.setAttribute('data-category', 'General');
    gs.setAttribute('data-category-id', 'DIC_kwDOSkgKVc4C92_7');
    gs.setAttribute('data-mapping', 'pathname');
    gs.setAttribute('data-strict', '0');
    gs.setAttribute('data-reactions-enabled', '1');
    gs.setAttribute('data-emit-metadata', '0');
    gs.setAttribute('data-input-position', 'top');
    gs.setAttribute('data-theme', 'dark_dimmed');
    gs.setAttribute('data-lang', 'zh-TW');
    gs.setAttribute('crossorigin', 'anonymous');
    gs.async = true;
    giscusEl.appendChild(gs);
  }

  // Like button
  var LK = 'twstock_liked_v1', LC = 'twstock_lc_v1';
  function updateLike() {
    var liked = localStorage.getItem(LK) === '1';
    var cnt = parseInt(localStorage.getItem(LC) || '0', 10);
    var btn = document.getElementById('rwd-like-btn');
    var cEl = document.getElementById('rwd-like-c');
    if (btn) btn.classList.toggle('liked', liked);
    if (cEl) cEl.textContent = cnt;
  }
  updateLike();
  var likeBtn = document.getElementById('rwd-like-btn');
  if (likeBtn) {
    likeBtn.addEventListener('click', function() {
      var liked = localStorage.getItem(LK) === '1';
      var cnt = parseInt(localStorage.getItem(LC) || '0', 10);
      if (liked) {
        localStorage.setItem(LK, '0');
        localStorage.setItem(LC, Math.max(0, cnt - 1));
      } else {
        localStorage.setItem(LK, '1');
        localStorage.setItem(LC, cnt + 1);
        
      }
      updateLike();
    });
  }
})();

/* ============================================================
   ============================================================ */


/* ── 6. CARD CLICK → SCROLL TO DETAIL ── */
(function(){
  document.addEventListener('click', function(e) {
    var card = e.target && e.target.closest && e.target.closest('[data-detail-id]');
    if (!card) return;
    // Don't intercept if clicking on a link or the news tooltip
    if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON') return;
    var detailId = card.getAttribute('data-detail-id');
    var target = document.getElementById(detailId);
    if (!target) return;
    // Open parent <details> if closed
    var details = target.closest('details');
    if (details && !details.open) details.open = true;
    // Scroll to target
    setTimeout(function(){
      target.scrollIntoView({behavior:'smooth', block:'start'});
    }, details && !details.open ? 150 : 0);
    // Flash highlight
    target.style.transition = 'background .3s';
    var orig = target.style.background;
    target.style.background = 'rgba(96,165,250,.15)';
    setTimeout(function(){ target.style.background = orig; }, 800);
  });
})();

/* ============================================================
   5. NEWS TOOLTIP — hover (desktop) + tap (mobile) on .nw cards
   ============================================================ */
(function(){ // disabled
  var tip = document.createElement('div');
  tip.id = 'nws-tip';
  tip.innerHTML = '<div id="nws-tip-hdr">最新消息</div><div id="nws-tip-body"></div>';
  document.body.appendChild(tip);

  var _cur = null;   // currently pinned card (mobile tap)
  var _hov = null;   // currently hovered card (desktop)
  var _tid = null;   // hide delay timer

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }

  function buildTip(card) {
    var raw = card.getAttribute('data-nws') || '[]';
    var items;
    try { items = JSON.parse(raw); } catch(e) { items = []; }
    var body = document.getElementById('nws-tip-body');
    if (!body) return;
    if (!items.length) {
      body.innerHTML = '<span class="nws-empty">暫無最新消息</span>';
    } else {
      body.innerHTML = items.map(function(it){
        return '<a class="nws-item" href="' + esc(it.u) + '" target="_blank" rel="noopener">' +
               '📰 ' + esc(it.t) + '</a>';
      }).join('');
    }
  }

  function positionTip(card) {
    var r = card.getBoundingClientRect();
    var tw = tip.offsetWidth || 320;
    var th = tip.offsetHeight || 200;
    var vw = window.innerWidth;
    var vh = window.innerHeight;

    // Prefer below; if not enough room, show above
    var top = r.bottom + 6;
    if (top + th > vh - 8) top = r.top - th - 6;
    if (top < 8) top = 8;

    // Align left edge to card, but clamp to viewport
    var left = r.left;
    if (left + tw > vw - 8) left = vw - tw - 8;
    if (left < 8) left = 8;

    tip.style.top  = top  + 'px';
    tip.style.left = left + 'px';
  }

  function showTip(card) {
    clearTimeout(_tid);
    buildTip(card);
    tip.style.display = 'block';
    positionTip(card);
  }

  function hideTip() {
    tip.style.display = 'none';
    _cur = null;
    _hov = null;
  }

  var isTouchDevice = (window.matchMedia('(hover:none)').matches);

  // Desktop: mouseenter / mouseleave with small grace delay
  if (!isTouchDevice) {
    document.addEventListener('mouseenter', function(e) {
      var card = e.target && e.target.closest && e.target.closest('.nw');
      if (!card) return;
      _hov = card;
      clearTimeout(_tid);
      showTip(card);
    }, true);

    document.addEventListener('mouseleave', function(e) {
      var card = e.target && e.target.closest && e.target.closest('.nw');
      if (!card) return;
      _tid = setTimeout(function(){
        if (_hov === card) hideTip();
      }, 120);
    }, true);

    // Keep tip visible while hovering it
    tip.addEventListener('mouseenter', function(){ clearTimeout(_tid); });
    tip.addEventListener('mouseleave', function(){ _tid = setTimeout(hideTip, 120); });
  }

  // Mobile: tap to toggle
  document.addEventListener('click', function(e) {
    var card = e.target && e.target.closest && e.target.closest('.nw');
    // Tap on a news link inside the tip — let it navigate
    if (!card && tip.contains(e.target)) return;
    // Tap outside → hide
    if (!card) { if (tip.style.display !== 'none') hideTip(); return; }
    // Tap on same card → toggle off
    if (_cur === card) { hideTip(); return; }
    // Tap on a different card (or desktop click) → show
    _cur = card;
    _hov = card;
    showTip(card);
  });

  // Reposition on scroll/resize
  window.addEventListener('scroll', function(){
    if (tip.style.display !== 'none' && (_cur || _hov)) positionTip(_cur || _hov);
  }, {passive:true});
  window.addEventListener('resize', function(){
    if (tip.style.display !== 'none' && (_cur || _hov)) positionTip(_cur || _hov);
  });
})();

}); // DOMContentLoaded

document.querySelectorAll("a[href^='#stock-']").forEach(a=>{a.addEventListener("click",()=>{const el=document.getElementById(a.getAttribute("href").slice(1));if(el){let p=el.parentElement;while(p){if(p.tagName==="DETAILS")p.open=true;p=p.parentElement;}}});});

// 把 Markdown 轉出來的 emoji 換成有 CSS class 的 span


// 把 table 加 wrapper 讓手機可以橫向捲動
document.querySelectorAll('.content table').forEach(t => {
  const w = document.createElement('div');
  w.style.cssText = 'overflow-x:auto;-webkit-overflow-scrolling:touch;margin:12px 0';
  t.parentNode.insertBefore(w, t);
  w.appendChild(t);
});

