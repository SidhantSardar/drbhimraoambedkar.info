"""Extract page-by-page text from the English BAWS volumes in archive/baws/.

Writes archive/baws-text/<Volume>.jsonl — one JSON object per PDF page: {"page": N, "text": "..."}.
Page numbers are 1-based PDF page numbers, so a link to the original is <sourceUrl>#page=N.

Run: .venv/bin/python -I scripts/extract-baws.py
"""
import json
import os
import re
import sys

from pypdf import PdfReader

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "archive", "baws")
OUT = os.path.join(ROOT, "archive", "baws-text")
os.makedirs(OUT, exist_ok=True)


def clean(text):
    text = text.replace("­", "")
    text = re.sub(r"-\n(\w)", r"\1", text)          # join hyphenated line breaks
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


for name in sorted(os.listdir(SRC)):
    if not name.endswith(".pdf"):
        continue
    vol = name[:-4]
    dest = os.path.join(OUT, vol + ".jsonl")
    if os.path.exists(dest) and "--force" not in sys.argv:
        print("skip", vol)
        continue
    reader = PdfReader(os.path.join(SRC, name))
    chars = 0
    with open(dest + ".part", "w", encoding="utf-8") as fh:
        for i, page in enumerate(reader.pages, start=1):
            try:
                text = clean(page.extract_text() or "")
            except Exception as exc:  # a damaged page should not stop the volume
                text = ""
                print(f"  {vol} p{i}: {exc}", file=sys.stderr)
            chars += len(text)
            fh.write(json.dumps({"page": i, "text": text}, ensure_ascii=False) + "\n")
    os.replace(dest + ".part", dest)
    print(f"{vol}: {len(reader.pages)} pages, {chars:,} chars")
