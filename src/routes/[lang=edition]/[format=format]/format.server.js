import { error } from '@sveltejs/kit';
import { LANGS } from '$lib/content.js';
import { FORMATS } from '$lib/labels.js';
import { ofKind } from '$lib/server/data.js';

/* Shared by a format's reel and its full index. */
export const entries = () =>
  LANGS.flatMap((lang) =>
    Object.entries(FORMATS)
      .filter(([key]) => ofKind(lang, key).length)
      .map(([, f]) => ({ lang, format: f.slug }))
  );

/** The format a URL names, or a 404 when this edition has none of it yet. */
export function kindFor(params) {
  const key = Object.keys(FORMATS).find((k) => FORMATS[k].slug === params.format);
  if (!ofKind(params.lang, key).length) error(404, 'Nothing here yet');
  return key;
}
