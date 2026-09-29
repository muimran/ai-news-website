/* ============================================================
   Content adapter — bilingual.

   Language comes from the folder: content/articles/{en,bn}/*.md
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

const modules = import.meta.glob('/content/articles/*/*.md', {
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

function toStory(path, raw) {
  const { data, body } = parseFrontmatter(raw);
  const parts = path.split('/');
  const file = parts.pop();
  const lang = LANGS.includes(parts[parts.length - 1]) ? parts[parts.length - 1] : DEFAULT_LANG;
  const slug = file.replace(/\.md$/, '');
  const date = new Date(data.date || Date.now());

  return {
    slug,
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

export const stories = Object.entries(modules)
  .map(([path, raw]) => toStory(path, raw))
  .sort((a, b) => b.date - a.date);

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
