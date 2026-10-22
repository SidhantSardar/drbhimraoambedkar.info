#!/usr/bin/env bash
# Downloads "Dr. Babasaheb Ambedkar: Writings and Speeches" (BAWS) — English and Hindi volumes —
# from the Ministry of External Affairs, Government of India (https://www.mea.gov.in/books-writings-of-ambedkar).
# Files go to archive/baws/ (English) and archive/baws-hindi/ (Hindi). These folders are git-ignored
# because the PDFs are large; scripts/baws-manifest.json records what was downloaded.
set -euo pipefail
cd "$(dirname "$0")/.."

BASE="https://www.mea.gov.in/images/CPV"
EN=(Volume1 Volume2 Volume3 Volume4 Volume5 Volume6 Volume7 Volume8 Volume9 Volume10 Volume11 Volume12 Volume13
    Volume14_Part_I Volume14_Part_II Volume15 Volume16 Volume17_Part_I Volume17_Part_II Volume17_Part_III)

mkdir -p archive/baws archive/baws-hindi

fetch() { # url out
  if [[ -s "$2" ]]; then echo "skip $2"; return; fi
  echo "get  $2"
  curl -sSL --fail --retry 3 --max-time 600 -A "Mozilla/5.0 (drbhimraoambedkar.info archive)" "$1" -o "$2.part" && mv "$2.part" "$2"
}

for v in "${EN[@]}"; do fetch "$BASE/$v.pdf" "archive/baws/$v.pdf"; done
if [[ "${1:-}" != "--english-only" ]]; then
  for i in $(seq 1 40); do fetch "$BASE/VolumeH$i.pdf" "archive/baws-hindi/VolumeH$i.pdf"; done
fi

.venv/bin/python -I - <<'PY'
import hashlib, json, os, datetime
out = []
for folder, lang in (("archive/baws", "English"), ("archive/baws-hindi", "Hindi")):
    if not os.path.isdir(folder): continue
    for name in sorted(os.listdir(folder)):
        if not name.endswith(".pdf"): continue
        p = os.path.join(folder, name)
        h = hashlib.sha256(open(p, "rb").read()).hexdigest()
        out.append({"file": p, "language": lang, "bytes": os.path.getsize(p), "sha256": h,
                    "sourceUrl": "https://www.mea.gov.in/images/CPV/" + name})
json.dump({"downloaded": datetime.date.today().isoformat(), "files": out}, open("scripts/baws-manifest.json", "w"), indent=1)
print("manifest:", len(out), "files")
PY
