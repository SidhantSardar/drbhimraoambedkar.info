// Languages of the site. English lives at /, Marathi at /mr/ (the same pages, translated).
// Pages read the language with getLang(Astro) and write both versions side by side: t('Read now', 'आता वाचा').
export const LANGS = ['en', 'mr'] as const;
export type Lang = (typeof LANGS)[number];
export const LANG_NAMES: Record<Lang, string> = { en: 'English', mr: 'मराठी' };

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

/** The language of a URL path (with or without the deploy base). */
export function langFromPath(pathname: string): Lang {
  const p = BASE && pathname.startsWith(BASE) ? pathname.slice(BASE.length) : pathname;
  return /^\/mr(\/|$)/.test(p) ? 'mr' : 'en';
}

export function getLang(astro: { locals: any; url: URL }): Lang {
  return (astro.locals?.lang as Lang) || langFromPath(astro.url.pathname);
}

/** Pick the text for the current language. */
export const translator = (lang: Lang) => (en: string, mr: string) => (lang === 'mr' ? mr : en);

/** The same page in another language (path includes the deploy base). */
export function pathIn(pathname: string, to: Lang): string {
  let p = BASE && pathname.startsWith(BASE) ? pathname.slice(BASE.length) : pathname;
  p = p.replace(/^\/mr(?=\/|$)/, '') || '/';
  return BASE + (to === 'mr' ? `/mr${p === '/' ? '/' : p}` : p);
}

// Site paths that are files or shared assets, which never get a language prefix.
const SHARED = /^(mr|_astro|images|pagefind|fonts|api)(\/|$)|\.[a-z0-9]{2,5}$/i;

/** Points every internal page link in a rendered Marathi page at its Marathi version. */
export function localizeLinks(html: string): string {
  const base = BASE + '/';
  return html.replace(/<a\b[^>]*>/g, (tag) => {
    if (tag.includes('data-lang-switch')) return tag;
    return tag.replace(/\shref="([^"]*)"/, (m, href: string) => {
      if (!href.startsWith(base)) return m;
      const rest = href.slice(base.length).replace(/[?#].*$/, '');
      if (SHARED.test(rest)) return m;
      return ` href="${base}mr/${href.slice(base.length)}"`;
    });
  });
}

const MONTHS_MR = ['जानेवारी', 'फेब्रुवारी', 'मार्च', 'एप्रिल', 'मे', 'जून', 'जुलै', 'ऑगस्ट', 'सप्टेंबर', 'ऑक्टोबर', 'नोव्हेंबर', 'डिसेंबर'];
const MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** Accepts YYYY, YYYY-MM or YYYY-MM-DD and prints a friendly date in the given language. */
export function formatDateIn(d: string, lang: Lang): string {
  const m = String(d).match(/^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?/);
  if (!m) return String(d);
  const months = lang === 'mr' ? MONTHS_MR : MONTHS_EN;
  const [, y, mo, da] = m;
  if (da) return `${Number(da)} ${months[Number(mo) - 1]} ${y}`;
  if (mo) return `${months[Number(mo) - 1]} ${y}`;
  return y;
}
