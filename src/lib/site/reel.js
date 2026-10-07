/* Client-safe helpers shared by the reel and story pages: photos, URLs,
   strings. The stories themselves come from data.server.js, per page. */

import { base } from '$app/paths';
import { sectionSlug, sectionLabel, kindLabel, FORMATS } from '$lib/labels.js';

/** A writer's address, from their English name: accents dropped, spaces
    and punctuation made hyphens, so it stays plain wherever it's pasted.
    A name with no Latin letters gives an empty slug. */
export const authorSlug = (name) =>
  name
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const topicUrl = (key, lang) => `${base}/${lang}/topic/${sectionSlug(key)}`;
export const formatUrl = (key, lang) => `${base}/${lang}/${FORMATS[key].slug}`;

/* The stories' images: photo-illustrations made for New Terms, one per
   story, each an object cut from a free Unsplash photo (its id is kept here,
   the source) and set in black and white on its topic's colours. Keyed by
   English slug, or by its own slug for a Bangla original; a translation
   shows its original's. Built by hand from the source photos; the files
   live in static/uploads/stories/<key>-<width>.jpg. */
const PHOTOS = {
  'a-data-centres-day': 'photo-1619365566184-272a34acfeb9',
  'the-ai-boom-is-reaching-places-investors-forgot-to-look': 'photo-1659579740355-9fd915e0a9aa',
  'the-procurement-documents-that-show-how-a-country-buys-surveillance': 'photo-1528312635006-8ea0bc49ec63',
  'election-officials-are-being-sold-ai-they-did-not-ask-for': 'photo-1540910419892-4a36d2c3266c',
  'who-owns-the-data-generated-by-ordinary-life': 'photo-1660844817855-3ecc7ef21f12',
  'what-happens-when-a-chatbot-becomes-your-co-worker': 'photo-1629697776809-f37ceac39e77',
  'the-rise-of-the-prompt-supervisor': 'photo-1722891067479-5fd39edbfc3d',
  'the-hidden-workers-teaching-machines-how-to-see': 'photo-1754820978711-611479056f97',
  'the-consent-form-nobody-could-read': 'photo-1518674660708-0e2c0473e68e',
  'every-photo-you-posted-in-2011-is-still-working': 'photo-1612547036242-77002603e5aa',
  'the-water-bill-a-data-centre-does-not-have-to-publish': 'photo-1542855368-ca6ea825bca2',
  'the-next-ai-race-may-be-about-electricity-not-models': 'photo-1596072215997-cac821d05b9c',
  'chip-makers-are-chasing-cheap-power-to-bangladeshs-economic-zones': 'photo-1494083306499-e22e4a457632',
  'a-model-trained-on-sundarbans-field-notes-by-the-people-who-wrote-them': 'photo-1447069387593-a5de0862481e',
  'a-public-compute-cluster-run-like-a-library': 'photo-1613577553731-e102e5de62f5',
  'a-union-contract-that-treats-a-model-as-a-piece-of-equipment': 'photo-1567954970774-58d6aa6c50dc',
  'a-voice-actor-is-suing-over-a-performance-she-never-gave': 'photo-1531651008558-ed1740375b39',
  'bangladesh-is-writing-ai-rules-for-a-market-it-does-not-control': 'photo-1676181739678-47d76dc38a87',
  'chinese-open-weight-models-are-winning-on-price-not-benchmarks': 'photo-1550490652-ce6a20d4ee76',
  'gazipur-built-an-ai-cluster-then-the-power-went-out': 'photo-1641595722358-7e6617d87f6b',
  'marriage-brokers-matchmakers-and-the-model-in-between': 'photo-1622398925373-3f91b1e275f5',
  'small-languages-are-building-their-own-ai-futures': 'photo-1558009250-d3d2229fdf28',
  'synthetic-anchors-are-reading-the-news-on-four-dhaka-channels': 'photo-1766941234615-644690cad4e2',
  'the-archive-that-refuses-to-be-scraped': 'photo-1577705998148-6da4f3963bc8',
  'the-commons-is-not-a-licence-it-is-a-maintenance-budget': 'photo-1611288870280-4a322b8ec7ec',
  'the-film-industry-that-decided-to-label-everything': 'photo-1603218734550-be7fcffeb817',
  'the-grid-operator-who-says-no': 'photo-1723536995929-02f231c2de6b',
  'the-maintainer-burnout-behind-half-the-ai-stack': 'photo-1644628270163-a2ccfb778a9c',
  'the-mirpur-annotators-who-unionised-and-what-happened-next': 'photo-1592530392525-9d8469678dac',
  'the-pharmacist-in-kurigram-who-became-a-triage-system': 'photo-1550572017-26b5655c1e8c',
  'the-quiet-consolidation-of-the-ai-supply-chain': 'photo-1713950653257-33abeea82b40',
  'the-school-that-banned-ai-then-quietly-unbanned-it': 'photo-1651534400798-e9657f587140',
  'translators-did-not-disappear-their-rates-did': 'photo-1534289855405-ab820a118fc1',
  'two-labs-one-grid-and-a-city-that-was-not-consulted': 'photo-1610056494052-6a4f83a8368c',
  'what-a-data-broker-actually-sells-line-by-line': 'photo-1648823161626-0e839927401b',
  'what-open-means-when-the-weights-are-free-and-the-data-is-not': 'photo-1555529902-5261145633bf',
  'when-the-regulator-and-the-regulated-share-the-same-consultants': 'photo-1495653797063-114787b77b23',
  'your-landlord-may-already-be-using-ai-to-price-your-rent': 'photo-1643804926339-e94f0a655185',
  // Bangla originals, keyed by their own slug
  'bangla-bhashar-model-toiri-korchen-jara': 'photo-1786360746884-2a29477f2def',
  'chattogramer-poshak-karkhanay-camera-ja-dekhe': 'photo-1466027397211-20d0f2449a3f',
  'data-centerer-panir-hisab-keu-prokash-kore-na': 'photo-1619365566184-272a34acfeb9',
  'dhakar-ridarra-je-thikanar-manchitra-baniyeche': 'photo-1591637333184-19aa84b3e01f',
  'gramer-clinic-e-phone-je-siddhanta-nicche': 'photo-1655313719493-16ebe4906441',
  'nirbachone-bhuya-content-kothay-toiri-hoy': 'photo-1710392046859-dba4aa3cd0bf',
  'open-source-e-bangla-tothyer-obhab': 'photo-1586769852836-bc069f19e1b6',
  'sadharon-jiboner-tothyer-malik-ke': 'photo-1637934015475-90784961592f',
  'silheter-cha-bagane-drone-o-sromik': 'photo-1507582020474-9a35b7d455d9'
};

