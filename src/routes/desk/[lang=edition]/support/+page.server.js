import { LANGS } from '$lib/content.js';
import { deskSupport } from '../../urls.js';

export const entries = () => LANGS.map((lang) => ({ lang }));

export function load() {
  return { alt: Object.fromEntries(LANGS.map((l) => [l, deskSupport(l)])) };
}
