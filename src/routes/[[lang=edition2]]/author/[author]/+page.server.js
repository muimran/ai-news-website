import { error, redirect } from '@sveltejs/kit';
import { base } from '$app/paths';
import { writers, writerBySlug, storiesByWriter } from '$lib/server/data.js';

/* One page per writer, in English, for their work on both desks. */
export const entries = () => writers().map((w) => ({ author: w.slug }));

export function load({ params }) {
  if (params.lang) redirect(308, `${base}/author/${params.author}`);
  const author = writerBySlug(params.author);
  if (!author) error(404, 'No such writer');
  return { author, stories: storiesByWriter(author), newsroom: true };
}
