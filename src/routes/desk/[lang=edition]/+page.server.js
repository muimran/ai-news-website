import { KINDS } from '$lib/labels.js';
import { edition } from '$lib/server/data.js';
import { isIt } from '../state.svelte.js';

export const entries = () => [{ lang: 'en' }, { lang: 'bn' }];

export function load({ params }) {
  const ed = edition(params.lang);
  const all = [ed.lead, ...ed.seconds, ...ed.pages.flatMap((p) => p.stories)];
  return {
    edition: ed,
    // the formats the bar offers: only those the front has, each with how many
    chips: {
      total: all.length,
      list: [...KINDS, 'Video'].map((f) => ({ f, n: all.filter((s) => isIt(s, f)).length })).filter((x) => x.n)
    }
  };
}
