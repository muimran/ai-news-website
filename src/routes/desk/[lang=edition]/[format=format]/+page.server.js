import { error } from '@sveltejs/kit';
import { LANGS } from '$lib/content.js';
import { FORMATS } from '$lib/labels.js';
import { ofKind, formatList } from '$lib/server/data.js';
import { deskFormat, deskHome } from '../../urls.js';

export const entries = () =>
  LANGS.flatMap((lang) =>
    Object.entries(FORMATS)
      .filter(([key]) => ofKind(lang, key).length)
      .map(([, f]) => ({ lang, format: f.slug }))
  );

export function load({ params }) {
  const kind = Object.keys(FORMATS).find((k) => FORMATS[k].slug === params.format);
  if (!ofKind(params.lang, kind).length) error(404, 'Nothing here yet');
  const alt = Object.fromEntries(LANGS.map((l) => [l, ofKind(l, kind).length ? deskFormat(kind, l) : deskHome(l)]));
  return { format: kind, stories: formatList(params.lang, kind), alt };
}
