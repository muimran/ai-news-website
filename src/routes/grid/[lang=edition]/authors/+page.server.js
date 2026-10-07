import { redirect } from '@sveltejs/kit';
import { base } from '$app/paths';
import { writers } from '$lib/server/data.js';

/* Everyone who writes for New Terms, both desks, on one English page. */
export const entries = () => [{ lang: 'en' }];

export function load({ params }) {
  if (params.lang !== 'en') redirect(308, `${base}/grid/en/authors`);
  return { authors: writers() };
}
