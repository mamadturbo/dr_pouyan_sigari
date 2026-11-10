# Dr. Sigari migration report — 2026-10-19

## A. Executive summary

The migration is implemented in the isolated `modern/` application and validated locally. All required routes are statically exported; the original design, confirmed information and interactive forward/reverse doctor presentation are retained. The working legacy tree and all pre-existing uncommitted changes remain recoverable. No public deployment, Git-history rewrite, commit or change to the legacy hosting registration was performed.

Production release still needs the actual owner-approved HTTPS domain and deployment authorization. The current artifact is deliberately a protected local preview. Missing medical/citation details have not been invented.

## B. Before vs. after tech stack

| Layer | Before | Implemented |
| --- | --- | --- |
| Rendering | Single static HTML shell; content inserted by JS | Next.js 16.4.2 App Router; server-rendered static HTML |
| UI | HTML + vanilla DOM code | React 19.3.1; Server Components with small client islands |
| Language | JavaScript | TypeScript 7.0.2 strict; preserved JS animation internals behind a typed adapter |
| Styling | Custom CSS | Tailwind 4.3.3 tokens + preserved custom design CSS |
| Animation | Local GSAP/ScrollTrigger; Lenis; global controller | Dynamically imported GSAP 3.15.0/ScrollTrigger; scoped controller and native scroll |
| Content | Monolithic content.js | Typed modules, Zod 4.6.7 build validation, local MDX 3.1.1 |
| Fonts | Local Vazirmatn @font-face | Licensed local Vazirmatn through next/font/local |
| Icons | Custom SVG system | Preserved SVG identity; Lucide 1.59.0 navigation icons |
| Tests | Eight Node playback tests + Python checker | Preserved playback tests, Vitest 5, RTL, Playwright 1.64.1, axe and Lighthouse 13.5 |
| Delivery | Legacy dist and offline ZIP | pnpm lockfile; portable static out; legacy still available |
| Backend/data | None | None; no database, login, dashboard or patient-data collection |

Stable package releases and peers were checked against npm registry data before installation. See [dependency verification](dependency-verification.md). shadcn is intentionally omitted: native controls cover the needed accessible interactions without a generic theme or extra runtime.

## C. Architectural changes

Separate routes now cover home, about, expertise, publications, blog, two article pages and contact. Doctor, history, services, FAQs and publications live in typed modules. Long-form text uses developer-maintained MDX with a validated exported metadata contract and explicit article registry. New content is emitted into HTML, including without JavaScript.

Client boundaries isolate menu state, category/search/sort controls and the story. The original player is adapted instead of replaced with a mockup. Its lifecycle belongs to a React effect with cancellation of stale imports and complete owned cleanup. Other pages use natural scrolling. Source references, historical wording and original descriptions are retained; a preservation test compares migrated data to the initial snapshot.

Static export uses pre-encoded images and no runtime image optimizer. A generated-output alias step works around the upstream Windows RSC filename defect; client route transitions are browser-tested on plain static hosting. See [architecture](architecture.md) and [animation system](animation-system.md).

## D. Preserved features

- Forest-green/mint palette, portrait, hero layout, asymmetric framing, local Persian typography and RTL composition.
- One-source native video forward/reverse turn, copy transitions, gesture arrival, keyboard/button/touch paths, frame retention, reset, error/timeout exits and reduced motion.
- All six confirmed service descriptions, four dated academic timeline entries and their source links, three publication records and their source links, three FAQs, license, address, telephone, map and professional profile.
- Existing legacy files, original media, inactive frames, alternate videos, offline preview, package scripts, tests and hosting identity remain intact.

Hero screenshot/geometry checks compare settled legacy and modern layouts at desktop/mobile widths. Short-window screenshots verify the full visual at 360×640, 768×1024 and 1440×600. They are regression evidence, not an assertion of pixel-identical redesign-free output.

## E. New features

The publications archive has newest/oldest sorting, research category filters, bilingual search, source links and an announced empty state. Its model supports full authors/journal/DOI/PubMed/abstract metadata when verified.

The MDX blog has categories, featured flags, dates, accurate editorial authorship, article routes, descriptions, TOC anchors, references, related articles and optional review fields. The two initial articles cover existing clinic logistics and finding research. They do not contain invented treatment recommendations or claim doctor authorship/review.

