"""Cut the front cover out of each Writings and Speeches volume for the library's book cards.

Page 1 of every official MEA PDF holds the printed jacket (back cover, spine, front cover) as one image.
The front cover is the right-hand panel. Output: public/images/covers/<volume-id>.jpg

Run: .venv/bin/python -I scripts/build-covers.py
"""
import json
import logging
import os

from pypdf import PdfReader

logging.disable(logging.WARNING)
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public", "images", "covers")
os.makedirs(OUT, exist_ok=True)

# Front panel of the jacket, as fractions of the full wrap (measured on the 4950x3225 jackets).
FRONT = (0.539, 0.0115, 0.9475, 0.9877)

vols = json.load(open(os.path.join(ROOT, "library", "volumes.json")))
for v in vols:
    candidates = [os.path.join(ROOT, "archive", "baws", v["officialUrl"].rsplit("/", 1)[1]),
                  os.path.join(ROOT, "archive", "baws-ia", v["sourceUrl"].rsplit("/", 1)[1])]
    imgs = []
    for pdf in candidates:
        if not os.path.exists(pdf):
            continue
        try:
            imgs = list(PdfReader(pdf).pages[0].images)
        except Exception as exc:  # some scans use codecs we can't decode (JBIG2); try the next copy
            print("  skip", os.path.basename(pdf), type(exc).__name__)
            imgs = []
        if imgs:
            break
    if not imgs:
        print("no cover image for", v["id"])
        continue
    img = max(imgs, key=lambda i: i.image.size[0] * i.image.size[1]).image.convert("RGB")
    w, h = img.size
    if w / h > 1.3:  # a full wrap: keep the front panel only
        l, t, r, b = FRONT
        img = img.crop((int(w * l), int(h * t), int(w * r), int(h * b)))
    img.thumbnail((720, 1100))
    dest = os.path.join(OUT, v["id"] + ".jpg")
    img.save(dest, quality=82, optimize=True, progressive=True)
    print(f"{v['id']:<20} {img.size} {os.path.getsize(dest) // 1024} KB")
