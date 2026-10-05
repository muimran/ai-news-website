/* Server-only: runs at build time, so each prerendered page carries just the
   stories it shows instead of the whole archive. */

import { marked } from 'marked';
import { base } from '$app/paths';
import { LANGS, inLang, sibling, sections } from '$lib/content.js';
import { FORMATS } from '$lib/labels.js';
import { photo, topicUrl, formatUrl } from '$lib/site/reel.js';
import { writerFor, writerUrl } from './authors.js';
import { toneFor, dominant } from './tone.js';

/* A section's reel runs its latest 12; everything older is in its index.
   The front reel is one story per section. */
const REEL = { topic: 12 };

/* Every story's card colour, read once from its picture before any page is
   built (an editor's own colour wins). */
const TONES = new Map();
for (const s of LANGS.flatMap(inLang)) {
  const pic = photo(s);
  if (s.cardColour) TONES.set(`${s.lang}/${s.slug}`, toneFor(s.cardColour, { adjust: false }));
  else if (pic) {
    const bg = await dominant(pic.thumb);
    if (bg) TONES.set(`${s.lang}/${s.slug}`, toneFor(bg));
  }
}

/** What a frame needs, and nothing else — no body. */
const summary = (s) => ({
  slug: s.slug,
  ym: s.ym,
  lang: s.lang,
  title: s.title,
  dek: s.dek,
  section: s.section,
  date: s.date,
  readTime: s.readTime,
  kind: s.kind,
  author: s.author,
  translationOf: s.translationOf,
  image: s.image,
  tone: TONES.get(`${s.lang}/${s.slug}`) ?? null
});

/** An index or search row: a summary plus what the filter looks through. */
const row = (s) => ({ ...summary(s), tags: s.tags });

const newestFirst = (a, b) => b.date - a.date || a.weight - b.weight;
export const order = (lang, section = null) =>
  inLang(lang).filter((s) => !section || s.section === section).sort(newestFirst);

export const indexUrl = (lang, section) =>
  section ? `${topicUrl(section, lang)}/all` : `${base}/${lang}/all`;

/** One format's stories (every interview, say), newest first. */
export const ofKind = (lang, kind) => inLang(lang).filter((s) => s.kind === kind).sort(newestFirst);

/* A section's stories, most important first: an editor's lead story (the
   newest, if there are several), then newest first. */
const leadFirst = (list) => [...list].sort((a, b) => b.featured - a.featured || newestFirst(a, b));

/** Every section a reader can open: the topics, then each format that has
    stories in this edition. */
const sectionLists = (lang) => [
  ...sections(lang).map((key) => order(lang, key)),
  ...Object.keys(FORMATS)
    .map((key) => ofKind(lang, key))
    .filter((list) => list.length)
];

const frame = (s, i) => ({ type: 'story', key: s.slug, story: summary(s), n: i + 1 });

/** The front reel: the top story of every section, each story once. One at
    the top of two sections (an investigation leading its topic) stands for
    both. Editors' lead stories come first, then newest first. The issue card
    lists the latest few regardless, so what's new is always on the front. */
export function frontReel(lang) {
  const tops = new Map();
  for (const list of sectionLists(lang)) {
    const top = leadFirst(list)[0];
    if (top) tops.set(top.slug, top);
  }
  const all = order(lang);
  return {
    items: leadFirst([...tops.values()]).map(frame),
    latest: all.slice(0, 16).map(summary),
    total: all.length,
    from: all.at(-1).date,
    to: all[0].date,
    index: indexUrl(lang)
  };
}

/** A section's reel: its top story, the same one the front shows for it, at
    full size; then the rest of its latest, two to a slot. */
function sectionReel(list, index) {
  const [top, ...rest] = leadFirst(list).slice(0, REEL.topic);
  const items = [frame(top, 0)];
  for (let i = 0; i < rest.length; i += 2) {
    const a = frame(rest[i], i + 1);
    const b = rest[i + 1] ? frame(rest[i + 1], i + 2) : null;
    items.push({ type: 'pair', key: a.key, a, b });
  }
  return { items, total: list.length, from: list.at(-1).date, to: list[0].date, index };
}

export const reelFor = (lang, section) => sectionReel(order(lang, section), indexUrl(lang, section));
export const formatReel = (lang, kind) => sectionReel(ofKind(lang, kind), `${formatUrl(kind, lang)}/all`);