const art = (key, w) => `${base}/uploads/stories/${key}-${w}.jpg`;

/** { thumb, src, srcset, illustration } for a story's image, or null. */
export function photo(s) {
  const key = PHOTOS[s.slug] ? s.slug : s.translationOf && PHOTOS[s.translationOf] ? s.translationOf : null;
  if (key) {
    return {
      thumb: art(key, 800),
      src: art(key, 1600),
      srcset: `${art(key, 800)} 800w, ${art(key, 1600)} 1600w`,
      illustration: true
    };
  }
  // The seeded placeholder is artwork, not a photograph: treat it as none.
  if (s.image && !s.image.src.endsWith('/test-photo.svg')) {
    return { thumb: s.image.src, src: s.image.src, srcset: null };
  }
  return null;
}

/** Does a story match a search? Every word typed has to appear somewhere in
    its headline, summary, byline, topic or tags. */
export function matches(s, query) {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return true;
  const kind = FORMATS[s.kind] ? kindLabel(s.kind, s.lang) : '';
  const hay = [s.title, s.dek, s.author, sectionLabel(s.section, s.lang), kind, ...(s.tags || [])]
    .join(' ')
    .toLowerCase();
  return words.every((w) => hay.includes(w));
}

/* The story last opened, so the reel can hand its photo back to the right
   frame when the reader returns. */
