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
