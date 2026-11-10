/* A clamped summary that ends on a whole sentence. When the full text runs
   past its lines, drop sentences from the end until the rest fits, rather
   than letting the clamp cut one off mid-thought with "…". If even the
   first sentence is too long, the clamp's ellipsis is the honest fallback.
   Measured again when the box changes width. */

const split = (text, lang) => {
  if (typeof Intl !== 'undefined' && Intl.Segmenter) {
    const parts = [...new Intl.Segmenter(lang, { granularity: 'sentence' }).segment(text)].map((p) => p.segment);
    if (parts.length) return parts;
  }
  return text.split(/(?<=[.!?।])\s+/).map((p, i, a) => (i < a.length - 1 ? p + ' ' : p));
};

export function whole(el, text) {
  let full = text;
  let width = 0;
  const fits = () => el.scrollHeight <= el.clientHeight + 1;
  function fit() {
    el.textContent = full;
    if (fits()) return;
    const parts = split(full, el.closest('[lang]')?.lang || 'en');
    for (let k = parts.length - 1; k >= 1; k--) {
      el.textContent = parts.slice(0, k).join('').trim();
      if (fits()) return;
    }
    el.textContent = full;
  }
  const watch = new ResizeObserver(([e]) => {
    const w = Math.round(e.contentRect.width);
    if (w !== width) {
      width = w;
      fit();
    }
  });
  watch.observe(el);
  // the web fonts change how much fits once they arrive
  document.fonts?.ready.then(fit);
  return {
    update(next) {
      full = next;
      fit();
    },
    destroy() {
      watch.disconnect();
    }
  };
}
