/* Server-only: runs at build time, so each prerendered page carries just the
   stories it shows instead of the whole archive. */

import { marked } from 'marked';
import matter from 'gray-matter';
import { base } from '$app/paths';
import { LANGS, inLang, sibling, sections } from '$lib/content.js';
import { FORMATS } from '$lib/labels.js';
import { photo, topicUrl, formatUrl } from '$lib/site/reel.js';
import { writerFor, writerUrl } from './authors.js';
import { toneFor, dominant } from './tone.js';
import { smart, smartHtml } from '$lib/typo.js';

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
export const summary = (s) => ({
  slug: s.slug,
  ym: s.ym,
  lang: s.lang,
  title: s.title,
  dek: s.dek,
  section: s.section,
  date: s.date,
  readTime: s.readTime,
  kind: s.kind,
  // a video: watched, not read, for as long as it runs
  video: !!s.video,
  duration: s.duration,
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

/* A pull quote in a story's text: a line starting with >, and on the next
   line who said it, after a dash (as pullQuotes reads them below). */
const PULL = /^>\s*(.+?)\s*\n>?\s*(?:—|–|-{1,2}\s)\s*(.+)$/m;

/** The editorial trial (/editorial): the reel as the pages of a paper.
    The front page leads with the front reel's lead; its two seconds are
    the editors' secondary stories, then the next tops, each from a topic
    not on the front yet; a quote from the lead when its writer set one
    with a speaker. Then a page for each topic: its stories but the three
    on the front, most important first, five at most. The front's Inside
    column is the newest of those, each with the page it's on. */
export function edition(lang) {
  const tops = new Map();
  for (const list of sectionLists(lang)) {
    const top = leadFirst(list)[0];
    if (top) tops.set(top.slug, top);
  }
  const [lead, ...rest] = leadFirst([...tops.values()]);
  const all = order(lang);
  const taken = new Set([lead.section]);
  const seconds = [];
  for (const s of [...all.filter((x) => x.secondary), ...rest]) {
    if (seconds.length === 2) break;
    if (s === lead || seconds.includes(s) || taken.has(s.section)) continue;
    taken.add(s.section);
    seconds.push(s);
  }
  const front = new Set([lead, ...seconds].map((s) => s.slug));
  const pages = sections(lang)
    .map((key) => {
      const list = order(lang, key);
      const stories = leadFirst(list).filter((s) => !front.has(s.slug)).slice(0, 5);
      return { key, total: list.length, from: list.at(-1)?.date, to: list[0]?.date, stories };
    })
    .filter((p) => p.stories.length)
    .map((p, i) => ({ ...p, n: i + 2 }));
  const onPage = new Map(pages.flatMap((p) => p.stories.map((s) => [s.slug, p.n])));
  const quote = PULL.exec(lead.body ?? '');
  return {
    date: all[0].date,
    total: all.length,
    lead: { ...summary(lead), interviews: lead.interviews, documents: lead.documents, reporting: lead.reporting },
    quote: quote ? { text: smart(quote[1].replace(/^["“]|["”]$/g, '')), who: smart(quote[2].trim()) } : null,
    seconds: seconds.map(summary),
    inside: all.filter((s) => onPage.has(s.slug)).slice(0, 10).map((s) => ({ ...summary(s), page: onPage.get(s.slug) })),
    pages: pages.map((p) => ({ ...p, stories: p.stories.map(summary) })),
    from: all.at(-1).date,
    to: all[0].date
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

/** Everyone who writes for Second Order, most stories first, with their
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
/** Everything search needs for an edition: every story's row (not its
    text, which Pagefind searches) and every writer (to be found by name). */
export const searchIndex = (lang) => ({
  // no text: Pagefind searches that, from the built pages, so this file
  // stays small however many stories there are
  stories: order(lang).map((s) => ({ ...row(s), location: s.location })),
  writers: writers().map(({ slug, name, name_bn, role, role_bn, photo, count }) => ({
    slug,
    name,
    name_bn,
    role,
    role_bn,
    photo,
    count
  }))
});

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

/* The glossary (content/glossary/<lang>/*.md, written in the CMS): a term,
   other ways it's written, and its meaning. Each story explains the first
   time each term appears in its text, by itself; writers mark nothing.
   Never inside a link, a heading, a quote, a caption, code or a note. */
const GLOSSARY = (() => {
  const files = import.meta.glob('/content/glossary/*/*.md', { query: '?raw', import: 'default', eager: true });
  const out = Object.fromEntries(LANGS.map((l) => [l, []]));
  for (const [path, raw] of Object.entries(files)) {
    const lang = path.split('/')[3];
    const { data } = matter(raw);
    if (!out[lang] || !data.term || !data.meaning) continue;
    const forms = [data.term, ...(Array.isArray(data.also) ? data.also : [])].map((f) => String(f).trim()).filter(Boolean);
    out[lang].push({ term: smart(String(data.term)), meaning: smart(String(data.meaning).trim()), forms });
  }
  return out;
})();

const escape = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const OFF_LIMITS = /^<(\/?)(a|code|pre|h[1-6]|button|figcaption|blockquote|span)\b/i;

function explained(html, lang) {
  const word = '\\p{L}\\p{M}\\p{N}';
  /* English finds plurals too (data centres); Bangla words take their endings
     straight on (ডেটা সেন্টারের), so a match runs on to the word's end */
  const tail = lang === 'bn' ? `[\\p{L}\\p{M}]*` : `(?:s|es)?(?![${word}])`;
  const terms = GLOSSARY[lang]
    .flatMap((g, k) => g.forms.map((f) => ({ k, re: new RegExp(`(?<![${word}-])${escape(f)}${tail}`, 'iu'), len: f.length })))
    .sort((a, b) => b.len - a.len);
  const used = new Map(); // glossary entry -> its number in this story
  const parts = html.split(/(<[^>]+>)/);
  let off = 0;
  for (let i = 0; i < parts.length; i++) {
    if (i % 2) {
      const t = OFF_LIMITS.exec(parts[i]);
      if (t && !parts[i].endsWith('/>')) off += t[1] ? -1 : 1;
      continue;
    }
    if (off > 0 || !parts[i].trim()) continue;
    let text = parts[i];
    const found = [];
    for (const t of terms) {
      if (used.has(t.k)) continue;
      const m = t.re.exec(text);
      if (!m) continue;
      used.set(t.k, used.size);
      // held aside as a placeholder, so a shorter term can't match inside it
      found.push({ k: t.k, text: m[0] });
      text = text.slice(0, m.index) + `\u0001${found.length - 1}\u0002` + text.slice(m.index + m[0].length);
    }
    parts[i] = text.replace(/\u0001(\d+)\u0002/g, (_, n) => {
      const f = found[Number(n)];
      return `<span class="gl" role="button" tabindex="0" aria-expanded="false" data-gl="${used.get(f.k)}">${f.text}</span>`;
    });
  }
  const list = [...used].sort((a, b) => a[1] - b[1]).map(([k]) => ({ term: GLOSSARY[lang][k].term, meaning: GLOSSARY[lang][k].meaning }));
  return { html: parts.join(''), glossary: list };
}

/* Pull quotes. A writer starts the quote's line with > and puts who said
   it on the next line, starting with a dash (— or -). The quote and its
   speaker become one figure; without a speaker, the quote stands alone. */
const DASH = '(?:—\\s*|–\\s*|-{1,2}\\s+)'; // a plain hyphen needs a space after it
const SAME_P = new RegExp(`^(<p>[\\s\\S]*?)\\n\\s*${DASH}([^\\n]+?)\\s*<\\/p>$`);
const OWN_P = new RegExp(`^([\\s\\S]*?)\\s*<p>\\s*${DASH}([\\s\\S]+?)\\s*<\\/p>$`);
const pullQuotes = (html) =>
  html.replace(/<blockquote>\s*([\s\S]*?)\s*<\/blockquote>/g, (_, inner) => {
    const m = SAME_P.exec(inner) ?? OWN_P.exec(inner);
    const quote = m ? (SAME_P.test(inner) ? m[1] + '</p>' : m[1]) : inner;
    const who = m ? `<figcaption>${m[2]}</figcaption>` : '';
    return `<figure class="pull"><blockquote>${quote}</blockquote>${who}</figure>`;
  });

/* A link to another of our stories, pasted on a line of its own, becomes a
   card for it beside the text. Any address of ours works (the live site,
   a copy, a bare /2026/09/slug); one that isn't a story stays a link. The
   story's HTML comes back in pieces with the cards between them, so the
   page can draw each card itself. */
const ALONE = /<p>\s*(?:<a href="([^"]+)"[^>]*>[^<]*<\/a>|(\/(?:bn\/)?\d{4}\/\d{2}\/[a-z0-9-]+\/?))\s*<\/p>/gi;
function storyAt(href) {
  const m = /(?:^|\/)(?:(bn)\/)?(\d{4})\/(\d{2})\/([a-z0-9-]+)\/?(?:[?#].*)?$/i.exec(href);
  if (!m) return null;
  return order(m[1] ? 'bn' : 'en').find((x) => x.slug === m[4] && x.ym === `${m[2]}/${m[3]}`) ?? null;
}
function withCards(html, self) {
  const blocks = [];
  let last = 0;
  for (const m of html.matchAll(ALONE)) {
    const to = storyAt(m[1] ?? m[2]);
    if (!to || (to.slug === self.slug && to.lang === self.lang)) continue;
    if (m.index > last) blocks.push({ html: html.slice(last, m.index) });
    blocks.push({ also: summary(to) });
    last = m.index + m[0].length;
  }
  if (last < html.length) blocks.push({ html: html.slice(last) });
  return blocks;
}

/* Source notes. A writer types [^1] after a sentence and, on a line of its
   own anywhere below, [^1]: and the source. Each note is set beside the
   sentence it supports, numbered in the order they're cited: in the margin
   on a wide screen, opened in place with a tap on a narrower one. A marker
   with no note, or a note never cited, is left alone. */
function sourceNotes(body, lang) {
  const defs = new Map();
  body = body.replace(/^\[\^([^\]\s]+)\]:[ \t]*(.+)$/gm, (_, key, text) => (defs.set(key, text.trim()), ''));
  const order = new Map();
  body = body.replace(/\[\^([^\]\s]+)\]/g, (m, key) => {
    if (!defs.has(key)) return m;
    if (!order.has(key)) order.set(key, order.size + 1);
    return `%%note:${order.get(key)}%%`;
  });
  const digits = new Intl.NumberFormat(lang === 'bn' ? 'bn-BD-u-nu-beng' : 'en-GB');
  const notes = new Map([...order].map(([key, n]) => [n, { mark: digits.format(n), html: smartHtml(marked.parseInline(defs.get(key))) }]));
  const place = (html) =>
    html.replace(/%%note:(\d+)%%/g, (_, n) => {
      const note = notes.get(Number(n));
      return (
        `<button type="button" class="nref" aria-expanded="false" aria-controls="note-${n}">${note.mark}</button>` +
        `<span class="note" id="note-${n}" role="note"><b>${note.mark}</b> ${note.html}</span>`
      );
    });
  return { body, place };
}

export function storyPage(s) {
  const all = order(s.lang);
  const i = all.findIndex((x) => x.slug === s.slug);
  // the reel carries on below the story, wrapping round to the newest
  const next = Array.from({ length: Math.min(4, all.length - 1) }, (_, k) => {
    const j = (i + 1 + k) % all.length;
    return { story: summary(all[j]), n: j + 1 };
  });

  let body = s.body;
  if (s.dek && smart(body).startsWith(s.dek)) body = body.slice(s.dek.length).trimStart(); // already shown as the dek

  const alt = {};
  for (const l of LANGS) {
    const t = l === s.lang ? s : sibling(s, l);
    alt[l] = t ? `${base}/${l}/${t.slug}` : `${base}/${l}`;
  }

  const noted = sourceNotes(body, s.lang);
  /* the glossary reads the dek too: it's where a reader meets a term first */
  const dek = s.dek.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const SPLIT = '<hr data-split>';
  const done = explained(dek + SPLIT + noted.place(pullQuotes(smartHtml(widePhotos(marked.parse(noted.body))))), s.lang);
  const [dekHtml, html] = done.html.split(SPLIT);
  const glossary = done.glossary;
  return {
    story: {
      ...summary(s),
      kind: s.kind,
      author: s.author,
      authorTitle: s.authorTitle,
      location: s.location,
      interviews: s.interviews,
      documents: s.documents,
      reporting: s.reporting,
      sources: s.sources,
      updates: s.updates
    },
    html,
    blocks: withCards(html, s),
    dekHtml,
    glossary,
    // the story's sections, by their headings, for the map beside it
    sections: [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/g)].map((m) => m[1].trim()),
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
