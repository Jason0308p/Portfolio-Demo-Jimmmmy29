"""Build an allowlisted static release in a NEW directory (never deletes sources)."""
from pathlib import Path
import argparse
import json
import shutil

ROOT = Path(__file__).resolve().parents[1]
DEMOS = ['line-rag-demo', 'ga-mcp-demo', 'ga-dashboard-demo',
         'job-automation-demo', 'job-research-dashboard-demo',
         'product-seo-demo', '輿情_demo']
CASES = ['01-j1-product-copy', '02-ops-automation', '03-shopify-ops',
         '04-ga4-dashboard', '05-stock-sentiment', '06-line-rag']
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('destination', type=Path)
args = parser.parse_args()
out = args.destination.resolve()
if out.exists() or out == ROOT or ROOT in out.parents:
    raise SystemExit('Destination must be a new directory outside the source repository')
files = [Path(n) for n in ['index.html', 'index-pm.html', 'case-study.html']]
files += [Path('case-studies') / (n + '.md') for n in CASES]
# Explicit demo roots; publish runtime web assets only, not docs/scripts/alternate pages.
for demo in DEMOS:
    for f in (ROOT / demo).rglob('*'):
        if f.is_file() and f.suffix.lower() in {'.html', '.css', '.js', '.json', '.png', '.jpg', '.jpeg', '.svg', '.webp', '.gif', '.woff', '.woff2', '.ico'}:
            if f.name == 'index-masked.html' or f.is_symlink():
                continue
            files.append(f.relative_to(ROOT))
for rel in files:
    if not (ROOT / rel).is_file():
        raise SystemExit(f'Missing required source: {rel}')
out.mkdir(parents=True)
for rel in sorted(set(files)):
    target = out / rel
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(ROOT / rel, target)
# Pages must return a real 404, not serve the homepage for excluded documents.
(out / '404.html').write_text('<!doctype html><html lang="zh-TW"><meta charset="utf-8"><title>404</title><h1>找不到此頁面</h1><a href="/">回作品集</a></html>', encoding='utf-8')
print(json.dumps({'destination': str(out), 'files': len(set(files)) + 1, 'published': [p.as_posix() for p in sorted(set(files))]}, ensure_ascii=False, indent=2))
