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

/* Free-licensed Unsplash photos standing in for the reporters' own, one for
   every story: keyed by English slug, or by its own slug for a Bangla
   original. A translation shows its original's photo. */
const PHOTOS = {
  'the-ai-boom-is-reaching-places-investors-forgot-to-look': 'photo-1680992046626-418f7e910589',
  'the-procurement-documents-that-show-how-a-country-buys-surveillance': 'photo-1515432085503-cabf2fbcd690',
  'election-officials-are-being-sold-ai-they-did-not-ask-for': 'photo-1782998307726-f93ec14eda24',
  'who-owns-the-data-generated-by-ordinary-life': 'photo-1583429891508-015ef9cd958e',
  'what-happens-when-a-chatbot-becomes-your-co-worker': 'photo-1560264280-88b68371db39',
  'the-rise-of-the-prompt-supervisor': 'photo-1712159018726-4564d92f3ec2',
  'the-hidden-workers-teaching-machines-how-to-see': 'photo-1629904853716-f0bc54eea481',
  'the-consent-form-nobody-could-read': 'photo-1728334445894-1e2e649cd0db',
  'every-photo-you-posted-in-2011-is-still-working': 'photo-1727334291061-fd29582ef9dc',
  'the-water-bill-a-data-centre-does-not-have-to-publish': 'photo-1506399558188-acca6f8cbf41',
  'the-next-ai-race-may-be-about-electricity-not-models': 'photo-1473341304170-971dccb5ac1e',
  'chip-makers-are-chasing-cheap-power-to-bangladeshs-economic-zones': 'photo-1746893737268-81fe686e6a51',
  'a-model-trained-on-sundarbans-field-notes-by-the-people-who-wrote-them': 'photo-1612536090790-680138b3f2cd',
  'a-public-compute-cluster-run-like-a-library': 'photo-1691435828932-911a7801adfb',
  'a-union-contract-that-treats-a-model-as-a-piece-of-equipment': 'photo-1721578006568-17901600cff3',
  'a-voice-actor-is-suing-over-a-performance-she-never-gave': 'photo-1531651008558-ed1740375b39',
  'bangladesh-is-writing-ai-rules-for-a-market-it-does-not-control': 'photo-1694343906708-e0d2306b5802',
  'chinese-open-weight-models-are-winning-on-price-not-benchmarks': 'photo-1515879218367-8466d910aaa4',
  'gazipur-built-an-ai-cluster-then-the-power-went-out': 'photo-1587815713661-418a916ca3a9',
  'marriage-brokers-matchmakers-and-the-model-in-between': 'photo-1625012932492-2c2dc979940e',
  'small-languages-are-building-their-own-ai-futures': 'photo-1671345495303-6466658ed02d',
  'synthetic-anchors-are-reading-the-news-on-four-dhaka-channels': 'photo-1651465531201-7e430660fd82',
  'the-archive-that-refuses-to-be-scraped': 'photo-1549964336-67d7d7d74ac2',
  'the-commons-is-not-a-licence-it-is-a-maintenance-budget': 'photo-1721332154191-ba5f1534266e',
  'the-film-industry-that-decided-to-label-everything': 'photo-1632187981988-40f3cbaeef5e',
  'the-grid-operator-who-says-no': 'photo-1587622054651-e3e62142c3e0',
  'the-maintainer-burnout-behind-half-the-ai-stack': 'photo-1550439062-609e1531270e',
  'the-mirpur-annotators-who-unionised-and-what-happened-next': 'photo-1606857521015-7f9fcf423740',
  'the-pharmacist-in-kurigram-who-became-a-triage-system': 'photo-1580281657527-47f249e8f4df',
  'the-quiet-consolidation-of-the-ai-supply-chain': 'photo-1590497008432-598f04441de8',
  'the-school-that-banned-ai-then-quietly-unbanned-it': 'photo-1709290749293-c6152a187b14',
  'translators-did-not-disappear-their-rates-did': 'photo-1543165796-5426273eaab3',
  'two-labs-one-grid-and-a-city-that-was-not-consulted': 'photo-1653932133705-851f4547eb2b',
  'what-a-data-broker-actually-sells-line-by-line': 'photo-1686061593213-98dad7c599b9',
  'what-open-means-when-the-weights-are-free-and-the-data-is-not': 'photo-1542831371-29b0f74f9713',
  'when-the-regulator-and-the-regulated-share-the-same-consultants': 'photo-1573167507387-6b4b98cb7c13',
  'your-landlord-may-already-be-using-ai-to-price-your-rent': 'photo-1630987871777-f7b2d62894d0',
  // Bangla originals, keyed by their own slug
  'bangla-bhashar-model-toiri-korchen-jara': 'photo-1771699435062-3072daa0418f',
  'chattogramer-poshak-karkhanay-camera-ja-dekhe': 'photo-1770196009760-bead9eb10514',
  'data-centerer-panir-hisab-keu-prokash-kore-na': 'photo-1729954924953-ff957b3e9edc',
  'dhakar-ridarra-je-thikanar-manchitra-baniyeche': 'photo-1646927509586-08adb766512a',
  'gramer-clinic-e-phone-je-siddhanta-nicche': 'photo-1773140278162-fd7df1043f0c',
  'nirbachone-bhuya-content-kothay-toiri-hoy': 'photo-1777428411691-e4d5c3423ed0',
  'open-source-e-bangla-tothyer-obhab': 'photo-1771699435693-52329f0d18ff',
  'sadharon-jiboner-tothyer-malik-ke': 'photo-1662569189726-b08beb143864',
  'silheter-cha-bagane-drone-o-sromik': 'photo-1706444326115-6a659b5cfda5'
};

const unsplash = (id, w) => `https://images.unsplash.com/${id}?w=${w}&q=80&auto=format&fit=crop`;

/** { thumb, src, srcset } for a story's photo, or null. */
export function photo(s) {
  const id = PHOTOS[s.slug] || (s.translationOf && PHOTOS[s.translationOf]);
  if (id) {
    return {
      thumb: unsplash(id, 200),
      src: unsplash(id, 1400),
      srcset: [700, 1100, 1600, 2200].map((w) => `${unsplash(id, w)} ${w}w`).join(', ')
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
  bn: new Intl.DateTimeFormat('bn-BD', { day: 'numeric', month: 'long', timeZone: 'UTC' })
};
export const RANGE = {
  en: new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' }),
  bn: new Intl.DateTimeFormat('bn-BD', { day: 'numeric', month: 'long', timeZone: 'UTC' })
};
export const range = (from, to, lang) => RANGE[lang].formatRange(from, to);

export const MONTH = {
  en: new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' }),
  bn: new Intl.DateTimeFormat('bn-BD', { month: 'long', year: 'numeric', timeZone: 'UTC' })
};

export const DAY_DATE = {
  en: new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' }),
  bn: new Intl.DateTimeFormat('bn-BD', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' })
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
