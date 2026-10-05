import { redirect } from '@sveltejs/kit';
import { base } from '$app/paths';
import { inLang, sections, sectionSlug } from '$lib/content.js';
import { FORMATS } from '$lib/labels.js';
import { pageSlugs } from '$lib/server/pages.js';
import { writers } from '$lib/server/data.js';
import { storyUrl } from '../../grid.js';

/* English used to sit under /en. Every old address forwards to its new one,
   so links already shared keep working: a story to its dated address, any
   other page to the same path without /en. */
export function entries() {
  // (/en/about has its own page beside this one)
  const paths = ['', 'all', 'authors', ...pageSlugs('en').filter((p) => p !== 'about').map((p) => `about/${p}`)];
  for (const key of sections('en')) paths.push(`topic/${sectionSlug(key)}`, `topic/${sectionSlug(key)}/all`);
  for (const f of Object.values(FORMATS)) paths.push(f.slug, `${f.slug}/all`);
  for (const w of writers()) paths.push(`author/${w.slug}`);
  for (const s of inLang('en')) paths.push(...new Set([s.file, s.slug]));
  return paths.map((rest) => ({ rest }));
}

export function load({ params }) {
  const s = inLang('en').find((x) => x.slug === params.rest || x.file === params.rest);
  redirect(308, s ? storyUrl(s) : `${base}/${params.rest ?? ''}`);
}