SEO uses unique Metadata API titles/descriptions, configurable canonical/social URLs, Person/WebSite/Article/BreadcrumbList JSON-LD, sitemap and robots. Accessibility adds contrast corrections, focus states, keyboard/focus handling, native FAQ controls and static motion alternatives, including with JavaScript disabled. Short-window locks reserve space for the full video and keep play controls reachable.

## F. Dependencies and technical debt excluded from the new artifact

Lenis, global content injection, global application bootstrapping, the obsolete 57-frame sequence, inactive videos, vendored JS duplicates and embedded single-file preview bundles are excluded from the new deployable tree. They were not deleted from the legacy project. Active public assets total 480,047 bytes versus 2,578,174 bytes in the legacy asset tree (about 81% fewer asset bytes; the legacy total includes its original font/vendors).

The preserved CSS cascade still has historical overrides, and the validated animation internals remain JavaScript. These are explicit maintainability tradeoffs to protect the working design/state machine. Decorative orbit parallax and initial hero/section fades are intentionally omitted for immediate readable rendering. The core animated presentation remains functional.

## G. Actual validation results

Commands below run inside `modern/` (`pnpm` is `.\scripts\pnpm.ps1` on this workstation):

| Command/check | Result |
| --- | --- |
| Legacy `node --test tests/story-player.test.cjs` | Baseline: 8 passed |
| Legacy bundled-Python `scripts/check.py` | Baseline PASS; 40 unique IDs and references validated |
| `pnpm install --frozen-lockfile` | Passed |
| `pnpm test` | 13 Vitest tests + 8 migrated playback tests passed |
| `pnpm typecheck` | Passed, strict TypeScript |
| `pnpm build` | Passed; all eight content routes, 404, sitemap, robots, local assets/anchors and unique IDs checked |
| `pnpm test:e2e` | 26 passed, 2 intentional skips; 28 scheduled, zero failures |
| `pnpm audit` / `pnpm audit --prod` | No known vulnerabilities reported |
| Development Strict Mode smoke | One owned wheel listener mounted, zero unmounted, one remounted; no residual lock or page errors |
| Configured-domain release fixture | Passed using reserved `https://sigari.example.test`; eight sitemap entries, canonical and robots policy verified; nothing deployed |
| Missing-domain release guard | Passed: release rejected without SITE_URL |

The two skips are the desktop-only wheel test under mobile emulation and touch-only test under desktop. Corresponding real code paths are exercised in their appropriate project. E2E coverage includes all routes, content without JS, header/mobile focus, publication controls, MDX/TOC/references, forward/reverse video, gesture/keyboard/touch emulation, active-playback route cleanup, preference changes during playback, failure fallback, overflow, responsive frame visibility and automated accessibility on seven page types at both primary sizes.

During validation, failures exposed and resolved the Windows export filenames, low contrast labels, reduced-motion hidden-attribute/CSS-layer interaction, baseline screenshot timing, clipped short-desktop framing and an unreachable tablet play control. No test was disabled to conceal these failures.

Browser coverage is installed Google Chrome, desktop 1440×900 and Pixel 7 emulation, with additional 360×640, 768×1024 and 1440×600 viewports. No physical touchscreen, Safari or Firefox validation is claimed. Automated accessibility and focus checks do not establish comprehensive manual WCAG certification.

## H. Measured performance

Final results are recorded in `modern/performance-results.json` and raw `lighthouse-final-mobile.json` / `lighthouse-final-desktop.json`. The measurements use a gzip-enabled local static preview and Lighthouse default mobile/desktop lab presets; they do not measure production CDN performance. `pnpm measure` reproduces them with the preview running.

| Local Lighthouse metric | Mobile | Desktop |
| --- | --- | --- |
| performance | 95 | 100 |
| accessibility | 100 | 100 |
| best-practices | 100 | 100 |
| seo | 66 | 66 |
| LCP | 2.72 s | 0.70 s |
| CLS | 0.0054 | 0.0025 |
| TBT | 80 ms | 0 ms |
| Transferred homepage JavaScript | 144284 bytes | 195090 bytes |
| Total transferred homepage resources | 325496 bytes | 408730 bytes |

INP is not available: no field dataset or sustained interaction measurement was collected. TBT is reported separately and is not a substitute for INP. JavaScript figures distinguish transferred homepage scripts from the 1,073,814 raw bytes across **all** generated JS chunks/routes; the latter includes deferred animation modules and framework code. Total static output at final build is 2,544,964 bytes. No GSAP library is eagerly imported on reading/archive pages.

