import { error } from '@sveltejs/kit';
import { byTag, allTags, LANGS, DEFAULT_LANG } from '$lib/content.js';

export const prerender = true;

/** Tag pages are per-language: the Bangla desk tags in Bangla. */
export function entries() {
  return LANGS.flatMap((lang) =>
    allTags(lang).map((tag) => ({
      lang: lang === DEFAULT_LANG ? undefined : lang,
      tag
    }))
  );
}

export function load({ params }) {
  const lang = params.lang || DEFAULT_LANG;
  const tag = decodeURIComponent(params.tag);
  const stories = byTag(tag, lang);

  /* SvelteKit expands `entries()` across the optional language param, so an
     English tag would otherwise also produce an empty /bn/topic/<tag> page.
     A tag with nothing filed under it in this language is not a real page —
     404 it so the prerenderer skips it and search engines never index it. */
  if (stories.length === 0) throw error(404, 'No stories filed under that tag.');

  return { lang, tag, stories };
}
