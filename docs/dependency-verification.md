# Dependency verification — 2026-10-19

Before installation, stable `latest` versions and declared peer/engine requirements were queried directly from `https://registry.npmjs.org/<package>`. The selected Node runtime is 24.19.0; pnpm is pinned to the available 11.25.0, with one lockfile. No beta/canary packages were selected.

| Package | Stable release checked / decision |
| --- | --- |
| Next.js / @next/mdx | 16.4.2, matching integration versions |
| React / React DOM | 19.3.1, compatible declared peers |
| TypeScript | 7.0.2, strict build and standalone check pass |
| Tailwind / PostCSS plugin | 4.3.3, matching versions |
| GSAP / ScrollTrigger | 3.15.0, preserves existing animation library version |
| Lenis | 1.3.27 checked; omitted from migration because native scrolling suffices |
| MDX loader / React integration | 3.1.1 |
| Zod | 4.6.7 |
| Lucide React | 1.59.0 |
| Vitest | 5.0.5 |
| React Testing Library / jest-dom | 16.3.3 / 7.0.1 |
| jsdom | 30.1.3; Node 24.19 satisfies its engine |
| Playwright | 1.64.1 |
| axe Playwright | 4.14.0 |
| Lighthouse | 13.5.0; Node engine verified before installing |

`@types/node` is locked at 24.19.2 to match the runtime major rather than the registry's Node 26 types. Other exact resolved versions and transitive integrity hashes are in `modern/pnpm-lock.yaml`. `pnpm install --frozen-lockfile` succeeds; production and full-graph `pnpm audit` reported no known vulnerabilities at validation time. This is a dated result, not a perpetual security guarantee.

Official implementation references: [Next static export](https://nextjs.org/docs/app/guides/static-exports), [Next MDX](https://nextjs.org/docs/app/guides/mdx), [Tailwind Next integration](https://tailwindcss.com/docs/installation/framework-guides/nextjs), [GSAP context lifecycle](https://gsap.com/docs/v3/GSAP/gsap.context()/). Installed Next documentation was also checked for export, local fonts and MDX after `next dev` generated its local AGENTS.md guidance.
