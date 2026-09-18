/* Stamps the correct `lang` on <html> for each page.

   This has to happen in the response, not in a component: `lang` lives on the
   root element, outside Svelte's reach. It matters more than it looks — screen
   readers pick their voice and pronunciation rules from it, and a Bangla page
   announced with an English voice is unusable. Search engines also use it
   alongside the hreflang tags to tell the two editions apart.

   Runs at build time for every prerendered page. */

export async function handle({ event, resolve }) {
  const lang = event.url.pathname.replace(/^\//, '').split('/')[0] === 'bn' ? 'bn' : 'en';

  return resolve(event, {
    transformPageChunk: ({ html }) => html.replace('%gt.lang%', lang)
  });
}
