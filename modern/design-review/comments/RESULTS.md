# Follow-up validation

- `scripts/pnpm.ps1 build`: passed, with only the five retained content routes exported. The deleted blog index and details return HTTP 404.
- `scripts/pnpm.ps1 typecheck`: passed.
- `scripts/pnpm.ps1 test`: 19 Vitest and 8 native playback tests passed.
- `scripts/pnpm.ps1 test:e2e --workers=2`: 75 passed, 1 intentional mobile skip, zero failures, 76 scheduled.
- New browser checks confirm the requested DOM removals, research label, removed-route responses, opposite row movement, pause behavior, static reduced-motion state and absence of invented case images.
- Existing scroll/video, navigation, touch, resize, cleanup, no-JavaScript and automated accessibility checks passed with the new eight-panel layout.
- Screenshots captured at 390, 768, 861×646 and 1440 pixels, with no horizontal overflow or uncaught page errors. Eight presentation scenes were captured on desktop; gallery and research archive were also checked on mobile/tablet.

Gallery image slots are intentionally empty per the owner's reply. This is a completed layout awaiting the supplied real photographs, not a claim that medical case imagery has been added. Earlier design-review validation records describe the previous revision and do not represent current route counts.

Tests ran in installed Chrome with mobile/touch emulation. No physical-device or Safari/Firefox claim is made. No deployment was performed.
