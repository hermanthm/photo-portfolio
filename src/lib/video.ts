export type VideoProvider = "youtube" | "vimeo" | "other";

const YOUTUBE_VIDEO_ID_PATTERN =
  /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/i;

export class UnsupportedVideoUrlError extends Error {
  constructor() {
    super("Only YouTube and Vimeo URLs are supported");
    this.name = "UnsupportedVideoUrlError";
  }
}

export function detectVideoProvider(url: string): VideoProvider {
  if (/youtube\.com|youtu\.be/i.test(url)) {
    return "youtube";
  }
  if (/vimeo\.com/i.test(url)) {
    return "vimeo";
  }
  return "other";
}

export function isSupportedVideoUrl(url: string): boolean {
  return detectVideoProvider(url) !== "other";
}

export function extractYoutubeVideoId(url: string): string | null {
  const match = url.trim().match(YOUTUBE_VIDEO_ID_PATTERN);
  return match ? match[1] : null;
}

export function getYoutubeThumbnailUrl(videoId: string): string {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

export async function getVimeoThumbnailUrl(url: string): Promise<string | null> {
  try {
    const response = await fetch(
      `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url.trim())}`,
    );
    if (!response.ok) return null;

    const data = (await response.json()) as { thumbnail_url?: string };
    return data.thumbnail_url ?? null;
  } catch {
    return null;
  }
}

export async function resolveVideoThumbnail(
  url: string,
  provider?: VideoProvider,
): Promise<string | null> {
  const detected = provider ?? detectVideoProvider(url);

  if (detected === "youtube") {
    const videoId = extractYoutubeVideoId(url);
    return videoId ? getYoutubeThumbnailUrl(videoId) : null;
  }

  if (detected === "vimeo") {
    return getVimeoThumbnailUrl(url);
  }

  return null;
}

export function toEmbedUrl(url: string): string {
  const trimmed = url.trim();

  const youtubeVideoId = extractYoutubeVideoId(trimmed);
  if (youtubeVideoId) {
    return `https://www.youtube.com/embed/${youtubeVideoId}`;
  }

  const vimeoMatch = trimmed.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }

  throw new UnsupportedVideoUrlError();
}

export function isAllowedEmbedUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") {
      return false;
    }

    return (
      (parsed.hostname === "www.youtube.com" &&
        parsed.pathname.startsWith("/embed/")) ||
      (parsed.hostname === "www.youtube-nocookie.com" &&
        parsed.pathname.startsWith("/embed/")) ||
      (parsed.hostname === "player.vimeo.com" &&
        parsed.pathname.startsWith("/video/"))
    );
  } catch {
    return false;
  }
}