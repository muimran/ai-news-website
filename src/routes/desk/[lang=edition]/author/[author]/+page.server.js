import { error } from '@sveltejs/kit';
import { LANGS } from '$lib/content.js';
import { writers, writerBySlug, storiesByWriter } from '$lib/server/data.js';
import { deskAuthor } from '../../../urls.js';

export const entries = () => LANGS.flatMap((lang) => writers().map((w) => ({ lang, author: w.slug })));

/* A writer, and their work on both desks. */
export function load({ params }) {
  const author = writerBySlug(params.author);
  if (!author) error(404, 'No such writer');
  return { author, stories: storiesByWriter(author), alt: Object.fromEntries(LANGS.map((l) => [l, deskAuthor(author.slug, l)])) };
}