/** Every story in a topic (or everything), newest first, for an index page. */
export const listFor = (lang, section = null) => order(lang, section).map(row);
export const formatList = (lang, kind) => ofKind(lang, kind).map(row);

/* Every story from both desks, newest first — a writer's page spans both. */
const everything = () => [...order('en'), ...order('bn')].sort(newestFirst);

/** Everyone who writes for Ground Truth, most stories first, with their
    count across both desks. */
export function writers() {
  const bySlug = new Map();
  for (const s of everything()) {
    const w = writerFor(s.author);
    if (!w) continue;
    const e = bySlug.get(w.slug) ?? { ...w, count: 0 };
    e.count++;
    bySlug.set(w.slug, e);
  }
  return [...bySlug.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export const writerBySlug = (slug) => writers().find((w) => w.slug === slug) || null;
export const storiesByWriter = (w) =>
  everything()
    .filter((s) => writerFor(s.author)?.slug === w.slug)
    .map(row);

/** The search list: headlines and summaries only, fetched when search opens. */
export const searchIndex = (lang) => order(lang).map(row);

/** Where the language switch goes: the same topic if the other edition has
    it, otherwise that edition's front reel. `index` for index pages. */
export const altFor = (section, index = false) =>
  Object.fromEntries(
    LANGS.map((l) => {
      if (section && !sections(l).includes(section)) return [l, `${base}/${l}`];
      if (index) return [l, indexUrl(l, section)];
      return [l, section ? topicUrl(section, l) : `${base}/${l}`];
    })
  );

/* A photo on a line of its own in a story is a wide photo: it becomes a
   figure that runs the width of the page, its title (the editor's
   "Caption — Photo: credit") the caption beneath. A site path gets the
   site's base, so uploads work under GitHub Pages too. */
const widePhotos = (html) =>
  html.replace(
    /<p>\s*<img src="([^"]+)" alt="([^"]*)"(?: title="([^"]*)")?\s*\/?>\s*<\/p>/g,
    (_, src, alt, title) =>
      `<figure class="wide"><img src="${src.startsWith('/') ? base + src : src}" alt="${alt}" loading="lazy" />` +
      (title ? `<figcaption>${title}</figcaption>` : '') +
      `</figure>`
  );

export function storyPage(s) {
  const all = order(s.lang);
  const i = all.findIndex((x) => x.slug === s.slug);
  // the reel carries on below the story, wrapping round to the newest
  const next = Array.from({ length: Math.min(4, all.length - 1) }, (_, k) => {
    const j = (i + 1 + k) % all.length;
    return { story: summary(all[j]), n: j + 1 };
  });

  let body = s.body;
  if (s.dek && body.startsWith(s.dek)) body = body.slice(s.dek.length).trimStart(); // already shown as the dek

  const alt = {};
  for (const l of LANGS) {
    const t = l === s.lang ? s : sibling(s, l);
    alt[l] = t ? `${base}/${l}/${t.slug}` : `${base}/${l}`;
  }

  return {
    story: { ...summary(s), kind: s.kind, author: s.author, authorTitle: s.authorTitle, location: s.location },
    html: widePhotos(marked.parse(body)),
    n: i + 1,
    next,
    alt,
    translated: LANGS.some((l) => l !== s.lang && !!sibling(s, l)),
    writer: writerFor(s.author) ? writerUrl(writerFor(s.author)) : null
  };
}

/** Formats with at least one story in this edition, for the menu. */
export const formatsFor = (lang) =>
  Object.keys(FORMATS)
    .map((key) => {
      const list = ofKind(lang, key);
      return { key, count: list.length, thumbs: list.slice(0, 4).map((s) => photo(s)?.thumb ?? null) };
    })
    .filter((f) => f.count);

/** The language switch from a format page: the same format if the other
    edition has any, otherwise its front reel. */
export const altForFormat = (kind, index = false) =>
  Object.fromEntries(
    LANGS.map((l) => {
      if (!ofKind(l, kind).length) return [l, `${base}/${l}`];
      return [l, `${formatUrl(kind, l)}${index ? '/all' : ''}`];
    })
  );

/** The topic index in the top bar: every section with its count and the
    first few photos, for previews. */
export const topicsFor = (lang) =>
  sections(lang).map((key) => {
    const list = order(lang, key);
    return { key, count: list.length, thumbs: list.slice(0, 4).map((s) => photo(s)?.thumb ?? null) };
  });
