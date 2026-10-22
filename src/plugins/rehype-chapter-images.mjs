// Places photographs between the sections of a life chapter or theme page.
// Images come from src/data/images.json, matched by tag = the chapter slug.
// The first matching image is the page's hero (rendered by the page), so it is skipped here.
import { imagesFor, imageSources, credit } from '../lib/images-core.mjs';

const h = (tagName, properties = {}, children = []) => ({ type: 'element', tagName, properties, children });
const t = (value) => ({ type: 'text', value });

function figure(img) {
  const { src, srcset, width, height } = imageSources(img);
  const pictureKids = [];
  if (srcset) pictureKids.push(h('source', { type: 'image/webp', srcSet: srcset, sizes: '(min-width: 900px) 760px, 100vw' }));
  pictureKids.push(h('img', { src, alt: img.caption || img.title || '', loading: 'lazy', decoding: 'async', width, height }));
  const creditKids = [t(credit(img) + ' · ')];
  if (img.sourceUrl) creditKids.push(h('a', { href: img.sourceUrl, target: '_blank', rel: ['noopener', 'noreferrer'] }, [t(img.sourceName || 'Source')]));
  return h('figure', { className: ['story-figure'] }, [
    h('picture', {}, pictureKids),
    h('figcaption', {}, [t(img.caption || img.title || ''), h('span', { className: ['credit'] }, creditKids)]),
  ]);
}

export default function rehypeChapterImages() {
  return (tree, file) => {
    const p = String(file.path || file.history?.[0] || '');
    const m = p.match(/src[\\/]content[\\/](life|themes)[\\/](?:\d+-)?([^\\/]+)\.md$/);
    if (!m) return;
    const pool = imagesFor(m[2]).slice(1);
    if (!pool.length) return;

    // Insert one figure before every second h2 (after the first), skipping the closing reference sections.
    const out = [];
    let h2 = 0;
    for (const node of tree.children) {
      if (node.type === 'element' && node.tagName === 'h2') {
        const label = (node.children || []).map((c) => c.value || '').join('').toLowerCase();
        const closing = /sources disagree|read more/.test(label);
        h2 += 1;
        if (!closing && h2 > 1 && h2 % 2 === 0 && pool.length) out.push(figure(pool.shift()));
      }
      out.push(node);
    }
    tree.children = out;
  };
}
