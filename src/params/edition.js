/* Every address names its edition (/en/..., /bn/..., /map/bn/...), so a story
   slug can follow it without the two ever being confused. */
export function match(param) {
  return param === 'en' || param === 'bn';
}
