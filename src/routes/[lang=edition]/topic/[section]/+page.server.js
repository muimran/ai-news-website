import { error } from '@sveltejs/kit';
import { LANGS, sections, sectionSlug } from '$lib/content.js';
import { reelFor, altFor } from '$lib/server/data.js';

export function entries() {
  return LANGS.flatMap((lang) => sections(lang).map((key) => ({ lang, section: sectionSlug(key) })));
}

export function load({ params }) {
  const key = sections(params.lang).find((k) => sectionSlug(k) === params.section);
  if (!key) error(404, 'No such topic');
  return { section: key, reel: reelFor(params.lang, key), alt: altFor(key) };
}
