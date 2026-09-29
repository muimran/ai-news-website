import { inLang } from '$lib/content.js';
import { topicsFor } from '../data.server.js';
import { pagesFor } from '../pages.server.js';

export function load({ params }) {
  return {
    lang: params.lang,
    topics: topicsFor(params.lang),
    total: inLang(params.lang).length,
    pages: pagesFor(params.lang)
  };
}
