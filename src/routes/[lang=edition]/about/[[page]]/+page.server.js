import { error } from '@sveltejs/kit';
import { LANGS } from '$lib/content.js';
import { getPage, pageSlugs, pageUrl } from '$lib/server/pages.js';

// About lives at /about itself; the others at /about/<slug>
export function entries() {
  return LANGS.flatMap((lang) =>
    pageSlugs(lang).map((slug) => (slug === 'about' ? { lang } : { lang, page: slug }))
  );
}

export function load({ params }) {
  const slug = params.page ?? 'about';
  if (slug === 'about' && params.page) error(404, 'Not found');
  const page = getPage(params.lang, slug);
  if (!page) error(404, 'Not found');
  const alt = Object.fromEntries(
    LANGS.map((l) => [l, getPage(l, slug) ? pageUrl(l, slug) : pageUrl(l, 'about')])
  );
  return { page: { slug, title: page.title, html: page.html }, alt };
}
