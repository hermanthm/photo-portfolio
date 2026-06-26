"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { CollectionPreview } from "@/components/gallery/CollectionPreview";
import { getCollectionCoverUrl } from "@/lib/collection-cover";
import {
  clampFocalPoint,
  COVER_ASPECT_RATIO_OPTIONS,
  coverAspectRatioToCss,
  coverFocalToObjectPosition,
  DEFAULT_COVER_ASPECT_RATIO,
  DEFAULT_COVER_FOCAL_X,
  DEFAULT_COVER_FOCAL_Y,
  type CoverAspectRatio,
} from "@/lib/cover-frame";

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
  collectionTitle: string;
  collectionType: string;
  photos: CoverPhoto[];
  videos: CoverVideo[];
  coverPhotoId: string | null;
  coverVideoId: string | null;
  coverAspectRatio: CoverAspectRatio;
  coverFocalX: number;
  coverFocalY: number;
};

export function CoverImagePicker({
  collectionId,
  collectionTitle,
  collectionType,
  photos,
  videos,
  coverPhotoId: initialCoverPhotoId,
  coverVideoId: initialCoverVideoId,
  coverAspectRatio: initialCoverAspectRatio,
  coverFocalX: initialCoverFocalX,
  coverFocalY: initialCoverFocalY,
}: CoverImagePickerProps) {
  const router = useRouter();
  const [coverPhotoId, setCoverPhotoId] = useState(initialCoverPhotoId);
  const [coverVideoId, setCoverVideoId] = useState(initialCoverVideoId);
  const [coverAspectRatio, setCoverAspectRatio] =
    useState<CoverAspectRatio>(initialCoverAspectRatio);
  const [coverFocalX, setCoverFocalX] = useState(initialCoverFocalX);
  const [coverFocalY, setCoverFocalY] = useState(initialCoverFocalY);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [frameLoading, setFrameLoading] = useState(false);

  const coverableVideos = videos.filter((video) => video.thumbnailUrl);
  const hasMedia = photos.length > 0 || coverableVideos.length > 0;
  const isAutomatic = !coverPhotoId && !coverVideoId;

  const previewCoverUrl = useMemo(() => {
    const coverPhoto = coverPhotoId
      ? photos.find((photo) => photo.id === coverPhotoId)
      : null;
    const coverVideo = coverVideoId
      ? coverableVideos.find((video) => video.id === coverVideoId)
      : null;

    return getCollectionCoverUrl({
      coverPhoto: coverPhoto ? { url: coverPhoto.url } : null,
      coverVideo: coverVideo ? { thumbnailUrl: coverVideo.thumbnailUrl } : null,
      photos: photos.map((photo) => ({ url: photo.url })),
      videos: coverableVideos.map((video) => ({ thumbnailUrl: video.thumbnailUrl })),
    });
  }, [coverPhotoId, coverVideoId, photos, coverableVideos]);

  const frameDirty =
    coverAspectRatio !== initialCoverAspectRatio ||
    coverFocalX !== initialCoverFocalX ||
    coverFocalY !== initialCoverFocalY;

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

  function setFocalFromPointer(
    event: React.MouseEvent<HTMLDivElement>,
    element: HTMLDivElement,
  ) {
    const rect = element.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setCoverFocalX(clampFocalPoint(x));
    setCoverFocalY(clampFocalPoint(y));
  }

  async function saveFrame() {
    setFrameLoading(true);
    setError(null);

    const response = await fetch(`/api/admin/collections/${collectionId}/cover-frame`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        coverAspectRatio,
        coverFocalX,
        coverFocalY,
      }),
    });

    setFrameLoading(false);

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setError(data?.error ?? "Failed to save cover frame.");
      return;
    }

    router.refresh();
  }

  function resetFrame() {
    setCoverAspectRatio(DEFAULT_COVER_ASPECT_RATIO);
    setCoverFocalX(DEFAULT_COVER_FOCAL_X);
    setCoverFocalY(DEFAULT_COVER_FOCAL_Y);
  }

  return (
    <div className="space-y-6">
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
      </div>

      <div className="space-y-6 rounded-3xl border border-neutral-800 bg-[#111111] p-6">
        <div>
          <h2 className="text-xl font-medium text-[#F5F5F7]">Cover frame</h2>
          <p className="mt-1 text-sm text-[#A1A1A6]">
            Customize how the cover is cropped on collection previews.
          </p>
        </div>

        {!previewCoverUrl ? (
          <p className="text-sm text-[#A1A1A6]">
            Add a cover image first, then adjust the frame.
          </p>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
            <div className="space-y-6">
              <label className="block space-y-2">
                <span className="text-sm text-[#A1A1A6]">Aspect ratio</span>
                <select
                  value={coverAspectRatio}
                  onChange={(event) =>
                    setCoverAspectRatio(event.target.value as CoverAspectRatio)
                  }
                  className="w-full rounded-xl border border-neutral-800 bg-[#0F0F0F] px-4 py-3 text-[#F5F5F7] outline-none transition focus:border-[#C8A97E]"
                >
                  {COVER_ASPECT_RATIO_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <div className="space-y-2">
                <span className="text-sm text-[#A1A1A6]">
                  Focal point — click the image to set crop focus
                </span>
                <div
                  className="relative mx-auto w-full max-w-xl cursor-crosshair overflow-hidden rounded-2xl border border-neutral-800 bg-[#1A1A1A]"
                  style={{ aspectRatio: coverAspectRatioToCss(coverAspectRatio) }}
                  onClick={(event) =>
                    setFocalFromPointer(event, event.currentTarget)
                  }
                >
                  <Image
                    src={previewCoverUrl}
                    alt="Cover frame preview"
                    fill
                    className="object-cover"
                    style={{ objectPosition: coverFocalToObjectPosition(coverFocalX, coverFocalY) }}
                    sizes="(max-width: 768px) 100vw, 480px"
                  />
                  <span
                    className="pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#C8A97E] bg-[#C8A97E]/30 shadow-[0_0_0_2px_rgba(0,0,0,0.5)]"
                    style={{ left: `${coverFocalX}%`, top: `${coverFocalY}%` }}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-2">
                  <span className="text-sm text-[#A1A1A6]">Horizontal focus ({coverFocalX}%)</span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={coverFocalX}
                    onChange={(event) =>
                      setCoverFocalX(clampFocalPoint(Number(event.target.value)))
                    }
                    className="w-full accent-[#C8A97E]"
                  />
                </label>
                <label className="block space-y-2">
                  <span className="text-sm text-[#A1A1A6]">Vertical focus ({coverFocalY}%)</span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={coverFocalY}
                    onChange={(event) =>
                      setCoverFocalY(clampFocalPoint(Number(event.target.value)))
                    }
                    className="w-full accent-[#C8A97E]"
                  />
                </label>
              </div>
            </div>

            <div className="space-y-3">
              <span className="text-sm text-[#A1A1A6]">Live preview</span>
              <CollectionPreview
                slug="#"
                title={collectionTitle}
                description={null}
                type={collectionType}
                coverUrl={previewCoverUrl}
                coverAspectRatio={coverAspectRatio}
                coverFocalX={coverFocalX}
                coverFocalY={coverFocalY}
                disableLink
              />
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            disabled={frameLoading || !previewCoverUrl || !frameDirty}
            onClick={saveFrame}
            className="rounded-xl border border-[#C8A97E] px-6 py-3 font-medium text-[#F5F5F7] transition hover:bg-[#C8A97E] hover:text-black disabled:opacity-60"
          >
            {frameLoading ? "Saving frame..." : "Save frame"}
          </button>
          <button
            type="button"
            disabled={frameLoading || !previewCoverUrl}
            onClick={resetFrame}
            className="rounded-xl border border-neutral-700 px-6 py-3 text-[#A1A1A6] transition hover:text-[#F5F5F7] disabled:opacity-60"
          >
            Reset to default
          </button>
        </div>
      </div>

      {error ? <p className="text-sm text-red-400">{error}</p> : null}
    </div>
  );
}