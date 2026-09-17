# -*- coding: utf-8 -*-
"""
mask_demo.py
Reads index.html (pristine, NEVER modified) and writes a sanitized public
portfolio version to index-masked.html.

Masking rules implemented (see task spec):
1. Ticker codes / company names: kept real.
2. All "content numbers" (scores, %, sentiment, post counts...): re-randomized
   within their original observed magnitude, non-linearly per field (no fixed
   offset relationship reusable across fields).
3. Stock card count reduced from ~59 to a curated 10-15 representative set.
4. Threads post original text replaced with rotating fabricated placeholder
   sentences; only buzz/score visuals kept real-ish (re-randomized).
5. nws-tip hover tooltip feature removed entirely (HTML/CSS/JS).
6. Supply-chain dashboard (__CHAIN_BROWSER__) trimmed to 2-3 representative
   links/nodes.
7. Two-track masking:
   - secondary sections (#sec-yt, #sec-volume, hot keywords): keep 2-3 real
     examples, CSS-blur the rest + hint text.
   - core sections (#sec-buzz2, #sec-groups, chain data): ~half rows replaced
     with real masked placeholder text/values directly in the underlying
     data, the other half shown normally (re-randomized, not just blurred).
"""

import json
import random
import re
import hashlib
from html.parser import HTMLParser

SRC = r"C:\Users\syf\Desktop\Portfolio_Demo\輿情_demo\index.html"
DST = r"C:\Users\syf\Desktop\Portfolio_Demo\輿情_demo\index-masked.html"

MASK_TXT = "█████"
UNLOCK_TXT = "••• 解鎖完整版 •••"

# ---------------------------------------------------------------------------
# Deterministic-but-nonlinear per-field randomization helpers
# ---------------------------------------------------------------------------

def _seeded_rng(*parts):
    """Return a random.Random seeded from a stable hash of the given parts,
    so re-running the script is reproducible but different fields for the
    same stock get unrelated (non-linear) values."""
    h = hashlib.sha256(("|".join(str(p) for p in parts)).encode("utf-8")).hexdigest()
    return random.Random(int(h[:16], 16))


def rand_in_range(key_parts, lo, hi, ndigits=1):
    rng = _seeded_rng(*key_parts)
    val = rng.uniform(lo, hi)
    return round(val, ndigits)


def rand_int_in_range(key_parts, lo, hi):
    rng = _seeded_rng(*key_parts)
    return rng.randint(lo, hi)


# ---------------------------------------------------------------------------
# Placeholder Threads sentences (fabricated, NOT real post text)
# ---------------------------------------------------------------------------
PLACEHOLDER_POSTS = [
    "（示範資料）這檔近期討論熱度上升，市場情緒偏多，觀察後續量能是否延續。",
    "（示範資料）法人籌碼出現變化，社群討論量同步放大，留意消息面發展。",
    "（示範資料）網路社群對此檔看法分歧，多空論戰交織，短線波動可能加劇。",
    "（示範資料）近期新聞曝光度提升，帶動散戶討論度，情緒分數呈現區間震盪。",
    "（示範資料）技術面出現轉折訊號，社群貼文開始聚焦此檔後市表現。",
]

def placeholder_post(seed):
    rng = _seeded_rng("thr-post", seed)
    return rng.choice(PLACEHOLDER_POSTS)


# ---------------------------------------------------------------------------
# 1. Load pristine source (read-only)
# ---------------------------------------------------------------------------
with open(SRC, "r", encoding="utf-8") as f:
    html = f.read()

original_len = len(html)

# ===========================================================================
# STEP A: Handle window.STOCK_LIST — reduce & keep code/name real
# ===========================================================================
STOCK_LIST_RE = re.compile(r"window\.STOCK_LIST\s*=\s*(\[.*?\]);", re.S)
m = STOCK_LIST_RE.search(html)
assert m, "STOCK_LIST not found"
stock_list_full = json.loads(m.group(1))

