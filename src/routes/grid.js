/* The panes prototype: its own addresses under /panes, so it can sit
   beside the live site on the same stories. */

import { base } from '$app/paths';
import { sectionSlug, FORMATS } from '$lib/labels.js';

/* English has the plain address; another edition its two letters first */
const at = (lang) => `${base}${lang === 'en' ? '' : `/${lang}`}`;

export const gridHome = (lang) => at(lang) || '/';
export const gridTopic = (key, lang) => `${at(lang)}/topic/${sectionSlug(key)}`;
export const gridIndex = (lang, key = null) => (key ? `${gridTopic(key, lang)}/all` : `${at(lang)}/all`);
export const gridFormat = (key, lang) => `${at(lang)}/${FORMATS[key].slug}`;
export const gridPage = (lang, slug) => `${at(lang)}/about${slug === 'about' ? '' : `/${slug}`}`;
/* a story: its edition, the year and month it was filed, its slug.
   (A row without its filed month falls back to its date's.) */
const ymOf = (s) => {
  if (s.ym) return s.ym;
  const d = new Date(s.date);
  return `${d.getUTCFullYear()}/${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
};
// a writer's page is one page for both desks, at the English address
export const gridAuthor = (slug) => `${at('en')}/author/${slug}`;
export const storyUrl = (s) => `${at(s.lang)}/${ymOf(s)}/${s.slug}`;
