import { topicsFor, formatsFor, listFor } from '$lib/server/data.js';
import { pagesFor } from '$lib/server/pages.js';
import { gridPage } from '../grid.js';

export function load({ params }) {
  return {
    lang: params.lang ?? 'en',
    topics: topicsFor(params.lang ?? 'en'),
    formats: formatsFor(params.lang ?? 'en'),
    // the newsroom's own pages, at their addresses here
    pages: pagesFor(params.lang ?? 'en').map((p) => ({ ...p, href: gridPage(params.lang ?? 'en', p.slug) })),
    latest: listFor(params.lang ?? 'en')
  };
}
