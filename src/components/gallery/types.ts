export type GalleryPhoto = {
  id: string;
  url: string;
  alt: string | null;
  width: number;
  height: number;
};

export type GalleryVideo = {
  id: string;
  title: string;
  description: string | null;
  embedUrl: string;
  provider: string;
  thumbnailUrl: string | null;
};