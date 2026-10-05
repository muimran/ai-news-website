import { error } from '@sveltejs/kit';
import { LANGS, sections, sectionSlug } from '$lib/content.js';
import { reelFor } from '$lib/server/data.js';

/* the edition's marker in a prerendered address: none for English */
const ed = (lang) => (lang === 'en' ? {} : { lang });

export function entries() {
  return LANGS.flatMap((lang) => sections(lang).map((key) => ({ ...ed(lang), section: sectionSlug(key) })));
}

export function load({ params }) {
  const key = sections(params.lang ?? 'en').find((k) => sectionSlug(k) === params.section);
  if (!key) error(404, 'No such topic');
  return { section: key, reel: reelFor(params.lang ?? 'en', key) };
}
