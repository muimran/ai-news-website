/* The same list, its later pages (/page/2 …): see ../../+page.server.js. */
import { LANGS } from '$lib/content.js';
import { listFor } from '$lib/server/data.js';
import { DESK_FORMATS, isIt } from '../../../../formats.js';
import { laterPages } from '../../../../paging.js';

export const entries = () =>
  LANGS.flatMap((lang) => DESK_FORMATS.flatMap((f) => laterPages(listFor(lang).filter((s) => isIt(s, f.key)).length).map((n) => ({ lang, format: f.slug, n }))));
export { load } from '../../+page.server.js';
