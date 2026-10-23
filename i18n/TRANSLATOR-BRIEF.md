# Brief for translating a chapter of Writings and Speeches into Marathi

You translate chapters of Dr. B. R. Ambedkar's *Writings and Speeches* (official Government of India edition) into Marathi for drbhimraoambedkar.info. Project folder: `/Users/sidhantsardar/Website Work/Dr B R Ambedkar` (quote paths: they contain spaces).

**Top priority, from the site owner:** the Marathi must be meaningful and easy for ordinary readers, but must **never change the meaning or intent** of the original English sentences and paragraphs. Understand his argument and style first, then translate. Keep his force, irony and harshness exactly — never soften.

## Steps for each chapter you are given (`<volume-id> <slug>`)

1. Read `i18n/marathi-style-guide.md` once, completely, and follow it (fidelity rules, glossary, Kruti Dev note, section marks).
2. Read the whole source chapter: `archive/translate/in/<volume-id>/<slug>.json` — `{ vol, slug, title, pages: [{ p, blocks: [{ type, text }] }] }`. Types: `h` heading, `p` paragraph, `fn` footnote. Pages with no blocks stay, with an empty list.
3. Write the translation in pieces of about 3 consecutive pages, in order:
   `archive/translate/out/<volume-id>/<slug>.part1.json`, `.part2.json`, …
   Each piece: `{ "pages": [ { "p": <same>, "blocks": [ { "type": <same>, "text": "<Marathi>" } ] } ] }`.
   The **last** piece also has `"title"` (Marathi chapter title) and `"summary"` (3–5 plain Marathi sentences saying what the chapter says; no opinions, nothing not in the text).
4. Rules: the same pages, the same number of blocks per page, the same types, in the same order. Translate every block completely — never merge, split, drop, summarise or add. A block that starts or ends mid-sentence (page or chapter break) is translated so that it joins naturally with its neighbour. Blocks that are only names, numbers, references or table rows may stay as they are. Valid JSON: use “ ” inside strings, never unescaped straight double quotes.
5. Special material:
   - **Letters and documents:** keep salutations, dates, signatures (names in Devanagari).
   - **Legislative debates** (e.g. Bombay Legislative Council, Constituent Assembly): keep every speaker label ("The Honourable the President:", "Dr. B. R. Ambedkar:") in Marathi form (e.g. "माननीय अध्यक्ष:", "डॉ. बी. आर. आंबेडकर:"), keep "(Interruption)", "Hear, hear" etc. as मध्येच अडथळा, “ऐका, ऐका”.
   - **Tables, statistics, lists of names:** keep numbers exactly; translate headings and words.
   - **Dictionary or grammar entries (Vol. 16, Pali):** keep the Pali headword and any Devanagari exactly; translate only the English glosses into Marathi.
   - **Text that is already Marathi or Hindi in the source:** keep it exactly as printed.
   - **Garbled Kruti Dev text** (Latin gibberish standing for Devanagari): convert only when certain; otherwise keep it and mark [मूळ मजकूर अस्पष्ट].
6. Run from the project folder: `node scripts/translate-library.mjs assemble <volume-id> <slug>` and fix every reported problem until it prints ✓.
7. Do not edit any other file. Do not run git or npm. Do not run `merge`.

## Final report (short)

The ✓ line for each chapter, then a list of passages for a human reviewer: garbled source text, unclear meaning, and every Kruti Dev conversion — quote the English and give your Marathi choice.
