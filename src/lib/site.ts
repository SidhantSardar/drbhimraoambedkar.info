export const SITE = {
  name: 'Prabuddha Pathak',
  mrName: 'प्रबुद्ध पाठक',
  tagline: 'Dr. B. R. Ambedkar, in his own words',
  mrTagline: 'डॉ. बाबासाहेब आंबेडकर, त्यांच्याच शब्दांत',
  domain: 'prabuddhapathak.com',
  title: 'Prabuddha Pathak — Dr. B. R. Ambedkar, in his own words',
  description:
    'The life and work of Dr. Bhimrao Ramji Ambedkar — his struggle, education, movements, the Constitution of India, and every book and speech — brought together from authoritative sources and explained simply. Free for everyone.',
  mrTitle: 'प्रबुद्ध पाठक — डॉ. बाबासाहेब आंबेडकर, त्यांच्याच शब्दांत',
  mrDescription:
    'डॉ. भीमराव रामजी आंबेडकर यांचे जीवन आणि कार्य — त्यांचा संघर्ष, शिक्षण, चळवळी, भारताचे संविधान आणि त्यांचे प्रत्येक पुस्तक व भाषण — विश्वसनीय संदर्भांतून एकत्र आणि सोप्या भाषेत. सर्वांसाठी मोफत.',
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

/** Prefix a site path with the deploy base (/ on prabuddhapathak.com; a sub-path when deployed elsewhere). */
export function url(path = '/'): string {
  const base = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : import.meta.env.BASE_URL + '/';
  if (/^https?:\/\//.test(path)) return path;
  return base + path.replace(/^\//, '');
}

export type NavItem = { href: string; label: string; hint?: string; mr: string; mrHint?: string; enOnly?: boolean };
export type NavGroup = { label: string; mr: string; href?: string; items?: NavItem[] };

/** News, blog and the home page's live updates are hidden for now; set to true to bring them back. */
export const SHOW_NEWS = false;

export const NAV: NavGroup[] = [
  ...(SHOW_NEWS ? [{ label: 'News & Blog', mr: 'बातम्या आणि ब्लॉग', items: [
    { href: '/news/', label: 'Latest news', hint: 'Today\'s stories, explained with sources', mr: 'ताज्या बातम्या', mrHint: 'आजच्या घडामोडी, संदर्भांसह' },
    { href: '/blog/', label: 'Blog', hint: 'Articles and discussion', mr: 'ब्लॉग', mrHint: 'लेख आणि चर्चा' },
  ] }] : []),
  { label: 'Life story', mr: 'जीवनकथा', href: '/timeline/' },
  { label: 'Works', mr: 'साहित्य', items: [
    { href: '/library/', label: 'All volumes', hint: 'Writings & Speeches, 17 volumes, page by page', mr: 'सर्व खंड', mrHint: 'लेखन आणि भाषणे, 17 खंड, पान न् पान' },
    { href: '/works/speeches/', label: 'Speeches', hint: 'His major speeches, year by year', mr: 'भाषणे', mrHint: 'त्यांची महत्त्वाची भाषणे, वर्षानुसार' },
    { href: '/works/videos/', label: 'Videos', hint: 'Original film and sound of him', mr: 'व्हिडिओ', mrHint: 'त्यांची मूळ चित्रफीत आणि आवाज' },
    { href: '/works/journals/', label: 'His newspapers', hint: 'Mooknayak, Bahishkrit Bharat, Janata and more', mr: 'त्यांची वृत्तपत्रे', mrHint: 'मूकनायक, बहिष्कृत भारत, जनता आणि इतर' },
  ] },
  { label: 'Constitution', mr: 'संविधान', href: '/constitution/' },
  { label: 'Extra', mr: 'अधिक', items: [
    { href: '/themes/personal-life/', label: 'Family and home', hint: 'Ramabai, Savita, Rajgriha', mr: 'कुटुंब आणि घर', mrHint: 'रमाबाई, सविता, राजगृह' },
    { href: '/themes/inspirations/', label: 'Inspirations', hint: 'Buddha, Kabir, Phule', mr: 'प्रेरणास्थाने', mrHint: 'बुद्ध, कबीर, फुले' },
    { href: '/themes/flag-and-symbols/', label: 'The blue flag & symbols', hint: 'Why blue, Jai Bhim, the Chakra', mr: 'निळा ध्वज आणि प्रतीके', mrHint: 'निळा रंग, जय भीम, चक्र' },
  ] },
  { label: 'Gallery', mr: 'छायाचित्रे', href: '/gallery/' },
  { label: 'Resources', mr: 'संदर्भ साधने', href: '/resources/' },
  { label: 'About', mr: 'आमच्याविषयी', href: '/about/' },
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
