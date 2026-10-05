/* ============================================================
   Content adapter — bilingual.

   Language comes from the folder: content/articles/{en,bn}/<year>/<month>/*.md
   Everything downstream consumes the normalized `Story` shape. To move off
   markdown later (Sanity, WordPress, Payload…), replace ONLY the glob and
   `toStory()`. No component changes.

   Story = {
     slug, lang, title, dek, section, kind, tags[],
     author, authorTitle, location,
     date, dateISO, dateLabel, readTime, weight,
     featured, secondary, template, route, translationOf, body
   }
   ============================================================ */

import { base } from '$app/paths';
import { SECTION_ORDER } from './labels.js';

/* Labels live in labels.js so pages can use them without importing every
   article; re-exported here so existing imports keep working. */
export { sectionLabel, kindLabel, sectionSlug, formatNumber } from './labels.js';

/* content/articles/<lang>/<year>/<month>/<slug>.md, where the CMS files a
   story the day it's first saved (older files may sit straight in <lang>/) */
const modules = import.meta.glob('/content/articles/*/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true
});

export const LANGS = ['en', 'bn'];
export const DEFAULT_LANG = 'en';

function parseFrontmatter(raw) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(raw);
  if (!match) return { data: {}, body: raw };
  const data = {};
  for (const line of match[1].split(/\r?\n/)) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const rawValue = line.slice(idx + 1).trim();
    if (!key) continue;
    try {
      data[key] = JSON.parse(rawValue);
    } catch {
      data[key] = rawValue.replace(/^["']|["']$/g, '');
    }
  }
  return { data, body: match[2] };
}

/* Bangla numerals and month names — a Bangla page showing "17 Sept 2026"
   in Latin digits reads as a half-translated page. */
