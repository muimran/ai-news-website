/* What the bar and the front page share: the format chosen in the bar's
   chips (null: all of them). */
export const desk = $state({ format: null });

/** Is a story of this format? Video is a format too, across the kinds. */
export const isIt = (s, f) => (f === 'Video' ? !!s.video : s.kind === f);