# Curated representative selection: keep large caps + spread across sectors.
KEEP_CODES = [
    "2330",  # 台積電 - large cap
    "2317",  # 鴻海 - large cap
    "2454",  # 聯發科 - large cap
    "0050",  # 大盤ETF
    "2408",  # 記憶體
    "8069",  # 電子紙
    "3037",  # PCB/載板
    "2382",  # 系統組裝
    "2382"[:0] or "3008",  # 光學(大立光)
    "2327",  # 被動元件(國巨)
    "2303",  # 晶圓代工(聯電)
    "3711",  # 封測(日月光)
    "2404",  # 營建工程機電(漢唐)
]
# de-dup, cap to 10-15
seen = set()
keep_codes = []
for c in KEEP_CODES:
    if c not in seen:
        seen.add(c)
        keep_codes.append(c)
keep_codes = keep_codes[:14]

kept_stock_list = [s for s in stock_list_full if s["code"] in keep_codes]
# Preserve stable order matching keep_codes priority
code_to_entry = {s["code"]: s for s in kept_stock_list}
kept_stock_list = [code_to_entry[c] for c in keep_codes if c in code_to_entry]

new_stock_list_json = json.dumps(kept_stock_list, ensure_ascii=False)
html = html[:m.start()] + f"window.STOCK_LIST = {new_stock_list_json};" + html[m.end():]

# ===========================================================================
# STEP B: window.SOURCE_DATA — randomize aggregate numeric fields
# ===========================================================================
SRC_DATA_RE = re.compile(r"window\.SOURCE_DATA\s*=\s*(\{.*?\})\s*;", re.S)
m = SRC_DATA_RE.search(html)
assert m, "SOURCE_DATA not found"
sd = json.loads(m.group(1))
if "total_posts" in sd and isinstance(sd["total_posts"], (int, float)):
    orig = sd["total_posts"]
    sd["total_posts"] = rand_int_in_range(["sd", "total_posts"], max(1, int(orig * 0.6)), int(orig * 1.4))

# Trim #src-panel source list: show only a few representative sources per
# category (not the full pipeline) so viewers can't map the complete real
# data-source inventory. Keep category labels (harmless), cap sources.
KEEP_SOURCES_PER_CATEGORY = 2
if isinstance(sd.get("categories"), list):
    orig_source_count = sum(len(c.get("sources", [])) for c in sd["categories"])
    for cat in sd["categories"]:
        srcs = cat.get("sources", [])
        cat["sources"] = srcs[:KEEP_SOURCES_PER_CATEGORY]
    sd["categories"] = [c for c in sd["categories"] if c.get("sources")]
    new_source_count = sum(len(c.get("sources", [])) for c in sd["categories"])
    sd["total_sources"] = new_source_count
else:
    orig_source_count = new_source_count = 0

new_sd_json = json.dumps(sd, ensure_ascii=False)
html = html[:m.start()] + f"window.SOURCE_DATA={new_sd_json};" + html[m.end():]

# ===========================================================================
# STEP C: window.__INDUSTRY_TM — industry treemap; randomize per-stock metrics
#          but keep names/codes; trim children lists to reduce data volume.
# ===========================================================================
IND_TM_RE = re.compile(r"window\.__INDUSTRY_TM\s*=\s*(\[.*?\])\s*;", re.S)
m = IND_TM_RE.search(html)
assert m, "__INDUSTRY_TM not found"
tm = json.loads(m.group(1))

def randomize_tm_node(node, path):
    # value fields observed: value,_val,_inst,_pct,_sent,_close,_yoy,_inr
    code = node.get("_code")
    if code is not None:
        key = ["tm", code]
        if "_pct" in node and isinstance(node["_pct"], (int, float)):
            node["_pct"] = rand_in_range(key + ["pct"], -10, 10, 2)
        if "_sent" in node and isinstance(node["_sent"], (int, float)):
            node["_sent"] = rand_in_range(key + ["sent"], 0, 100, 1)
        if "_inst" in node and isinstance(node["_inst"], (int, float)):
            node["_inst"] = rand_in_range(key + ["inst"], -50, 50, 2)
        if "_yoy" in node and isinstance(node["_yoy"], (int, float)):
            node["_yoy"] = rand_in_range(key + ["yoy"], -20, 100, 1)
        if "_inr" in node and isinstance(node["_inr"], (int, float)):
            node["_inr"] = rand_int_in_range(key + ["inr"], -1000, 1000)
        if "_close" in node and isinstance(node["_close"], (int, float)) and node["_close"]:
            lo, hi = node["_close"] * 0.7, node["_close"] * 1.3
            node["_close"] = rand_in_range(key + ["close"], lo, hi, 1)
        if "value" in node and isinstance(node["value"], (int, float)):
            lo, hi = max(1, node["value"] * 0.5), node["value"] * 1.5
            node["value"] = rand_in_range(key + ["value"], lo, hi, 2)
        if "_val" in node and isinstance(node["_val"], (int, float)):
            node["_val"] = node["value"] if "value" in node else node["_val"]
    for child in node.get("children", []) or []:
        randomize_tm_node(child, path + [node.get("name", "")])

