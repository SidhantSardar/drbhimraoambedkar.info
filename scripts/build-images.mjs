// Makes small WebP copies of every image in public/images/archive/ so phones download only what
// they need (480px / 960px / 1600px). Output: public/images/r/ (git-ignored, rebuilt in CI) and
// src/data/image-variants.json, which the pages use to write srcset attributes.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(root, 'public/images/archive');
const OUT = path.join(root, 'public/images/r');
const WIDTHS = [480, 960, 1600];
fs.mkdirSync(OUT, { recursive: true });

const variants = {};
const files = fs.existsSync(SRC) ? fs.readdirSync(SRC).filter((f) => /\.(jpe?g|png|webp|tiff?)$/i.test(f)) : [];
let made = 0;
for (const file of files) {
  const name = file.replace(/\.[^.]+$/, '');
  const input = path.join(SRC, file);
  let meta;
  try {
    meta = await sharp(input).metadata();
  } catch (err) {
    console.warn('skip', file, err.message);
    continue;
  }
  const widths = WIDTHS.filter((w, i) => w <= (meta.width || 0) || i === 0);
  for (const w of widths) {
    const out = path.join(OUT, `${name}-${w}.webp`);
    if (fs.existsSync(out) && fs.statSync(out).mtimeMs >= fs.statSync(input).mtimeMs) continue;
    await sharp(input).rotate().resize({ width: Math.min(w, meta.width || w), withoutEnlargement: true }).webp({ quality: 72 }).toFile(out);
    made++;
  }
  variants[name] = widths;
}
fs.writeFileSync(path.join(root, 'src/data/image-variants.json'), JSON.stringify(variants));
console.log(`images: ${files.length} sources, ${made} new variants`);
