// The books as they were first printed: scans on the Internet Archive (made by the Digital Library of India),
// shown in the Archive's own page viewer. Each entry says which printing the scan is, so a later edition is
// never passed off as the first. Checked against each scan's title page, November 2026.
import { SHELF_BOOKS, bookOf, bookHref } from './books';
import { volLabelIn } from './library';
import { url } from './site';
import type { Lang } from '../i18n';

/** [English, Marathi] */
type Two = [string, string];
export type FirstEdition = {
  /** Page address: /library/first-editions/<slug>/ */
  slug: string;
  /** Id in works.json, for the text in the volumes. */
  work: string;
  /** Internet Archive identifier of the scan. */
  ia: string;
  /** Leaf of the scan where the title page is (n0 is the first image), so the viewer opens there. */
  start: number;
  title: Two;
  /** Year printed on the scanned copy's title page. */
  year: string;
  /** Which printing the scan is. */
  edition: Two;
  /** Publisher and place, as printed. */
  imprint: Two;
  /** Whose copy was scanned, when the Digital Library of India records it. */
  library?: Two;
  note?: Two;
  /** Title page in images.json. */
  cover: string;
};

export const FIRST_EDITIONS: FirstEdition[] = [
  {
    slug: 'problem-of-the-rupee', work: 'problem-of-the-rupee', ia: 'in.ernet.dli.2015.84521', start: 6, cover: 'cover-problem-of-the-rupee',
    title: ['The Problem of the Rupee', 'रुपयाचा प्रश्न'], year: '1923',
    edition: ['First edition, 1923', 'पहिली आवृत्ती, 1923'],
    imprint: ['P. S. King & Son, London', 'पी. एस. किंग अँड सन, लंडन'],
    library: ['Osmania University Library, Hyderabad', 'उस्मानिया विद्यापीठ ग्रंथालय, हैदराबाद'],
  },
  {
    slug: 'evolution-of-provincial-finance', work: 'evolution-of-provincial-finance', ia: 'dli.ministry.12679', start: 7, cover: 'cover-evolution-of-provincial-finance',
    title: ['The Evolution of Provincial Finance in British India', 'ब्रिटिश भारतातील प्रांतिक अर्थव्यवस्थेची उत्क्रांती'], year: '1925',
    edition: ['First edition, 1925', 'पहिली आवृत्ती, 1925'],
    imprint: ['P. S. King & Son, London', 'पी. एस. किंग अँड सन, लंडन'],
  },
  {
    slug: 'federation-versus-freedom', work: 'federation-versus-freedom', ia: 'in.ernet.dli.2015.83949', start: 7, cover: 'cover-federation-versus-freedom',
    title: ['Federation versus Freedom', 'संघराज्य विरुद्ध स्वातंत्र्य'], year: '1939',
    edition: ['Published 1939', '1939 मध्ये प्रकाशित'],
    imprint: ['Tracts for the Times No. 3 · Kale Memorial Lecture, Gokhale Institute of Politics and Economics', 'ट्रॅक्ट्स फॉर द टाइम्स क्र. 3 · काळे स्मृती व्याख्यान, गोखले इन्स्टिट्यूट ऑफ पॉलिटिक्स अँड इकॉनॉमिक्स'],
    library: ['Osmania University Library, Hyderabad', 'उस्मानिया विद्यापीठ ग्रंथालय, हैदराबाद'],
  },
  {
    slug: 'thoughts-on-pakistan', work: 'pakistan-or-the-partition-of-india', ia: 'dli.ernet.1802', start: 2, cover: 'cover-thoughts-on-pakistan',
    title: ['Thoughts on Pakistan', 'पाकिस्तानविषयी विचार'], year: '1941',
    edition: ['Title page dated 1941', 'शीर्षक पानावर 1941'],
    imprint: ['Thacker & Co., Bombay', 'थॅकर अँड कंपनी, मुंबई'],
    library: ['Lal Bahadur Shastri National Academy of Administration, Mussoorie', 'लालबहादूर शास्त्री राष्ट्रीय प्रशासन अकादमी, मसुरी'],
    note: [
      'The book first came out in December 1940; this copy’s title page is dated 1941. It was later renamed Pakistan or the Partition of India.',
      'हा ग्रंथ प्रथम डिसेंबर 1940 मध्ये प्रसिद्ध झाला; या प्रतीच्या शीर्षक पानावर 1941 हे वर्ष आहे. पुढे त्याचे नाव ‘पाकिस्तान अथवा भारताची फाळणी’ असे झाले.',
    ],
  },
  {
    slug: 'annihilation-of-caste', work: 'annihilation-of-caste', ia: 'in.ernet.dli.2015.71655', start: 1, cover: 'cover-annihilation-of-caste-third-edition',
    title: ['Annihilation of Caste', 'जातिनिर्मूलन'], year: '1945',
    edition: ['Third edition, 1945', 'तिसरी आवृत्ती, 1945'],
    imprint: ['Ambedkar School of Thoughts, Amritsar', 'आंबेडकर स्कूल ऑफ थॉट्स, अमृतसर'],
    library: ['University of Rajasthan', 'राजस्थान विद्यापीठ'],
    note: [
      'No scan of the 1936 first edition is online. This third edition has Dr. Ambedkar’s preface dated 1 December 1944, and the reply to Mahatma Gandhi first added in 1937.',
      '1936 च्या पहिल्या आवृत्तीचा स्कॅन ऑनलाइन उपलब्ध नाही. या तिसऱ्या आवृत्तीत डॉ. आंबेडकरांची 1 डिसेंबर 1944 ची प्रस्तावना आणि 1937 मध्ये प्रथम जोडलेले महात्मा गांधींना दिलेले उत्तर आहे.',
    ],
  },
  {
    slug: 'pakistan-or-the-partition-of-india', work: 'pakistan-or-the-partition-of-india', ia: 'in.ernet.dli.2015.514118', start: 7, cover: 'cover-pakistan-or-the-partition-of-india-1945',
    title: ['Pakistan or the Partition of India', 'पाकिस्तान अथवा भारताची फाळणी'], year: '1945',
    edition: ['Second edition, 1945', 'दुसरी आवृत्ती, 1945'],
    imprint: ['Thacker & Co., Bombay', 'थॅकर अँड कंपनी, मुंबई'],
    library: ['Ramakrishna Mission Institute of Culture, Kolkata', 'रामकृष्ण मिशन इन्स्टिट्यूट ऑफ कल्चर, कोलकाता'],
    note: [
      'The second edition of Thoughts on Pakistan, published under this new title in February 1945.',
      '‘पाकिस्तानविषयी विचार’ची दुसरी आवृत्ती, फेब्रुवारी 1945 मध्ये या नव्या नावाने प्रसिद्ध झालेली.',
    ],
  },
  {
    slug: 'what-congress-and-gandhi-have-done-to-the-untouchables', work: 'what-congress-and-gandhi-have-done-to-the-untouchables', ia: 'dli.csl.7774', start: 2, cover: 'cover-what-congress-and-gandhi-have-done-to-the-untouchables',
    title: ['What Congress and Gandhi Have Done to the Untouchables', 'काँग्रेस आणि गांधी यांनी अस्पृश्यांचे काय केले?'], year: '1945',
    edition: ['First edition, 1945', 'पहिली आवृत्ती, 1945'],
    imprint: ['Thacker & Co., Bombay', 'थॅकर अँड कंपनी, मुंबई'],
    library: ['Central Secretariat Library, New Delhi', 'केंद्रीय सचिवालय ग्रंथालय, नवी दिल्ली'],
  },
  {
    slug: 'who-were-the-shudras', work: 'who-were-the-shudras', ia: 'dli.ernet.522953', start: 5, cover: 'cover-who-were-the-shudras',
    title: ['Who Were the Shudras?', 'शूद्र पूर्वी कोण होते?'], year: '1946',
    edition: ['First edition, 1946', 'पहिली आवृत्ती, 1946'],
    imprint: ['Thacker & Co., Bombay', 'थॅकर अँड कंपनी, मुंबई'],
    library: ['Durga Shah Municipal Public Library, Nainital', 'दुर्गा शाह नगरपालिका सार्वजनिक ग्रंथालय, नैनिताल'],
  },
  {
    slug: 'states-and-minorities', work: 'states-and-minorities', ia: 'dli.ministry.06488', start: 1, cover: 'cover-states-and-minorities',
    title: ['States and Minorities', 'राज्ये आणि अल्पसंख्याक'], year: '1947',
    edition: ['First edition, 1947', 'पहिली आवृत्ती, 1947'],
    imprint: ['Thacker & Co., Bombay', 'थॅकर अँड कंपनी, मुंबई'],
  },
  {
    slug: 'the-untouchables-who-were-they', work: 'the-untouchables-who-were-they', ia: 'dli.ernet.238047', start: 1, cover: 'cover-the-untouchables-who-were-they',
    title: ['The Untouchables', 'अस्पृश्य मूळचे कोण?'], year: '1948',
    edition: ['First edition, 1948', 'पहिली आवृत्ती, 1948'],
    imprint: ['Amrit Book Co., New Delhi', 'अमृत बुक कंपनी, नवी दिल्ली'],
    library: ['Lal Bahadur Shastri National Academy of Administration, Mussoorie', 'लालबहादूर शास्त्री राष्ट्रीय प्रशासन अकादमी, मसुरी'],
  },
  {
    slug: 'the-buddha-and-his-dhamma', work: 'the-buddha-and-his-dhamma', ia: 'in.gov.ignca.15980', start: 5, cover: 'cover-the-buddha-and-his-dhamma',
    title: ['The Buddha and His Dhamma', 'बुद्ध आणि त्यांचा धम्म'], year: '1957',
    edition: ['First edition, 1957', 'पहिली आवृत्ती, 1957'],
    imprint: ['Siddharth College Publication No. 1 · People’s Education Society, Bombay', 'सिद्धार्थ कॉलेज पब्लिकेशन क्र. 1 · पीपल्स एज्युकेशन सोसायटी, मुंबई'],
    library: ['Central Archaeological Library, New Delhi', 'केंद्रीय पुरातत्त्व ग्रंथालय, नवी दिल्ली'],
  },
];

export const firstEditionHref = (fe: FirstEdition) => url(`/library/first-editions/${fe.slug}/`);
export const archiveUrl = (fe: FirstEdition) => `https://archive.org/details/${fe.ia}/page/n${fe.start}`;
// one page at a time: the two-page spread opens with an empty left page beside the title page
export const embedUrl = (fe: FirstEdition) => `https://archive.org/embed/${fe.ia}/page/n${fe.start}/mode/1up`;

/** The earliest printing on the shelf for a work in works.json, if there is one. */
export const firstEditionOf = (work: string) => FIRST_EDITIONS.find((fe) => fe.work === work);

/** Where to read the same book as text in the volumes: its book page, or the volume's reader at its first page. */
export function textOf(fe: FirstEdition, lang: Lang) {
  const book = bookOf(fe.work);
  if (!book) return null;
  const href = SHELF_BOOKS.some((r) => r[0] === fe.work) ? bookHref(fe.work, book.vol) : (book.entries[0]?.href ?? url(`/library/${book.vol.id}/`));
  return { href, vol: volLabelIn(book.vol, lang), printed: book.printed };
}
