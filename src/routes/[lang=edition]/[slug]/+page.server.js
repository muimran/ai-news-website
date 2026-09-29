import { error } from '@sveltejs/kit';
import { LANGS, inLang, getStory } from '$lib/content.js';
import { storyPage } from '$lib/server/data.js';

export function entries() {
  return LANGS.flatMap((lang) => inLang(lang).map((s) => ({ lang, slug: s.slug })));
}

export function load({ params }) {
  const s = getStory(params.slug, params.lang);
  if (!s) error(404, 'No such story');
  return storyPage(s);
}
