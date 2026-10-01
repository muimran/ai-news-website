import { base } from '$app/paths';
import { formatReel, altForFormat } from '$lib/server/data.js';
import { kindFor } from './format.server.js';

export { entries } from './format.server.js';

/* The live site's addresses, moved under /panes: the other edition's same
   format, or its front reel if it has none yet. */
const toGrid = (url) => url.replace(`${base}/`, `${base}/panes/`);

export function load({ params }) {
  const kind = kindFor(params);
  const gridAlt = Object.fromEntries(Object.entries(altForFormat(kind)).map(([l, u]) => [l, toGrid(u)]));
  return { format: kind, reel: formatReel(params.lang, kind), gridAlt };
}
