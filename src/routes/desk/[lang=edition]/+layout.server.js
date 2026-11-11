import { topicsFor, formatsFor, order } from '$lib/server/data.js';
import { pagesFor } from '$lib/server/pages.js';
import { deskPage } from '../urls.js';

/* What every Desk page needs: the edition, its newest day, and the menu's
   lists (each topic and format with its count, the newsroom's own pages). */
export function load({ params }) {
  const lang = params.lang;
  return {
    lang,
    day: order(lang)[0]?.date ?? null,
    topics: topicsFor(lang).map(({ key, count }) => ({ key, count })),
    formats: formatsFor(lang).map(({ key, count }) => ({ key, count })),
    pages: pagesFor(lang).map((p) => ({ ...p, href: deskPage(lang, p.slug) }))
  };
}
