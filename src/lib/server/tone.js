/* A card's colour, worked out at build time from its picture: the dominant
   colour of its upper half, where the words sit. The card washes the picture
   with it from the top, solid behind the words and gone by 70% down. The
   words go dark or white, whichever reads better on it. An editor can set
   the colour by hand instead ("Card colour" in the CMS). */

import { readFileSync } from 'node:fs';
import sharp from 'sharp';
import { base } from '$app/paths';

const INK = '#26282f';
const WHITE = '#ffffff';

const hex = (rgb) => '#' + rgb.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
const rgbOf = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));

// WCAG relative luminance and contrast
function luminance(rgb) {
  const [r, g, b] = rgb.map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
const contrast = (a, b) => {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

/** { bg, fg } for a background colour: fg is ink or white, the clearer one.
    A colour read from a picture that's too middling for either to read well
    (under 4.5:1, the bar for small text) is eased lighter under ink or
    darker under white until it does; an editor's own colour is kept as set. */
export function toneFor(bg, { adjust = true } = {}) {
  let rgb = rgbOf(bg);
  const ink = contrast(rgb, rgbOf(INK)) >= contrast(rgb, rgbOf(WHITE));
  const fg = ink ? INK : WHITE;
  if (adjust) {
    const to = ink ? 255 : 0;
    for (let k = 0; k < 20 && contrast(rgb, rgbOf(fg)) < 4.5; k++) rgb = rgb.map((v) => v + (to - v) * 0.06);
  }
  return { bg: hex(rgb), fg };
}

const cache = new Map();

/** The dominant colour of a picture's upper half: its pixels sorted into
    coarse colour bins, the fullest bin's average. Null if the file can't be
    read. `src` is the address the page uses. */
export async function dominant(src) {
  if (cache.has(src)) return cache.get(src);
  let out = null;
  try {
    const path = 'static' + decodeURI(src.slice(base.length));
    const img = sharp(readFileSync(path)).resize(80, null).removeAlpha();
    const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
    const end = Math.ceil(info.height / 2) * info.width * 3;
    const bins = new Map();
    for (let i = 0; i < end; i += 3) {
      const key = ((data[i] >> 5) << 6) | ((data[i + 1] >> 5) << 3) | (data[i + 2] >> 5);
      const bin = bins.get(key) ?? [0, 0, 0, 0];
      bin[0] += data[i];
      bin[1] += data[i + 1];
      bin[2] += data[i + 2];
      bin[3]++;
      bins.set(key, bin);
    }
    const [r, g, b, n] = [...bins.values()].sort((x, y) => y[3] - x[3])[0];
    out = hex([r / n, g / n, b / n]);
  } catch {
    out = null;
  }
  cache.set(src, out);
  return out;
}
