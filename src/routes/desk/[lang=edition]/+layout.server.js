import { topicsFor, listFor } from '$lib/server/data.js';
import { pagesFor } from '$lib/server/pages.js';
import { DESK_FORMATS, isIt } from '../formats.js';
import { deskPage } from '../urls.js';

/* What every Desk page needs: the edition, its newest day, how many
   stories it has, and the lists the bar and the menu show (each topic and
   each format with its count, the newsroom's own pages). */
export function load({ params }) {
  const lang = params.lang;
  const all = listFor(lang);
  return {
    lang,
    day: all[0]?.date ?? null,
    total: all.length,
    topics: topicsFor(lang).map(({ key, count }) => ({ key, count })),
    formats: DESK_FORMATS.map((f) => ({ key: f.key, count: all.filter((s) => isIt(s, f.key)).length })).filter((f) => f.count),
    pages: pagesFor(lang).map((p) => ({ ...p, href: deskPage(lang, p.slug) }))
  };
}
