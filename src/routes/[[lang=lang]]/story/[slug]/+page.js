import { error } from '@sveltejs/kit';
import { getStory, stories, sibling, DEFAULT_LANG } from '$lib/content.js';

export const prerender = true;

/** Every article URL, in both languages. */
export function entries() {
  return stories.map((s) => ({
    lang: s.lang === DEFAULT_LANG ? undefined : s.lang,
    slug: s.slug
  }));
}

export function load({ params }) {
  const lang = params.lang || DEFAULT_LANG;
  const story = getStory(params.slug, lang);
  if (!story) throw error(404, 'That story is not in the archive.');

  const related = stories
    .filter((s) => s.lang === lang && s.slug !== story.slug && s.section === story.section)
    .slice(0, 3);

  const other = lang === 'en' ? 'bn' : 'en';
  return { lang, story, related, twin: sibling(story, other) };
}
