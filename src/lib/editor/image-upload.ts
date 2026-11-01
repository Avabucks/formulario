const MAX_DIMENSION = 1600;
const WEBP_QUALITY = 0.82;
const UPLOADABLE_TYPES = new Set([
  "image/webp",
  "image/png",
  "image/jpeg",
  "image/gif",
]);

export function isUploadableImage(file: File) {
  return UPLOADABLE_TYPES.has(file.type);
}

/** Resizes to MAX_DIMENSION and re-encodes as WebP; GIFs are kept to preserve animation */
async function compressImage(file: File): Promise<Blob> {
  if (file.type === "image/gif") return file;

  const bitmap = await createImageBitmap(file);
  const ratio = Math.min(
    1,
    MAX_DIMENSION / Math.max(bitmap.width, bitmap.height),
  );
  const width = Math.round(bitmap.width * ratio);
  const height = Math.round(bitmap.height * ratio);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const webp = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", WEBP_QUALITY),
  );
  // Browsers without WebP encoding fall back to PNG: keep whichever is smaller
  if (!webp || webp.type !== "image/webp" || webp.size >= file.size)
    return file;
  return webp;
}

/** Uploads the image to R2 and returns its public URL; without argomentoId it goes to the user's library */
export async function uploadImage(file: File, argomentoId?: string) {
  const blob = await compressImage(file);

  const res = await fetch("/api/uploads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      argomentoId,
      contentType: blob.type,
      size: blob.size,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Errore nel caricamento");

  const put = await fetch(data.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": blob.type },
    body: blob,
  });
  if (!put.ok) throw new Error("Errore nel caricamento dell'immagine");

  return data.publicUrl as string;
}

/** Alt text from the file name, without extension and markdown-breaking chars */
export function altFromFileName(name: string) {
  return name
    .replace(/\.[^.]+$/, "")
    .replaceAll(/[[\]\\]/g, "")
    .trim();
}
