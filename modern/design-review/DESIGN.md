# Dr Sigari design refinement — 28 October 2026

## Direction and constraints

Preserve the existing deep-green identity, real portraits, Persian copy and documented medical history. The memorable element remains the doctor's portrait and native-video turn. Supporting pages use quiet clinical typography and clear reading structure. No invented credentials, patient stories, clinical claims, contact details, media, or public deployment.

Read before implementation: modern/AGENTS.md, README, parent animation-system.md and scroll-system.md, installed Next 16.4.2 CSS and Server/Client Components guides, existing scroll controller, gesture session, story controller and their tests. The repository already had substantial uncommitted and untracked work; it was preserved.

Applied skills: ui-ux-pro-max, frontend-design, and the already installed official greensock/gsap-skills gsap-plugins and gsap-scrolltrigger. No new dependency or skill was installed. UI search initially returned a playful clay style inappropriate here; a narrower `medical clinic professional --domain product` returned Medical Clinic / Accessible & Ethical + Minimalism. Adopted its accessible, calm direction while retaining this site's green identity. Latin font recommendations were discarded for local Persian Vazirmatn. `micro interaction hover --domain gsap` supports restrained transform feedback and reduced-motion handling.

## Tokens

| Role | Value |
| --- | --- |
| Brand green | #004d3e |
| Deep surface | #003d33 |
| Action | #007657 |
| Reading background | #f8fbfa |
| Quiet surface | #edf4f1 |
| Ink / secondary | #173c34 / #50675e |

Local variable Vazirmatn is used throughout. Interior body text is 16px; long-form desktop text is 18px with 2.25 line height and a 66ch maximum. Mobile long-form text is 16px. Titles balance within a bounded line length. Preserve RTL reading order and explicitly isolated LTR research titles and telephone numbers.

## Composition

Interior opening: breadcrumb, bounded title and description on the reading side; quiet doctor signature/drawing on wide screens. No decorative numbering. Biography pairs a closer portrait crop with readable prose, followed by sourced chronology. Treatment pages use two generous columns on desktop and one on mobile. Publications distinguish bibliographic metadata, Persian summary, English title and source action. Editorial cards have a stronger title and reading action instead of the former shadow-heavy container. Article contents use an inset sticky navigation on desktop and a compact natural-flow block on mobile. Contact information retains the real phone, map, address and professional profile. 404 provides home and contact recovery.

Homepage presentation layout retains its existing section dimensions and fit checks. Mobile treatment cards now have room for readable descriptions; research cards expose the English title at a usable size. Mobile and reduced motion continue to show two complete static doctor profiles without fetching MP4.

## Motion and interaction

| Interaction | Duration / easing | Ownership |
| --- | --- | --- |
| Button feedback | 180ms, existing ease | CSS; displacement 1px |
| Mobile nav links | 260ms power2.out, 25ms stagger | Header scoped GSAP matchMedia |
| Interior opening | 380ms power2.out, 40ms stagger | Route-scoped GSAP matchMedia; content starts visible |
| FAQ answer | 240ms power2.out | PageMotion scoped toggle listener; native details owns state |
| Selected timeline detail | 280ms power2.out | Timeline scoped GSAP matchMedia |
| Section movement / doctor turn | Existing implementation retained | FullPageScroll's sole Observer, or standalone story ScrollTrigger in natural desktop mode |

No text splitting, continuous ornamental animations, new scroll engine, parallax, or new scroll listeners for presentation effects. New animation uses transform and opacity. Every asynchronous motion import has a stale-generation/unmount guard and optional-failure fallback. Contexts revert on route change, preference change or unmount. Closed menu is immediately hidden and cannot retain focusable links during an exit tween. Menu background is inert while open, and prior state is restored on close, resize and unmount. A visible “پیمایش عادی” button now exposes the existing scroll-exit path.

Reduced motion skips GSAP feedback and disables CSS transitions. CSS `scripting:none` exposes both static profiles without JavaScript. Native details, all article content, source links and footer navigation remain available. Filter reset clears category, query and sort, including recovery from an empty archive.

## Review evidence

`before/` records the originally served local export before code changes. `after/` records the final rebuilt export. Each contains all nine content routes at 390, 768, 805 and 1440 pixels (805 uses 646px height). The original served export was not identical to every current source file; the comparison is explicitly against that observed browser baseline.

`scripts/design-capture.mjs before|after` reproduces captures against port 4175. `scripts/design-fit.mjs` diagnoses the actual presentation fit budget. Detailed test outcomes and limitations are recorded in VALIDATION.md after verification.
