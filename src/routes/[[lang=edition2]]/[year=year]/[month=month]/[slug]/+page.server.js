import { error } from '@sveltejs/kit';
import { LANGS, inLang, getStory, sibling } from '$lib/content.js';
import { storyPage } from '$lib/server/data.js';
import { writerFor } from '$lib/server/authors.js';
import { storyUrl, gridHome } from '../../../../grid.js';

/* A story's address: [/edition]/year/month/slug — English with no edition,
   the year and month it was filed. */
export function entries() {
  return LANGS.flatMap((lang) =>
    inLang(lang).map((s) => {
      const [year, month] = s.ym.split('/');
      return { ...(lang === 'en' ? {} : { lang }), year, month, slug: s.slug };
    })
  );
}

export function load({ params }) {
  const lang = params.lang ?? 'en';
  const s = getStory(params.slug, lang);
  if (!s || s.ym !== `${params.year}/${params.month}`) error(404, 'No such story');
  const page = storyPage(s);
  const w = writerFor(s.author);
  // the other edition: its own version of this story, or its front page
  const gridAlt = Object.fromEntries(
    LANGS.filter((l) => l !== lang).map((l) => {
      const t = sibling(s, l);
      return [l, t && t.lang === l ? storyUrl(t) : gridHome(l)];
    })
  );
  return {
    ...page,
    section: s.section,
    // a special that throws away the site's frame (CMS Layout: Special — full screen)
    fullscreen: s.template === 'special-full',
    credit: s.image?.credit || null,
    gridAlt,
    writer: w ? { slug: w.slug, role: s.lang === 'bn' ? w.role_bn || w.role : w.role, photo: w.photo } : null
  };
}
