import { error } from '@sveltejs/kit';
import { LANGS } from '$lib/content.js';
import { listFor } from '$lib/server/data.js';
import { deskAll } from '../../urls.js';

export const entries = () => LANGS.map((lang) => ({ lang }));

/* All stories, a month to a page (/all is the newest month; /all/2026/09
   any other), so a page stays the same size however long the outlet runs.
   The history down the side is drawn from small counts (how many each day,
   how many each month) rather than from every story. */
const dayOf = (s) => new Date(s.date).toISOString().slice(0, 10);

export const _monthsOf = (lang) => [...new Set(listFor(lang).map((s) => dayOf(s).slice(0, 7)))].sort().reverse();

export function load({ params }) {
  const lang = params.lang;
  const all = listFor(lang);
  const months = _monthsOf(lang);
  const ym = params.year ? `${params.year}-${params.month}` : months[0];
  if (params.year && !months.includes(ym)) error(404, 'No stories that month');
  const days = {};
  for (const s of all) days[dayOf(s)] = (days[dayOf(s)] ?? 0) + 1;
  return {
    stories: all.filter((s) => dayOf(s).startsWith(ym)),
    ym,
    months,
    days,
    total: all.length,
    alt: Object.fromEntries(LANGS.map((l) => [l, deskAll(l)]))
  };
}
