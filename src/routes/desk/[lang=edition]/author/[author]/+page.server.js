import { error } from '@sveltejs/kit';
import { LANGS } from '$lib/content.js';
import { writers, writerBySlug, storiesByWriter } from '$lib/server/data.js';
import { deskAuthor } from '../../../urls.js';
import { pageOf, PER } from '../../../paging.js';

export const entries = () => LANGS.flatMap((lang) => writers().map((w) => ({ lang, author: w.slug })));

/* A writer, and their work on both desks. */
export function load({ params }) {
  const author = writerBySlug(params.author);
  if (!author) error(404, 'No such writer');
  const list = storiesByWriter(author);
  if (params.n && Number(params.n) > Math.ceil(list.length / PER)) error(404, 'No such page');
  return { author, ...pageOf(list, Number(params.n ?? 1)), href: deskAuthor(author.slug, params.lang), alt: Object.fromEntries(LANGS.map((l) => [l, deskAuthor(author.slug, l)])) };
}
