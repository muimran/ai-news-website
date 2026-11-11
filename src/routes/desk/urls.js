/* Desk's own addresses, under /desk/<edition>. Stories still open at the
   site's story pages (storyUrl in ../grid.js). */
import { base } from '$app/paths';
import { sectionSlug, FORMATS } from '$lib/labels.js';

const at = (lang) => `${base}/desk/${lang}`;

export const deskHome = (lang) => at(lang);
export const deskTopic = (key, lang) => `${at(lang)}/topic/${sectionSlug(key)}`;
export const deskFormat = (key, lang) => `${at(lang)}/${FORMATS[key].slug}`;
export const deskAll = (lang) => `${at(lang)}/all`;
export const deskAuthors = (lang) => `${at(lang)}/authors`;
export const deskAuthor = (slug, lang) => `${at(lang)}/author/${slug}`;
export const deskPage = (lang, slug) => `${at(lang)}/about${slug === 'about' ? '' : `/${slug}`}`;
