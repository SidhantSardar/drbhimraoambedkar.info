export const SITE = {
  name: 'Dr. Bhimrao Ambedkar',
  domain: 'drbhimraoambedkar.info',
  title: 'Dr. B. R. Ambedkar — His Life and Work, Together',
  description:
    'The life and work of Dr. Bhimrao Ramji Ambedkar — his struggle, education, movements, the Constitution of India, and every book and speech — brought together from authoritative sources and explained simply. Free for everyone.',
  mrTitle: 'डॉ. बाबासाहेब आंबेडकर — जीवन आणि कार्य, एकाच ठिकाणी',
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

/** Prefix a site path with the deploy base (e.g. /drbhimraoambedkar.info/ on GitHub Pages). */
export function url(path = '/'): string {
  const base = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : import.meta.env.BASE_URL + '/';
  if (/^https?:\/\//.test(path)) return path;
  return base + path.replace(/^\//, '');
}

export type NavItem = { href: string; label: string; hint?: string; mr: string; mrHint?: string; enOnly?: boolean };
export type NavGroup = { label: string; mr: string; href?: string; items?: NavItem[] };

export const NAV: NavGroup[] = [
  { label: 'News & Blog', mr: 'बातम्या आणि ब्लॉग', items: [
    { href: '/news/', label: 'Latest news', hint: 'Today\'s stories, explained with sources', mr: 'ताज्या बातम्या', mrHint: 'आजच्या घडामोडी, संदर्भांसह' },
    { href: '/blog/', label: 'Blog', hint: 'Articles and discussion', mr: 'ब्लॉग', mrHint: 'लेख आणि चर्चा' },
  ] },
  { label: 'Life', mr: 'जीवन', items: [
    { href: '/life/', label: 'Life story', hint: 'His whole life in 13 chapters', mr: 'जीवनकथा', mrHint: 'संपूर्ण जीवन 13 प्रकरणांत' },
    { href: '/timeline/', label: 'Timeline', hint: 'Every key date, with sources', mr: 'कालपट', mrHint: 'प्रत्येक महत्त्वाची तारीख, संदर्भांसह' },
    { href: '/education/', label: 'Educational journey', hint: 'From Satara to Columbia and LSE', mr: 'शैक्षणिक प्रवास', mrHint: 'सातारा ते कोलंबिया आणि लंडन' },
    { href: '/themes/personal-life/', label: 'Family and home', hint: 'Ramabai, Savita, Rajgriha', mr: 'कुटुंब आणि घर', mrHint: 'रमाबाई, सविता, राजगृह' },
    { href: '/themes/inspirations/', label: 'Inspirations', hint: 'Buddha, Kabir, Phule', mr: 'प्रेरणास्थाने', mrHint: 'बुद्ध, कबीर, फुले' },
    { href: '/themes/flag-and-symbols/', label: 'The blue flag & symbols', hint: 'Why blue, Jai Bhim, the Chakra', mr: 'निळा ध्वज आणि प्रतीके', mrHint: 'निळा रंग, जय भीम, चक्र' },
  ] },
  { label: 'Works', mr: 'साहित्य', items: [
    { href: '/works/', label: 'All works', hint: 'Books, papers, essays, statements', mr: 'सर्व साहित्य', mrHint: 'ग्रंथ, शोधनिबंध, लेख, निवेदने' },
    { href: '/works/speeches/', label: 'Speeches', hint: 'His major speeches', mr: 'भाषणे', mrHint: 'त्यांची महत्त्वाची भाषणे' },
    { href: '/library/', label: 'Writings & Speeches', hint: 'All 17 volumes, page by page', mr: 'लेखन आणि भाषणे', mrHint: 'सर्व 17 खंड, पान न् पान' },
    { href: '/ask/', label: 'Ask the archive', hint: 'Search everything he wrote', mr: 'संग्रहात शोधा', mrHint: 'त्यांनी लिहिलेले सर्व शोधा' },
    { href: '/chat/', label: 'Ask in his words', hint: 'A chat that answers with his own passages', mr: 'त्यांच्याच शब्दांत विचारा', mrHint: 'त्यांच्याच परिच्छेदांनी उत्तर देणारा संवाद', enOnly: true },
    { href: '/works/journals/', label: 'His newspapers', hint: 'Mooknayak, Bahishkrit Bharat, Janata', mr: 'त्यांची वृत्तपत्रे', mrHint: 'मूकनायक, बहिष्कृत भारत, जनता' },
  ] },
  { label: 'Constitution', mr: 'संविधान', href: '/constitution/' },
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
