import { edition, summary } from '$lib/server/data.js';
import { inLang } from '$lib/content.js';
import { onDesk } from '../topics.js';

export const entries = () => [{ lang: 'en' }, { lang: 'bn' }];

/* Halfway down, between two dossiers, the page takes a breath: our feed's
   newest posts, as a strip of tiles, whatever their topic. */
function feed(lang, ed) {
  if (!ed.pages.length) return null;
  const after = Math.ceil(ed.pages.length / 2) - 1;
  const posts = inLang(lang)
    .sort((a, b) => b.date - a.date)
    .slice(0, 4)
    .map(summary);
  return posts.length ? { after, posts } : null;
}

/* Desk's front: the edition, but when there's a video, the newest one
   takes the second of the two cards beside the lead (it plays there).
   Its topic's dossier then leaves it out, so it's on the page once. */
function front(lang) {
  const ed = edition(lang);
  const vid = inLang(lang)
    .filter((s) => s.video)
    .sort((a, b) => (a.date < b.date ? 1 : -1))[0];
  if (vid && ed.lead?.slug !== vid.slug && !ed.seconds.some((s) => s.video)) {
    // the card needs the video's address, to play it
    const seconds = [ed.seconds[0], { ...summary(vid), watch: vid.video }].filter(Boolean);
    return {
      ...ed,
      seconds,
      pages: ed.pages.map((p) => ({ ...p, stories: p.stories.filter((s) => s.slug !== vid.slug) }))
    };
  }
  return ed;
}

export function load({ params }) {
  const all = front(params.lang);
  // the topics Desk leaves out have no box on its front
  const ed = { ...all, pages: all.pages.filter((p) => onDesk(p.key)) };
  return { edition: { ...ed, feed: feed(params.lang, ed) } };
}
