# Dr. Sigari — static-first architecture

The UI review applied Vercel's [Web Interface Guidelines](https://github.com/vercel-labs/web-interface-guidelines). The research archive accepts Persian, Arabic and Latin numerals and shares its search, topic and sort through the URL. The homepage remembers a visitor's free-scroll choice in the browser; free scroll also shows both doctor profiles without a video-controlled section.

Latest information-architecture update (2026-11-04): the existing site now has 14 public routes. The shared menu is Home → Cases → Services → About → Patient guide → Articles, with a separate clinic-contact button. The homepage keeps eight sections and gives the gallery third position. Services retain `/expertise/`; research retains `/publications/`. Approved cases are empty, so no patient imagery is published. One non-clinical editorial article is public; the consultation article remains a draft. See [initial audit](IA-AUDIT.fa.md), [implementation and QA report](IA-REPORT.fa.md), and [content requirements](IA-CONTENT.fa.md). Previous visual-review reports below are historical evidence.

The 2026-10-28 visual and motion refinement is documented in [design decisions](design-review/DESIGN.md) and [validation](design-review/VALIDATION.md). Open [the local comparison viewer](design-review/index.html) for all nine routes before/after at 390, 768, 805 and 1440px. The homepage supports a natural-scroll fallback, and interior pages share a reading-focused Persian design system. No public release was made.

The Next.js migration lives in this isolated directory. The original working website, uncommitted changes, assets, tests, offline preview and hosting registration remain in the parent project. Nothing has been deployed.

The homepage now uses cinematic section navigation where the content fits: one gesture moves one section, with explicit internal doctor-video steps. The 805×646 embedded preview is supported through compact presentation spacing. Phones, windows whose content cannot fit and reduced motion use natural fallback. Content routes always scroll naturally. See the [current scroll-system report](../docs/scroll-system.md) for installed GSAP skills, architecture and browser validation. The `preview.cmd` launcher supports this workstation even when Node and pnpm are absent from the terminal PATH.

At widths up to 768px, the doctor story is two static profiles stacked vertically: academic/formal clothing, then surgery/surgical clothing. Both contain their own text and link. The mobile path does not mount the video controller, fetch its MP4 or lock scrolling. Resizing from active desktop playback disposes it before showing these profiles; returning to desktop restores the desktop controller. Reduced motion also uses the static profiles.

## Run on this Windows workstation

Node 24.15+ and pnpm 11.25.0 are required. This workstation has Node 24.19.0 and the bundled pnpm launcher. From this directory:

```powershell
.\scripts\pnpm.ps1 install --frozen-lockfile
.\scripts\pnpm.ps1 dev
```

Development uses the URL printed by Next, normally `http://localhost:3000`. For a production export and preview:

```powershell
.\scripts\pnpm.ps1 build
.\scripts\pnpm.ps1 preview
```

Open `http://127.0.0.1:4175`. Static Next exports require HTTP hosting; use the preserved legacy single-file preview if you need double-click/offline-file delivery.

## Validate

```powershell
.\scripts\pnpm.ps1 test
.\scripts\pnpm.ps1 typecheck
.\scripts\pnpm.ps1 test:e2e
.\scripts\pnpm.ps1 audit
```

Playwright uses installed Google Chrome, desktop and Pixel 7 emulation. It starts servers on 4175 (migration) and 4176 (legacy comparison), or reuses existing ones. HTML report: `playwright-report/index.html`; screenshots/traces: `test-results/`. These are ignored outputs. To use Playwright's Chromium on another machine, install its browser and change the `channel` in `playwright.config.ts`.

With the static preview running, `pnpm measure` repeats mobile and desktop Lighthouse measurements and writes `performance-results.json` plus the raw reports. These are local lab results, not production or field Core Web Vitals. No INP is claimed from Lighthouse.

## Prepare an authorized release

```powershell
$env:SITE_URL = 'https://YOUR-OWNER-APPROVED-DOMAIN'
.\scripts\pnpm.ps1 release
```

Replace the uppercase value with the real HTTPS origin. This command **only builds**. Upload the **entire `out/` directory** to static hosting after separately authorizing deployment. No Node server, database, credentials or backend is required in production. No production domain is known yet, so ordinary local builds have `noindex`, `Disallow: /`, no canonical and an empty sitemap. Release fails without `SITE_URL` rather than inventing one. See [deployment](../docs/deployment.md).

## Content and architecture

- [Architecture and decisions](../docs/architecture.md)
- [Repository audit](../docs/architecture-audit.md)
- [Content editing](../docs/content-management.md)
- [Animation lifecycle](../docs/animation-system.md)
- [SEO and indexing](../docs/seo.md)
- [Migration report and measured results](../docs/migration-report.md)

MDX has an explicit `status` field, defaulting to `draft`. Only `published` articles receive public routes, archive cards and sitemap entries. `finding-research` is public; `first-consultation` remains a draft pending review. The 2026-10-28 evidence update adds registered degrees/board, dated event records and complete publisher bibliographies for the three confirmed publications. Medical summaries, treatment-specific care, current service availability, current rank, office hours and media rights still need confirmation. The gallery uses a server-only list in `src/content/data/cases.ts`; only explicitly approved, de-identified cases are passed to public components. Never store unapproved patient media or consent documents in `public/`. See ../research/site-update-report-fa.md and src/content/data/missing.ts.

Use pnpm only and commit `pnpm-lock.yaml`. Versions were checked against the npm registry on 2026-10-19; the lockfile is the reproducible source. There is no CMS, authentication, patient-data form or persistent server. Local MDX is trusted executable code and requires normal code review.
