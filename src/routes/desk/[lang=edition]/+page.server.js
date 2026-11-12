import { edition, summary } from '$lib/server/data.js';
import { inLang } from '$lib/content.js';

export const entries = () => [{ lang: 'en' }, { lang: 'bn' }];

/* Desk's front: the edition, but when there's a video, the newest one
   takes the second of the two cards beside the lead (it plays there).
   Its topic's dossier then leaves it out, so it's on the page once. */
export function load({ params }) {
  const ed = edition(params.lang);
  const vid = inLang(params.lang)
    .filter((s) => s.video)
    .sort((a, b) => (a.date < b.date ? 1 : -1))[0];
  if (vid && ed.lead?.slug !== vid.slug && !ed.seconds.some((s) => s.video)) {
    // the card needs the video's address, to play it
    const seconds = [ed.seconds[0], { ...summary(vid), watch: vid.video }].filter(Boolean);
    return {
      edition: {
        ...ed,
        seconds,
        pages: ed.pages.map((p) => ({ ...p, stories: p.stories.filter((s) => s.slug !== vid.slug) }))
      }
    };
  }
  return { edition: ed };
}
