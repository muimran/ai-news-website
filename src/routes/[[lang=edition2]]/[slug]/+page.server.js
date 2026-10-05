import { error, redirect } from '@sveltejs/kit';
import { inLang } from '$lib/content.js';
import { storyUrl } from '../../grid.js';

/* A story's old, undated address (/bn/<slug>, by its file's name or its
   address) forwards to its dated one. */
export function entries() {
  return inLang('bn').flatMap((s) => [...new Set([s.file, s.slug])].map((slug) => ({ lang: 'bn', slug })));
}

export function load({ params }) {
  const s = inLang(params.lang ?? 'en').find((x) => x.slug === params.slug || x.file === params.slug);
  if (!s) error(404, 'No such story');
  redirect(308, storyUrl(s));
}
