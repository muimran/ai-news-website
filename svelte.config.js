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
      handleHttpError: 'warn',
      /* A list's later pages (/page/2 …) and All stories' earlier months
         exist only once there are enough stories; until then those routes
         have nothing to build, which is fine. Any other unbuilt route is
         still an error. */
      handleUnseenRoutes: ({ routes, message }) => {
        const later = (r) => r.includes('/page/[n=pageno]') || r.endsWith('/all/[year=year]/[month=month]');
        if (!routes.every(later)) throw new Error(message);
      }
    }
  }
};
