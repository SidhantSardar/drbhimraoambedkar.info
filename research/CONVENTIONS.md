# Research & writing conventions

Everyone writing content for **drbhimraoambedkar.info** follows these rules. The website renders
the files in `src/content/` directly, so the format matters.

## 1. Accuracy comes first

- Prefer **primary and institutional sources**, in this order:
  1. Dr. Ambedkar's own words — *Dr. Babasaheb Ambedkar: Writings and Speeches* (BAWS) volumes,
     hosted as PDFs by the Ministry of External Affairs (e.g. `https://www.mea.gov.in/Images/CPV/Volume1.pdf`)
     and the Dr. Ambedkar Foundation (`https://drambedkarwritings.gov.in`), or the Internet Archive copies.
     Link to a specific page with `#page=N` where you can.
  2. Official records — Constituent Assembly Debates (Lok Sabha eParliament library, `https://eparlib.sansad.in`,
     or `https://www.constitutionofindia.net`), legislative.gov.in, PIB, National Archives (`https://www.abhilekh-patal.in`).
  3. Universities and archives — Columbia University (Frances Pritchett's timeline `https://franpritchett.com/00ambedkar/`,
     Columbia Libraries exhibitions), LSE Library, British Library.
  4. Respected biographies and scholarship (Dhananjay Keer, Eleanor Zelliot, Christophe Jaffrelot, Gail Omvedt,
     Ashok Gopal, Aakash Singh Rathore, Shashi Tharoor) — cite the book and, if possible, a link to it.
  5. Quality journalism and encyclopedias (Britannica, The Hindu, Indian Express, Scroll, The Wire, Forward Press).
  6. Wikipedia **only** as a pointer to a better source. Do not cite Wikipedia alone for a fact if you can avoid it.
- **Never invent a quote.** Many quotes attributed to Ambedkar online are fake or paraphrased. Only include a
  quote if you found it in a primary source (BAWS page, Constituent Assembly Debates record, or a reputable
  reproduction of the original text). Give the exact citation. If you can't verify it, leave it out.
- When sources disagree (dates, places, numbers), say so plainly and list each source. Do not silently pick one.
- If something is uncertain, say "according to X" rather than stating it as fact.

## 2. Source links go inline, next to the claim

The site owner wants to see exactly where every fact came from. Put a source link right after the
sentence or paragraph it supports, using **this exact pattern**:

```
He was born at Mhow on 14 April 1891 [source: Columbia University – Pritchett timeline](https://franpritchett.com/00ambedkar/timeline/1890s.html).
```

- The link text must start with `source: ` followed by a short, human-readable source name.
- One fact can carry two sources: `[source: A](url) [source: B](url)`.
- Use real URLs you actually opened. No made-up links.

## 3. Write so everyone can understand

- Plain English, roughly the level of a 14–15-year-old reader. Short sentences. Short paragraphs (2–4 sentences).
- Explain every term the first time: e.g. "the Mahar community — a community that the caste system treated as 'untouchable'".
- Warm and respectful, but factual. No exaggeration, no worship language, no attacks on any group.
  Describe injustice clearly and honestly.
- Use `##` subheadings every 200–300 words so readers can scan.
- Use "Dr. Ambedkar" or "Babasaheb" for the adult; "Bhim" or "Bhimrao" when describing him as a child.

## 4. File format for story chapters (`src/content/life/*.md` and `src/content/themes/*.md`)

```markdown
---
title: "Childhood"                       # short title
subtitle: "Mhow, Satara and the first lessons of untouchability"
order: 1                                 # position in the story
period: "1891–1904"
summary: "One or two simple sentences that describe the chapter."
inShort:                                 # 3–4 bullet takeaways for a box at the top
  - "Bhimrao was born on 14 April 1891 in Mhow, an army town in central India."
  - "..."
keyDates:                                # every important dated event in this chapter
  - date: "1891-04-14"                   # ISO date; use "1891-04" or "1891" if day/month unknown
    label: "Bhimrao is born in Mhow"
    source: "https://..."
imageIdeas:                              # optional; describe images that would fit, with Commons links if found
  - "Photo of the Mhow memorial – https://commons.wikimedia.org/wiki/File:..."
---

Intro paragraph(s)...

## Subheading

Story text with inline [source: Name](url) links...

> "Exact verified quote."
>
> — Dr. B. R. Ambedkar, *Work title* (year) [source: BAWS Vol. 1, p. 47](https://www.mea.gov.in/Images/CPV/Volume1.pdf#page=60)

## Where sources disagree

- ...

## Read more

- [Title](url) — one line on what it is.
```

## 5. Research notes (`research/notes/*.md`)

Each chapter also gets a fuller research dossier with every extra detail, date, name, place, archive
reference, conflicting account and source you found — even things that didn't fit the story. This is the
project's long-term knowledge base. Same inline `[source: …](url)` rule.

## 6. Folder ownership

Only write to the files you were assigned. Other people are writing other files at the same time.
