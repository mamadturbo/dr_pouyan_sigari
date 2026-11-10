# Architecture audit — 2026-10-19

## Existing architecture
`dist/index.html` is the entry point; ordered classic scripts load local GSAP 3.15.0, ScrollTrigger, Lenis 1.3.27, `content.js`, `story-player.js`, then `site.js`. No package manifest or backend exists. Content arrays populate empty containers through escaped HTML strings. Python utilities validate/package the legacy static tree and create failure fixtures. CSS is a compact custom stylesheet with successive responsive overrides. Git contains pre-existing user modifications; these are preserved.

## Strengths to preserve
Persian RTL typography, licensed local Vazirmatn, forest-green/mint palette, portrait and asymmetrical hero, sourced historical academic timeline, six confirmed service descriptions, three research records, contact details and FAQ. Native video playback uses a single 92-frame, 60fps forward/reverse clip. The player has eight meaningful lifecycle tests, including ignored extra gestures, segment boundaries, cancellation, rejected playback, failure, timeout and disposal.

## Technical debt
Main information depends on browser `innerHTML`; no individual pages, canonical domain, article system, sitemap or build-time validation. Global selectors/listeners make SPA reuse unsafe. CSS contains redundant historical overrides. Frame sequences and alternate videos are unused by the current player. Lenis is coupled to global scroll locking. Legacy single-file previews intentionally duplicate media. No current performance measurement is available.

## Risks and dependencies
Preserve scroll anchor calculations, fixed segment boundary, video frame retention, touch/keyboard navigation, poster behavior, resize and font measurement, Escape/navigation exits and reduced motion. A React mount must own and dispose all listeners, timers, GSAP context and triggers. Existing academic ranks are dated historical claims, not current appointments. Publication records lack full author lists, journals and DOIs; do not fill them by guessing. Source attempts: DOAJ blocked automated access; the 2026 publisher timed out. Preserve the previously verified project records and source URLs.

## Decisions
Implement in isolated `modern/`; never overwrite legacy `dist`, tests, packaging or hosting identity. Use Next App Router, static export, strict TypeScript, Tailwind, local font, trusted local MDX exports validated with Zod, npm-registry verified stable dependencies and pnpm lockfile. Use server-rendered content and small client islands. Retain the existing tested JS playback/controller in a typed adapter rather than rewriting the state machine. Dynamically load GSAP only near the homepage story. Omit Lenis: native scrolling reduces competing scroll systems and the controlled sequence already has explicit locking. Omit shadcn until an accessible primitive adds value beyond native HTML. Copy only active assets into the deployable tree; retain all originals. Require a real domain for release builds; local preview must not invent a domain or imply clinical review.

## Baseline evidence
`node --test tests/story-player.test.cjs`: 8 passed. Bundled Python `scripts/check.py`: PASS, 40 unique IDs and local references validated. Legacy assets: 74 files, 2,578,174 bytes. No new browser or Lighthouse baseline claimed at this stage.