for group in tm:
    randomize_tm_node(group, [])
    # keep only a couple children per group to reduce info volume, still real names
    if isinstance(group.get("children"), list) and len(group["children"]) > 3:
        rng = _seeded_rng("tm-trim", group.get("name"))
        group["children"] = rng.sample(group["children"], 3) if len(group["children"]) > 3 else group["children"]

new_tm_json = json.dumps(tm, ensure_ascii=False)
html = html[:m.start()] + f"window.__INDUSTRY_TM={new_tm_json};" + html[m.end():]

# ===========================================================================
# STEP D: window.__CO__ — big per-company dict (758 entries). Filter down to
#          only kept_codes, randomize numeric fields, drop sparkline SVG (sp)
#          to shrink size and avoid leaking fine-grained real trend shape.
# ===========================================================================
def extract_json_var(html_text, varname):
    idx = html_text.index(f"window.{varname}=")
    start = idx + len(f"window.{varname}=")
    dec = json.JSONDecoder()
    obj, end = dec.raw_decode(html_text, start)
    # NOTE: json.JSONDecoder.raw_decode(s, idx) returns `end` as an ABSOLUTE
    # index into `s`, not relative to `idx`. Do not add `start` again here.
    return obj, idx, end

co, co_start, co_end = extract_json_var(html, "__CO__")

new_co = {}
for code in keep_codes:
    entry = co.get(code)
    if not entry:
        continue
    e = dict(entry)
    key = ["co", code]
    if isinstance(e.get("s"), (int, float)):
        e["s"] = rand_in_range(key + ["s"], 0, 100, 1)
    if isinstance(e.get("y"), (int, float)):
        e["y"] = rand_in_range(key + ["y"], -20, 100, 1)
    if isinstance(e.get("i"), (int, float)):
        e["i"] = rand_int_in_range(key + ["i"], -500, 500)
    if isinstance(e.get("i5"), (int, float)):
        e["i5"] = rand_int_in_range(key + ["i5"], -3000, 3000)
    if isinstance(e.get("ab"), (int, float)):
        e["ab"] = rand_in_range(key + ["ab"], 0.5, 3.0, 2)
    if isinstance(e.get("rs"), (int, float)):
        e["rs"] = rand_in_range(key + ["rs"], -20, 20, 1)
    if isinstance(e.get("per"), (int, float)):
        e["per"] = rand_in_range(key + ["per"], 8, 40, 2)
    if isinstance(e.get("pc"), (int, float)):
        base = e.get("pc") or 100
        e["pc"] = rand_in_range(key + ["pc"], base * 0.7, base * 1.3, 1)
    if isinstance(e.get("pch"), (int, float)):
        e["pch"] = rand_in_range(key + ["pch"], -15, 15, 1)
    e.pop("sp", None)  # drop real sparkline SVG (fine-grained trend leak)
    new_co[code] = e

new_co_json = json.dumps(new_co, ensure_ascii=False)
html = html[:co_start] + f"window.__CO__={new_co_json};" + html[co_end:]

# ===========================================================================
# STEP E: window.__CHAIN_BROWSER__ — supply chain dashboard. Keep 2-3
#          representative industries, and within each keep 2-3 nodes/tiers,
#          trimming comps lists.
# ===========================================================================
cb, cb_start, cb_end = extract_json_var(html, "__CHAIN_BROWSER__")

