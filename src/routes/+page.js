import { redirect } from '@sveltejs/kit';
import { base } from '$app/paths';

/* The site lives in two editions, /en and /bn; the bare address opens English. */
export function load() {
  redirect(307, `${base}/en`);
}
