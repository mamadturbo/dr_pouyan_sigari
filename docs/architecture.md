# Architecture

**2026-10-20 update:** the homepage now has a GSAP Observer presentation owner, with server-rendered children and a natural fallback when content does not fit. Its scoped shell includes the footer, while the header/menu remains outside the controlled surface. Long-form routes never mount that controller. [Current scrolling architecture and validation](scroll-system.md) supersede the original homepage scroll-ownership description below.

The implementation root is `modern/`, an isolated Next.js App Router application. Legacy files and pre-existing user modifications are untouched. The safe cutover is choosing `modern/out/` as the hosting artifact after review, not deleting `dist/`.

## Rendering and modules

Pages and shared content sections are Server Components. All doctor details, services, timeline entries, FAQs, research and article bodies are emitted in HTML. Client islands are the responsive header, publication archive controls, blog category control and cinematic story. Listings receive metadata only, not MDX article bodies. Eight content routes are generated with a custom 404, robots and sitemap. `generateStaticParams` covers known article slugs; unknown slugs are not generated.

`src/content/data/` contains typed modules. `src/lib/schemas.ts` validates publication records, doctor details, external URLs, historical timeline and MDX metadata. Missing qualifications and citation fields are recorded in `missing.ts` instead of made-up facts. Publications accept nullable journals/empty author lists because the preserved records do not contain them. They support complete metadata when later source-verified.

`@next/mdx` compiles trusted local MDX; exported JSON metadata is checked before building and parsed again when imported. The explicit registry in `lib/content.ts` makes inclusion deliberate and keeps article bodies off the listing's client bundle.

## Design and motion

Original CSS is preserved as `styles/legacy.css` to minimize visual regression. `app/globals.css` integrates Tailwind tokens, new interior/article layouts and contrast/accessibility adjustments. Legacy cascade duplication remains a documented follow-up; rewriting every selector was outside the preservation priority. The original SVG icon system remains where it contributes to visual identity; Lucide provides navigation icons. Local Vazirmatn is loaded with `next/font/local`; OFL is included in source.

The original player and scoped controller remain JavaScript behind a typed `mountStory` declaration. TypeScript strict mode covers the new application, data, schemas and public adapter interface; `allowJs` preserves the tested engine without pretending those internals were fully converted to TypeScript. React owns disposal. GSAP plugins load only on the homepage, with Observer owning eligible full-page layouts and the standalone story controller owning natural fallback. They do not load on article/about routes. Lenis is deliberately omitted to avoid competing position owners. Native details, select and button controls suffice, so no shadcn runtime is installed.

## Export portability

Next.js 16.4.2 currently reproduces a Windows segment-cache filename defect ([upstream issue #85374](https://github.com/vercel/next.js/issues/85374)). `normalize-export.mjs` adds correctly flattened aliases to generated output before validation. It never patches dependencies, changes application routes or deletes originals. Browser tests verify that client navigation and prefetch-free transitions work without 404 requests on plain static hosting. Remove the workaround only after a future upgrade passes that regression suite.

Build configuration follows [Next static exports](https://nextjs.org/docs/app/guides/static-exports) and [MDX integration](https://nextjs.org/docs/app/guides/mdx). Image optimization is disabled for export; responsive pre-encoded WebP is used. No API, cookies, authentication, database, server actions, redirects or server image optimizer are required. Production is an HTTP static tree, not a standalone `file://` application.
