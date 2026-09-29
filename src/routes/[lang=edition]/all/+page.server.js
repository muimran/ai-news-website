import { listFor, altFor } from '$lib/server/data.js';

/* A preview of the index design at full volume; in the long run every story
   is reached through its topic, so this page may go. */
export const entries = () => [{ lang: 'en' }, { lang: 'bn' }];

export function load({ params }) {
  return { stories: listFor(params.lang), alt: altFor(null, true) };
}
