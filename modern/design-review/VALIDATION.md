# Validation — 28 October 2026

Prepared for local review only. Site: http://127.0.0.1:4175/ . Screenshot comparison: http://127.0.0.1:4177/ . No public deployment was performed.

## Executed checks

| Check | Observed result |
| --- | --- |
| `scripts/pnpm.ps1 typecheck` | Passed after final application changes |
| `scripts/pnpm.ps1 build` | Passed; all static routes, assets and anchor checks passed |
| `scripts/pnpm.ps1 test` | 19 Vitest tests and 8 native-video playback tests passed |
| `scripts/pnpm.ps1 test:e2e --workers=2` | 77 passed, 1 intentional mobile skip, 0 failures (78 scheduled) |
| Final CSS correction follow-up: `test:e2e --workers=2 --grep '805 by 646\|WCAG automated'` | 4 passed, 0 failures, after separating the compact research icon from the year |
| `scripts/strict-smoke.mjs` against Next development Strict Mode | One owned Observer; 2 shell wheel handlers mounted, 0 after route unmount, 2 after remount; no page errors or residual lock |
| `scripts/design-capture.mjs before` and `after` | 36 screenshots each; 9 routes × 4 widths; no reported horizontal overflow or uncaught page errors |
| `scripts/design-scenes.mjs` | All 9 homepage scenes captured at 805×646 and 1440×900; all 4 timeline detail states fit at both sizes; menu, expanded FAQ and reduced-motion static profiles captured |
| `scripts/design-zoom.mjs` | Actual Chrome 200% page zoom selected in an isolated profile's Appearance settings; all 9 routes checked: 712 CSS px width, devicePixelRatio 2, visible h1, no horizontal document overflow; homepage uses natural flow |

The full browser run preceded one final CSS-only correction (`justify-content:flex-end` on the compact research illustration). The four targeted follow-up tests and final build were run after that correction. The Playwright HTML report currently contains the targeted follow-up; the full-run result above is the observed prior complete run, not a claim that the current report contains all 78 tests.

## Browser coverage

Required widths: 390, 768, 1440 and 805×646. Additional existing regression coverage includes 360×640, 393×851, 845×646, 952×646, 1024×900, 1280×720, 1366×768 and 1440×600. Tested menu open/close, Escape focus restoration, Tab wrapping, background inert restoration, resize while open, route navigation, browser back, hash navigation, archive search/filter/reset, article contents anchors, FAQ, 404 recovery, natural-scroll exit, reduced motion and preference changes during video playback.

Existing gesture tests verify one panel per burst/contact, absorbed momentum, contacts begun while busy, keyboard repeats, boundaries, native video forward/reverse completion, media failure/watchdog release, resize, route cleanup and one active input owner. New tests cover natural-scroll exit at the reading location, menu background isolation and cleanup, empty archive reset, article parent/back navigation and no-JavaScript static profiles/FAQ/content.

Axe's WCAG 2 A/AA, 2.1 AA and 2.2 AA scans reported no violations on the seven page types covered by the existing accessibility test in both desktop and mobile projects. This is an automated scan, not a complete accessibility certification. 404 and the second article are covered by route/screenshot/zoom checks; the axe loop does not include them.

## Visual issues found and corrected

- Increased type and control sizes initially exceeded the compact homepage height budget. Reduced decorative spacing and placed timeline year and title side by side; retained complete text and usable buttons. Verified fresh load and resize in both directions.
- The original served footer and current source differed. The rebuild exposed light text on the preserved pale footer background. Defined the final deep-green surface and its matching foreground explicitly, then rechecked screenshots and axe.
- The compact research icon and year overlapped after increasing the year size. Moved the icon to the opposite side and repeated compact navigation and accessibility checks.
- The existing development smoke script referenced a removed play button. Updated it to use the current keyboard playback action after the section has settled.

## Evidence and review

- `index.html`: interactive route/width comparison; original screenshots are linked without cropping.
- `before/results.json`, `after/results.json`: route, width, heading, scroll mode and overflow/error observations.
- `scenes/results.json`: timeline visibility and reflow observations.
- `zoom-results.json`: actual 200% page-zoom observations.
- `../strict-mode-validation.json`: latest development lifecycle result.
- `board-{390,768,805,1440}.jpg`: visual overview of the first viewport of every page at each requested width.
- `scenes/`: individual homepage panels, timeline states, mobile menu, expanded FAQ and reduced-motion evidence.

The baseline is the local export actually served before changes, rather than a fresh rebuild of the initially dirty source tree. Parent legacy files and unrelated existing work were preserved. The modern directory was already untracked as a whole, so a normal Git diff does not isolate this task. The task's application edits are:

`src/app/layout.tsx`, `src/app/not-found.tsx`, `src/styles/refinements.css`, `src/components/animations/PageMotion.tsx`, `src/components/layout/PageIntro.tsx`, `src/components/layout/SiteHeader.tsx`, `src/components/scrolling/FullPageScroll.tsx`, `src/components/doctor/EducationTimeline.tsx`, `src/components/publications/PublicationFilters.tsx`. Supporting edits: README, design scripts, development smoke script, new design browser tests and this review folder.

## Boundaries

Chrome on this workstation, with emulated mobile/touch input. No physical touchscreen/trackpad, Safari, Firefox, screen-reader hardware session or production/field performance test was run. No new Lighthouse score, measured frame-rate, INP or CLS improvement is claimed. The existing responsive WebP media and native-video engine were preserved; no image-generation service, extra animation engine, new package, external font request or new medical content was added. No published or remote contact endpoint was changed.

## Reopen later

From `modern`, run `scripts/pnpm.ps1 preview` and open port 4175. For the comparison viewer, run the existing server with `PORT=4177` and `STATIC_DIR=design-review`, or open `design-review/index.html` locally. `scripts/design-review.mjs` regenerates the viewer. Review screenshots and build outputs are local artifacts.
