import { FORMATS } from '$lib/labels.js';

/* /en/interviews, /en/investigations: a format's page sits at the top of its
   edition, and outranks a story slug of the same name. */
export function match(param) {
  return Object.values(FORMATS).some((f) => f.slug === param);
}
