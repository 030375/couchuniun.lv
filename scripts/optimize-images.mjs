import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

// Source images are retained in Git; only optimized assets are published.
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

// The compact img/kubok.png is an opaque, indexed PNG with a baked-in gray/
// white checkerboard. Never use it as a source for the transparent trophy!
// Prefer the high-quality RGBA original. If its corner pixels still contain
// the baked checkerboard, remove only border-connected neutral-light pixels.
async function transparentTrophy() {
  const original = 'img/ориг/kubok.png';
  const dest = 'img/web_img/icu-trophy.webp';
  const { data, info } = await sharp(original, { failOn: 'error' })
    .rotate()
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const total = width * height;
  const cornerIds = [0, width - 1, (height - 1) * width, total - 1];
  const transparentCorners = cornerIds.every((id) => data[id * channels + 3] < 20);

  if (!transparentCorners) {
    const seen = new Uint8Array(total);
    const queue = new Uint32Array(total);
    let head = 0;
    let tail = 0;
    let removed = 0;

    const backdrop = (index) => {
      const offset = index * channels;
      const alpha = data[offset + 3];
      if (alpha < 16) return true;
      const red = data[offset];
      const green = data[offset + 1];
      const blue = data[offset + 2];
      const low = Math.min(red, green, blue);
      const high = Math.max(red, green, blue);
      // The two checkerboard tones are white and pale neutral gray.
      // Keep the yellow / brown (chromatic) pixels of the trophy intact.
      return low >= 170 && (high - low) <= 28;
    };

    const enqueue = (index) => {
      if (!seen[index] && backdrop(index)) {
        seen[index] = 1;
        queue[tail++] = index;
      }
    };

    for (let x = 0; x < width; x++) {
      enqueue(x);
      enqueue((height - 1) * width + x);
    }
    for (let y = 0; y < height; y++) {
      enqueue(y * width);
      enqueue(y * width + width - 1);
    }

    while (head < tail) {
      const index = queue[head++];
      const offset = index * channels;
      if (data[offset + 3] !== 0) {
        // Make the masked pixels fully transparent; clearing RGB avoids
        // old checkerboard colors bleeding through WebP downsampling.
        data[offset] = 0;
        data[offset + 1] = 0;
        data[offset + 2] = 0;
        data[offset + 3] = 0;
        removed++;
      }
      const x = index % width;
      if (x > 0) enqueue(index - 1);
      if (x + 1 < width) enqueue(index + 1);
      if (index >= width) enqueue(index - width);
      if (index < total - width) enqueue(index + width);
    }

    if (removed < total * .20) {
      throw new Error(`Trophy background not cleared: only ${removed} of ${total} pixels. Check the original.`);
    }
    console.log(`Removed baked checkerboard from ${removed} trophy pixels (${Math.round(removed / total * 100)}%).`);
  } else {
    console.log('Original trophy already has transparent corners; preserving its alpha channel.');
  }

  const out = await sharp(data, { raw: { width, height, channels } })
    .resize({ width: 560, withoutEnlargement: true })
    .webp({ quality: 84, alphaQuality: 100, effort: 5 })
    .toFile(dest);
  console.log(`Saved transparent trophy → ${dest} (${out.width}×${out.height}, ${out.size} bytes)`);
}

await transparentTrophy();
