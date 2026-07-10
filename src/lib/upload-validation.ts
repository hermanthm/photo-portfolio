export const MAX_IMAGE_UPLOAD_BYTES = 20 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

const PNG_SIGNATURE = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
]);

export function validateImageFile(file: File): string | null {
  if (file.size === 0) {
    return "File is empty";
  }

  if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
    return `File exceeds maximum size of ${MAX_IMAGE_UPLOAD_BYTES / 1024 / 1024}MB`;
  }

  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return "Only JPEG, PNG, WebP, and AVIF images are allowed";
  }

  return null;
}

export function validateImageBuffer(buffer: Buffer): string | null {
  if (buffer.length < 12) {
    return "Invalid image file";
  }

  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return null;
  }

  if (buffer.subarray(0, 8).equals(PNG_SIGNATURE)) {
    return null;
  }

  if (
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return null;
  }

  if (buffer.subarray(4, 8).toString("ascii") === "ftyp") {
    const brand = buffer.subarray(8, 12).toString("ascii");
    if (brand.startsWith("avif") || brand.startsWith("avis")) {
      return null;
    }
  }

  return "File content does not match an allowed image format";
}