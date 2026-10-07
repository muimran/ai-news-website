import { redirect } from '@sveltejs/kit';
import { base } from '$app/paths';
import { writers } from '$lib/server/data.js';

/* Everyone who writes for Second Order, both desks, on one English page. */
export const entries = () => [{}];

export function load({ params }) {
  if (params.lang) redirect(308, `${base}/authors`);
  return { authors: writers(), newsroom: true };
}
