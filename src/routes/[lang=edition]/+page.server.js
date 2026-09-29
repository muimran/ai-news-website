import { frontReel, altFor } from '$lib/server/data.js';

export const entries = () => [{ lang: 'en' }, { lang: 'bn' }];

export function load({ params }) {
  return { reel: frontReel(params.lang), alt: altFor(null) };
}
