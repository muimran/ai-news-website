import { LANGS } from '$lib/content.js';
import { writers } from '$lib/server/data.js';
import { deskAuthors } from '../../urls.js';

export const entries = () => LANGS.map((lang) => ({ lang }));

/* Everyone who writes for Second Order, both desks. */
export function load() {
  return { authors: writers(), alt: Object.fromEntries(LANGS.map((l) => [l, deskAuthors(l)])) };
}
