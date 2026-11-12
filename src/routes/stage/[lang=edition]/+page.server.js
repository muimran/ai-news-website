import { edition } from '$lib/server/data.js';

export const entries = () => [{ lang: 'en' }, { lang: 'bn' }];

export function load({ params }) {
  return { lang: params.lang, edition: edition(params.lang) };
}
