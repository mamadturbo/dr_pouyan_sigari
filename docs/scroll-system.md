# Homepage presentation scrolling — 2026-10-20

The latest embedded-browser correction, exact changed files, skill reinstall and browser evidence are detailed in [scroll-preview-fix.md](scroll-preview-fix.md).

## Installed skills and source

Installed **find-skills** from `vercel-labs/skills`, then searched all four requested terms using the supported Skills CLI. Selected and installed **gsap-plugins** and **gsap-scrolltrigger** from the [official GreenSock skills repository](https://github.com/greensock/gsap-skills). Both specialist skills' actual installed SKILL.md files were read and applied before modifying the scrolling implementation. Installation used `pnpm dlx skills … -a codex -y`, the same Skills CLI through the available package runner; this workstation does not expose npx on PATH.

Local instructions are in `modern/.agents/skills/{find-skills,gsap-plugins,gsap-scrolltrigger}/SKILL.md`; provenance/integrity information is in `modern/skills-lock.json`. Discovery commands and the repository audit are recorded in [scroll-audit.md](scroll-audit.md). The specialist skills are installed locally for Codex and can be discovered on later turns as well; their guidance was read directly and used during this task.

Applied guidance: register plugins before use, choose Observer for gesture navigation rather than scroll-position scrub, keep one input owner, measure after fonts/layout changes, and dispose owned animations/listeners/observers/triggers on unmount. The implementation also follows [official Observer documentation](https://gsap.com/docs/v3/Plugins/Observer/).

## Why the previous behavior failed

The initial migration had a naturally scrolling homepage with a gesture-locked **doctor scene only**. The subsequent section controller was already present when this revision began. The observed failure in the embedded browser was its eligibility rule: a minimum 1001×700 viewport excluded the actual 805×646 preview. Simply lowering that rule would still fail the content-fit gate: the introduction, experience, services and research sections were taller than the viewport. The revised compact presentation removes excess decorative spacing and reduces illustration height while preserving every paragraph. It passes the real fit gate at 805×646.

The input audit also found that a touch contact begun during a transition could be accepted if its first movement arrived after completion. `GestureSession.press(busy)` now consumes that entire contact; only a fresh contact can navigate. No additional library was added.

## Implemented system

`FullPageScroll` owns the homepage lifecycle through `useFullPageScroll`. It measures the actual server-rendered sections and footer, imports the already-installed GSAP plugins, and selects either presentation mode or natural fallback. Server-rendered content remains available without JavaScript; no database or server feature was introduced.

Presentation mode uses one **GSAP Observer** scoped to `#page-shell`, a scroll surface containing the homepage and footer. The header/menu sits outside that surface. It is never mounted on biography, expertise, publications, blog/articles or contact routes. The shell uses controlled `scrollTop`; GSAP transitions last **0.95 seconds** with `power3.inOut`. There is no second smooth-scroll library or ScrollSmoother.

`scroll-controller.ts` explicitly models `currentSection`, `targetSection` and `isTransitioning`, with `goToSection`, `nextSection` and `previousSection`. Indexes are clamped; sections do not wrap. The committed index changes only on completion, and the final position is set exactly. Wheel/touch input received during transitions or playback is discarded rather than queued. Escape commits an in-progress section transition to its destination or cancels video playback. A guard prevents arbitrary resting scroll positions in presentation mode.

### Gesture ownership and momentum

`GestureSession` uses a consumed latch for the whole input burst, accumulated signed distance, a meaningful peak and a quiet boundary. Wheel input requires 32px of accumulated movement and a peak of at least 12px. A 280ms quiet interval separates bursts; continuous momentum remains consumed even after the animation has finished. Small isolated tails are ignored. This is not a timer-only debounce. A physical touch contact can trigger at most once, after a 50px swipe; reversal within the same contact cannot create another transition. Held keyboard repeats are ignored. Ctrl+wheel zoom is allowed through the scoped capture helper.

Keyboard arrows, PageUp/PageDown, Space/Shift+Space, Home and End are supported. Native buttons, links, form controls and FAQ activation retain their normal activation behavior. The active panel is focusable, other panels are inert while controlled, and the navigation announces the selected section. The “پیمایش عادی” control releases presentation mode and keeps the same reading location.

### Doctor animation and ScrollTrigger

The existing tested native player and single forward/reverse MP4 remain unchanged. `mountStory` now exposes a typed media port: `step`, `locked`, `cancel`, `refresh` and `destroy`.

In presentation mode, **managed story mode** creates no story wheel/touch/key/scroll listeners and no story ScrollTrigger. Observer is the sole gesture owner. At the doctor panel:

```text
down: academic → complete forward turn → surgical → next section
up:   surgical → complete return turn → academic → previous section
```

Each arrow in the sequence is a separate deliberate gesture; intermediate video frames are not separate pages. Successful playback retains the decoded frame and text state. Additional scrolling during playback is absorbed. Re-entering the section preserves its current clothing state. Error/rejection/timeout releases the media busy state and permits navigation with a poster fallback. Explicit route navigation and cancellation remain available.

In natural fallback, the original independently tested ScrollTrigger/gesture story controller is retained. Only that controller runs, with no full-page Observer. Switching modes disposes the prior owner first, resets media controls, reverts unfinished text animations and releases old locks. Thus Observer and ScrollTrigger do not compete to drive the same scene.

### Fitting, resize and history

Presentation mode is eligible from 769px width and 600px height **only if actual content fits**. The current browser suite verifies full-page behavior at 805×646, 1280×720, 1366×768 and 1440×900, including full traversal in the embedded preview size. Eligibility is not a promise that all content will fit at every size above those minima. Compact presentation rules apply at widths up to 1100px or heights below 768px. They reduce decorative spacing and illustration height without hiding or scaling copy. The doctor text is checked against its card bounds; decorative glows/leaves are excluded from overflow measurement. If a section's meaningful content does not fit, the entire homepage falls back to natural flow rather than cropping it.

Phones, short windows, reduced motion and explicit exit use natural flow. At widths up to 768px, phones show two separate static doctor profiles stacked vertically, with complete text and links for the formal and surgical characters. No story controller is mounted or MP4 fetched on this path. Reduced motion also presents both static profiles without locks. The doctor's local interaction remains available in ordinary-motion desktop fallback. Resizing is remeasured after a short 180ms layout debounce; this debounce is unrelated to gesture ownership. Hashes record committed sections, so refresh with `/#services` deterministically restores that section; an unknown/no section hash starts at the introduction. Browser restoration settings are restored when leaving controlled mode.

## Changed implementation files

| File | Change |
| --- | --- |
| `modern/src/components/scrolling/FullPageScroll.tsx` | Homepage wrapper and accessible previous/next/natural-mode controls |
| `modern/src/hooks/useFullPageScroll.ts` | Exclusive lifecycle, mode selection, real fitting, responsive/reduced-motion handling and cleanup |
| `modern/src/lib/scroll-controller.ts` | Observer, navigation state, GSAP transition, input ownership, focus, anchors and positioning |
| `modern/src/lib/gesture-session.ts` | Tested wheel-burst/touch-contact consumption |
| `modern/src/lib/story-controller.js` and `.d.ts` | Managed media port; preserve standalone controller; reset/revert cleanup |
| `modern/src/components/animations/DoctorStory.tsx` | Presentational markup; lifecycle moved to homepage owner |
| `modern/src/app/page.tsx`, `layout.tsx` | Homepage integration and scoped content/footer surface |
| `modern/src/styles/fullpage.css`, `app/globals.css` | Viewport presentation layout and navigation styling; no long-form page snap |
| `modern/tests/gesture-session.test.ts` | Burst, tail, busy-state, reversal and touch unit tests |
| `modern/tests/e2e/fullpage.spec.ts` | Full-page browser acceptance cases |
| `modern/tests/e2e/site.spec.ts` | Keep standalone story/design regression checks by selecting natural mode explicitly |
| `modern/scripts/strict-smoke.mjs` | Actual development Strict Mode Observer ownership check |
| `modern/.agents/skills/`, `skills-lock.json` | Installed skill instructions and provenance |
| Documentation / validation JSON | Current architecture, test evidence and handoff instructions |

No legacy `dist/`, original media, doctor content or hosting identity was changed. Lenis remains omitted because controlled navigation already has one position owner and content routes need browser-native scrolling. No new application dependency was installed.

## Browser validation and results

| Actual command / check | Result |
| --- | --- |
| pnpm build | PASS: static export and all route/asset/anchor checks |
| pnpm typecheck | PASS: strict TypeScript |
| pnpm test | 19 Vitest tests + 8 original playback tests passed |
| pnpm test:e2e --workers=2 | 55 passed, 1 intentional device-specific skip; 56 scheduled, zero failures (including the mobile static-profile revision) |
| Development Strict Mode smoke | PASS: one owned Observer; shell handlers 2 mounted / 0 unmounted / 2 remounted; no page errors or residual locks |
| pnpm audit | No known production dependency vulnerabilities reported |

The browser suite exercises one down/up gesture, long momentum after transition completion, rapid events, reverse input during a transition, endpoints, held keys, exact landing, video internal steps/re-entry, resizing, hash refresh, small-screen fallback, natural scrolling on content routes, touch input through Chrome's native input protocol, reduced motion, explicit exit, media failure, lifecycle ownership, console/hydration checks and the previous route/content/accessibility regressions.

Development Strict Mode smoke also passed: **one Observer** (two shell wheel handlers including its native-zoom helper), **zero** shell wheel handlers after route unmount, and the same **two** after remount; no residual full-page/story lock and no page errors. This counts owned shell handlers, not GSAP's shared global library listeners.

## Run and limitations

The production static export has been rebuilt. The existing `preview.cmd` launcher still works without Node on PATH or PowerShell execution-policy changes. Open it from `modern/`, then refresh `http://127.0.0.1:4175/` with Ctrl+F5. If the preview is already running, refreshing is enough; do not start a second server on the same port.

Repeat checks with `pnpm test`, `pnpm typecheck`, `pnpm build` and `pnpm test:e2e`, or the provided `scripts/pnpm.ps1` wrapper where script execution is allowed. `pnpm dev --webpack --port 3001` plus `node scripts/strict-smoke.mjs` repeats the development lifecycle check using the bundled runtime as needed.

Validation used installed Google Chrome desktop and emulated mobile/touch environments. No physical trackpad/touchscreen, Safari or Firefox result is claimed. A wheel/touch gesture is defined by the measurable burst/contact rules above; physical devices can vary. Small/content-heavy layouts intentionally use natural fallback. Earlier Lighthouse JSON files describe the previous architecture migration and were not remeasured for this scrolling change. No new performance score or production deployment is claimed.
