import { MediaSlideshow } from "@/components/gallery/MediaSlideshow";
import type { GalleryPhoto, GalleryVideo } from "@/components/gallery/types";

type CollectionGalleryProps = {
  photos: GalleryPhoto[];
  videos: GalleryVideo[];
  collectionTitle: string;
  protectPhotos?: boolean;
};

export function CollectionGallery({
  photos,
  videos,
  collectionTitle,
  protectPhotos = false,
}: CollectionGalleryProps) {
  const hasPhotos = photos.length > 0;
  const hasVideos = videos.length > 0;

  return (
    <div className="mt-16 space-y-10">
      {hasPhotos || hasVideos ? (
        <p className="text-sm text-[#A1A1A6]">
          {hasPhotos ? `${photos.length} photos` : null}
          {hasPhotos && hasVideos ? " · " : null}
          {hasVideos ? `${videos.length} videos` : null}
        </p>
      ) : null}

      <MediaSlideshow
        photos={photos}
        videos={videos}
        collectionTitle={collectionTitle}
        protectPhotos={protectPhotos}
      />
    </div>
  );
}