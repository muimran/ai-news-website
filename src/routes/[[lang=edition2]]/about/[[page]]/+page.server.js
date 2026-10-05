import { error } from '@sveltejs/kit';
import { LANGS } from '$lib/content.js';
import { getPage, pageSlugs } from '$lib/server/pages.js';
import { gridPage } from '../../../grid.js';

// About lives at /about itself; the others at /about/<slug>
/* the edition's marker in a prerendered address: none for English */
const ed = (lang) => (lang === 'en' ? {} : { lang });

export function entries() {
  return LANGS.flatMap((lang) =>
    pageSlugs(lang).map((slug) => (slug === 'about' ? ed(lang) : { ...ed(lang), page: slug }))
  );
}

export function load({ params }) {
  const slug = params.page ?? 'about';
  if (slug === 'about' && params.page) error(404, 'Not found');
  const doc = getPage(params.lang ?? 'en', slug);
  if (!doc) error(404, 'Not found');
  const gridAlt = Object.fromEntries(LANGS.map((l) => [l, gridPage(l, getPage(l, slug) ? slug : 'about')]));
  return { doc: { slug, title: doc.title, html: doc.html }, gridAlt, newsroom: true };
}
