import { redirect } from '@sveltejs/kit';
import { base } from '$app/paths';
import { inLang, sections, sectionSlug } from '$lib/content.js';
import { FORMATS } from '$lib/labels.js';
import { pageSlugs } from '$lib/server/pages.js';
import { writers } from '$lib/server/data.js';
import { storyUrl } from '../../grid.js';

/* This design was first tried out under /panes (/panes/en/..., /panes/bn/...).
   It's the site now, at the root: every address shared from back then
   forwards to the same page today. */
export function entries() {
  const paths = [];
  for (const lang of ['en', 'bn']) {
    const at = (p) => paths.push(p ? `${lang}/${p}` : lang);
    at('');
    at('all');
    for (const key of sections(lang)) at(`topic/${sectionSlug(key)}`), at(`topic/${sectionSlug(key)}/all`);
    for (const f of Object.values(FORMATS)) at(f.slug), at(`${f.slug}/all`);
    for (const p of pageSlugs(lang)) at(p === 'about' ? 'about' : `about/${p}`);
    for (const s of inLang(lang)) for (const slug of new Set([s.file, s.slug])) at(slug);
  }
  paths.push('en/authors', ...writers().map((w) => `en/author/${w.slug}`));
  return paths.map((rest) => ({ rest }));
}

export function load({ params }) {
  const [lang, ...more] = params.rest.split('/');
  const rest = more.join('/');
  const s = more.length === 1 && inLang(lang).find((x) => x.slug === rest || x.file === rest);
  if (s) redirect(308, storyUrl(s));
  redirect(308, `${base}${lang === 'bn' ? '/bn' : ''}${rest ? `/${rest}` : ''}` || '/');
}
