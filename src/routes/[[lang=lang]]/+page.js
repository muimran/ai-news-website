export const prerender = true;

/** Build both front pages: `/` is English, `/bn` is Bangla. */
export function entries() {
  return [{ lang: undefined }, { lang: 'bn' }];
}
