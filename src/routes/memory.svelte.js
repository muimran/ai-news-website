/* What this browser remembers of its reader, and nothing leaves it: which
   stories they've read, how far into a long one they got (and the paragraph
   they were at, to pick it up again), and which stories they'd already been
   shown, so ones that have come in since their last visit can say so.
   Kept in localStorage; a private window or blocked storage simply starts
   fresh every time, and the site reads the same as it always did. */

const READS = 'so-reads'; // { 'en/slug': { p: 0..1, i: paragraph, at: ms } }
const SEEN = 'so-seen'; // every story id this browser has been shown
const SESSION = 'so-session';

// a story counts as read once its end has been on screen
export const DONE = 0.97;
// and as begun, worth offering to continue, a little way in
const BEGUN = 0.05;

export const memory = $state({ ready: false, reads: {}, before: null });

const id = (s) => `${s.lang}/${s.slug}`;
let seen = new Set();

function get(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}
function put(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // full or blocked: forget quietly
  }
}

/* Once, after the page is up (never during the server render, so the
   first paint matches it). The stories already shown before this visit
   are fixed at its start; what's shown during it joins them for next time. */
export function wake() {
  if (memory.ready) return;
  memory.reads = get(READS, {});
  seen = new Set(get(SEEN, []));
  let before = null;
  try {
    const fresh = !sessionStorage.getItem(SESSION);
    if (fresh) sessionStorage.setItem(SESSION, JSON.stringify([...seen]));
    const kept = JSON.parse(sessionStorage.getItem(SESSION) || 'null');
    before = kept && kept.length ? new Set(kept) : null;
  } catch {
    before = null;
  }
  memory.before = before; // null on a first visit: nothing is "new" then
  memory.ready = true;
}

/** these stories have been on screen; next visit they're not new */
export function saw(stories) {
  if (!memory.ready) return;
  let grew = false;
  for (const s of stories) {
    const k = id(s);
    if (!seen.has(k)) {
      seen.add(k);
      grew = true;
    }
  }
  if (grew) put(SEEN, [...seen]);
}

/** how far into this story the reader got, 0..1 (0 if never opened) */
export const progress = (s) => (memory.ready ? (memory.reads[id(s)]?.p ?? 0) : 0);
export const isRead = (s) => progress(s) >= DONE;
export const isBegun = (s) => {
  const p = progress(s);
  return p >= BEGUN && p < DONE;
};
export const isNew = (s) => memory.ready && !!memory.before && !memory.before.has(id(s)) && !memory.reads[id(s)];
export const resumeAt = (s) => (isBegun(s) ? (memory.reads[id(s)]?.i ?? 0) : null);

/** the reader is this far in, at this paragraph. Only the furthest point
    is kept: opening a story again at its top, or looking back up, doesn't
    lose the place (or unread it) */
export function reached(s, p, i) {
  if (!memory.ready) return;
  const k = id(s);
  const was = memory.reads[k];
  if (was && p <= was.p + 0.005) return;
  memory.reads[k] = { p: Math.round(p * 1000) / 1000, i, at: Date.now() };
  put(READS, memory.reads);
}
