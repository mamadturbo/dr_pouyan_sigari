# Embedded preview scroll fix — 2026-10-20

## Installed specialist guidance

The existing `find-skills` installation from `vercel-labs/skills` was verified and read. All four requested searches were executed using `scripts/pnpm.ps1 dlx skills find` (npx is absent from this workstation's PATH). The discovered official [GreenSock skills](https://github.com/greensock/gsap-skills) were verified against their repository and the [official Observer documentation](https://gsap.com/docs/v3/Plugins/Observer/).

Before editing implementation, the supported Skills CLI actually reinstalled both specialists for Codex:

```powershell
.\scripts\pnpm.ps1 dlx skills add greensock/gsap-skills --skill gsap-plugins --skill gsap-scrolltrigger -a codex -y
```

The installed guides were read and used: [gsap-plugins](../modern/.agents/skills/gsap-plugins/SKILL.md), [gsap-scrolltrigger](../modern/.agents/skills/gsap-scrolltrigger/SKILL.md). Their provenance is recorded in `modern/skills-lock.json`. These are project-local Codex skills, available on later turns too.

## Cause and implementation

The project already had a GSAP Observer state machine. The initial embedded viewport was 805×646, below the 1001×700 eligibility cutoff, so it mounted natural scrolling. Removing the cutoff alone was insufficient: several panels were taller than the viewport. The embedded browser later opened at 1280×720, which also failed the real content-fit gate with the original spacing.

Presentation eligibility now starts at 769×600, subject to measuring all panels. Compact CSS applies up to 1100px wide or below 768px high. It reduces unused spacing and decorative image height; no paragraphs are removed, scaled or clipped. Both actual preview sizes now use full-page mode. Smaller phones, reduced motion, explicit exit and content that cannot fit retain natural scrolling.

A separate input defect was fixed: a contact pressed while a transition/video was locked must stay consumed even when its first movement arrives after settling. `GestureSession.press(busy)` records that lock at contact start.

The existing state machine remains the position owner: `currentSection`, `targetSection`, `isTransitioning`, clamped indexes, exact landing, 0.95-second GSAP transitions with `power3.inOut`. A consumed wheel-burst/contact latch, movement threshold and quiet boundary prevent momentum and rapid input from queuing extra transitions. Keyboard repeats are ignored. The input Observer is scoped to the homepage shell; the header and content routes are outside its ownership.

Lenis remains absent from the modern runtime and dependencies. Adding another position controller would introduce conflicting ownership. Legacy delivery files and their Lenis integration were not changed by this revision.

In full-page mode, the doctor runs in managed mode without its own wheel/touch/key/scroll handlers or ScrollTrigger. One gesture plays one complete video segment before navigation can continue; reverse segments and return state are preserved. Video progress still drives the existing text timeline. Media errors, cancellation and timeout release the busy state. In natural mode only the original local story controller and its ScrollTrigger run. Teardown removes the old owner before mounting another.

## Files changed in this revision

- `modern/src/hooks/useFullPageScroll.ts`: expanded eligibility while retaining actual fit measurement and existing lifecycle cleanup.
- `modern/src/styles/fullpage.css`: compact presentation layout for side panels and short laptop windows.
- `modern/src/lib/gesture-session.ts`: consume contacts that start while locked.
- `modern/src/lib/scroll-controller.ts`: pass lock state to the contact latch.
- `modern/tests/gesture-session.test.ts`: delayed first touch movement regression.
- `modern/tests/e2e/fullpage.spec.ts`: compact viewport traversal, content bounds, touch locking and resize regressions.
- `modern/README.md`, `docs/scroll-system.md`, this report, `modern/scroll-validation.json`, `modern/strict-mode-validation.json` and `modern/compact-validation.json`: current behavior and evidence.
- `modern/out/`: rebuilt static preview. No production deployment.

## Browser coverage

The real installed Chrome suite covers a single down/up gesture, exact landing, rapid wheel bursts, trackpad-like momentum, opposite input during transition, first/last boundaries, keyboard/held keys, resize, route exit/return and listener ownership, native protocol touch gestures, reduced motion, doctor forward/reverse/return/error playback, deterministic hash refresh, console errors, content overflow and automated accessibility checks.

The new 805×646 test traverses all ten panels and checks content bounds below the header and above navigation, including forward doctor playback. The new touch test holds a contact across transition completion and proves it cannot navigate until a fresh contact starts. The 1280×720 regression checks full-page operation and exact positioning when resizing between both embedded sizes.

Supplemental browser inspection verified an expanded FAQ remains readable and a native touch swipe on a 393×851 phone naturally scrolls. Development Strict Mode verified two owned shell wheel handlers (one Observer plus its zoom helper), zero after unmount and two after remount, with no residual locks or page errors.

Final results on the rebuilt export: `pnpm build` passed (all eight content route/asset/anchor checks), `pnpm typecheck` passed, `pnpm test` passed (19 Vitest + 8 playback tests), and `pnpm test:e2e` finished with **52 passed, 2 intentional device-specific skips, 0 failures** out of 54 scheduled tests. `node scripts/strict-smoke.mjs` also passed against the real development server with React Strict Mode enabled. The embedded browser itself was inspected at 1280×720: `mode=fullpage`, section index 1, transition settled, with the doctor section fully visible.

Machine-readable results: [scroll-validation.json](../modern/scroll-validation.json), [Strict Mode](../modern/strict-mode-validation.json), [supplemental checks](../modern/compact-validation.json). Screenshots: [embedded preview](scroll-evidence/embedded-preview.png), [compact doctor](scroll-evidence/compact-doctor.png), [compact introduction](scroll-evidence/compact-introduction.png).

## Limits

This is installed Chrome with desktop/mobile emulation and native input protocol testing. Physical trackpads/phones, Safari and Firefox were not tested. Content-heavy layouts intentionally fall back to natural flow; there is no promise that every width/height above the eligibility minima can fit every section. No new Lighthouse/field performance score or production deployment is claimed.
