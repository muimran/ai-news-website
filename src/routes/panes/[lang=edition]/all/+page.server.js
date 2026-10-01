import { listFor } from '$lib/server/data.js';

export const entries = () => [{ lang: 'en' }, { lang: 'bn' }];

export function load({ params }) {
  return { stories: listFor(params.lang) };
}
