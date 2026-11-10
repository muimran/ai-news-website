import { base } from '$app/paths';
import { edition } from '$lib/server/data.js';

export const entries = () => [{}, { lang: 'bn' }];

export function load({ params }) {
  return {
    edition: edition(params.lang ?? 'en'),
    // the language switch stays on the trial
    gridAlt: { en: `${base}/editorial`, bn: `${base}/bn/editorial` }
  };
}
