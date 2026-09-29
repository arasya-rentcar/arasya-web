import { createImageUrlBuilder } from '@sanity/image-url';
import { SANITY_DATASET, SANITY_PROJECT_ID } from './content';

const builder = createImageUrlBuilder({ projectId: SANITY_PROJECT_ID, dataset: SANITY_DATASET });

export interface Img { src: string; srcset?: string }

/** Car cut-outs: a Sanity upload wins; otherwise the bundled /cars/{name}-{w}.webp pair. */
export function carImage(car: { image?: any; imagePath?: string } | undefined | null): Img | null {
  if (!car) return null;
  if (car.image?.asset) {
    const b = builder.image(car.image).auto('format').fit('max');
    return { src: b.width(960).url(), srcset: `${b.width(480).url()} 480w, ${b.width(960).url()} 960w` };
  }
  if (car.imagePath) {
    return { src: `${car.imagePath}-960.webp`, srcset: `${car.imagePath}-480.webp 480w, ${car.imagePath}-960.webp 960w` };
  }
  return null;
}

/** Photos (destinations, covers, hero backgrounds). */
export function photo(image: any, path: string | undefined, width = 1200): Img | null {
  if (image?.asset) {
    const b = builder.image(image).auto('format').fit('crop');
    return {
      src: b.width(width).url(),
      srcset: [480, 800, width].map((w) => `${b.width(w).url()} ${w}w`).join(', '),
    };
  }
  return path ? { src: path } : null;
}

/**
 * Branded unit cards (car + Arasya logo + contact), one per car slug, in
 * public/cars/brochure. Used as the share image for unit pages and shown on
 * the page as a brochure the visitor can save or forward.
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';
export function brochure(slug: string): { webp: string; jpg: string } | null {
  const base = `/cars/brochure/${slug}`;
  return existsSync(join(process.cwd(), 'public', `${base}.jpg`)) ? { webp: `${base}.webp`, jpg: `${base}.jpg` } : null;
}
