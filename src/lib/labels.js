/* Section and kind labels, number formatting: pure helpers with no content
   attached, safe to import from any page without shipping the archive. */

/* ---- taxonomy: one shared key set, localized labels ----
   Sharing the keys keeps tag and section pages working across both desks;
   only the display string changes. */
export const SECTION_ORDER = [
  'The AI Race',
  'AI & Everyday Life',
  'Work After Automation',
  'Machines and Power',
  'AI Across Bangladesh',
  'Climate, Chips & Infrastructure'
];

const SECTION_BN = {
  'The AI Race': 'এআই প্রতিযোগিতা',
  'AI & Everyday Life': 'দৈনন্দিন জীবনে এআই',
  'Work After Automation': 'স্বয়ংক্রিয়তার পরে কাজ',
  'Machines and Power': 'যন্ত্র ও ক্ষমতা',
  'AI Across Bangladesh': 'সারা দেশে এআই',
  'Climate, Chips & Infrastructure': 'জলবায়ু, চিপ ও অবকাঠামো'
};

const KIND_BN = {
  Interview: 'সাক্ষাৎকার',
  Investigation: 'অনুসন্ধান',
  Report: 'প্রতিবেদন',
  Analysis: 'বিশ্লেষণ',
  Explainer: 'ব্যাখ্যা',
  Feature: 'ফিচার',
  Dispatch: 'সরেজমিন'
};

/* Formats a reader can browse as well as topics. A topic is what a story is
   about, a format what kind of piece it is; the two cross, so an interview
   about jobs is in Work After Automation and in Interviews. Only these get a
   pill on their cards and a page of their own; the other kinds stay
   newsroom labels. */
export const FORMATS = {
  Investigation: { slug: 'investigations', en: 'Investigations', bn: 'অনুসন্ধান' },
  Interview: { slug: 'interviews', en: 'Interviews', bn: 'সাক্ষাৎকার' }
};
export const formatLabel = (key, lang) => FORMATS[key]?.[lang] ?? key;

export const sectionLabel = (key, lang) =>
  lang === 'bn' ? SECTION_BN[key] || key : key;
export const kindLabel = (key, lang) => (lang === 'bn' ? KIND_BN[key] || key : key);

export const sectionSlug = (key) =>
  key.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const formatNumber = (n, lang) =>
  new Intl.NumberFormat(lang === 'bn' ? 'bn-BD' : 'en-GB').format(n);
