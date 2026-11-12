/* All stories, an earlier month: see ../../+page.server.js. */
import { LANGS } from '$lib/content.js';
import { _monthsOf } from '../../+page.server.js';

export const entries = () =>
  LANGS.flatMap((lang) =>
    _monthsOf(lang)
      .slice(1)
      .map((ym) => ({ lang, year: ym.slice(0, 4), month: ym.slice(5) }))
  );
export { load } from '../../+page.server.js';
