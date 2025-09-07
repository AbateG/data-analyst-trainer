import { readFile, mkdir } from 'fs/promises';
import { basename, join } from 'path';
import sharp from 'sharp';

/*
  exportImages.ts
  Converts selected SVG assets in /public to PNG and JPG renditions.
*/

const targets = [
  'learning-flow.svg'
];

const OUT_DIR = 'public/raster';

async function ensureOutDir() {
  await mkdir(OUT_DIR, { recursive: true });
}

async function convert(svgName: string) {
  const srcPath = join('public', svgName);
  const raw = await readFile(srcPath);
  const base = basename(svgName, '.svg');
  const pngPath = join(OUT_DIR, base + '.png');
  const jpgPath = join(OUT_DIR, base + '.jpg');

  // Default width derived from viewBox width (learning-flow.svg is 960 wide)
  const width = 1920; // 2x for crisp slides

  const image = sharp(raw, { density: 300 });
  await image
    .resize({ width })
    .png({ compressionLevel: 9 })
    .toFile(pngPath);

  await image
    .resize({ width })
    .jpeg({ quality: 92, mozjpeg: true })
    .toFile(jpgPath);

  return { pngPath, jpgPath };
}

(async () => {
  try {
    await ensureOutDir();
    const results = [];
    for (const t of targets) {
      const r = await convert(t);
      results.push(r);
    }
    console.log('Export complete:', results);
  } catch (err) {
    console.error('Image export failed', err);
    process.exitCode = 1;
  }
})();
