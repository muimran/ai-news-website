import { error } from '@sveltejs/kit';
import { marked } from 'marked';
import { LANGS, inLang, getStory, sibling } from '$lib/content.js';
import { mapFor, BOUNDS } from '$lib/map.js';

/* A story's URL is the front page with that story already open, so every
   story gets its own prerendered copy of the paragraph. */
export function entries() {
  return LANGS.flatMap((lang) => [{ lang }, ...inLang(lang).map((s) => ({ lang, slug: s.slug }))]);
}

/* What a box on the map needs, and its other edition's slug; never its
   text, which is fetched when the story is opened (../text/[slug].json),
   so the page doesn't carry every story. */
const box = (s) => ({
  slug: s.slug,
  lang: s.lang,
  title: s.title,
  dek: s.dek,
  section: s.section,
  kind: s.kind,
  date: s.date,
  weight: s.weight,
  readTime: s.readTime,
  author: s.author,
  location: s.location,
  tags: s.tags,
  image: s.image,
  alt: Object.fromEntries(LANGS.map((l) => [l, l === s.lang ? s.slug : (sibling(s, l)?.lang === l ? sibling(s, l).slug : null)]))
});

/** A story's text as the panel shows it (most bodies repeat the dek first). */
export const _textOf = (s) => {
  let b = s.body;
  if (s.dek && b.startsWith(s.dek)) b = b.slice(s.dek.length).trimStart();
  return marked.parse(b);
};

export function load({ params }) {
  const slug = params.slug ?? null;
  const s = slug && getStory(slug, params.lang);
  if (slug && !s) error(404, 'No such story');
  const { items, areas } = mapFor(params.lang);
  return {
    lang: params.lang,
    slug,
    map: { items: items.map(({ story, ...at }) => ({ ...at, story: box(story) })), areas },
    bounds: BOUNDS,
    text: s ? { [slug]: _textOf(s) } : {}
  };
}
