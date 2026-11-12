import { json } from '@sveltejs/kit';
import { searchIndex } from '$lib/server/data.js';

/* Desk's search file: every story's headline, standfirst, writer, place
   and tags, but not its text. The text is searched by Pagefind, which
   reads the built story pages and loads only the pieces a search needs,
   so this file stays small however many stories there are. */
export const prerender = true;
export const entries = () => [{ lang: 'en' }, { lang: 'bn' }];

export function GET({ params }) {
  const { stories, writers } = searchIndex(params.lang);
  return json({ stories: stories.map(({ text, ...row }) => row), writers });
}
