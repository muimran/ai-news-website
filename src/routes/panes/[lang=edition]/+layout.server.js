import { topicsFor, formatsFor, listFor } from '$lib/server/data.js';
import { pagesFor } from '$lib/server/pages.js';
import { gridPage } from '../grid.js';

export function load({ params }) {
  return {
    lang: params.lang,
    topics: topicsFor(params.lang),
    formats: formatsFor(params.lang),
    // the newsroom's own pages, at their addresses here
    pages: pagesFor(params.lang).map((p) => ({ ...p, href: gridPage(params.lang, p.slug) })),
    latest: listFor(params.lang)
  };
}
