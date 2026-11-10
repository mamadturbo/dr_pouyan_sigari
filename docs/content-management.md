# Content management

Work in `modern/`. Edit source files, never `out/`. Build output is disposable; the original implementation remains in the parent `dist/`.

## Doctor, services and history

- `src/content/data/doctor.ts`: confirmed identity, specialty, license, telephone, address, official Medical Council profile and address-search URL (not a verified pin).
- `experience.ts`: dated academic/educational reports with original source and supplemental source URLs. Do not convert historical assistant-professor descriptions into current-rank claims.
- `education.ts` remains empty because awarding institutions and dates are unknown. Registered dentistry degree, specialty and board from S01 are displayed in About without invented institutions or dates.
- `expertise.ts`: three cards describing registered specialty and dated research/teaching; no list of currently available procedures is confirmed.
- `faq.ts`: contact/address and publication navigation only; medical preparation/follow-up drafts are withheld. Native grouped details maintain accessible keyboard behavior.
- `missing.ts`: developer verification backlog; not rendered publicly.

## Scientific publications

Add a `Publication` entry to `publications.ts` with a unique ID, Persian display title, exact English title, description, integer Gregorian year, category, source URL, icon and featured flag. Bibliographies now include ordered authors, journal, year, optional exact date, volume, issue, pages, DOI when verified and publisher URL. All three existing works are source-checked against research/publications.json. Persian summaries await physician review and are omitted. Only enter values from the actual source record. Missing author lists are `[]` and missing journals are `null`; optional DOI/PubMed/abstract fields stay absent. The UI links to the source rather than displaying fabricated placeholders. Builds reject unsafe URLs and malformed DOI strings. The research dossier documents primary publisher verification and the unresolved 2016 editorial-history conflict.

## Inactive article drafts

There are currently no blog routes. The steps below describe draft metadata conventions only; activating routes requires a separate scope decision.

1. Create `src/content/blog/my-article.mdx` only within separately authorized editorial work.
2. Follow an existing article's `export const article = { ... };` block. Use valid JSON syntax inside the object, one field per line. The prebuild validator intentionally enforces a simple readable metadata format, not arbitrary metadata code.
3. Required: title, description, matching ASCII filename/slug, author, accurate authorRole, ISO date, category, tags, featured, TOC entries and source references. Optional: coverImage, updatedAt, reviewedBy and reviewedAt. A reviewer and review date must be supplied together and reflect a review actually performed. Do not assign doctor authorship automatically.
4. Add `<h2 id="section-id">…</h2>` headings matching every TOC ID. Use meaningful link labels. Avoid raw HTML or executable imports from untrusted sources.
5. Import the MDX component and exported metadata in `src/lib/content.ts`, then add one registry entry. The registry alone does not create a route, listing, Article schema or sitemap entry.
6. Check references, medical claims and image permission; run `pnpm build`, `pnpm test` and relevant E2E checks.

Clinical education needs qualified authorship/review and supporting references before publication. The migrated site contains no clinical treatment instruction. The inactive drafts cover clinic logistics and research-search navigation with editorial attribution. They have not been medically reviewed and their metadata dates do not establish public publication. Source for the research guide is the [official PubMed help](https://pubmed.ncbi.nlm.nih.gov/help/). Publication dates are actual new editorial dates, not invented original dates.

## Media and trust boundary

Place approved active images in `public/assets/`; provide intrinsic dimensions, useful alt text and lazy loading below the fold. MDX is trusted developer code compiled at build time, not sanitized user input. Do not connect uploads, remote MDX or public content submission without a new threat assessment. JSON-LD is generated from known data and escapes `<` before insertion into scripts.
