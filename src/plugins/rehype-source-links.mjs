// Turns Markdown links written as [source: Name](url) into small inline source chips,
// and opens every external link in a new tab safely.
import { visit } from 'unist-util-visit';

const textOf = (node) =>
  node.type === 'text' ? node.value : (node.children || []).map(textOf).join('');

export default function rehypeSourceLinks() {
  return (tree) => {
    visit(tree, 'element', (node) => {
      if (node.tagName !== 'a') return;
      const href = String(node.properties?.href || '');
      const external = /^https?:\/\//.test(href);
      const text = textOf(node).trim();
      const m = text.match(/^source:\s*(.+)$/i);
      if (m) {
        node.properties.className = ['src'];
        node.properties.title = `Source: ${m[1]}`;
        node.children = [{ type: 'text', value: m[1] }];
      }
      if (external) {
        node.properties.target = '_blank';
        node.properties.rel = ['noopener', 'noreferrer'];
      }
    });
  };
}
