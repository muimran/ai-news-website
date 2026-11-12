/* Desk's formats: the kinds of story a reader can browse by, across the
   topics. Video is one too, whatever kind the story is. Each has a page
   of its own (/desk/<edition>/<slug>) and a place in the bar. */
import { kindLabel } from '$lib/labels.js';

export const DESK_FORMATS = [
  { key: 'Investigation', slug: 'investigations', en: 'Investigations' },
  { key: 'Interview', slug: 'interviews', en: 'Interviews' },
  { key: 'Explainer', slug: 'explainers', en: 'Explainers' },
  { key: 'Analysis', slug: 'analysis', en: 'Analysis' },
  { key: 'Video', slug: 'video', en: 'Video', bn: 'ভিডিও' }
];

/** Is a story of this format? */
export const isIt = (s, key) => (key === 'Video' ? !!s.video : s.kind === key);

export const formatBySlug = (slug) => DESK_FORMATS.find((f) => f.slug === slug) ?? null;
export const formatName = (key, lang) => {
  const f = DESK_FORMATS.find((x) => x.key === key);
  return lang === 'bn' ? (f?.bn ?? kindLabel(key, 'bn')) : (f?.en ?? key);
};
