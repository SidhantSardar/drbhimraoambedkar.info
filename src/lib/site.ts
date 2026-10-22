export const SITE = {
  name: 'Dr. Bhimrao Ambedkar',
  domain: 'drbhimraoambedkar.info',
  title: 'Dr. B. R. Ambedkar — His Life and Work, Together',
  description:
    'The life and work of Dr. Bhimrao Ramji Ambedkar — his struggle, education, movements, the Constitution of India, and every book and speech — brought together from authoritative sources and explained simply. Free for everyone.',
  repo: 'SidhantSardar/drbhimraoambedkar.info',
  repoUrl: 'https://github.com/SidhantSardar/drbhimraoambedkar.info',
};

/** Comments are stored in GitHub Discussions through giscus (https://giscus.app). */
export const GISCUS = {
  repo: SITE.repo,
  repoId: 'R_kgDOVTJb5w',
  // "Announcements": only maintainers and the giscus app can open new threads; anyone can reply.
  category: 'Announcements',
  categoryId: 'DIC_kwDOVTJb584DJUFa',
};

/** Where the AI answer service lives. On GitHub Pages there is none, so the page falls back to search results. */
export const ASK_ENDPOINT: string = import.meta.env.PUBLIC_ASK_ENDPOINT || '';

/** Prefix a site path with the deploy base (e.g. /drbhimraoambedkar.info/ on GitHub Pages). */
export function url(path = '/'): string {
  const base = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : import.meta.env.BASE_URL + '/';
  if (/^https?:\/\//.test(path)) return path;
  return base + path.replace(/^\//, '');
}

export const NAV = [
  { href: '/life/', label: 'Life Story', hint: 'His whole life in 13 chapters' },
  { href: '/timeline/', label: 'Timeline', hint: 'Every key date, 1891–today' },
  { href: '/constitution/', label: 'Constitution', hint: 'The flagship: his greatest work' },
  { href: '/works/', label: 'Works', hint: 'Books, speeches, papers, newspapers' },
  { href: '/ask/', label: 'Ask the Archive', hint: 'Search his writings, with page links' },
  { href: '/gallery/', label: 'Gallery', hint: 'Photographs with full credits' },
  { href: '/blog/', label: 'Blog & News', hint: 'Articles, discussion and news' },
];

export const CHAPTER_COUNT_LABEL = 'chapters';

export function formatDate(d: string): string {
  // Accepts YYYY, YYYY-MM or YYYY-MM-DD and prints a friendly date.
  const m = String(d).match(/^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?/);
  if (!m) return String(d);
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const [, y, mo, da] = m;
  if (da) return `${Number(da)} ${months[Number(mo) - 1]} ${y}`;
  if (mo) return `${months[Number(mo) - 1]} ${y}`;
  return y;
}
