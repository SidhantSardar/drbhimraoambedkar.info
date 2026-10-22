# Design inspiration: documentary, history and archive websites

Researched 22 October 2026 for **drbhimraoambedkar.info**.

- **Page weights** were measured in a desktop browser with the Performance API. Bytes from other domains may be under-counted, so treat them as minimums.
- **Blocked sites:** some sites refused automated reading. For those, the notes say so and rely on the source linked.

---

## Part 1: Sites studied (20)

**1. Gandhi Heritage Portal**
- **Does well:** Organised by format (Writings, Journals, Gallery). It has two chronologies, "Day-to-Day" and "Event", and event categories such as Fasts and Imprisonments. Every quote shows its *Collected Works* volume and page. The homepage is about 437 KB. [source: Gandhi Heritage Portal](https://www.gandhiheritageportal.org/)
- **Weakness:** About 10 top-level menu items.
- **Borrow:** A key-events timeline plus a detailed one. "BAWS Vol. X, p. Y" on every quote.

**2. Stanford King Institute**
- **Does well:** The Papers, an Encyclopedia of 280+ articles built from the Papers research, and a Chronology all link to each other. There are separate entry points for Kids, Teachers, Students and Researchers. [source: King Institute](https://kinginstitute.stanford.edu/)
- **Does well:** Notes use short forms such as *Papers* 3:485–487, linked to the document. [source: King Encyclopedia](https://kinginstitute.stanford.edu/encyclopedia/montgomery-bus-boycott)
- **Borrow:** Short citations ("BAWS 1:47") that open the exact PDF page, and audience entry points.

**3. Founders Online (US National Archives)**
- **Does well:** Every document has a permanent link and a "You Are Looking At" panel. A "CITE AS" line names the original printed volume and pages. [source: Founders Online](https://founders.archives.gov/documents/Madison/01-01-02-0001)
- **Borrow:** A "Cite this page" box on every chapter and work.

**4. USHMM Holocaust Encyclopedia**
- **Does well:** A "Key Facts" box and **subheadings written as questions**. Also Footnotes, Glossary, Critical Thinking Questions, Cite/Share/Print, "Last Edited", the author and a Feedback link.
- **Does well:** 42 of 45 images are lazy-loaded. The page is about 1 MB with 18 KB of JavaScript. [source: USHMM article](https://encyclopedia.ushmm.org/content/en/article/introduction-to-the-holocaust)
- **Does well:** The timeline uses five period tabs with "Highlighted events". [source: USHMM Timeline](https://encyclopedia.ushmm.org/content/en/timeline/holocaust)
- **Borrow:** Question headings, plus "Last edited · Author · Feedback" on every chapter.

**5. Anne Frank House**
- **Does well:** The life story is split into short sections ("The diary", "The Secret Annex", "The main characters", "The timeline") in 4 languages. [source: Anne Frank House](https://www.annefrank.org/en/anne-frank/)
- **Does well:** The timeline has year jump-links. Key-year headlines have smaller events beneath, with previous/next links. [source: Anne Frank timeline](https://www.annefrank.org/en/anne-frank/the-timeline/)
- **Borrow:** A **"People in Babasaheb's life"** page.

**6. Nelson Mandela Foundation**
- **Does well:** "Mandela Archives" groups Biography & Timeline, Genealogy, Exhibitions, Archives, Researcher resources and Education Hub. There is a search box and an "Advanced search". [source: Nelson Mandela Foundation](https://www.nelsonmandela.org/)
- **Does well:** Its Google Arts & Culture stories include "20 Things You Need to Know…" and "In His Own Words…". [source: Google Arts & Culture – NMF](https://artsandculture.google.com/partner/nelson-mandela-centre-of-memory)
- **Borrow:** Short "In his own words" and "10 things to know" explainers.

**7. Google Arts & Culture stories**
- **Does well:** The story editor advises at most 280 characters per slide and 10–15 slides. It offers full-screen and half-screen layouts and adds credits automatically. [source: Google – Create new story](https://support.google.com/culturalinstitute/partners/answer/10460872)
- **Borrow:** These limits for "Ambedkar in pictures" photo essays.

**8. NYT "Snow Fall" (2012)**
- **Does well:** Six parts that open on a looping video, then go straight into the text. It won a Pulitzer and a Peabody. [source: Nieman Storyboard](https://niemanstoryboard.org/?p=1009)
- **Weakness:** A critique quoted in the same article says the multimedia overshadowed the reading. (nytimes.com blocked fetch.)
- **Borrow:** A strong opening image per chapter, without the effects.

**9. The Pudding**
- **Does well:** Its guides say: plan for mobile first, don't hijack scrolling or use tap/swipe steppers, don't size scroll steps in `vh`, drop hover effects and keep scroll steps few. [source: Pudding – responsive scrollytelling](https://pudding.cool/process/responsive-scrollytelling/) [source: Pudding – implementing scrollytelling](https://pudding.cool/process/how-to-implement-scrollytelling)
- **Weakness:** Its story list uses the generic alt text "thumbnail for story". [source: The Pudding](https://pudding.cool/)
- **Borrow:** Scroll-driven graphics only where movement means something, such as a map of his journeys.

**10. Smithsonian NMAAHC "Searchable Museum"**
- **Does well:** Launched in 2021, it rebuilt the *Slavery and Freedom* gallery for the web with 3D models, video and podcasts. It is free, needs no registration, and is meant for people's homes and phones. [source: Blooloop](https://blooloop.com/museum/news/smithsonian-nmaahc-searchable-museum/) (the site itself blocked fetch)
- **Borrow:** Light photo "visits" to Mhow, Rajgruha, Deekshabhoomi and Chaityabhoomi.

**11. Library of Congress: Douglass Papers and "By the People"**
- **Does well:** Volunteers transcribe pages. Transcriptions become searchable only after review. Douglass Day 2024 was the program's busiest day: 7,500 pages were started and 1,500+ were completed. [source: LoC – The Signal](https://blogs.loc.gov/thesignal/2024/03/douglass-day-2024/) [source: LoC Manuscripts blog](https://blogs.loc.gov/manuscripts/2024/01/show-frederick-douglass-some-love-transcribe-his-letters-for-douglass-day-on-february-14/)
- **Borrow:** A 14 April transcription drive for scans of *Mooknayak* and *Bahishkrut Bharat*.

**12. Europeana**
- **Does well:** Rights information sits under every object. A "Can I use it?" filter sorts items into *Yes, with attribution*, *Yes, with restrictions* and *Only with permission*. [source: Europeana Pro (search summary; site blocked fetch)](https://pro.europeana.eu/post/new-features-for-europeana)
- **Borrow:** A plain reuse label on every item.

**13. 1947 Partition Archive**
- **Does well:** Menu: About, Collections, Archive Access, Get Involved, Learn. It invites "Share a story / Nominate a witness" and "Become a citizen historian". [source: 1947 Partition Archive](https://www.1947partitionarchive.org/)
- **Borrow:** A moderated "Share a memory", for example from people present at the 1956 Deeksha ceremony.

**14. Columbia, "Caste, Ambedkar, and Contemporary India"**
- **Does well:** Nine themed sections, including "Making of the Constitution". [source: Columbia exhibit](https://exhibitions.library.columbia.edu/exhibits/show/ambedkar)
- **Weakness:** Some links open only for Columbia members.
- **Borrow:** Link to its items, and label any link that needs a login.

**15. LSE, "Educate. Agitate. Organise."**
- **Does well:** One-column chronological story with full-width scans. Captions give dates and archive references (LANSBURY/22, CANNAN/717). It shows his whole student file, asks the public to identify an unsourced photo, and has "Help us grow this living exhibition" and a "Takedown policy". [source: LSE exhibition](https://www.lse.ac.uk/library/whats-on/online-exhibitions/educate-agitate-organise)
- **Borrow:** "Do you know this photo?" requests, plus a takedown policy.

**16. constitutionofindia.net**
- **Does well:** Read / Explore / Learn / Engage menu. It covers 395 Articles, the Constituent Assembly Debates by volume, framer cards, "Stages" 1–10 with dates, and search across the Website or the Database. [source: constitutionofindia.net](https://www.constitutionofindia.net/)
- **Borrow:** A "Stages" timeline. Link to their debates rather than copying them.

**17. Interactive Constitution (National Constitution Center)**
- **Does well:** Two scholars with different views write about each clause. Each has "Common Interpretation" and "Matters of Debate" essays, and "Share with Students". [source: Interactive Constitution](https://constitutioncenter.org/the-constitution)
- **Borrow:** Article pages that show the text, a plain summary, what Dr. Ambedkar said in the Assembly, and today's debates.

**18. Indian Culture Portal**
- **Does well:** 23 languages, each named in its own script. "Today in History". An Accessibility Statement.
- **Weakness:** The homepage measured **23 MB over 171 requests, with 156 images and none lazy-loaded**. [source: Indian Culture Portal](https://www.indianculture.gov.in/)
- **Borrow:** The language switcher and "On this day". Avoid the weight.

**19. Abhilekh Patal (National Archives of India)**
- **Does well:** Huge digitised holdings, about 7 million records [source: Vajiram & Ravi](https://vajiramandravi.com/current-affairs/what-is-abhilekh-patal/). A login is needed for full files [source: Abhilekh Patal FAQ (search summary)](https://abhilekh-patal.in/Shared/Home/Faq).
- **Weakness:** It loaded blank during this research. [source: Abhilekh Patal](https://www.abhilekh-patal.in/jspui/)
- **Borrow (lesson):** When citing it, also print the record identifier and a summary.

**20. AI "ask" tools**
- **Philadelphia's "Ask the Archives":** Answers with numbered citations. Hovering shows the document and page, which links to the original image. [source: PhilaGeoHistory help (search summary; bot check blocked fetch)](https://www.philageohistory.org/rdic-images/ask-the-archives-help.cfm/PhilaCong)
- **Washington Post's "Ask The Post AI":** Gives **no answer** when nothing passes a relevance threshold. [source: Editor & Publisher (search summary)](https://www.editorandpublisher.com/stories/the-washington-post-launches-ask-the-post-ai-a-new-search-experience,252887)
- **Borrow:** Both.

---

## Part 2: Recommendations

### 1. Information architecture and navigation

**Main navigation (6 items, the same on phone and desktop):**
1. **Life** — chapters, people, places.
2. **Works** — books, speeches, newspapers, letters, BAWS volumes.
3. **Constitution** — the flagship.
4. **Timeline**
5. **Archive** — Ask, photos, documents.
6. **Blog & News**

**Header and footer:**
- A **"Search or ask"** field is always visible. Phones show a search button and a **"Menu" button with a visible text label**.
- About, Contribute, Corrections and Contact go in the footer, in the same order on every page.

**Home page:**
- One-line introduction, then **"Start the story"** and **"Ask the archive"**.
- "On this day in Babasaheb's life", generated from `keyDates`.
- Student, Teacher and Researcher doors.
- Latest posts.

**URLs:** Permanent and readable, for example `/life/childhood/` and `/constitution/article-17/`. Hindi and Marathi later under `/hi/` and `/mr/`.

### 2. Long chapters on phones

**Chapter order:**
1. Title, period and reading time.
2. One opening image.
3. **"In short"** box.
4. Collapsed "In this chapter" contents (`<details>`).
5. **Question `##` headings every 200–300 words.**
6. "Where sources disagree".
7. Key dates.
8. Read more.
9. Last edited · Author · Cite · Suggest a correction.
10. A large **Next chapter** card.

**Rhythm:**
- One image or one verified quote about every two screens.
- "People in this chapter" chips.
- Pages of 1,500–2,500 words. Split longer chapters (Snow Fall used six parts).

**Rules:**
- Native scrolling only. No parallax, scroll-hijacking or autoplay.
- "Save for offline reading" through a service worker.

### 3. Inline sources

**How each source renders:**
- Turn each `[source: Name](url)` into a **small source chip**, such as "BAWS 1:47" or "Keer", in muted blue.
- Tapping it opens a **bottom sheet** on phones, or a popover on desktop, showing:
  - the source name
  - its type in words: *Primary*, *Archive*, *Scholarship* or *Journalism*
  - the page
  - **"Open original — PDF p. 60, 8 MB"**
- Without JavaScript, the chip is a plain link.

**Supporting features:**
- List all sources at the end, grouped by type.
- A "Cite this page" box.
- A "Sources: On / Quiet" toggle. "Quiet" reduces chips to dots. On small screens, notes appear only when tapped [source: Tufte CSS](https://edwardtufte.github.io/tufte-css/).
- Always show PDF size, and link to the page with `#page=N`.
- Give chips accessible names such as "Source 3: Pritchett timeline, external site".

### 4. Mobile timelines

**Layout:**
- **One vertical column with a year rail on the left.** No zig-zag, no horizontal drag strips.
- A sticky header shows the current year.

**Periods and filters:**
- Seven period chips: 1891–1912; 1913–1923; 1924–1935; 1936–1946; 1946–1951; 1952–1956; After 1956.
- A "Jump to year" `<select>`.
- A **"Key events / All events"** switch.
- Theme filters: Education, Protest, Writing, Politics, Constitution, Buddhism, Family.

**Each event:**
- An honest date: "April 1891"; "c."; "sources differ".
- A title and 1–2 lines.
- A source chip, a "Read in chapter" link and an optional 96 px thumbnail.

**How it is built:** Generated from `keyDates` as static HTML.

### 5. Search and "Ask the archive"

**Search box:** One field, "Search or ask a question", with three example questions.

**Step 1: keyword results first.** These are instant and use no AI. Use a static index such as Pagefind, which loads small index chunks: under 300 kB for a 10,000-page site [source: Pagefind](https://pagefind.app/). Each result card shows:
- a type badge (Speech, Book, Letter, Debate, Photo)
- the date, volume and page
- a 2-line excerpt with the matching words highlighted
- **"Read here"** and **"Open original (PDF p. 60)"**

**Step 2: the "Answer from the archive" panel.** It loads after the keyword results.
- At most 150 plain words, with numbered citations [1][2] after every sentence.
- **Quotes appear only if they exactly match a source passage, checked by machine.** This guards against fake quotes.
- Label: "AI summary — check the sources". Buttons: 👍/👎 and "Report a problem".
- **No-answer rule:** "We couldn't find this in our sources." Then show keyword results and "Suggest a source".
- Follow-up questions. Shareable answer links that keep the sources.

**Filters:** Type, Period, Volume and Language.

**Privacy:** No login. Searches are not stored against a person.

### 6. Images and performance budget

**Why it matters:**
- On a typical-to-slow phone and network (P75: about 7.2 Mbps, 94 ms latency), an HTML-first site should stay **under about 1.4 MiB, with 75 KiB of JavaScript**, to load in 3 seconds. India's network speeds vary enormously [source: Infrequently Noted](https://infrequently.org/2024/01/performance-inequality-gap-2024/).
- The median mobile page is 2,311 KB [source: Web Almanac 2024](https://almanac.httparchive.org/en/2024/page-weight).
- The "good" targets are LCP ≤ 2.5 s, INP ≤ 200 ms and CLS ≤ 0.1, measured at the 75th percentile [source: web.dev](https://web.dev/articles/vitals).

**Budget (compressed bytes):**

| Item | Chapter | Home |
|---|---|---|
| HTML + critical CSS | ≤ 60 KB | ≤ 40 KB |
| JavaScript | ≤ 30 KB | ≤ 30 KB |
| Fonts | ≤ 30 KB | ≤ 30 KB |
| First-screen images | ≤ 120 KB | ≤ 150 KB |
| **First view** | **≤ 250 KB** | **≤ 300 KB** |
| Whole page after scrolling | ≤ 1 MB | ≤ 800 KB |

Test every release on a budget Android phone over "Slow 4G".

**Images:**
- **AVIF, then WebP, then JPEG**, using `<picture>`. Widths of 360, 480, 720, 1080 and 1440, with accurate `sizes`.
- Size targets: thumbnail ≤ 15 KB, story image ≤ 70 KB, hero ≤ 120 KB. Greyscale scans.
- **Lazy-load every image except the first.** Give the first one `fetchpriority="high"`. Always set `width` and `height` [source: web.dev](https://web.dev/articles/browser-level-image-lazy-loading).
- Use a plain colour placeholder.

**Larger media:**
- Full-size zoom only on request.
- The YouTube player loads only after a tap.
- Honour `Save-Data`.

**Hosting:** A static site on a CDN with Indian edge servers, Brotli compression and long cache lifetimes.

### 7. Accessibility checklist (WCAG 2.2 AA)

**Visual:**
- [ ] Contrast: text ≥ 4.5:1, large text and control borders ≥ 3:1 (1.4.3, 1.4.11).
- [ ] Reflows at 320 px with no sideways scrolling (1.4.10). Works at 200% text zoom and with custom text spacing (1.4.4, 1.4.12).
- [ ] Respect `prefers-reduced-motion`. No carousels. No colour-only meaning.

**Interaction:**
- [ ] **Targets ≥ 24×24 px (2.5.8).** Aim for 44–48 px on buttons.
- [ ] **Focus is never hidden under the sticky header (2.4.11).** Use `scroll-padding-top` and a 3 px focus ring.
- [ ] **Dragging always has a tap alternative (2.5.7).**
- [ ] **Help and correction links stay in a consistent place (3.2.6).**
- [ ] **No re-typing in forms (3.3.7).** No puzzle CAPTCHAs (3.3.8) [source: W3C – New in WCAG 2.2](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/).

**Structure and content:**
- [ ] Skip link, landmarks, one H1 per page, headings in order.
- [ ] `lang="hi"` or `lang="mr"` on Devanagari passages (3.1.2).
- [ ] Alt text gives who, where and when. Scans link to their transcriptions.
- [ ] Captions and transcripts for audio and video.
- [ ] Accessible names on chips and external links.
- [ ] Test with TalkBack, NVDA and axe.

### 8. Typography and colour

**Body text:**
- Use the system stack: `system-ui, Roboto, "Noto Sans", "Noto Sans Devanagari", sans-serif`.
- Android already ships Roboto, `NotoSansDevanagari-VF` and `NotoSerifDevanagari-VF` [source: AOSP fonts.xml](https://android.googlesource.com/platform/frameworks/base/+/refs/heads/main/data/fonts/fonts.xml). So **body text costs 0 KB, including future Hindi and Marathi.**

**Headings:**
- Self-host **Noto Serif** (Latin, about 14 KB per weight) and **Noto Serif Devanagari** (about 54 KB). Load the Devanagari font only on Hindi and Marathi pages, using `unicode-range`.
- Alternatives with Latin and Devanagari in one family: **Hind** (8 + 37 KB) or **Mukta** (13 + 60 KB). **Tiro Devanagari Marathi** offers a Marathi-specific style.
- These sizes were measured from the Google Fonts WOFF2 files.
- At most 2 weights, `font-display: swap`.

**Sizes and spacing:**
- Body 18px with line-height 1.6. Devanagari 1.75, so vowel marks don't collide.
- Lines of 60–72 characters.

**Colour background:**
- The Ashoka Chakra is navy blue in the Flag Code; #000080 is the usual approximation [source: Flag Code of India, cl. 1.1 (Punjab Police copy)](https://barnala.punjabpolice.gov.in/Flag-Code) [source: Wikipedia – Flag of India](https://en.wikipedia.org/wiki/Flag_of_India).
- The Scheduled Castes Federation (1942) flew a blue flag with the Chakra [source: The Week](https://www.theweek.in/news/india/2018/04/15/how-colour-blue-got-associated-with-ambedkar.html).

**Palette.** Contrast ratios are computed with the WCAG formula against white unless noted.

| Token | Hex | Use | Contrast |
|---|---|---|---|
| Chakra Navy | `#000080` | logo, footer | 16.01:1 |
| Ink Navy | `#0B2A6F` | header, headings | 13.33:1 (white text on it 13.33) |
| **Ambedkar Blue** | `#1240AB` | links, buttons | 8.95:1; 8.41 on Paper; 7.74 on Tint |
| Flag Blue | `#1F5AD6` | hover, large accents | 6.01:1 |
| Bright Blue | `#2563EB` | icons | 5.17:1 |
| Paper / Tint | `#F5F8FD` / `#E8EFFA` | background / boxes | — |
| Text | `#1A1F2B` | body | 16.47:1 |
| Muted | `#4A5468` | captions | 7.61:1 (7.15 on Paper) |
| Control border | `#6B7A99` | inputs | 4.31:1 |
| Gold focus | `#FFC233` | focus ring on navy only | 8.26:1 on `#0B2A6F`; fails on white (1.61) |
| Error / Success | `#B42318` / `#0E7A43` | messages | 6.57 / 5.41 |
| Dark mode | bg `#0B1424`, text `#E6ECF7`, link `#8FB4FF` | | 15.53 / 8.90 |

Underline links.

### 9. Community features

**Comments:**
- Allow comments on **Blog & News only**. Chapters get "Was this helpful?" and "Suggest a correction" instead.
- Ask for name and a hidden email.
- Hold first comments for approval, and show short rules (no slurs, no attacks on any caste or religion).
- Allow one level of replies and a "Report" button.
- Block spam with a honeypot field and rate limits, not CAPTCHAs.

**Corrections:**
- A form asking what is wrong, with a **required source link**.
- Publish a public **Corrections log**, and show "Last edited" on each page.

**Contributions:**
- "Share a memory", "Do you know this photo?" and "Suggest a source".
- **Transcription drives with second-volunteer review.**
- Record consent and a licence (CC BY) for each submission, with a **takedown policy**.

**Reuse labels** on every item: *Free with credit*, *With conditions*, *Ask permission*.

### 10. What to avoid

**Performance:**
- 23 MB homepages.
- Unlabelled 10–30 MB PDFs.

**Design and interaction:**
- Parallax, scroll-hijacking, autoplay, and "Snow Fall" effects that put reading second.
- Carousels and horizontal drag timelines.
- Menus with 9–10 top-level items, and icon-only menus.
- Light-grey text and text inside images.

**Content and trust:**
- Quote cards without a verified BAWS or Constituent Assembly Debates citation. Generic alt text.
- Login-only links without a warning.
- Unlabelled machine translation. Hindi and Marathi must be human-reviewed.
- Photos with unclear rights, since some archives restrict reuse strictly [source: King Institute](https://kinginstitute.stanford.edu/).
- Worship language or devotional clutter.
- Heavy third-party widgets, trackers and cookie walls.
