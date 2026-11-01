# Splits each Writings and Speeches PDF (archive/baws/ from scripts/download-baws.sh; archive/baws-ia/ for
# volumes 14 and 16, whose text was taken from the archive.org copies listed in library/volumes.json)
# into one small PDF per reader page, so the reader can show the original pages from this site.
#   .venv/bin/python -I scripts/split-pdfs.py [volume-16 ...]   -> public/pdf/<volume>/<slug>.pdf
# The pages are copied unchanged; only the page range differs from the official file.
# The page range of every file goes into library/pdf-pages.json. The build (scripts/check-pdfs.mjs) stops
# when library/toc.json no longer matches it, so run this again for any volume whose contents were rebuilt.
import json, os, sys
import pypdf

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
vols = json.load(open(os.path.join(ROOT, 'library/volumes.json')))
toc = json.load(open(os.path.join(ROOT, 'library/toc.json')))
MANIFEST = os.path.join(ROOT, 'library/pdf-pages.json')
split = json.load(open(MANIFEST)) if os.path.exists(MANIFEST) else {}
only = set(sys.argv[1:])
total = 0
for v in vols:
    if only and v['id'] not in only:
        continue
    name = v['sourceUrl'].rsplit('/', 1)[-1]
    # official MEA files in archive/baws; the archive.org copies (volumes 14 and 16) in archive/baws-ia
    src = next((f for f in (os.path.join(ROOT, d, name) for d in ('archive/baws', 'archive/baws-ia')) if os.path.exists(f)), '')
    if not src:
        print('missing', name); continue
    reader = pypdf.PdfReader(src)
    out = os.path.join(ROOT, 'public/pdf', v['id'])
    os.makedirs(out, exist_ok=True)
    ranges = {}
    for c in toc.get(v['id'], []):
        for p in c['parts']:
            w = pypdf.PdfWriter()
            for i in range(p['start'] - 1, min(p['end'], len(reader.pages))):
                w.add_page(reader.pages[i])
            w.compress_identical_objects()
            f = os.path.join(out, p['slug'] + '.pdf')
            with open(f, 'wb') as fh:
                w.write(fh)
            total += os.path.getsize(f)
            ranges[p['slug']] = {'start': p['start'], 'end': p['end']}
    # files of reader pages an earlier contents had, which nothing links to any more
    for f in sorted(os.listdir(out)):
        if f.endswith('.pdf') and f[:-4] not in ranges:
            os.remove(os.path.join(out, f)); print('removed', v['id'] + '/' + f)
    split[v['id']] = ranges
    print(v['id'], len(ranges), 'files')
with open(MANIFEST, 'w') as fh:
    json.dump({v['id']: split[v['id']] for v in vols if v['id'] in split}, fh, indent=1)
    fh.write('\n')
print('total MB', round(total / 1e6, 1))
