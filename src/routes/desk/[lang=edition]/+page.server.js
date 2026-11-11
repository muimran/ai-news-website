import { edition, topicsFor, formatsFor } from '$lib/server/data.js';
import { pagesFor } from '$lib/server/pages.js';
import { gridPage } from '../../grid.js';

export const entries = () => [{ lang: 'en' }, { lang: 'bn' }];

export function load({ params }) {
  const lang = params.lang;
  return {
    lang,
    edition: edition(lang),
    // for the menu: every topic and format with its count, the newsroom's own pages
    topics: topicsFor(lang).map(({ key, count }) => ({ key, count })),
    formats: formatsFor(lang).map(({ key, count }) => ({ key, count })),
    pages: pagesFor(lang).map((p) => ({ ...p, href: gridPage(lang, p.slug) }))
  };
}
