/* The panes prototype: its own addresses under /panes, so it can sit
   beside the live site on the same stories. */

import { base } from '$app/paths';
import { sectionSlug, FORMATS } from '$lib/labels.js';

export const gridHome = (lang) => `${base}/panes/${lang}`;
export const gridTopic = (key, lang) => `${base}/panes/${lang}/topic/${sectionSlug(key)}`;
export const gridIndex = (lang, key = null) => (key ? `${gridTopic(key, lang)}/all` : `${base}/panes/${lang}/all`);
export const gridFormat = (key, lang) => `${base}/panes/${lang}/${FORMATS[key].slug}`;
export const gridPage = (lang, slug) => `${base}/panes/${lang}/about${slug === 'about' ? '' : `/${slug}`}`;
export const storyUrl = (s) => `${base}/panes/${s.lang}/${s.slug}`;
