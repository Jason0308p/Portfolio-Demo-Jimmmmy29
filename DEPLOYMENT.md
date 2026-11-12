# Public deployment boundary

Do not deploy the repository root with `wrangler pages deploy .`.

Build a new directory outside the repository:

```bash
python tools/build-public.py C:/path/to/new-release-directory
npx wrangler pages deploy C:/path/to/new-release-directory --project-name portfolio-demo --branch main --commit-dirty=true
```

The builder refuses existing destinations and does not delete or edit source documents. It publishes the two homepages, case viewer, six numbered case documents and runtime assets in seven explicit official demo directories. It excludes interview/resume aggregate drafts, preview folders, masked alternate pages, the untracked ga-gsc-line-demo prototype, Git metadata, and development documentation. A root 404 page prevents excluded paths from falling back to the homepage.

## Verified release

Deployment `f977751a`: stable homepage internal targets returned 200 (14 unique URLs). All six case sources returned 200 and rendered headings. The LINE case viewer rendered its actual title. Excluded preview/prototype routes and four draft documents returned 404; the resume URL required a cache-busting request because the browser retained an older response.

Original files remain locally and in Git history. This does not remove GitHub access, old deployment URLs, browser caches, or copies already downloaded. Do not claim complete erasure. Older Cloudflare deployments have not been deleted.

## Rollback

Revert the deployment tooling commit to undo the source change. Do not restore the old whole-repository deployment merely to fix a visual issue: it republishes excluded drafts. To revert a visible page, rebuild an allowlisted release using the desired source revision. Deployment and push remain separate approval-gated actions.
