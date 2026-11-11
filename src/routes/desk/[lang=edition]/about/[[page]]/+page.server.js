import { error } from '@sveltejs/kit';
import { LANGS } from '$lib/content.js';
import { getPage, pageSlugs } from '$lib/server/pages.js';
import { deskPage } from '../../../urls.js';

// About lives at /about itself; the others at /about/<slug>
export const entries = () =>
  LANGS.flatMap((lang) => pageSlugs(lang).map((slug) => (slug === 'about' ? { lang } : { lang, page: slug })));

export function load({ params }) {
  const slug = params.page ?? 'about';
  if (slug === 'about' && params.page) error(404, 'Not found');
  const doc = getPage(params.lang, slug);
  if (!doc) error(404, 'Not found');
  const alt = Object.fromEntries(LANGS.map((l) => [l, deskPage(l, getPage(l, slug) ? slug : 'about')]));
  return { doc: { slug, title: doc.title, html: doc.html }, alt };
}