KEEP_CHAIN_INDUSTRIES = 3
KEEP_NODES_PER_TIER = 2
KEEP_COMPS_PER_NODE = 3

rng_chain = _seeded_rng("chain-select")
chain_subset = cb[:KEEP_CHAIN_INDUSTRIES]
for industry in chain_subset:
    tiers = industry.get("tiers", [])
    for tier in tiers:
        nodes = tier.get("nodes", [])
        tier["nodes"] = nodes[:KEEP_NODES_PER_TIER]
        for node in tier["nodes"]:
            comps = node.get("comps", [])
            node["comps"] = comps[:KEEP_COMPS_PER_NODE]
    industry["tiers"] = tiers[:3]

new_cb_json = json.dumps(chain_subset, ensure_ascii=False)
html = html[:cb_start] + f"window.__CHAIN_BROWSER__={new_cb_json};" + html[cb_end:]

# ===========================================================================
# STEP F: window.FIN_HTML — per-stock financial-panel HTML fragments. Keep
#          only kept codes; randomize the numeric text inside via regex on
#          plain numbers is risky (styled HTML), so instead replace with a
#          simple masked placeholder block per stock (keeps feature present
#          but content generic) EXCEPT for kept codes we lightly rewrite
#          obvious percentage/price numbers with random ones of similar
#          magnitude using a targeted regex on <b>NUMBER</b> patterns.
# ===========================================================================
fh, fh_start, fh_end = extract_json_var(html, "FIN_HTML")

NUM_RE = re.compile(r"(<b[^>]*>)([\-+]?\d[\d,]*\.?\d*)(%?)(</b>)")

def randomize_fin_html(code, frag):
    def repl(mo):
        pre, num_s, pct, post = mo.groups()
        try:
            base = float(num_s.replace(",", ""))
        except ValueError:
            return mo.group(0)
        rng = _seeded_rng("finhtml", code, num_s, mo.start())
        if pct == "%":
            newval = rng.uniform(-15, 15)
            newstr = f"{newval:+.1f}"
        else:
            lo, hi = (base * 0.7, base * 1.3) if base >= 0 else (base * 1.3, base * 0.7)
            newval = rng.uniform(min(lo, hi), max(lo, hi))
            if abs(base) >= 100:
                newstr = f"{newval:,.0f}"
            else:
                newstr = f"{newval:.1f}"
        return f"{pre}{newstr}{pct}{post}"
    return NUM_RE.sub(repl, frag)

new_fh = {}
for code in keep_codes:
    if code in fh:
        new_fh[code] = randomize_fin_html(code, fh[code])

new_fh_json = json.dumps(new_fh, ensure_ascii=False)
html = html[:fh_start] + f"window.FIN_HTML={new_fh_json};" + html[fh_end:]

# ===========================================================================
# STEP G: Remove nws-tip feature entirely (HTML markup is script-generated,
#          so removing the JS IIFE removes the HTML too). Remove CSS rules
#          and the IIFE block that builds/binds #nws-tip / #nws-backdrop.
# ===========================================================================
# CSS rules: #nws-tip{...} #nws-tip-hdr{...} #nws-tip-hdr::before{...}
css_block_re = re.compile(
    r"#nws-tip\{.*?\}\s*#nws-tip-hdr\{.*?\}\s*#nws-tip-hdr::before\{.*?\}\s*",
    re.S,
)
html, n_css = css_block_re.subn("", html)

# .nws-item / .nws-empty CSS (only used by the tooltip body) — remove too.
nws_item_css_re = re.compile(
    r"\.nws-item\{.*?\}\s*\.nws-item:hover,\.nws-item:active\{.*?\}\s*\.nws-item::before\{.*?\}\s*\.nws-empty\{.*?\}\s*",
    re.S,
)
html, n_css2 = nws_item_css_re.subn("", html)

# JS IIFE building #nws-tip (starts "(function(){\n  var tip = document.createElement('div');\n  tip.id = 'nws-tip';")
iife_re = re.compile(
    r"\(function\(\)\{\s*var tip = document\.createElement\('div'\);.*?\}\)\(\);\s*",
    re.S,
)
html, n_iife = iife_re.subn("", html)

