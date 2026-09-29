import { error } from '@sveltejs/kit';
import { LANGS, inLang, getStory } from '$lib/content.js';

/* A story's URL is the front page with that story already open, so every
   story gets its own prerendered copy of the paragraph. */
export function entries() {
  return LANGS.flatMap((lang) => [{ lang }, ...inLang(lang).map((s) => ({ lang, slug: s.slug }))]);
}

export function load({ params }) {
  const slug = params.slug ?? null;
  if (slug && !getStory(slug, params.lang)) error(404, 'No such story');
  return { lang: params.lang, slug };
}
