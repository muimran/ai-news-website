import { topicsFor, formatsFor } from '$lib/server/data.js';
import { pagesFor } from '$lib/server/pages.js';

export function load({ params }) {
  return {
    lang: params.lang,
    topics: topicsFor(params.lang),
    formats: formatsFor(params.lang),
    pages: pagesFor(params.lang)
  };
}
