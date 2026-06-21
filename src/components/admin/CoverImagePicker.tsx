"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

type CoverPhoto = {
  id: string;
  url: string;
  alt: string | null;
};

type CoverVideo = {
  id: string;
  title: string;
  thumbnailUrl: string | null;
};

type CoverImagePickerProps = {
  collectionId: string;
  photos: CoverPhoto[];
  videos: CoverVideo[];
  coverPhotoId: string | null;
  coverVideoId: string | null;
};

export function CoverImagePicker({
  collectionId,
  photos,
  videos,
  coverPhotoId: initialCoverPhotoId,
  coverVideoId: initialCoverVideoId,
}: CoverImagePickerProps) {
  const router = useRouter();
  const [coverPhotoId, setCoverPhotoId] = useState(initialCoverPhotoId);
  const [coverVideoId, setCoverVideoId] = useState(initialCoverVideoId);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const coverableVideos = videos.filter((video) => video.thumbnailUrl);
  const hasMedia = photos.length > 0 || coverableVideos.length > 0;
  const isAutomatic = !coverPhotoId && !coverVideoId;

  async function updateCover(body: { photoId?: string | null; videoId?: string | null }) {
    setLoading(true);
    setError(null);

    const response = await fetch(`/api/admin/collections/${collectionId}/cover`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setLoading(false);

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setError(data?.error ?? "Failed to update cover.");
      return;
    }

    const data = await response.json();
    setCoverPhotoId(data.coverPhotoId);
    setCoverVideoId(data.coverVideoId);
    router.refresh();
  }

  return (
    <div className="space-y-4 rounded-3xl border border-neutral-800 bg-[#111111] p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-medium text-[#F5F5F7]">Cover image</h2>
          <p className="mt-1 text-sm text-[#A1A1A6]">
            Shown on collection previews. Choose a photo or video thumbnail, or use
            automatic (first item).
          </p>
        </div>
        <button
          type="button"
          disabled={loading || isAutomatic}
          onClick={() => updateCover({ photoId: null, videoId: null })}
          className="rounded-xl border border-neutral-700 px-4 py-2 text-sm text-[#A1A1A6] transition hover:text-[#F5F5F7] disabled:opacity-50"
        >
          Use automatic
        </button>
      </div>

      {!hasMedia ? (
        <p className="text-sm text-[#A1A1A6]">
          Add photos or videos first, then pick a cover here.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {photos.map((photo) => {
            const isSelected = coverPhotoId === photo.id;
            return (
              <button
                key={photo.id}
                type="button"
                disabled={loading}
                onClick={() => updateCover({ photoId: photo.id })}
                className={`group relative aspect-[4/3] overflow-hidden rounded-2xl border-2 transition ${
                  isSelected
                    ? "border-[#C8A97E]"
                    : "border-transparent hover:border-[#C8A97E]/50"
                }`}
              >
                <Image
                  src={photo.url}
                  alt={photo.alt ?? "Photo"}
                  fill
                  className="object-cover"
                  sizes="200px"
                />
                {isSelected ? (
                  <span className="absolute top-2 left-2 rounded-full bg-[#C8A97E] px-2 py-0.5 text-xs font-medium text-black">
                    Cover
                  </span>
                ) : null}
              </button>
            );
          })}

          {coverableVideos.map((video) => {
            const isSelected = coverVideoId === video.id;
            return (
              <button
                key={video.id}
                type="button"
                disabled={loading}
                onClick={() => updateCover({ videoId: video.id })}
                className={`group relative aspect-[4/3] overflow-hidden rounded-2xl border-2 transition ${
                  isSelected
                    ? "border-[#C8A97E]"
                    : "border-transparent hover:border-[#C8A97E]/50"
                }`}
              >
                <Image
                  src={video.thumbnailUrl!}
                  alt={video.title}
                  fill
                  className="object-cover"
                  sizes="200px"
                />
                <span className="absolute right-2 bottom-2 rounded bg-black/70 px-2 py-0.5 text-xs text-[#F5F5F7]">
                  Video
                </span>
                {isSelected ? (
                  <span className="absolute top-2 left-2 rounded-full bg-[#C8A97E] px-2 py-0.5 text-xs font-medium text-black">
                    Cover
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      )}

      {isAutomatic && hasMedia ? (
        <p className="text-xs text-[#A1A1A6]">Using automatic cover (first photo or video).</p>
      ) : null}

      {error ? <p className="text-sm text-red-400">{error}</p> : null}
    </div>
  );
}