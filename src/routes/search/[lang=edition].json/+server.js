import { json } from '@sveltejs/kit';
import { searchIndex } from '$lib/server/data.js';

/* Built once per edition as a static file; the search panel fetches it the
   first time it opens, so no page carries it otherwise. */
export const prerender = true;
export const entries = () => [{ lang: 'en' }, { lang: 'bn' }];

export function GET({ params }) {
  return json(searchIndex(params.lang));
}
