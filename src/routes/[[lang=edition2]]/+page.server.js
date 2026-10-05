import { frontReel } from '$lib/server/data.js';

export const entries = () => [{}, { lang: 'bn' }];

export function load({ params }) {
  return { reel: frontReel(params.lang ?? 'en') };
}
