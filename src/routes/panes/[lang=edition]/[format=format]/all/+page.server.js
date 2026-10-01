import { base } from '$app/paths';
import { formatList, altForFormat } from '$lib/server/data.js';
import { kindFor } from '../format.server.js';

export { entries } from '../format.server.js';

const toGrid = (url) => url.replace(`${base}/`, `${base}/panes/`);

export function load({ params }) {
  const kind = kindFor(params);
  const gridAlt = Object.fromEntries(Object.entries(altForFormat(kind, true)).map(([l, u]) => [l, toGrid(u)]));
  return { format: kind, stories: formatList(params.lang, kind), gridAlt };
}