The initial uncompressed mobile run scored Performance 75 with LCP 6.42s. Compression, reduced eager route requests and later mobile animation initialization improved the measured result; this comparison includes delivery configuration changes, not just application code changes. Preview SEO is intentionally reduced by noindex/robots protection until the real domain is configured. No production SEO score is fabricated.

## I. Remaining issues and limitations

1. A real HTTPS origin, static host/account and explicit deployment authorization are not provided. The final local export intentionally blocks indexing. Release configuration and sitemap/canonical generation were validated with a reserved test origin, then the protected preview was rebuilt.
2. Degree institutions/dates, certifications, current academic rank, office hours, full publication authors/journals/DOIs and article clinical reviewer are not supplied. Missing-data markers remain developer-facing. Existing project citations are preserved; DOAJ blocked automated access and the 2026 publisher timed out, so full independent re-verification was not claimed.
3. Browser/device and field performance limitations are listed above. Medical review would be required before adding clinical recommendations or naming the doctor as an article author/reviewer.
4. The Windows export workaround must remain until an upstream fix is verified. Next's MDX webpack integration emits an upstream cache-dependency warning on some cached builds; fresh production builds and exported-content checks succeeded. Prefer clean CI builds when changing MDX integration/dependencies.
5. Static export requires an HTTP host; the legacy offline HTML remains the direct-file option. Hosting security headers/cache/compression/404 rules must be applied by the chosen provider; local preview is not evidence that an unknown CDN has applied them.

## J. Build, test and deployment instructions

```powershell
Set-Location 'C:\Users\Megabyte-system\Desktop\dr sigari\dr-sigari-site\modern'
.\scripts\pnpm.ps1 install --frozen-lockfile
.\scripts\pnpm.ps1 test
.\scripts\pnpm.ps1 typecheck
.\scripts\pnpm.ps1 build
.\scripts\pnpm.ps1 test:e2e
.\scripts\pnpm.ps1 preview
```

For an approved release, set `$env:SITE_URL` to the real HTTPS origin and run `.\scripts\pnpm.ps1 release`. Upload the complete `out/` tree through the chosen host's approved workflow; retain all navigation `.txt` files, directory indexes and custom 404. Enable compression and appropriate cache/security headers. There is no invented provider-independent deploy command. Detailed instructions are in [deployment.md](deployment.md).

## K. Final repository structure

```text
dr-sigari-site/
├── dist/                         original working site and all original assets
├── scripts/                      original Python utilities
├── tests/                        original Node tests
├── README.md, QA.md               existing user-modified documentation retained
├── .openai/hosting.json           original registration retained
├── docs/
│   ├── architecture-audit.md
│   ├── architecture.md
│   ├── animation-system.md
│   ├── content-management.md
│   ├── dependency-verification.md
│   ├── deployment.md
│   ├── migration-report.md
│   └── seo.md
└── modern/
    ├── README.md, QA.md, AGENTS.md implementation guide, QA / Next agent guidance
    ├── package.json, pnpm-lock.yaml
    ├── next.config.mjs, postcss.config.mjs, tsconfig.json
    ├── mdx-components.tsx, vitest.config.ts, playwright.config.ts
    ├── legacy-content.json       initial source-of-truth content snapshot
    ├── public/                   active media, favicon and host _headers
    ├── src/
    │   ├── app/                  layout, home, about, expertise, publications,
    │   │                         blog/[slug], contact, 404, sitemap, robots, CSS
    │   ├── components/           layout, home, doctor, animations, publications,
    │   │                         blog and shared UI
    │   ├── content/
    │   │   ├── blog/             two MDX articles
    │   │   └── data/             doctor, education, experience, expertise,
    │   │                         publications, faq and missing-data markers
    │   ├── lib/                  content, schemas, SEO, publication functions,
    │   │                         player and typed controller boundary
    │   ├── styles/               preserved CSS and licensed font
    │   └── types/                content and MDX declarations
    ├── scripts/                  validation, portable export aliases, preview,
    │                             release, pnpm wrapper, performance, Strict smoke
    ├── tests/                    unit/components, preserved player, Playwright
    ├── out/                      generated protected preview export (ignored)
    ├── .next/, node_modules/      generated build/dependencies (ignored)
    ├── test-results/, playwright-report/  generated browser evidence (ignored)
    └── *validation.json, *metrics.json, *results.json, lighthouse*.json
                                  measured validation/performance evidence
```
