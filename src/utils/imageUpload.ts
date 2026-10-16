/**
 * Owner photo uploads.
 *
 * Listings (including their photos) are persisted in localStorage by
 * PropertiesContext, which has a hard ~5MB quota. Raw phone photos are
 * several MB each and base64 inflates them by ~33%, so every image is
 * downscaled + re-encoded in the browser before it is stored.
 *
 * The returned values are data URLs. When a real object store (e.g.
 * Firebase Storage) is wired up, only `compressImageToDataUrl` needs to be
 * swapped for an upload call that returns a hosted URL — the rest of the
 * app reads `property.images` and is agnostic to the scheme.
 */

export const MAX_PHOTOS_PER_LISTING = 8;
/** Reject absurd originals outright so the decoder isn't DoS'd. */
export const MAX_SOURCE_FILE_BYTES = 15 * 1024 * 1024;
/** Rough share of the localStorage quota we are willing to spend on photos. */
export const PHOTO_STORAGE_BUDGET_BYTES = 3 * 1024 * 1024;

const MAX_DIMENSION = 1280;
const JPEG_QUALITY = 0.72;

const ACCEPTED = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export type PhotoFile = {
  id: string;
  name: string;
  dataUrl: string;
  bytes: number;
};

/** Returns an error message, or null when the file is acceptable. */
export function validatePhotoFile(file: File): string | null {
  if (!ACCEPTED.includes(file.type.toLowerCase())) {
    return `"${file.name}" is not a supported image. Use JPG, PNG or WebP.`;
  }
  if (file.size > MAX_SOURCE_FILE_BYTES) {
    return `"${file.name}" is larger than 15 MB. Please pick a smaller photo.`;
  }
  return null;
}

/** Approximate decoded byte size of a base64 data URL. */
export function dataUrlBytes(dataUrl: string): number {
  const comma = dataUrl.indexOf(",");
  if (comma === -1) return 0;
  const b64 = dataUrl.slice(comma + 1);
  return Math.round((b64.length * 3) / 4);
}

function loadImage(source: Blob): Promise<{ drawable: ImageBitmap | HTMLImageElement; width: number; height: number }> {
  // createImageBitmap applies EXIF orientation, which avoids rotated uploads.
  // "from-exif" is newer than this project's DOM lib types, hence the cast;
  // browsers that reject it fall through to the <img> decoder.
  if (typeof createImageBitmap === "function") {
    const options = { imageOrientation: "from-exif" } as unknown as ImageBitmapOptions;
    return createImageBitmap(source, options)
      .then((bmp) => ({ drawable: bmp, width: bmp.width, height: bmp.height }))
      .catch(() => loadHtmlImage(source));
  }
  return loadHtmlImage(source);
}

function loadHtmlImage(source: Blob): Promise<{ drawable: HTMLImageElement; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(source);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ drawable: img, width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not decode this image"));
    };
    img.src = url;
  });
}

/**
 * Downscale to fit MAX_DIMENSION and re-encode as JPEG.
 * Always re-encodes (even for small images) so PNG screenshots and
 * transparent PNGs become compact, uniform JPEGs.
 */
export async function compressImageToDataUrl(file: File): Promise<string> {
  const { drawable, width, height } = await loadImage(file);
  if (!width || !height) throw new Error("Image has no dimensions");

  const scale = Math.min(1, MAX_DIMENSION / Math.max(width, height));
  const targetW = Math.max(1, Math.round(width * scale));
  const targetH = Math.max(1, Math.round(height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported in this browser");

  // White base so transparent PNGs don't turn black.
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, targetW, targetH);
  ctx.drawImage(drawable as CanvasImageSource, 0, 0, targetW, targetH);

  if ("close" in drawable && typeof (drawable as ImageBitmap).close === "function") {
    (drawable as ImageBitmap).close();
  }

  return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
}

/** Validate, compress and wrap a file for the listing form. */
export async function fileToPhoto(file: File): Promise<PhotoFile> {
  const error = validatePhotoFile(file);
  if (error) throw new Error(error);

  const dataUrl = await compressImageToDataUrl(file);
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: file.name,
    dataUrl,
    bytes: dataUrlBytes(dataUrl)
  };
}

/** Total bytes of a set of photos. */
export function totalPhotoBytes(photos: { bytes: number }[]): number {
  return photos.reduce((sum, p) => sum + p.bytes, 0);
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
