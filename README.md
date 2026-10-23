# drbhimraoambedkar.info

**The life and work of Dr. Bhimrao Ramji Ambedkar, brought together in one place — from authoritative sources, explained simply, free for everyone.**

Dr. Ambedkar's writings, speeches and records are spread across government PDFs, university archives, museums and memorials. India's Ministry of Social Justice and Empowerment itself describes them as "spread across libraries, memorials, archives, and fragmented digital sources" ([SIH 2026 brief SIH26096](https://zaidsayyed.in/tools/sih-problem-statements/sih26096)). This project gathers them.

- **Staging:** https://www.sidhantsardar.com/drbhimraoambedkar.info/ (branch `staging`)
- **Production:** https://drbhimraoambedkar.info (branch `main`, once the domain is connected)

## What's inside

| Section | What it is | Where it comes from |
|---|---|---|
| Life story | 13 chapters + 3 themes, plain language, every fact linked to its source | `src/content/life/`, `src/content/themes/` |
| Timeline | Every dated event, built automatically from the chapters | `keyDates` in each chapter + `src/data/constitution.json` |
| Constitution | Flagship section: drafting, key articles explained, speeches, official PDFs | `src/data/constitution.json`, `public/documents/constitution/` |
| Works | Catalogue of every book, paper, essay, newspaper, speech | `src/data/works.json`, `src/data/speeches.json` |
| Library | All 17 volumes of *Writings and Speeches*, page by page, linked to the official PDFs | `library/` (built from the Government of India PDFs) |
| Ask the Archive | Full-text search (Pagefind) + optional AI answers with page citations | `src/pages/ask.astro`, `functions/api/ask.js` |
| Gallery | Freely licensed photos with full credits | `public/images/`, `src/data/images.json` |
| Blog & News | Articles with GitHub-Discussions comments; news auto-updated every 6 hours | `src/content/blog/`, `src/data/news.json` |
| Research | The full research dossiers behind every page | `research/` |

## Run it locally

```bash
npm install
npm run build      # builds the site and the search index into dist/
npm run preview    # http://localhost:4321
```

`npm run dev` works for editing, but search only works after `npm run build`.

## Rebuild the library from the original PDFs

```bash
./scripts/download-baws.sh                        # ~620 MB of PDFs into archive/ (not committed)
.venv/bin/python -I scripts/extract-baws.py       # page text into archive/baws-text/
node scripts/build-library.mjs                    # cleaned text into library/ (committed)
node scripts/build-toc.mjs                        # chapters from each volume's printed CONTENTS into library/toc.json
.venv/bin/python -I scripts/build-covers.py       # front covers into public/images/covers/
```

The reader (`/library/<volume>/<chapter>/`) shows each page's text word for word: only line breaks are joined into paragraphs, and running headers and page numbers are left out. Every page links to the same page of the official PDF.

## Marathi (मराठी)

English is at `/`, Marathi at `/mr/`. Each page is written once and reads its language with `getLang(Astro)`; short texts sit side by side as `t('English', 'मराठी')` (`src/i18n/index.ts`). `scripts/gen-locale-pages.mjs` creates the `/mr/` routes before every build, and `src/middleware.ts` keeps Marathi readers on Marathi pages.

Translated content lives next to the English, with the same file names and structure:

| English | Marathi | Check |
|---|---|---|
| `src/content/life/`, `themes/`, `blog/` | `src/content/mr/…` | `node scripts/check-mr-md.mjs <files>` |
| `src/data/<name>.json` | `src/data/mr/<name>.json` | `node scripts/check-mr-json.mjs <name>` |
| `research/works/`, `research/constitution/` | `research/mr/…` | — |
| `library/baws-en/` (the 17 volumes) | `library/baws-mr/` + `library/toc-mr.json` | `node scripts/translate-library.mjs status` |

Every translation follows **`i18n/marathi-style-guide.md`**: the meaning and intent of the original must never change. Passages flagged for a human reviewer are listed in `i18n/review/`.

To translate more of the library (needs `ANTHROPIC_API_KEY`; uses the Message Batches API):

```bash
node scripts/translate-library.mjs api volume-1          # every chapter of Volume 1 not yet translated
node scripts/translate-library.mjs status                # progress for all volumes
```

Translations are checked before they are published (same pages, same paragraphs, nothing left untranslated or dropped), and each reader page shows the original English beside the Marathi.

## Branches and deploys

- `staging` → GitHub Pages automatically on every push (`.github/workflows/deploy-staging.yml`).
- `main` → production. Recommended host: **Cloudflare Pages** (free, fast in India, and it runs the AI answer function in `functions/`).

### Connect the domain (when purchased)

1. In Cloudflare Pages: *Create project → Connect to Git →* this repository, production branch `main`.
   Build command `npm run build`, output directory `dist`. Environment variables: `SITE_URL=https://drbhimraoambedkar.info`, `BASE_PATH=/`, `PUBLIC_ASK_ENDPOINT=/api/ask`.
2. *Custom domains → Set up a domain →* `drbhimraoambedkar.info` (and `www`). Cloudflare shows the DNS records to add at your registrar.
3. Optional: add `staging.drbhimraoambedkar.info` as the domain for the `staging` branch preview.

### Turn on AI answers

In Cloudflare Pages → *Settings → Variables and Secrets*: add the secret `ANTHROPIC_API_KEY` and `ALLOWED_ORIGINS=https://drbhimraoambedkar.info`. The function only answers from pages of his writings that the reader's search found, and returns numbered citations to those pages. Default model: `claude-opus-5-5` at low effort (change with `ASK_MODEL` / `ASK_EFFORT`). Consider a Cloudflare rate-limiting rule on `/api/ask`.

### Turn on comments

Comments use [giscus](https://giscus.app), which stores them in this repository's GitHub Discussions. Install the giscus app on this repository: https://github.com/apps/giscus. The repository and category IDs are already set in `src/lib/site.ts`.

## Writing content

Read `research/CONVENTIONS.md` first. In short: plain English, and a source link after every fact written as `[source: Name](url)` — the site turns these into small source chips.

## Licences

- Dr. Ambedkar's own writings are in the public domain in India (he died in 1956; Indian copyright lasts 60 years after the author's death).
- Images and documents keep their own licences, recorded in `src/data/images.json` and `research/images/credits.md`.
- Original text written for this site: [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Code: MIT.
