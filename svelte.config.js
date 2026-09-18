import adapter from '@sveltejs/adapter-static';

/* GitHub Pages serves a project site at <user>.github.io/<repo>/, so every
   asset and internal link needs that repo name prefixed. The deploy workflow
   sets BASE_PATH; local dev and preview leave it unset and run at the root. */
const base = process.env.BASE_PATH || '';

/** @type {import('@sveltejs/kit').Config} */
export default {
  kit: {
    adapter: adapter({
      /* Every route is prerendered (see entries() in +page.js files), so this
         file never actually drives client-side routing — but it still has to
         exist under some name. It was 'index.html', which silently overwrote
         the real prerendered homepage with a blank hydrate-on-load shell.
         '404.html' is inert here and doubles as GitHub Pages' unmatched-path
         page for free. */
      fallback: '404.html',
      precompress: false
    }),
    paths: { base },
    prerender: {
      handleHttpError: 'warn'
    }
  }
};
