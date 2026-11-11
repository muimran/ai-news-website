import { LANGS } from '$lib/content.js';
import { listFor } from '$lib/server/data.js';
import { deskAll } from '../../urls.js';

export const entries = () => LANGS.map((lang) => ({ lang }));

export function load({ params }) {
  return { stories: listFor(params.lang), alt: Object.fromEntries(LANGS.map((l) => [l, deskAll(l)])) };
}
