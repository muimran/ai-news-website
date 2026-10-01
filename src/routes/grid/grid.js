/* The ruled-grid prototype: its own addresses under /grid, so it can sit
   beside the live site on the same stories. */

import { base } from '$app/paths';
import { sectionSlug } from '$lib/labels.js';

export const gridHome = (lang) => `${base}/grid/${lang}`;
export const gridTopic = (key, lang) => `${base}/grid/${lang}/topic/${sectionSlug(key)}`;
export const gridIndex = (lang, key = null) => (key ? `${gridTopic(key, lang)}/all` : `${base}/grid/${lang}/all`);
export const storyUrl = (s) => `${base}/grid/${s.lang}/${s.slug}`;