const FMT = {
  en: new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
  bn: new Intl.DateTimeFormat('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })
};

/* ---- a story's web address: always plain English letters ----
   1. the "Web address" the writer typed in the CMS, if any;
   2. a Bangla translation: its English original's, so the two editions
      share one address (/en/x and /bn/x);
   3. the file's own name, when it is already in English letters (every
      English story: the CMS makes it from the title);
   4. otherwise (a Bangla original with no address typed) its title spelled
      in Latin letters.
   Two stories in one edition never share an address: see `unique` below. */
const clean = (s) =>
  String(s)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const BN_VOWEL = { অ: 'o', আ: 'a', ই: 'i', ঈ: 'i', উ: 'u', ঊ: 'u', ঋ: 'ri', এ: 'e', ঐ: 'oi', ও: 'o', ঔ: 'ou' };
const BN_SIGN = { 'া': 'a', 'ি': 'i', 'ী': 'i', 'ু': 'u', 'ূ': 'u', 'ৃ': 'ri', 'ে': 'e', 'ৈ': 'oi', 'ো': 'o', 'ৌ': 'ou' };
const BN_CONS = {
  ক: 'k', খ: 'kh', গ: 'g', ঘ: 'gh', ঙ: 'ng', চ: 'ch', ছ: 'chh', জ: 'j', ঝ: 'jh', ঞ: 'n',
  ট: 't', ঠ: 'th', ড: 'd', ঢ: 'dh', ণ: 'n', ত: 't', থ: 'th', দ: 'd', ধ: 'dh', ন: 'n',
  প: 'p', ফ: 'f', ব: 'b', ভ: 'bh', ম: 'm', য: 'j', র: 'r', ল: 'l', শ: 'sh', ষ: 'sh',
  স: 's', হ: 'h', '\u09DC': 'r', '\u09DD': 'rh', '\u09DF': 'y', ৎ: 't'
};
const BN_MARK = { 'ং': 'ng', 'ঃ': 'h', 'ঁ': 'n' };

/** A Bangla title in Latin letters, plainly: "ঢাকার রাইডাররা" -> "dhakar raidarra".
    Only the fallback for an address nobody typed. */
function romanise(text) {
  // the dotted letters as one each (ড় ঢ় য়), however they were typed
  const ch = [...text.normalize('NFC').replace(/\u09A1\u09BC/g, '\u09DC').replace(/\u09A2\u09BC/g, '\u09DD').replace(/\u09AF\u09BC/g, '\u09DF')];
  let out = '';
  for (let i = 0; i < ch.length; i++) {
    const c = ch[i], next = ch[i + 1];
    if (BN_CONS[c]) {
      // য after a joiner is the y-glide: চ্যা -> chya
      out += c === 'য' && ch[i - 1] === '্' ? 'y' : BN_CONS[c];
      // the inherent vowel between two letters, not before a sign or joiner
      // and not at the word's end (an approximation: it's only the fallback)
      if (BN_CONS[next]) out += 'o';
    } else if (BN_SIGN[c]) out += BN_SIGN[c];
    else if (BN_VOWEL[c]) out += BN_VOWEL[c];
    else if (BN_MARK[c]) out += BN_MARK[c];
    else if (c === '্') continue;
    else out += c;
  }
  return out;
}

function addressOf(data, file, lang) {
  if (data.slug && clean(data.slug)) return clean(data.slug);
  if (lang !== DEFAULT_LANG && data.translationOf) return clean(data.translationOf);
  const name = file.replace(/\.md$/, '');
  if (/^[a-z0-9-]+$/.test(name)) return name;
  return clean(romanise(data.title || name)) || 'story';
}

function toStory(path, raw) {
  const { data, body } = parseFrontmatter(raw);
  const parts = path.split('/'); // ['', 'content', 'articles', lang, (year, month,) file]
  const file = parts.pop();
  const lang = LANGS.includes(parts[3]) ? parts[3] : DEFAULT_LANG;
  /* the year and month in its address: the folder it was filed in, so it
     never moves once published, even if its date is corrected later */
  const filed = /^(\d{4})\/(\d{2})$/.exec(parts.slice(4, 6).join('/'));
  const slug = addressOf(data, file, lang);
  const date = new Date(data.date || Date.now());

  return {
    slug,
    ym: filed ? `${filed[1]}/${filed[2]}` : `${date.getUTCFullYear()}/${String(date.getUTCMonth() + 1).padStart(2, '0')}`,
    file: file.replace(/\.md$/, ''),
    typed: !!(data.slug && clean(data.slug)),
    lang,
    title: data.title || 'Untitled',
    dek: data.dek || '',
    section: data.section || 'Latest',
    kind: data.kind || 'Report',
    tags: Array.isArray(data.tags) ? data.tags : [],
    author: data.author || 'Ground Truth staff',
    authorTitle: data.authorTitle || '',
    location: data.location || '',
    date,
    dateISO: date.toISOString(),
    dateLabel: (FMT[lang] || FMT.en).format(date),
    readTime: Number(data.readTime) || 6,
    weight: Number(data.weight) || 99,
    featured: data.featured === true,
    secondary: data.secondary === true,
    /* A real photograph, when there is one. Alt text and credit are not
       optional extras for a newsroom: alt text is what a screen-reader user
       gets instead of the picture, and an uncredited photo is a rights problem.
       Generated artwork is the FALLBACK when src is absent or fails to load,
       not the default. */
    image: data.image
      ? { src: base + data.image, alt: data.imageAlt || '', credit: data.imageCredit || '' }
      : null,

    /* Video is a FORMAT, not a section. A video interview about chip fabs
       belongs in Climate/Chips like any other story on that beat; the format
       changes the card treatment and the metadata, not where it lives. */
    video: data.video || null,
    duration: Number(data.duration) || 0,

    template: data.template || 'standard',
    route: data.route || null,
    /* slug of the English original this translates, or null. Only ever set on
       the non-default language, so the relationship has one direction. */
    translationOf: data.translationOf || null,
    body: body.trim()
  };
}

/* No two stories in one edition share an address. If two would, the older
   keeps it (it may already be shared) and the newer gets -2, -3…; the build
   says so, so an editor can give it a better one. */
function unique(list) {
  const taken = new Set();
  for (const s of [...list].sort((a, b) => a.date - b.date)) {
    let slug = s.slug;
    for (let n = 2; taken.has(`${s.lang}/${s.ym}/${slug}`); n++) slug = `${s.slug}-${n}`;
    if (slug !== s.slug) console.warn(`[address] "${s.title}" (${s.lang}) would share ${s.ym}/${s.slug}; it is ${s.ym}/${slug} instead`);
    s.slug = slug;
    taken.add(`${s.lang}/${s.ym}/${slug}`);
  }
  return list;
}

/* The CMS links a translation to its original by the original's file name;
   the original's address may be one its writer typed instead. Follow the
   link to the original's real address, for the link and (unless the
   translation has an address of its own) for the translation's too. */
function link(list) {
  const original = new Map(list.filter((s) => s.lang === DEFAULT_LANG).map((s) => [s.file, s]));
  for (const s of list) {
    if (s.lang === DEFAULT_LANG || !s.translationOf) continue;
    // the CMS may write the original's folder too (2026/09/x): match its name
    const o = original.get(String(s.translationOf).split('/').pop());
    if (!o) continue;
    s.translationOf = o.slug;
    if (!s.typed) {
      s.slug = o.slug;
      s.ym = o.ym; // same year and month too: the two editions mirror
    }
  }
  return list;
}

export const stories = unique(link(Object.entries(modules).map(([path, raw]) => toStory(path, raw)))).sort(
  (a, b) => b.date - a.date
);

/* ---- language-scoped selectors ---- */
export const inLang = (lang) => stories.filter((s) => s.lang === lang);

export const sections = (lang) =>
  SECTION_ORDER.filter((name) => inLang(lang).some((s) => s.section === name));

export const getStory = (slug, lang) =>
  stories.find((s) => s.slug === slug && s.lang === lang) || null;

/** The same story in the other language, or null. Works in both directions:
    a Bangla story names its English original, and an English story is found
    by searching for whoever names it. */
export function sibling(story, otherLang) {
  if (!story) return null;
  if (story.translationOf) {
    const orig = stories.find((s) => s.slug === story.translationOf && s.lang === otherLang);
    if (orig) return orig;
  }
  return stories.find((s) => s.lang === otherLang && s.translationOf === story.slug) || null;
}
