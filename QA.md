# Validation — 2026-10-16

## Current revision — 2026-10-19

The dated notes below describe earlier versions. This revision supersedes their media playback details.

- The active media is one 60fps H.264 file with 92 frames and a duration of 1.533333 seconds. Forward and reverse directions each occupy half the same source (about 0.77 seconds), without changing sources or calling load() between directions.
- The first decoded video frame becomes visible after loadeddata. A completed turn pauses on its decoded endpoint; the fallback poster stays at opacity 0 before, during and after successful playback. CSS opacity transitions on the video have been removed.
- Progress and copy transitions use animation-frame sampling rather than only the sparse timeupdate event. Text blocks reveal with small offsets and a stagger, replacing the slower whole-block blur effect.
- Desktop wheel checks at CSS 1280×720: arrival armed at scroll Y=798 and scene top=103.109. Forward playback completed at media time 0.764307, with the surgical copy, hidden poster, visible video, and an unlocked page at the same Y. The reverse completed at media time 1.529610 with academic copy and the same Y.
- Rapid opposite wheel input during a further turn left the scene locked at Y=798; completion unlocked at the same Y. Inputs cannot seek or restart an in-progress turn. Reverse playback starts at the fixed scene boundary, rather than whenever any part of the doctor is visible.
- Standalone preview checked at CSS 360×800: no horizontal overflow; the full 300px visual was within the viewport. Both directions completed at scroll Y=1179. The video stayed visible and poster hidden after playback.
- The failure fixture targets the new active media: failed playback left a loaded poster and no lock. Reduced-motion mode showed the static alternative without locking. Physical touch devices and Safari were not tested.
- Eight playback tests passed, including segment completion, preserved frame/copy on reset, and observing the armed state before repositioning. Static checks and JavaScript syntax validation passed.
- Publishing is blocked: get_site and the source-credential operation returned project_not_found for the retained project ID. No replacement site was created.

- JavaScript syntax checks passed for `site.js` and `content.js`.
- Static check passed: 39 unique IDs, all HTML asset references, internal anchors, all 57 WebP frames and the Sites hosting manifest.
- Browser checked at 1440×900, 768×1024, 360×800 and 360×640. No horizontal overflow in these viewports.
- Sequence: all 57 frames loaded without failures in normal conditions. Forward scrolling reached the surgical outfit; reverse scrolling returned to the academic outfit and text. The pinned scene fits below the header on the short mobile viewport.
- Mobile navigation opens, closes with Escape, updates `aria-expanded` and restores focus. All telephone links use `tel:+984533235000`.
- FAQ opening/closing and single-open behavior verified. All internal anchors resolve. External links use `noopener noreferrer`; map search uses the supplied clinic address.
- Reduced-motion fixture: animated scene hidden, two static poses visible, no frame sequence loaded. The fixture simulates the application media-query response; an OS-level preference toggle was not automated.
- Frame-failure fixture: all 57 frame requests failed deliberately; the independent poster loaded and changed to the surgical pose while text stayed usable.
- Slow-frame fixture: poster available at first display; all frames subsequently loaded successfully with per-request delay.
- No application console errors in the normal and reduced-motion flows. HTTP errors in the deliberate failure fixture are expected.
- Claims reviewed against supplied copy: no current academic rank, board ranking, success rates, procedure totals, testimonials, or 2013 identity-unmatched paper added. Services, contact details and license number follow the user's explicit confirmation.

Browser checks used the Codex in-app browser. Physical iOS/Android device and Safari testing were not performed.

## Regression fixes after direct-file report

- Root cause: `dist/index.html` loaded a JavaScript module. Direct `file://` loading blocks that module in Chromium, preventing dynamic content and the entire animation from initializing.
- Changed to ordered classic deferred scripts with an isolated content namespace. Static regression checks reject module entrypoints, import/export syntax and wrong content/app ordering.
- Replaced the frame loader's `decode()` dependency with `load`/`error` events. All 57 frames loaded; forward scrolling reached frame 57 and the surgical copy. Reverse scrolling returned to frame 24 and academic copy.
- The offline preview is now one HTML file with embedded WebP frames, photos, font, libraries and CSS. It has no module, external script, external stylesheet or base-element dependency. Windows MIME detection for WebP was replaced with an explicit correct MIME type. HTTP browser testing confirmed 57 embedded frames and all content render successfully.
- Intrinsic grid sizing reserves space for both text states. All academic/surgical paragraphs and English research titles are visible on mobile. Short windows use normal document flow and keep rotation tied to the visible photo instead of pinning an oversized scene outside the viewport.
- Rechecked 1440×900, 1440×600, 768×1024 and 360×640. No horizontal overflow or text-state overflow. Short desktop and phone layouts used flow mode.
- Rechecked menu Escape, single-open FAQ behavior, reduced-motion fallback and deliberate failure of all 57 frame requests. Independent posters and content remained available.
- The browser tool only permits HTTP/HTTPS, so direct `file://` execution was not automated. Classic-script compatibility was checked statically, and both the normal entrypoint and identical standalone preview were executed over HTTP.

## One-gesture playback revision

This replaces the previous scroll-scrubbed frame sequence.

- The doctor is now a native muted, inline MP4 video, duration 1.90115 seconds. No frame requests, canvas rendering or scroll-to-video seeking occur. The standalone preview embeds that same MP4 and excludes the obsolete frame sequence.
- Arrival armed the scene and locked the page at scroll Y=786.923, with video time 0. A single additional wheel gesture entered playing. The video reached its native ended event at 1.90115 seconds without any more input; scroll Y remained 786.923 throughout. The lock then cleared.
- Additional wheel input during playback left scroll Y unchanged and did not restart playback (video time advanced to 0.176). After completion another wheel input moved the page to Y=1000.
- The standalone preview was tested at CSS 360×800. The full 300px-high visual remained within the viewport. Arrival locked Y=1179.231; one additional gesture played the full video, then unlocked at the identical Y.
- Escape cancelled playback and cleared the lock. A deliberately failing MP4 request left the poster visible and the page unlocked. Reduced-motion mode showed the static alternative without any lock.
- Seven automated playback lifecycle tests passed: arrival without autoplay, one uninterrupted playback, ignored duplicate starts, native-ended unlock, media-error unlock, stalled-media timeout, cancellation, rejected play promises, callback cleanup and explicit retry.
- Native touch gesture handling is implemented; a physical touchscreen device was not tested. Keyboard and wheel paths are available, together with an explicit play/replay button.

## Faster and reversible story animation — 2026-10-17

- The forward source is encoded at 1.37 seconds (about 28% shorter than the original 1.90-second clip); the opposite direction has its own reversed MP4 so upward scrolling preserves the full outfit-change motion.
- When the surgical portrait is visible, scrolling up starts the reverse clip before the page can move. The scene stays locked until the academic portrait returns. Wheel, touch and keyboard paths share the same scene transition.
- The accompanying copy now changes with the direction-adjusted video progress. Both directions use a short GSAP crossfade, blur and offset transition. The enclosing frame uses a large asymmetrical curve, a pale split background, and a raised shadow.
- Browser playback completed in both directions. The forward pass ended on the surgical portrait and copy; one upward gesture held the same scroll position through the reverse pass and ended on the academic portrait and copy.
- Regression follow-up: after moving 112px away from the story’s lock point, one upward gesture returned to the original anchor (scroll Y=798) before reverse playback. A later full exit and re-entry armed the scene at that same anchor again; additional input stayed contained until playback ended.
- The one-file preview embeds the forward and reverse clips locally; it has no network dependency for the rotation.
