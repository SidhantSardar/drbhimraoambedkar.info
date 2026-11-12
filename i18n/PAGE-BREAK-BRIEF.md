# Brief: where a published Marathi paragraph splits at a page break

Run every command from the project folder (quote its path: it contains spaces).

This brief is for Marathi chapters translated before page marks existed (Volumes 1–3, and Volume 4 chapters prepared before them). New translations carry the mark `[[page N]]` themselves and need none of this (`i18n/marathi-style-guide.md`, rule 8).

Steps for a volume: `node scripts/translate-library.mjs breaks <volume-id>` writes the worksheets to `archive/translate/breaks/<volume-id>/`; one person or agent answers each worksheet as below; `resplit <volume-id> --dry` until nothing is missing; then `resplit <volume-id>` (it writes nothing if a single word would change) and `align <volume-id>` to see what is left.

## Background
The site presents Dr. B. R. Ambedkar's *Writings and Speeches* page by page, in English and in a Marathi translation, and each page links to the same page of the official PDF. When a paragraph ran over a page break, the translation pipeline kept it whole on the page where it starts. So the Marathi for the start of the next page sits at the end of the previous page, and some pages show up empty. We are now moving the part of each such paragraph that belongs to the next page onto that page.

**You do not change the translation.** Not one word, letter, punctuation mark or space. The overriding rule of this project is that Dr. Ambedkar's meaning and wording in Marathi must never change. You only say *where* to cut each Marathi paragraph. A script then cuts there and moves the second part to the top of the next page, and it refuses to write anything if the run of words changes.

## Your worksheet
Each item in your worksheet looks like this:
- `### volume-1:31 — PDF p. 30 → p. 31` (the id is `volume-1:31`)
- the English at the end of the first page (last one or two sentences),
- the English at the start of the next page (first one or two sentences),
- the Marathi paragraph (or the part of it around the page break, with "…" where it is cut short), and how far through the English paragraph the page turns, as a percentage (a rough guide only).

The worksheet is large: read it with the Read tool in pieces (offset/limit), a few items at a time.

## How to choose the cut
1. Find the Marathi sentence that translates the English sentence running over the page break.
2. Cut between two Marathi words so that the Marathi before the cut renders the English before the page break, and the Marathi after the cut renders the English after it.
3. If the Marathi keeps the English order at that point, cut exactly at the matching point, even mid-sentence. `"exact": true`.
4. Marathi word order often differs (verb at the end, relative clauses before the noun, clauses turned around). When there is no exact point, cut at the nearest natural boundary inside that sentence (after a comma, before a conjunction such as किंवा / आणि / पण / कारण / म्हणून, at a clause edge) that keeps as much as possible of each page's meaning on its own page. Each part should read as the start or the end of a sentence that continues on the other page. This is the style guide's rule for a sentence split across chapters (i18n/marathi-style-guide.md, rule 8), applied to pages. Then set `"exact": false` and write a short note in English saying which words ended up on the other page from their English (for example: "'by a law-giver as a divine dispensation' comes before 'docile population' in the Marathi, so it stays on p. 30").
5. Never cut inside a word, a name, a number, a reference, or a short quotation. Never leave the part for the next page empty, and leave the first part empty only as in 8.
6. Front matter, lists, tables and addresses: match the items line by line.
7. If the window does not contain the place you need (it is cut short with "…"), see the whole paragraph with
   `node scripts/translate-library.mjs breaks <volume-id> --show <next-page-number>`
8. If the whole Marathi paragraph belongs to the next page (the English before the break has no Marathi, e.g. a stray "zz" left by the scan), give nothing before the bar: `"at": "| <first words of the paragraph>"`.
9. If the item looks wrong (for example, the English after the page break is not in this Marathi paragraph at all), give `"at": null` and explain in the note. `resplit` leaves that paragraph where it is.

## Your answers
Write one JSON object per line to the answers file named at the top of your worksheet (`…answers.jsonl`). Append as you go, so no work is lost:
{"id":"volume-1:31","at":"<last 2–4 Marathi words before the cut> | <first 3–5 Marathi words after the cut>","exact":true,"note":""}
- Copy the words exactly from the worksheet, character for character, with any punctuation attached to them (commas, quotation marks, dashes). The separator is space, vertical bar, space: " | ".
- The words before and after the cut, taken together, must occur only once in that paragraph. If they occur twice, give more words.
- Write the file with your tools (Write for the first lines, then Edit or a heredoc to append). Valid JSON: escape any straight double quote inside a string as \".

## Checking your answers
Run `node scripts/translate-library.mjs resplit <volume-id> --dry` (always with --dry). It lists problems for answers that cannot be found or are ambiguous, and "check" warnings where your cut is far from where the English page turns. Other people are answering the other batches of the same volume at the same time: look only at lines about your own ids and your own file, and ignore "without an answer" for ids that are not in your worksheet. Fix every problem for your ids. For each "check" warning on your ids, look again: either correct the cut, or keep it and make sure the note explains why (e.g. the Marathi turned the sentence around). Repeat until your ids have no problems and every one of your items is answered.

## Do not
- Do not edit any file other than your answers file. Do not run `resplit` without `--dry`. No git, no npm.

## Report back (short)
How many items you answered, how many are `"exact": false`, any `"at": null` items with the reason, and any warning you kept on purpose.
