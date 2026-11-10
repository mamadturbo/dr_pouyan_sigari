# Doctor story animation

**2026-10-20 update:** homepage ownership now belongs to `FullPageScroll` / `useFullPageScroll`. `DoctorStory` renders its markup only. In full-page mode, its typed media port has no independent wheel/touch/key listeners or story ScrollTrigger; the single Observer consumes explicit internal video steps. Natural fallback retains the original scoped controller. See [scroll-system.md](scroll-system.md) for the current lifecycle, gesture rules and results; the original standalone behavior below describes that fallback.

The homepage preserves the original 92-frame H.264 `doctor-turn-flow.mp4`. The first half changes from academic clothing to surgery clothing; the second half returns. Additional gestures during a segment do not seek or restart it. Completed playback pauses on its decoded frame. The original source video, alternate clips and old frame sequence remain recoverable in legacy assets; only the active clip ships in the new public tree.

## Ownership

`components/animations/DoctorStory.tsx` renders the original composition and static fallback as a Server Component. `FullPageScroll` / `useFullPageScroll` owns the homepage effect, dynamically loads GSAP, respects `prefers-reduced-motion`, selects managed or standalone `mountStory` mode and disposes the previous owner before switching. An effect generation counter prevents stale asynchronous imports from mounting after unmount or preference changes. The former proximity observer is no longer the lifecycle owner.

`lib/story-player.js` is the original lifecycle engine with its global export changed into an ES module. `lib/story-controller.js` retains the original gesture logic scoped to its root. It receives GSAP dependencies rather than loading global vendor files. The eight preserved Node tests execute the migrated player itself.

## Behavior

Arrival arms and locks at a measured anchor without autoplay. A fresh wheel gesture, swipe, down/Space/PageDown key or explicit button starts one whole segment. Returning upwards reverses at the boundary. Scroll, video and text progress remain coordinated; layout measurement focuses the visual on short viewports. Resize/font readiness recalculates dimensions. A successful segment unlocks the page, with a brief momentum settling window. Reset preserves the last frame when changing direction.

Escape, upward departure from an armed scene, header/menu navigation, media errors, rejected play promises and the eight-second watchdog release the local lock. Reduced motion renders both static states without initializing the player. Browser failure checks verify a visible independent poster. Video uses `preload="none"`; assigning the source does not request full playback eagerly. There is no Lenis; full-page control is restricted to the homepage in eligible layouts. Content routes use natural scrolling.

Cleanup removes wheel, touch, keyboard, scroll, click, pageshow, resize and media listeners; kills the owned trigger and latest text timeline; cancels pending resize/watchdog/RAF work; reverts the GSAP context; pauses/unloads video and clears the scroll-lock class. This follows [GSAP context cleanup guidance](https://gsap.com/docs/v3/GSAP/gsap.context()/). Global `killAll()` is not used.

Short-window correction: fitting considers the controls as well as the scene. When the whole composition cannot fit, the trigger centers the actual frame, the frame height is capped relative to the viewport, and the controls float within the viewport while locked. This fixes clipped video and an unreachable play button at tablet/short-desktop sizes without changing the normal unlocked composition.

## Validation boundaries

Tests cover native segment playback, forward/reverse copy, errors, timeouts, cancellation, reset and disposal; browser tests exercise button, wheel, keyboard, touch emulation, reduced motion, preference changes during playback, route transitions and return to the homepage. Real touchscreen hardware and Safari/Firefox were not tested. The development Strict Mode smoke check passed: one owned wheel listener mounted, zero on unmount, one on remount, no remaining lock and no page errors. Run `node scripts/strict-smoke.mjs` against `next dev --webpack --port 3001` to repeat it. It tracks the controller's named listener, not GSAP's shared library listeners.

Intentional motion changes: hero/section entrance fades and decorative orbit parallax are omitted to keep content immediately readable and avoid initial-render work. The distinctive native-video turn, copy transition, forward/reverse gestures and accessible exits are retained. There is no static mock replacing the interactive story.
