import { formatReel, altForFormat } from '$lib/server/data.js';
import { kindFor } from './format.server.js';

export { entries } from './format.server.js';

export function load({ params }) {
  const kind = kindFor(params);
  return { format: kind, reel: formatReel(params.lang, kind), alt: altForFormat(kind) };
}
