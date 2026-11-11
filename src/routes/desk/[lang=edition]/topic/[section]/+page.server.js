import { error } from '@sveltejs/kit';
import { LANGS, sections, sectionSlug } from '$lib/content.js';
import { listFor } from '$lib/server/data.js';
import { deskTopic, deskHome } from '../../../urls.js';

export const entries = () => LANGS.flatMap((lang) => sections(lang).map((key) => ({ lang, section: sectionSlug(key) })));

export function load({ params }) {
  const all = sections(params.lang);
  const key = all.find((k) => sectionSlug(k) === params.section);
  if (!key) error(404, 'No such topic');
  // the other edition's page for this topic, if it has the topic
  const alt = Object.fromEntries(LANGS.map((l) => [l, sections(l).includes(key) ? deskTopic(key, l) : deskHome(l)]));
  return { section: key, no: all.indexOf(key) + 1, stories: listFor(params.lang, key), alt };
}
