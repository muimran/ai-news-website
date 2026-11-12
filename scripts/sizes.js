/* Picture sizes, made from what editors upload.

   The CMS puts a story's photo in static/uploads/ at whatever size the
   camera made it (often 3–5 MB). Pages never load that: they load one of
   three copies made here, as WebP, into static/uploads/sized/:
     <name>-240.webp   a small square in a list
     <name>-800.webp   a card
     <name>-1600.webp  a story's head on a wide screen
   `photo()` in src/lib/site/reel.js points at these by the same names.

   A copy is made only when it's missing or older than its upload, so a
   build redoes nothing it has already done. Copies are never made larger
   than the upload. Runs before every build and when the dev server starts
   (see vite.config.js); the sized/ folder isn't kept in git. */

import { readdirSync, statSync, mkdirSync, existsSync } from 'node:fs';
import { join, parse } from 'node:path';
import sharp from 'sharp';

export const WIDTHS = [240, 800, 1600];
const UPLOADS = 'static/uploads';
const OUT = join(UPLOADS, 'sized');
const PICTURE = /\.(jpe?g|png|webp|avif|tiff?)$/i;

/** Make any missing or stale sizes. Returns how many files it wrote. */
export async function makeSizes({ quiet = false } = {}) {
  if (!existsSync(UPLOADS)) return 0;
  mkdirSync(OUT, { recursive: true });
  let made = 0;
  // only the uploads themselves, not the folders under them (stories/,
  // authors/, sized/), which hold files already sized by hand or by us
  for (const file of readdirSync(UPLOADS)) {
    if (!PICTURE.test(file)) continue;
    const from = join(UPLOADS, file);
    const when = statSync(from).mtimeMs;
    const { name } = parse(file);
    for (const w of WIDTHS) {
      const to = join(OUT, `${name}-${w}.webp`);
      if (existsSync(to) && statSync(to).mtimeMs >= when) continue;
      await sharp(from)
        .rotate() // turn it the way the camera held it
        .resize({ width: w, withoutEnlargement: true })
        .webp({ quality: w === 240 ? 70 : 78 })
        .toFile(to);
      made++;
    }
  }
  if (made && !quiet) console.log(`[sizes] made ${made} picture size${made === 1 ? '' : 's'}`);
  return made;
}
