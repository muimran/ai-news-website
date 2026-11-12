/* The same list, its later pages (/page/2 …): see ../../+page.server.js. */
import { LANGS, sections, sectionSlug } from '$lib/content.js';
import { listFor } from '$lib/server/data.js';
import { laterPages } from '../../../../../paging.js';

export const entries = () =>
  LANGS.flatMap((lang) => sections(lang).flatMap((key) => laterPages(listFor(lang, key).length).map((n) => ({ lang, section: sectionSlug(key), n }))));
export { load } from '../../+page.server.js';