# The stock cards still carry data-nws="..." attribute and class="nw" with a
# click-to-open interaction that now has no handler (since IIFE removed).
# Strip the data-nws attribute (it holds real news headline/urls we don't
# want exposed via devtools even if unused) and drop the now-dead 'nw' class
# + cursor:pointer look (keep visual harmless).
html = re.sub(r'\s+data-nws="[^"]*"', "", html)
html = re.sub(r'class="nw"', 'class="nw-demo"', html)

assert n_iife >= 1, "nws-tip IIFE not found/removed"

# ===========================================================================
# STEP H: Reduce stock cards (id="stock-XXXX") to kept_codes only.
#          Cards live inside <details> sector groups as sibling
#          <div class="nw-demo" ... id="stock-CODE" ...>...</div> blocks
#          (each a single-line self-contained div, verified during
#          investigation). We remove any such block whose id isn't kept.
# ===========================================================================
# Match a full card div: starts with `<div class="nw-demo"` (post STEP G rename)
# and ends at the matching top-level </div> before the next `<div class="nw-demo"`
# or before `</div>\n</div></details>`. Cards are single-line; use non-greedy
# match up to next card-start or block-close marker on the SAME structural level.
card_re = re.compile(
    r'<div(?: class="nw-demo")?[^>]*\bid="stock-([^"]+)"[^>]*>.*?</div></div>'
    r'(?=\n<div(?: class="nw-demo")?[^>]*\bid="stock-|\n</div>\n</div></details>)',
    re.S,
)

def card_filter(mo):
    code = mo.group(1)
    return mo.group(0) if code in keep_codes else ""

html, n_cards_seen = card_re.subn(card_filter, html)

# Now clean up empty sector groups (details blocks with 0 kept cards) and fix
# the "N 檔" counter text per remaining group.
details_re = re.compile(
    r'<details style="margin:8px 0;border:1px solid var\(--border\);border-radius:8px;overflow:hidden">.*?</details>',
    re.S,
)

def fix_details(mo):
    block = mo.group(0)
    remaining = len(re.findall(r'id="stock-', block))
    if remaining == 0:
        return ""
    block = re.sub(r'(<span style="font-size:12px;color:var\(--text3\);font-weight:400">)\d+( 檔</span>)',
                    lambda m2: f"{m2.group(1)}{remaining}{m2.group(2)}", block, count=1)
    return block

html = details_re.sub(fix_details, html)

# ===========================================================================
# STEP I: Threads section — remove real post text, keep buzz/score visuals
#          (re-randomized), rotate placeholder sentences, strip real links.
# ===========================================================================
thr_card_re = re.compile(
    r'<div class="thr-card" data-tilt="([^"]*)" data-code="([^"]*)">'
    r'(<div class="thr-card-hd">.*?</div>)'
    r'<div class="thr-card-bd">(.*?)</div>'
    r'<a class="thr-card-lk" href="[^"]*"[^>]*>看原文 ↗</a></div>',
    re.S,
)

MAX_REAL_POSTS_PER_STOCK = 2

