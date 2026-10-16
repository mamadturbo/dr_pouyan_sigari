# Validation — 2026-10-16

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