let last = null;
export const lastRead = () => last;
export const setLastRead = (slug) => (last = slug);

export const two = (n, lang) =>
  new Intl.NumberFormat(lang === 'bn' ? 'bn-BD' : 'en-GB', { minimumIntegerDigits: 2 }).format(n);

export const SHORT_DATE = {
  en: new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' }),
  bn: new Intl.DateTimeFormat('bn-BD', { day: 'numeric', month: 'short', timeZone: 'UTC' })
};
export const RANGE = {
  en: new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' }),
  bn: new Intl.DateTimeFormat('bn-BD', { day: 'numeric', month: 'short', timeZone: 'UTC' })
};
export const range = (from, to, lang) => RANGE[lang].formatRange(from, to);

export const MONTH = {
  en: new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' }),
  bn: new Intl.DateTimeFormat('bn-BD', { month: 'long', year: 'numeric', timeZone: 'UTC' })
};

export const DAY_DATE = {
  en: new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' }),
  bn: new Intl.DateTimeFormat('bn-BD', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' })
};

export const STR = {
  en: {
    tagline: 'AI, reported from wherever it lands.',
    blurb: 'A nonprofit newsroom reporting on AI and the technology around it in Bangladesh, and on the people it reaches first.',
    read: 'Read',
    min: 'min',
    scroll: 'Scroll',
    reel: 'The reel',
    thisWeek: 'This week',
    reporter: 'Reporter',
    reporters: 'Reporters',
    people: (n) => `${n} ${n === '1' ? 'reporter' : 'reporters'}`,
    searchBy: 'Search these stories',
    latest: 'Latest',
    search: 'Search',
    searchAll: 'Search every story',
    searchIn: 'Search this topic',
    none: 'Nothing matches that.',
    loading: 'Loading…',
    shown: (a, b) => `${a} of ${b}`,
    next: 'Next in the reel',
    readOther: 'বাংলায় পড়ুন',
    topics: 'Topics',
    menu: 'Menu',
    soon: 'This page is being written.',
    topic: 'Topic',
    format: 'Format',
    formats: 'Formats',
    close: 'Close',
    all: 'All stories',
    count: (n) => `${n} ${n === '1' ? 'story' : 'stories'}`
  },
  bn: {
    tagline: 'এআই যেখানেই পৌঁছায়, সেখান থেকেই প্রতিবেদন।',
    blurb: 'একটি অলাভজনক সংবাদমাধ্যম, যা বাংলাদেশে কৃত্রিম বুদ্ধিমত্তা ও তাকে ঘিরে থাকা প্রযুক্তি, আর সবার আগে যাঁদের কাছে তা পৌঁছায় তাঁদের নিয়ে কাজ করে।',
    read: 'পড়ুন',
    min: 'মিনিট',
    scroll: 'স্ক্রল করুন',
    reel: 'রিল',
    thisWeek: 'এই সপ্তাহে',
    reporter: 'প্রতিবেদক',
    reporters: 'প্রতিবেদকেরা',
    people: (n) => `${n} জন প্রতিবেদক`,
    searchBy: 'এই প্রতিবেদনগুলোতে খুঁজুন',
    latest: 'সর্বশেষ',
    search: 'খুঁজুন',
    searchAll: 'সব প্রতিবেদনে খুঁজুন',
    searchIn: 'এই বিষয়ে খুঁজুন',
    none: 'কিছু মেলেনি।',
    loading: 'লোড হচ্ছে…',
    shown: (a, b) => `${b}টির মধ্যে ${a}টি`,
    next: 'এরপর',
    readOther: 'Read in English',
    topics: 'বিষয়',
    menu: 'মেনু',
    soon: 'এই পাতাটি লেখা হচ্ছে।',
    topic: 'বিষয়',
    format: 'ধরন',
    formats: 'ধরন',
    close: 'বন্ধ',
    all: 'সব প্রতিবেদন',
    count: (n) => `${n}টি প্রতিবেদন`
  }
};
