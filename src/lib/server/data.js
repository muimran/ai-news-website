/* Server-only: runs at build time, so each prerendered page carries just the
   stories it shows instead of the whole archive. */

import { marked } from 'marked';
import { base } from '$app/paths';
import { LANGS, inLang, sibling, sections } from '$lib/content.js';
import { photo, topicUrl } from '$lib/site/reel.js';
import { writerFor, writerUrl } from './authors.js';

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
  author: s.author,
  translationOf: s.translationOf,
  image: s.image
});

/** An index or search row: a summary plus what the filter looks through. */
const row = (s) => ({ ...summary(s), tags: s.tags });

const newestFirst = (a, b) => b.date - a.date || a.weight - b.weight;
export const order = (lang, section = null) =>
  inLang(lang).filter((s) => !section || s.section === section).sort(newestFirst);

export const indexUrl = (lang, section) =>
  section ? `${topicUrl(section, lang)}/all` : `${base}/${lang}/all`;

const DAY = 86400000;

/** Monday 00:00 UTC of the week a date falls in. */
const weekStart = (d) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - ((d.getUTCDay() + 6) % 7)));

/** A reel: numbered frames with a marker wherever the date moves on (the
    first date is on the first frame itself). Markers mark days while there
    are several stories a day, weeks once stories are sparser than that. */
export function reelFor(lang, section = null) {
  const all = order(lang, section);
  const slice = all.slice(0, section ? REEL.topic : REEL.front);
  const days = new Set(slice.map((s) => s.dateISO.slice(0, 10))).size;
  const byWeek = days > slice.length * 0.6;

  const items = [];
  let mark = null;
  slice.forEach((s, i) => {
    const start = byWeek ? weekStart(s.date) : null;
    const key = byWeek ? start.toISOString().slice(0, 10) : s.dateISO.slice(0, 10);
    if (mark && key !== mark) {
      items.push(
        byWeek
          ? { type: 'day', key, date: s.date, from: start, to: new Date(start.getTime() + 6 * DAY) }
          : { type: 'day', key, date: s.date }
      );
    }
    mark = key;
    items.push({ type: 'story', key: s.slug, story: summary(s), n: i + 1 });
  });
  return { items, total: all.length, from: all.at(-1).date, to: all[0].date, index: indexUrl(lang, section) };
}

/** Every story in a topic (or everything), newest first, for an index page. */
export const listFor = (lang, section = null) => order(lang, section).map(row);

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
    html: marked.parse(body),
    n: i + 1,
    next,
    alt,
    translated: LANGS.some((l) => l !== s.lang && !!sibling(s, l)),
    writer: writerFor(s.author) ? writerUrl(writerFor(s.author)) : null
  };
}

/** The topic index in the top bar: every section with its count and the
    first few photos, for previews. */
export const topicsFor = (lang) =>
  sections(lang).map((key) => {
    const list = order(lang, key);
    return { key, count: list.length, thumbs: list.slice(0, 4).map((s) => photo(s)?.thumb ?? null) };
  });
