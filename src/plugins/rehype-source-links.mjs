// Editorial source notes.
// Markdown links written as [source: Name](url) become small numbered notes in the text, and a numbered
// "Sources" list is added at the end of the page. A source that is a page of Writings and Speeches links
// to that page in this website's library (readers stay on the site), with the official PDF alongside.
// Every other external link opens safely in a new tab.
import { visit } from 'unist-util-visit';
import { libraryPathFor, hostOf } from '../lib/sources.mjs';
import { withBase } from '../lib/images-core.mjs';

const textOf = (node) => (node.type === 'text' ? node.value : (node.children || []).map(textOf).join(''));
const h = (tagName, properties = {}, children = []) => ({ type: 'element', tagName, properties, children });
const t = (value) => ({ type: 'text', value });

export default function rehypeSourceLinks() {
  return (tree) => {
    const refs = []; // { name, href, uses }
    visit(tree, 'element', (node, index, parent) => {
      if (node.tagName !== 'a' || !parent) return;
      const href = String(node.properties?.href || '');
      const m = textOf(node).trim().match(/^source:\s*(.+)$/i);
      if (m) {
        let ref = refs.find((r) => r.href === href);
        if (!ref) { ref = { name: m[1], href, uses: 0 }; refs.push(ref); }
        const n = refs.indexOf(ref) + 1;
        ref.uses += 1;
        parent.children[index] = h('sup', { className: ['fn'] }, [
          h('a', { href: `#ref-${n}`, id: `cite-${n}-${ref.uses}`, title: ref.name, 'aria-label': `Source ${n}: ${ref.name}` }, [t(String(n))]),
        ]);
        return;
      }
      if (/^https?:\/\//.test(href)) {
        node.properties.target = '_blank';
        node.properties.rel = ['noopener', 'noreferrer'];
      }
    });
    if (!refs.length) return;

    const items = refs.map((r, i) => {
      const n = i + 1;
      const internal = libraryPathFor(r.href);
      const links = [];
      if (internal) {
        links.push(h('a', { href: withBase(internal), className: ['ref-read'] }, [t('Read this page on the site')]));
        links.push(t(' · '));
        links.push(h('a', { href: r.href, target: '_blank', rel: ['noopener', 'noreferrer'] }, [t('Official PDF ↗')]));
      } else if (/^https?:\/\//.test(r.href)) {
        links.push(h('a', { href: r.href, target: '_blank', rel: ['noopener', 'noreferrer'] }, [t(`${hostOf(r.href)} ↗`)]));
      }
      return h('li', { id: `ref-${n}` }, [
        h('span', { className: ['ref-name'] }, [t(r.name)]),
        t(' '),
        h('span', { className: ['ref-links'] }, links),
        t(' '),
        h('a', { href: `#cite-${n}-1`, className: ['ref-back'], 'aria-label': 'Back to the text' }, [t('↩')]),
      ]);
    });
    tree.children.push(
      h('section', { className: ['references'], 'aria-labelledby': 'sources-h' }, [
        h('h2', { id: 'sources-h' }, [t('Sources')]),
        h('ol', {}, items),
      ]),
    );
  };
}
