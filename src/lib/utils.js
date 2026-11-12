import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs) => twMerge(clsx(inputs));

/** Local calendar day as YYYY-MM-DD (not UTC), so "today" matches the user's clock. */
export function isoDay(date = new Date()) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function shiftDay(iso, delta) {
  const [y, m, d] = iso.split('-').map(Number);
  return isoDay(new Date(y, m - 1, d + delta));
}

export function formatDay(iso, opts = { weekday: 'long', month: 'short', day: 'numeric' }) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, opts);
}

export function greeting(date = new Date()) {
  const h = date.getHours();
  if (h < 5) return 'Late night';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export const initials = (name = '') =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('') || 'K';

export const round = (n) => Math.round(Number(n) || 0);

/**
 * Read an image file, downscale it to maxSide px and return base64 JPEG (without data: prefix).
 * Keeps uploads small (≈150–400 KB) so AI calls stay fast.
 */
export async function fileToBase64Jpeg(fileOrBlob, maxSide = 1280, quality = 0.85) {
  const bitmap = await createImageBitmap(fileOrBlob);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close?.();
  const dataUrl = canvas.toDataURL('image/jpeg', quality);
  return { data: dataUrl.split(',')[1], mimeType: 'image/jpeg', preview: dataUrl };
}
