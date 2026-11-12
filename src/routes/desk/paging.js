/* A long list, a page at a time. Every list page (a topic, a format, a
   writer) holds at most PER stories, newest first; older ones are on
   /page/2, /page/3 … so a page stays the same size however many stories
   the outlet has. (All stories goes a month to a page instead.) */
export const PER = 60;

/** One page of a list: its stories, which page, how many, the whole count. */
export function pageOf(list, n = 1) {
  const pages = Math.max(1, Math.ceil(list.length / PER));
  return { stories: list.slice((n - 1) * PER, n * PER), page: n, pages, total: list.length };
}

/** The pages after the first, for prerendering: [2, 3, …]. */
export const laterPages = (count) => Array.from({ length: Math.max(0, Math.ceil(count / PER) - 1) }, (_, i) => String(i + 2));

/** A list's address for its nth page. */
export const pageHref = (href, n) => (n > 1 ? `${href}/page/${n}` : href);