def thr_repl_real(html_text):
    """Keep REAL post text (per user's follow-up request), but only for
    kept stock codes and capped to MAX_REAL_POSTS_PER_STOCK per code —
    prefer longer/more complete posts as "representative". Real URLs are
    still stripped (link replaced with a disabled label). Cards for
    non-kept stock codes, or beyond the per-stock cap, are dropped
    entirely (not replaced with placeholders)."""
    per_code_kept = {}
    out_parts = []
    last_end = 0
    n_kept = 0
    n_seen = 0
    # First pass: collect all matches with their body length, to prefer
    # more complete/representative posts per stock.
    matches = list(thr_card_re.finditer(html_text))
    candidates = {}
    for mo in matches:
        tilt, code, hd, body_text = mo.groups()
        if code not in keep_codes:
            continue
        plain_len = len(re.sub(r"<[^>]+>", "", body_text).strip())
        candidates.setdefault(code, []).append((plain_len, mo))

    keep_match_ids = set()
    for code, lst in candidates.items():
        lst.sort(key=lambda t: t[0], reverse=True)  # longest/most complete first
        for plain_len, mo in lst[:MAX_REAL_POSTS_PER_STOCK]:
            if plain_len >= 4:  # skip near-empty/username-only posts when possible
                keep_match_ids.add(id(mo))
        if not any(id(mo) in keep_match_ids for _, mo in lst[:MAX_REAL_POSTS_PER_STOCK]):
            # fallback: nothing met the length bar, just take the longest ones
            for plain_len, mo in lst[:MAX_REAL_POSTS_PER_STOCK]:
                keep_match_ids.add(id(mo))

    for mo in matches:
        n_seen += 1
        tilt, code, hd, body_text = mo.groups()
        out_parts.append(html_text[last_end:mo.start()])
        last_end = mo.end()
        if id(mo) in keep_match_ids:
            n_kept += 1
            out_parts.append(
                f'<div class="thr-card" data-tilt="{tilt}" data-code="{code}">'
                f'{hd}<div class="thr-card-bd">{body_text}</div>'
                f'<span class="thr-card-lk" style="opacity:.55;cursor:default">原文連結（完整版可看）↗</span></div>'
            )
        # else: drop the card entirely (no placeholder)
    out_parts.append(html_text[last_end:])
    return "".join(out_parts), n_kept, n_seen

html, n_thr, n_thr_seen = thr_repl_real(html)

# ===========================================================================
# STEP J: Two-track visual masking for SECONDARY sections
#         (#sec-yt, #sec-volume, hot-keywords "surge-board-grid"):
#         keep first 2-3 real entries, CSS-blur the rest + hint text.
# ===========================================================================

def blur_rest(html_text, container_open_pattern, item_pattern, keep_n, hint_label, end_marker=None):
    """Find first match of container_open_pattern; within following content,
    find item_pattern occurrences (bounded by end_marker if given, else the
    remainder of the document); wrap items after keep_n with a blur span."""
    m_c = re.search(container_open_pattern, html_text)
    if not m_c:
        return html_text, 0
    start = m_c.end()
    scan_end = len(html_text)
    if isinstance(end_marker, int):
        scan_end = end_marker
    elif end_marker is not None:
        em = html_text.find(end_marker, start)
        if em != -1:
            scan_end = em
    items = [it for it in item_pattern.finditer(html_text, start) if it.end() <= scan_end]
    if len(items) <= keep_n:
        return html_text, 0
    # Build replacement from the (keep_n)-th item onward, wrap each remaining
    # item individually in a blurred wrapper span (keeps structure, just
    # visually blurs -- data stays in DOM per spec, that's intentional here).
    pieces = []
    last_end = start
    count = 0
    for it in items:
        count += 1
        if count <= keep_n:
            continue
        pieces.append((it.start(), it.end()))
    if not pieces:
        return html_text, 0
    out = html_text[:pieces[0][0]]
    out += '<div class="demo-blur-wrap" style="position:relative">'
    # concatenate remaining originals
    seg = html_text[pieces[0][0]:pieces[-1][1]]
    out += f'<div style="filter:blur(5px);pointer-events:none;user-select:none">{seg}</div>'
    out += (
        '<div style="position:absolute;inset:0;display:flex;align-items:center;'
        'justify-content:center;font-size:13px;font-weight:700;color:var(--text);'
        'background:rgba(15,24,40,.35);border-radius:8px">'
        f'🔒 完整版顯示更多（{hint_label}）</div></div>'
    )
    out += html_text[pieces[-1][1]:]
    return out, len(pieces)

# #sec-volume table rows
vol_row_re = re.compile(r"<tr>(?:(?!</tr>).)*?</tr>", re.S)
html, n_vol_blurred = blur_rest(
    html,
    re.compile(r'id="sec-volume"[^>]*>.*?<tbody>', re.S),
    vol_row_re,
    3,
    "成交量排行 20 檔",
    end_marker="</tbody>",
)

