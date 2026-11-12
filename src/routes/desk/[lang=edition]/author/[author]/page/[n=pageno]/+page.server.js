/* The same list, its later pages (/page/2 …): see ../../+page.server.js. */
import { LANGS } from '$lib/content.js';
import { writers, storiesByWriter } from '$lib/server/data.js';
import { laterPages } from '../../../../../paging.js';

export const entries = () => LANGS.flatMap((lang) => writers().flatMap((w) => laterPages(storiesByWriter(w).length).map((n) => ({ lang, author: w.slug, n }))));
export { load } from '../../+page.server.js';
