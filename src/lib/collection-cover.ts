export type CollectionCoverSource = {
  coverPhoto?: { url: string } | null;
  coverVideo?: { thumbnailUrl: string | null } | null;
  photos: { url: string }[];
  videos: { thumbnailUrl: string | null }[];
};

export function getCollectionCoverUrl(collection: CollectionCoverSource): string | null {
  if (collection.coverPhoto?.url) {
    return collection.coverPhoto.url;
  }

  if (collection.coverVideo?.thumbnailUrl) {
    return collection.coverVideo.thumbnailUrl;
  }

  if (collection.photos[0]?.url) {
    return collection.photos[0].url;
  }

  if (collection.videos[0]?.thumbnailUrl) {
    return collection.videos[0].thumbnailUrl;
  }

  return null;
}