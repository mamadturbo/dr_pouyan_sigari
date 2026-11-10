# Build and deployment

No deployment was authorized or performed. The existing `.openai/hosting.json` and its legacy identity are unchanged. A previously unavailable Sites registration is not silently replaced.

## Reproducible local commands

From `dr-sigari-site/modern`, on this workstation:

```powershell
.\scripts\pnpm.ps1 install --frozen-lockfile
.\scripts\pnpm.ps1 test
.\scripts\pnpm.ps1 typecheck
.\scripts\pnpm.ps1 build
.\scripts\pnpm.ps1 test:e2e
.\scripts\pnpm.ps1 audit
.\scripts\pnpm.ps1 preview
```

On a workstation with pnpm on PATH, use `pnpm` in place of `.\scripts\pnpm.ps1`. Node 24.15+ is required by the installed QA tools. Package manager pinned to pnpm 11.25.0. The wrapper uses the installed pnpm or the Codex bundled pnpm; it does not install software or modify PATH.

## Prepare release output

Set the actual HTTPS origin, then build:

```powershell
$env:SITE_URL = 'https://YOUR-OWNER-APPROVED-DOMAIN'
.\scripts\pnpm.ps1 release
```

Replace that value with a real approved origin. Release validates content/domain, builds with `output: 'export'`, adds portable Windows segment aliases and checks all generated pages, anchors/assets and canonical tags. The build produces **`modern/out/`**. Deploy the complete contents only after explicit approval. There is no provider-independent upload command: provider, account, domain and deployment credentials have not been supplied. No deployment CLI or hidden authorization was added.

## Static host requirements

Use directory indexes (`/about/` → `/about/index.html`), retain `/_next/static/**` and **all `.txt` RSC/segment files**, and serve the custom `404.html` with status 404. Do not use a universal SPA rewrite to index.html. Serve MP4 with byte ranges and correct MIME types. Enable Brotli/gzip on HTML/CSS/JS/XML/TXT; cache hashed `/_next/static/` for one year immutable, revalidate HTML and nonhashed navigation `.txt`, and use short media caching or purge on replacement. No Next image server exists; images are pre-encoded WebP and default optimization is disabled.

`public/_headers` is copied into the export for hosts supporting that format, including security, referrer, framing and caching rules. Other CDNs need equivalent configuration in their own dashboard/configuration. CSP permits inline Next bootstrap and GSAP style updates; it does not allow arbitrary external script origins. It is a baseline, not a claim of a nonce-based strict CSP. Add HSTS only once the actual HTTPS domain is stable. No patient data or form submissions are collected.

The optional `scripts/serve.mjs` is a local QA static server with gzip, ranges and cache headers, not a production backend. E2E tests require installed Google Chrome; physical-device or cross-browser verification is a separate release check.

## Recovery and limitations

The legacy `dist/` still runs with the original Python utilities and single-file preview. The migration never changes its hosting manifest. To roll back a future cutover, redeploy the saved legacy artifact through your provider's normal approved flow. Static export has no runtime CMS, authentication, database, ISR, server actions, server endpoints or dynamic unknown article generation; content changes require rebuilding.