# hot keywords surge-board-grid items (each is a top-level <div style="...border-left:3px...">)
surge_item_re = re.compile(r'<div style="background:var\(--card\);border:1px solid var\(--border\);border-left:3px solid[^>]*>.*?</div></div>', re.S)
html, n_surge_blurred = blur_rest(
    html,
    re.compile(r'<div class="surge-board-grid">', re.S),
    surge_item_re,
    3,
    "熱議關鍵字完整榜單",
    end_marker="<h2",
)

# #sec-yt ytd-card entries within ytd-day details blocks
ytd_card_re = re.compile(r'<div class="ytd-card"[^>]*>.*?</div>(?=<div class="ytd-card"|</details>)', re.S)
sec_yt_start_idx = html.find('id="sec-yt"')
sec_yt_next_h2 = html.find("<h2", sec_yt_start_idx + 1) if sec_yt_start_idx != -1 else len(html)
html, n_yt_blurred = blur_rest(
    html,
    re.compile(r'id="sec-yt"', re.S),
    ytd_card_re,
    3,
    "頻道精華完整版",
    end_marker=sec_yt_next_h2,
)

# ===========================================================================
# STEP K: TRUE masking for CORE sections (#sec-buzz2 table rows,
#         #sec-groups sector cards): ~half rows show real (re-randomized)
#         values, other half get actual masked placeholder text/values
#         written into the data/markup (not CSS blur).
# ===========================================================================

# --- sec-groups sector score cards ---
group_card_re = re.compile(
    r'(<div style="background:var\(--card\);border:1px solid var\(--border\);border-radius:10px;'
    r'padding:12px 14px;border-top:3px solid )([^"]+)("><div[^>]*>.*?</div></div>)',
    re.S,
)

def groups_repl_factory():
    counter = {"i": 0}
    def repl(mo):
        counter["i"] += 1
        idx = counter["i"]
        pre, color, rest = mo.groups()
        if idx % 2 == 1:
            # real (re-randomized) track
            def num_repl(nm):
                rng = _seeded_rng("grp-score", idx)
                return f">{rng.uniform(20,70):.1f}<"
            rest2 = re.sub(r'>(\d+\.\d+)<(?=/div>)', num_repl, rest, count=1)
            return pre + color + '"' + rest2[1:]
        else:
            masked_rest = re.sub(r'>(\d+\.\d+)<(?=/div>)', f'>{MASK_TXT}<', rest, count=1)
            masked_rest = re.sub(r'>(→|↑|↓)[+\-]?\d+<', f'>{MASK_TXT}<', masked_rest, count=1)
            masked_rest = re.sub(r'·\d+篇', f'·{UNLOCK_TXT}', masked_rest, count=1)
            return pre + color + '"' + masked_rest[1:]
    return repl

html, n_groups = group_card_re.subn(groups_repl_factory(), html)

# --- sec-buzz2 mf-tbl rows: alternate real(randomized)/masked ---
row_re = re.compile(r'<tr data-c="[^"]*"[^>]*>.*?</tr>', re.S)

def mf_row_mask(mo):
    row = mo.group(0)
    idx_m = re.search(r'data-nm="([^"]*)"', row)
    code_m = re.search(r'href="#stock-([^"]*)"', row)
    return row  # placeholder, real work below with enumerate

