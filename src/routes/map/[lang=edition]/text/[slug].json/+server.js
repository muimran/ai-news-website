import { json, error } from '@sveltejs/kit';
import { LANGS, inLang, getStory } from '$lib/content.js';
import { _textOf } from '../../[[slug]]/+page.server.js';

/* One story's text for the map's panel, fetched when the story is opened. */
export const prerender = true;
export const entries = () => LANGS.flatMap((lang) => inLang(lang).map((s) => ({ lang, slug: s.slug })));

export function GET({ params }) {
  const s = getStory(params.slug, params.lang);
  if (!s) error(404, 'No such story');
  return json({ html: _textOf(s) });
}
