/* /new and /map always name their edition (/new/en, /map/bn), so a story slug can
   follow it without the two ever being confused. */
export function match(param) {
  return param === 'en' || param === 'bn';
}
