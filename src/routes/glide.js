/* Scroll a paragraph up to just under the header. By hand: the browser's
   own smooth scroll is cut short here by the frame reacting to the scroll
   it causes. On a wide screen the story scrolls in its frame; on a phone,
   the page itself. */
export function glide(to) {
  const box = to.closest('main.page');
  const own = box && getComputedStyle(box).position === 'fixed';
  const from = own ? box.scrollTop : scrollY;
  const end = from + to.getBoundingClientRect().top - 80;
  const set = (y) => (own ? (box.scrollTop = y) : scrollTo(0, y));
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return set(end);
  const start = performance.now();
  const step = (now) => {
    const t = Math.min(1, (now - start) / 550);
    set(from + (end - from) * (1 - (1 - t) ** 3));
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
