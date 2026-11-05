import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

// Built files live in Netlify's publish directory. The original sources stay intact.
// WebP preserves the alpha channel in the ICU logo, unlike the existing opaque logo.webp.
const images = [
  {
    source: 'img/proz_logo.png',
    dest: 'img/web_img/icu-logo-transparent.webp',
    width: 490,
    quality: 82
  },
  {
    source: 'img/proz_logo.png',
    dest: 'img/web_img/icu-logo-transparent-small.webp',
    width: 240,
    quality: 76
  },
  {
    source: 'img/kubok.png',
    dest: 'img/web_img/icu-trophy.webp',
    width: 560,
    quality: 82
  }
];

await mkdir('img/web_img', { recursive: true });
for (const image of images) {
  const result = await sharp(image.source, { failOn: 'error' })
    .rotate()
    .resize({ width: image.width, withoutEnlargement: true })
    .webp({ quality: image.quality, effort: 5 })
    .toFile(image.dest);
  console.log(`Optimized ${image.source} → ${image.dest} (${result.size} bytes)`);
}
