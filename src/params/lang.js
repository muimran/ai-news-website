/* Matches only the non-default language segment, so `/` stays English and
   `/bn` is Bangla. Without the guard, `[[lang]]` would swallow `/story` and
   `/topic` as if they were language codes. */
export function match(param) {
  return param === 'bn';
}
