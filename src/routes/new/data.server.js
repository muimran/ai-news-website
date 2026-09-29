/* Server-only: runs at build time, so each prerendered page carries just the
   stories it shows instead of the whole archive. */

import { marked } from 'marked';
import { base } from '$app/paths';
import { LANGS, inLang, sibling, sections } from '$lib/content.js';
import { photo, topicUrl } from './reel.js';

/* Reels are for what's new: the front reel runs the latest 24, a topic reel
   its latest 12. Everything older is in the topic's index. */
const REEL = { front: 24, topic: 12 };

/** What a frame needs, and nothing else — no body. */
const summary = (s) => ({
  slug: s.slug,
  lang: s.lang,
  title: s.title,
  dek: s.dek,
  section: s.section,
  date: s.date,
  readTime: s.readTime,
  translationOf: s.translationOf,
  image: s.image
});

/** An index or search row: a summary plus what the filter looks through. */
const row = (s) => ({ ...summary(s), tags: s.tags, author: s.author });

const newestFirst = (a, b) => b.date - a.date || a.weight - b.weight;
export const order = (lang, section = null) =>
  inLang(lang).filter((s) => !section || s.section === section).sort(newestFirst);

export const indexUrl = (lang, section) =>
  section ? `${topicUrl(section, lang)}/all` : `${base}/new/${lang}/all`;

/** A reel: numbered frames with a day marker wherever the date changes (the
    first day's date is on the first frame itself). */
export function reelFor(lang, section = null) {
  const all = order(lang, section);
  const items = [];
  let day = null;
  all.slice(0, section ? REEL.topic : REEL.front).forEach((s, i) => {
    const key = s.dateISO.slice(0, 10);
    if (day && key !== day) items.push({ type: 'day', key, date: s.date });
    day = key;
    items.push({ type: 'story', key: s.slug, story: summary(s), n: i + 1 });
  });
  return { items, total: all.length, from: all.at(-1).date, to: all[0].date, index: indexUrl(lang, section) };
}

/** Every story in a topic (or everything), newest first, for an index page. */
export const listFor = (lang, section = null) => order(lang, section).map(row);

/** The search list: headlines and summaries only, fetched when search opens. */
export const searchIndex = (lang) => order(lang).map(row);

/** Where the language switch goes: the same topic if the other edition has
    it, otherwise that edition's front reel. `index` for index pages. */
export const altFor = (section, index = false) =>
  Object.fromEntries(
    LANGS.map((l) => {
      if (section && !sections(l).includes(section)) return [l, `${base}/new/${l}`];
      if (index) return [l, indexUrl(l, section)];
      return [l, section ? topicUrl(section, l) : `${base}/new/${l}`];
    })
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
    alt[l] = t ? `${base}/new/${l}/${t.slug}` : `${base}/new/${l}`;
  }

  return {
    story: { ...summary(s), kind: s.kind, author: s.author, authorTitle: s.authorTitle, location: s.location },
    html: marked.parse(body),
    n: i + 1,
    next,
    alt,
    translated: LANGS.some((l) => l !== s.lang && !!sibling(s, l))
  };
}

/** The topic index in the top bar: every section with its count and the
    first few photos, for previews. */
export const topicsFor = (lang) =>
  sections(lang).map((key) => {
    const list = order(lang, key);
    return { key, count: list.length, thumbs: list.slice(0, 4).map((s) => photo(s)?.thumb ?? null) };
  });
