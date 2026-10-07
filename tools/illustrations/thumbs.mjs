// A 240-wide copy of every story illustration, for small places (search
// results) that would otherwise load the 800: node tools/illustrations/thumbs.mjs
import { readdirSync } from 'node:fs';
import sharp from 'sharp';

const dir = 'static/uploads/stories';
for (const f of readdirSync(dir).filter((f) => f.endsWith('-800.jpg'))) {
  await sharp(`${dir}/${f}`).resize(240).jpeg({ quality: 78, progressive: true }).toFile(`${dir}/${f.replace('-800.jpg', '-240.jpg')}`);
}
console.log('done');
