/* A video story's still, when the editor gave it no picture: YouTube's own
   thumbnail for the video.

   Every story's `video:` link is read from content/articles. For each YouTube
   video not fetched before, its largest thumbnail is downloaded once into
   .cache/yt/<id>.jpg (the deploy keeps .cache between runs). YouTube's
   smaller thumbnail is 4:3 with black bars above and below a 16:9 video;
   those are cut off, or they'd set the card's colour. Then the same three
   WebP sizes as an upload are made into static/uploads/sized/yt-<id>-<w>.webp,
   so `photo()` finds it as if it were an upload named yt-<id>.jpg (see
   stillFor in src/lib/server/data.js, which hands it to a story only when
   the copies exist). An editor's own picture or card colour always wins.

   Offline, or if YouTube refuses, nothing is made and the story has no
   picture, as before; the next build tries again. */

import { readdirSync, readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
import { WIDTHS } from './sizes.js';
import { ytId } from '../src/lib/youtube.js';

const CONTENT = 'content/articles';
const CACHE = '.cache/yt';
const OUT = 'static/uploads/sized';

function* markdown(dir) {
  if (!existsSync(dir)) return;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* markdown(p);
    else if (e.name.endsWith('.md')) yield p;
  }
}

async function fetchStill(id) {
  // the full-size one exists only for videos uploaded in HD; it is 16:9
  let res = await fetch(`https://i.ytimg.com/vi/${id}/maxresdefault.jpg`);
  if (res.ok) return Buffer.from(await res.arrayBuffer());
  // 480×360 with the video letterboxed in the middle 270 rows
  res = await fetch(`https://i.ytimg.com/vi/${id}/hqdefault.jpg`);
  if (!res.ok) return null;
  return sharp(Buffer.from(await res.arrayBuffer()))
    .extract({ left: 0, top: 45, width: 480, height: 270 })
    .jpeg({ quality: 90 })
    .toBuffer();
}

/** Fetch and size any video still not made before. Returns how many. */
export async function makeStills({ quiet = false } = {}) {
  const ids = new Set();
  for (const file of markdown(CONTENT)) {
    const m = readFileSync(file, 'utf8').match(/^video:\s*["']?([^"'\n]+)/m);
    const id = m && ytId(m[1].trim());
    if (id) ids.add(id);
  }
  let made = 0;
  for (const id of ids) {
    const done = WIDTHS.every((w) => existsSync(join(OUT, `yt-${id}-${w}.webp`)));
    if (done) continue;
    const kept = join(CACHE, `${id}.jpg`);
    let file = existsSync(kept) ? readFileSync(kept) : null;
    if (!file) {
      try {
        file = await fetchStill(id);
      } catch {
        file = null;
      }
      if (!file) {
        if (!quiet) console.warn(`[stills] couldn't fetch YouTube's still for ${id}`);
        continue;
      }
      mkdirSync(CACHE, { recursive: true });
      writeFileSync(kept, file);
    }
    mkdirSync(OUT, { recursive: true });
    for (const w of WIDTHS) {
      await sharp(file)
        .resize({ width: w, withoutEnlargement: true })
        .webp({ quality: w === 240 ? 70 : 78 })
        .toFile(join(OUT, `yt-${id}-${w}.webp`));
    }
    made++;
  }
  if (made && !quiet) console.log(`[stills] made ${made} video still${made === 1 ? '' : 's'}`);
  return made;
}
