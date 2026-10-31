// The Ambedkarite movement directory: people spreading Dr. Ambedkar's ideas, from global to local.
// Data in src/data/people.json; every story sentence carries a [n] marker pointing into `sources`.
// `image` (a path under public/ or a licensed URL, with `imageCredit`) and `links` (social media) are filled in by hand.
import { loadJSON } from './data';

export type Level = 'global' | 'national' | 'regional' | 'local';
export type Person = {
  name: string; nameLocal: string; level: Level; place: string; country: string; field: string;
  status: string; since: string; work: string; story: string; silent: boolean;
  sources: { title: string; url: string }[];
  image: string; imageCredit: string; links: { label: string; url: string }[];
};

export const LEVELS: Level[] = ['global', 'national', 'regional', 'local'];
export const LEVEL_LABEL: Record<Level, { en: string; mr: string; blurbEn: string; blurbMr: string }> = {
  global: { en: 'Global', mr: 'जागतिक', blurbEn: 'Outside India: diaspora communities, campaigns against caste discrimination abroad, scholars, and people in other countries who took up his ideas.', blurbMr: 'भारताबाहेर: परदेशातील समुदाय, परदेशातील जातिभेदाविरुद्धच्या मोहिमा, अभ्यासक आणि त्यांचे विचार स्वीकारलेले इतर देशांतील लोक.' },
  national: { en: 'National', mr: 'राष्ट्रीय', blurbEn: 'People whose work reaches all of India: rights campaigns, scholarship, publishing, film and music, enterprise.', blurbMr: 'संपूर्ण भारतापर्यंत पोहोचणारे कार्य: हक्कांच्या मोहिमा, संशोधन, प्रकाशन, चित्रपट आणि संगीत, उद्योग.' },
  regional: { en: 'Regional', mr: 'प्रादेशिक', blurbEn: 'People rooted in one state or language: poets, singers, lawyers, teachers, publishers and organisers.', blurbMr: 'एका राज्यात किंवा भाषेत रुजलेले: कवी, गायक, वकील, शिक्षक, प्रकाशक आणि संघटक.' },
  local: { en: 'Local', mr: 'स्थानिक', blurbEn: 'Village and neighbourhood work: reading rooms, free classes, study circles, and people living the freedom he fought for.', blurbMr: 'गाव आणि वस्ती पातळीवरील कार्य: वाचनालये, मोफत वर्ग, अभ्यास मंडळे आणि त्यांनी मिळवून दिलेले स्वातंत्र्य जगणारे लोक.' },
};

export const people = (): Person[] => loadJSON<Person[]>('people', []);

// The site shows two groups: people working in India (national, regional, local) and the rest of the world.
export const isIndian = (p: Person) => p.level !== 'global';
// The Indian state a person works in, from the last part of `place`.
const STATE_ALIAS: Record<string, string> = { 'New Delhi': 'Delhi', 'Western Odisha': 'Odisha' };
export const ALL_INDIA = 'All India';
export function stateOf(p: Person): string {
  const parts = p.place.split(',').map((s) => s.trim()).filter(Boolean);
  if (parts.at(-1) === 'India') parts.pop();
  const last = parts.at(-1) || '';
  if (!last || /^India\b/.test(last)) return ALL_INDIA;
  return STATE_ALIAS[last] || last;
}

export const initials = (name: string) =>
  name.replace(/\(.*?\)/g, '').replace(/\b(Dr|Bhadant|Thol|Shahir)\.?\s+/g, '').split(/\s+/).filter((w) => /^[A-Za-z]/.test(w))
    .slice(0, 2).map((w) => w[0].toUpperCase()).join('');
