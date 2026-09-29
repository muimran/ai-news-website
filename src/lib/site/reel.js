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

/* Free-licensed Unsplash photos standing in for the reporters' own, keyed by
   English slug (the same set the v2 mock used). A translation shows its
   original's photo. */
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
  'chip-makers-are-chasing-cheap-power-to-bangladeshs-economic-zones': 'photo-1746893737268-81fe686e6a51'
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
