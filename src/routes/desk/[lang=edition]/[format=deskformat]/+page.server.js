import { error } from '@sveltejs/kit';
import { LANGS } from '$lib/content.js';
import { listFor } from '$lib/server/data.js';
import { DESK_FORMATS, formatBySlug, isIt } from '../../formats.js';
import { deskFormat, deskHome } from '../../urls.js';

const of = (lang, key) => listFor(lang).filter((s) => isIt(s, key));

export const entries = () =>
  LANGS.flatMap((lang) => DESK_FORMATS.filter((f) => of(lang, f.key).length).map((f) => ({ lang, format: f.slug })));

export function load({ params }) {
  const f = formatBySlug(params.format);
  const stories = f ? of(params.lang, f.key) : [];
  if (!stories.length) error(404, 'Nothing here yet');
  // the other edition's page for this format, if it has any
  const alt = Object.fromEntries(LANGS.map((l) => [l, of(l, f.key).length ? deskFormat(f.key, l) : deskHome(l)]));
  return { format: f.key, stories, alt };
}
