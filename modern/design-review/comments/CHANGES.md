# Browser comments follow-up — 28 October 2026

Implemented all eleven marked requests:

- Removed the homepage editorial/articles panel and the blog index and detail routes. Blog URLs now return 404 and are excluded from navigation, sitemap and export checks. Editorial source records remain archived in the repository; they are not published as pages.
- Removed the floating timeline arrows/count while retaining title selection and wheel/keyboard stage navigation.
- Removed the entire doctor prelude including both Persian and English labels, plus the marked experience, treatment and FAQ eyebrows.
- Removed the visible natural-scroll button.
- Replaced the journey panel with two seamless GSAP bands moving in opposite directions. As requested in the follow-up reply, image slots remain empty until the owner supplies photographs; no artificial or unrelated medical cases are used. Six slots per group, two repeated groups per row. Empty visual slots are hidden from assistive technology.
- Renamed research navigation and archive heading to «پژوهش‌ها و مقالات» in header, footer and section navigation.
- Centralized eight homepage section IDs and names so removal of the editorial panel cannot desynchronize navigation and scene anchors. The existing `#journey` anchor now reaches the portfolio to keep browser references working.

Motion pauses offscreen, in a hidden tab, on pointer hover over the bands and via the pause button. Reduced motion and no-JavaScript render a static pair of bands. Scoped GSAP media contexts, observer and event listeners are disposed on unmount; the gallery does not intercept input or own scrolling.

Current screenshots and capture observations are in this folder. Earlier `before/`, `after/` and comparison-viewer artifacts describe the previous design pass and are retained as historical evidence.

Validation for this follow-up is recorded in RESULTS.md after the current checks finish.
