import { error } from '@sveltejs/kit';
import { existsSync } from 'node:fs';
import { base } from '$app/paths';
import { ytId } from '$lib/youtube.js';
import { LANGS, inLang, getStory, sibling } from '$lib/content.js';
import { storyPage } from '$lib/server/data.js';
import { writerFor } from '$lib/server/authors.js';
import { deskStory, deskHome } from '../../../../urls.js';

/* A story's Desk address: /desk/<edition>/<year>/<month>/<slug>, the year
   and month it was filed. */
export const entries = () =>
  LANGS.flatMap((lang) =>
    inLang(lang).map((s) => {
      const [year, month] = s.ym.split('/');
      return { lang, year, month, slug: s.slug };
    })
  );

export function load({ params }) {
  const lang = params.lang;
  const s = getStory(params.slug, lang);
  if (!s || s.ym !== `${params.year}/${params.month}`) error(404, 'No such story');
  const { story, blocks, dekHtml, glossary, sections, next, translated } = storyPage(s);
  const w = writerFor(s.author);
  // a YouTube video plays at the head of its page; its still is the one made
  // at build (scripts/stills.js), sharper than YouTube's small one
  const yt = ytId(s.video);
  const big = yt && `static/uploads/sized/yt-${yt}-1600.webp`;
  const watch = yt
    ? { id: yt, still: existsSync(big) ? `${base}/uploads/sized/yt-${yt}-1600.webp` : null }
    : null;
  // the other edition: its own version of this story, or its front page
  const alt = Object.fromEntries(
    LANGS.map((l) => {
      const t = l === lang ? s : sibling(s, l);
      return [l, t && t.lang === l ? deskStory(t) : deskHome(l)];
    })
  );
  return {
    story,
    blocks,
    dekHtml,
    glossary,
    sections,
    next: next.slice(0, 3).map((x) => x.story),
    translated,
    credit: s.image?.credit || null,
    watch,
    alt,
    writer: w ? { slug: w.slug, role: lang === 'bn' ? w.role_bn || w.role : w.role, photo: w.photo } : null
  };
}
