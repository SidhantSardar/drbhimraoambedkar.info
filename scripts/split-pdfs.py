# Splits each Writings and Speeches PDF (archive/baws/ from scripts/download-baws.sh; archive/baws-ia/ for
# volumes 14 and 16, whose text was taken from the archive.org copies listed in library/volumes.json)
# into one small PDF per reader page, so the reader can show the original pages from this site.
#   python3 scripts/split-pdfs.py            -> public/pdf/<volume>/<slug>.pdf
# The pages are copied unchanged; only the page range differs from the official file.
import json, os, sys
import pypdf

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
vols = json.load(open(os.path.join(ROOT, 'library/volumes.json')))
toc = json.load(open(os.path.join(ROOT, 'library/toc.json')))
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
    n = 0
    for c in toc.get(v['id'], []):
        for p in c['parts']:
            w = pypdf.PdfWriter()
            for i in range(p['start'] - 1, min(p['end'], len(reader.pages))):
                w.add_page(reader.pages[i])
            w.compress_identical_objects()
            f = os.path.join(out, p['slug'] + '.pdf')
            with open(f, 'wb') as fh:
                w.write(fh)
            total += os.path.getsize(f); n += 1
    print(v['id'], n, 'files')
print('total MB', round(total / 1e6, 1))