# Need enumerate to alternate — do manual scan within sec-buzz2 table body.
tbl_start = html.find('id="sec-buzz2"')
tbody_start = html.find("<tbody>", tbl_start)
tbody_end = html.find("</tbody>", tbody_start)
if tbl_start != -1 and tbody_start != -1 and tbody_end != -1:
    body = html[tbody_start:tbody_end]
    rows = row_re.findall(body)
    new_rows = []
    for i, row in enumerate(rows):
        code_m = re.search(r'#stock-([^\'"]+)', row)
        code = code_m.group(1) if code_m else f"row{i}"
        if i % 2 == 0:
            # real, re-randomized numeric fields (both data-* attrs and <td> text)
            def rand_attr(am):
                attr, val = am.groups()
                try:
                    base = float(val)
                except ValueError:
                    return am.group(0)
                rng = _seeded_rng("mf-row", code, attr)
                if attr in ("data-sv",):
                    nv = rng.uniform(0, 100)
                elif attr in ("data-vv",):
                    nv = rng.uniform(0.5, 3.0)
                elif attr in ("data-i5",):
                    nv = rng.uniform(-2000000, 2000000)
                elif attr in ("data-yy",):
                    nv = rng.uniform(-20, 100)
                elif attr in ("data-pp",):
                    nv = rng.uniform(-10, 10)
                elif attr in ("data-bs",):
                    nv = rng.uniform(0, 100)
                else:
                    return am.group(0)
                return f'{attr}="{nv:.2f}"'
            row2 = re.sub(r'(data-sv|data-vv|data-i5|data-yy|data-pp|data-bs)="([^"]*)"', rand_attr, row)
            # sync visible <td> numbers loosely: just re-run the same random
            # generator seeds for the visible cell text using regex on <b>NUM
            def td_num_repl(tm):
                pre, num, post = tm.groups()
                rng = _seeded_rng("mf-row-td", code, tm.start())
                try:
                    base = float(num.replace(",", "").replace("+", ""))
                except ValueError:
                    return tm.group(0)
                nv = base + rng.uniform(-abs(base) * 0.4 - 1, abs(base) * 0.4 + 1)
                if "," in num:
                    numstr = f"{nv:,.0f}"
                elif "." in num:
                    numstr = f"{nv:.1f}"
                else:
                    numstr = f"{nv:.0f}"
                if num.startswith("+") and nv >= 0:
                    numstr = "+" + numstr
                return f"{pre}{numstr}{post}"
            row2 = re.sub(r"(<[bt]d?[^>]*>)([\-+]?[\d,]+\.?\d*)(%?</[bt]d?>)", td_num_repl, row2)
            new_rows.append(row2)
        else:
            # TRUE mask: overwrite data-* numeric attrs AND visible td text
            row2 = re.sub(r'(data-sv|data-vv|data-i5|data-yy|data-pp|data-bs)="[^"]*"', r'\1="0"', row)
            row2 = re.sub(r'(<td[^>]*>\s*<b[^>]*>)[\-+]?[\d,]+\.?\d*(x?%?</b>\s*</td>)', rf'\1{MASK_TXT}\2', row2)
            row2 = re.sub(r'(<td style="font-family:monospace[^"]*">)[\-+]?[\d,]+\.?\d*(%?</td>)', rf'\1{MASK_TXT}\2', row2)
            # mask strategy cell text hint
            row2 = re.sub(r'(<td class="mf-strat-cell"[^>]*>).*?(</td>)', rf'\1<span style="color:var(--text3)">{UNLOCK_TXT}</span>\2', row2, flags=re.S)
            new_rows.append(row2)
    new_body = body
    for old, new in zip(rows, new_rows):
        new_body = new_body.replace(old, new, 1)
    html = html[:tbody_start] + new_body + html[tbody_end:]

# ===========================================================================
# STEP L: Chain-browser JS references __CO__ for tooltip/panel data - already
#          filtered above (STEP D limited to keep_codes), so any remaining
#          chain node comps not in keep_codes simply show no extra CO detail,
#          which is acceptable (chain itself already trimmed in STEP E).
# ===========================================================================

# ===========================================================================
# Write output (index.html untouched; index-masked.html written fresh)
# ===========================================================================
with open(DST, "w", encoding="utf-8") as f:
    f.write(html)

print("STOCK_LIST kept:", len(kept_stock_list), keep_codes)
print("CSS blocks removed (nws-tip main):", n_css, "item/empty css:", n_css2)
print("nws-tip IIFE removed:", n_iife)
print("stock cards seen/filtered:", n_cards_seen)
print("threads cards kept (real text, capped per stock):", n_thr, "/ seen:", n_thr_seen)
print("src-panel sources: orig=", orig_source_count, "-> new=", new_source_count)
print("sec-volume rows blurred:", n_vol_blurred)
print("surge/hot-keyword items blurred:", n_surge_blurred)
print("sec-yt ytd-cards blurred:", n_yt_blurred)
print("sec-groups cards processed:", n_groups)
print("Output size:", len(html), "bytes (approx, chars)")
print("Original size (chars):", original_len)
