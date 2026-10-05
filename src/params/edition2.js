/* The panes site's edition marker, for every edition but English: English
   has the plain address (/2026/09/x), the others their two letters
   (/bn/2026/09/x). A new language joins here and in LANGS (content.js). */
export function match(param) {
  return ['bn'].includes(param);
}
