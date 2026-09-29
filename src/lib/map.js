/* The map: every story gets a fixed spot, worked out once from the content,
   so a story is in the same place on every visit and in both languages.

   Each section is an area. Inside an area the stories sit on a honeycomb,
   newest in the middle, older ones ringed around it. A translation takes its
   original's spot, which is what lets the language switch leave you exactly
   where you were. */

import { stories } from './content.js';

/* A story's footprint in world units: dot, meta line, up to four lines of
   headline and four of dek. Cell spacing leaves a gutter around it. */
export const CELL = { w: 330, h: 230 };
const COL = 400;
const ROW = 280;

/* Area centres. Two rows offset like a honeycomb, neighbouring areas are
   neighbouring beats, spaced for up to two rings of stories each. */
const AREAS = [
  ['The AI Race', 0, 0],
  ['AI & Everyday Life', 2300, -120],
  ['Work After Automation', 4600, 40],
  ['Machines and Power', 1150, 1700],
  ['AI Across Bangladesh', 3450, 1620],
  ['Climate, Chips & Infrastructure', 5750, 1740]
];

/* Axial hex cells spiralling out from the centre, clockwise from the top-left. */
const STEPS = [[1, 0], [0, 1], [-1, 1], [-1, 0], [0, -1], [1, -1]];
function honeycomb(n) {
  const cells = [[0, 0]];
  for (let k = 1; cells.length < n; k++) {
    let q = 0;
    let r = -k;
    for (const [dq, dr] of STEPS) {
      for (let i = 0; i < k; i++) {
        cells.push([q, r]);
        q += dq;
        r += dr;
      }
    }
  }
  return cells.slice(0, n);
}

/* A few units of stable wobble per story, so the honeycomb doesn't read as a grid. */
function wobble(slug) {
  let h = 2166136261;
  for (let i = 0; i < slug.length; i++) h = Math.imul(h ^ slug.charCodeAt(i), 16777619);
  return [((h & 0xff) / 255 - 0.5) * 24, (((h >>> 8) & 0xff) / 255 - 0.5) * 16];
}

const newestFirst = (a, b) => b.date - a.date || a.weight - b.weight;
const en = stories.filter((s) => s.lang === 'en').sort(newestFirst);
const bn = stories.filter((s) => s.lang === 'bn').sort(newestFirst);
const isTranslation = (s) => !!s.translationOf && en.some((e) => e.slug === s.translationOf);

const spot = new Map(); // `${lang}/${slug}` -> { x, y } (top-left of the story)
const areaTop = new Map();

for (const [section, cx, cy] of AREAS) {
  // English and its translations first, so the main edition stays a tight
  // honeycomb; Bangla originals take the outer cells.
  const here = [
    ...en.filter((s) => s.section === section),
    ...bn.filter((s) => s.section === section && !isTranslation(s))
  ];
  honeycomb(here.length).forEach(([q, r], i) => {
    const s = here[i];
    const [jx, jy] = wobble(s.slug);
    const at = {
      x: Math.round(cx + COL * (q + r / 2) - CELL.w / 2 + jx),
      y: Math.round(cy + ROW * r - CELL.h / 2 + jy)
    };
    spot.set(`${s.lang}/${s.slug}`, at);
    for (const t of bn) if (t.translationOf === s.slug) spot.set(`bn/${t.slug}`, at);
    areaTop.set(section, Math.min(areaTop.get(section) ?? Infinity, at.y));
  });
}

/* The same frame for both languages, so "whole map" is the same view in each. */
const all = [...spot.values()];
const x0 = Math.min(...all.map((p) => p.x)) - 60;
const y0 = Math.min(...areaTop.values()) - 140;
export const BOUNDS = {
  x: x0,
  y: y0,
  w: Math.max(...all.map((p) => p.x + CELL.w)) + 60 - x0,
  h: Math.max(...all.map((p) => p.y + CELL.h)) + 40 - y0
};

/** Stories and area labels for one language. `age` runs 0 (newest) to 1 (oldest). */
export function mapFor(lang) {
  const list = stories.filter((s) => s.lang === lang && spot.has(`${lang}/${s.slug}`));
  const times = list.map((s) => s.date.getTime());
  const newest = Math.max(...times);
  const span = newest - Math.min(...times) || 1;

  const items = list.map((s) => ({
    story: s,
    ...spot.get(`${lang}/${s.slug}`),
    age: (newest - s.date.getTime()) / span
  }));

  const areas = AREAS.map(([key, cx]) => {
    const count = items.filter((i) => i.story.section === key).length;
    return count ? { key, count, x: cx, y: areaTop.get(key) - 44 } : null;
  }).filter(Boolean);

  return { items, areas };
}
