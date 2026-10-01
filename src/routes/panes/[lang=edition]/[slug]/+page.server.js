import { error } from '@sveltejs/kit';
import { base } from '$app/paths';
import { LANGS, inLang, getStory } from '$lib/content.js';
import { storyPage } from '$lib/server/data.js';
import { writerFor } from '$lib/server/authors.js';

export function entries() {
  return LANGS.flatMap((lang) => inLang(lang).map((s) => ({ lang, slug: s.slug })));
}

/* The live site's addresses, moved under /panes. */
const toGrid = (url) => url.replace(`${base}/`, `${base}/panes/`);

export function load({ params }) {
  const s = getStory(params.slug, params.lang);
  if (!s) error(404, 'No such story');
  const page = storyPage(s);
  const w = writerFor(s.author);
  return {
    ...page,
    section: s.section,
    credit: s.image?.credit || null,
    gridAlt: Object.fromEntries(Object.entries(page.alt).map(([l, u]) => [l, toGrid(u)])),
    writer: w ? { slug: w.slug, role: s.lang === 'bn' ? w.role_bn || w.role : w.role, photo: w.photo } : null
  };
}
