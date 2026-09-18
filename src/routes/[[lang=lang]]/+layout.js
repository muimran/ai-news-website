import { DEFAULT_LANG } from '$lib/content.js';

export const prerender = true;

export function load({ params }) {
  return { lang: params.lang || DEFAULT_LANG };
}
