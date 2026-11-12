/* Desk's own addresses, under /desk/<edition>. Stories still open at the
   site's story pages (storyUrl in ../grid.js). */
import { base } from '$app/paths';
import { sectionSlug } from '$lib/labels.js';
import { DESK_FORMATS } from './formats.js';

const at = (lang) => `${base}/desk/${lang}`;

export const deskHome = (lang) => at(lang);
export const deskTopic = (key, lang) => `${at(lang)}/topic/${sectionSlug(key)}`;
export const deskFormat = (key, lang) => `${at(lang)}/${DESK_FORMATS.find((f) => f.key === key).slug}`;
export const deskAll = (lang) => `${at(lang)}/all`;
/** All stories, one month: ym is '2026-09'. */
export const deskAllMonth = (lang, ym) => `${at(lang)}/all/${ym.replace('-', '/')}`;
export const deskAuthors = (lang) => `${at(lang)}/authors`;
export const deskAuthor = (slug, lang) => `${at(lang)}/author/${slug}`;
export const deskSupport = (lang) => `${at(lang)}/support`;
export const deskPage = (lang, slug) => `${at(lang)}/about${slug === 'about' ? '' : `/${slug}`}`;

/* a story: its edition, the year and month it was filed, its slug */
const ymOf = (s) => {
  if (s.ym) return s.ym;
  const d = new Date(s.date);
  return `${d.getUTCFullYear()}/${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
};
export const deskStory = (s) => `${at(s.lang)}/${ymOf(s)}/${s.slug}`;
