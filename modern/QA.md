# Final QA — 2026-10-19

The results below are the historical architecture-migration baseline. The **2026-10-20 scrolling revision** and its current browser/unit results are recorded in [scroll-system.md](../docs/scroll-system.md). Earlier Lighthouse scores were not remeasured for that revision.

- Production static build: passed; eight content routes plus custom 404, robots and sitemap.
- Unit/components/content: 13 passed. Migrated original playback tests: 8 passed.
- Playwright: 26 passed, 2 intentional device-specific skips, 0 failures; Google Chrome desktop and mobile emulation.
- Extra viewport checks: 360×640, 768×1024, 1440×600. Full video visible and controls reachable; no horizontal overflow.
- Automated axe checks: seven page types at desktop/mobile sizes, no reported violations in the selected WCAG rule tags.
- Lighthouse: mobile Performance 95, desktop 100; Accessibility and Best Practices 100 in both. SEO 66 because preview indexing is intentionally blocked. Full metrics and limitations in `../docs/migration-report.md` and `performance-results.json`.
- Strict Mode development smoke: one owned wheel listener after mount/remount, zero after unmount, no residual lock or page errors.
- Configured release fixture: eight sitemap entries and correct canonical/robots policy with reserved test origin. Fixture origin absent from final protected export.
- Full dependency and production dependency audits: no known vulnerabilities reported.
- Legacy working files and original tests remain intact; no deployment performed.

Physical devices, Safari, Firefox and field INP were not tested. No clinical review is claimed. See the full migration report for remaining verification/domain requirements and exact commands.
