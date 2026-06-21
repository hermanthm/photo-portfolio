"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChangeEvent, useState } from "react";

import { ReorderButtons } from "@/components/admin/ReorderButtons";

type PhotoItem = {
  id: string;
  url: string;
  alt: string | null;
  sortOrder: number;
};

type PhotoManagerProps = {
  collectionId: string;
  initialPhotos: PhotoItem[];
  cloudinaryConfigured: boolean;
  coverPhotoId?: string | null;
};

export function PhotoManager({
  collectionId,
  initialPhotos,
  cloudinaryConfigured,
  coverPhotoId: initialCoverPhotoId = null,
}: PhotoManagerProps) {
  const router = useRouter();
  const [photos, setPhotos] = useState(initialPhotos);
  const [alt, setAlt] = useState("");
  const [coverPhotoId, setCoverPhotoId] = useState(initialCoverPhotoId);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  async function handleSetCover(photoId: string) {
    const response = await fetch(`/api/admin/collections/${collectionId}/cover`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ photoId }),
    });

    if (!response.ok) {
      setError("Failed to set cover image.");
      return;
    }

    const data = await response.json();
    setCoverPhotoId(data.coverPhotoId);
    router.refresh();
  }

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("collectionId", collectionId);
    formData.append("file", file);
    if (alt.trim()) formData.append("alt", alt.trim());

    const response = await fetch("/api/admin/photos/upload", {
      method: "POST",
      body: formData,
    });

    setUploading(false);
    event.target.value = "";

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setError(data?.error ?? "Upload failed.");
      return;
    }

    const photo = await response.json();
    setPhotos((current) => [...current, photo].sort((a, b) => a.sortOrder - b.sortOrder));
    setAlt("");
    router.refresh();
  }

  async function handleDelete(photoId: string) {
    if (!confirm("Delete this photo?")) return;

    const response = await fetch(`/api/admin/photos/${photoId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      setError("Failed to delete photo.");
      return;
    }

    setPhotos((current) => current.filter((photo) => photo.id !== photoId));
    router.refresh();
  }

  async function persistOrder(nextPhotos: PhotoItem[]) {
    const response = await fetch("/api/admin/photos/reorder", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        collectionId,
        photoIds: nextPhotos.map((photo) => photo.id),
      }),
    });

    if (!response.ok) {
      setError("Failed to reorder photos.");
      return false;
    }

    setPhotos(nextPhotos.map((photo, index) => ({ ...photo, sortOrder: index })));
    router.refresh();
    return true;
  }

  async function movePhoto(photoId: string, direction: -1 | 1) {
    const index = photos.findIndex((photo) => photo.id === photoId);
    const targetIndex = index + direction;

    if (index < 0 || targetIndex < 0 || targetIndex >= photos.length) {
      return;
    }

    const nextPhotos = [...photos];
    [nextPhotos[index], nextPhotos[targetIndex]] = [
      nextPhotos[targetIndex],
      nextPhotos[index],
    ];

    await persistOrder(nextPhotos);
  }

  async function handleAltChange(photoId: string, nextAlt: string) {
    const response = await fetch(`/api/admin/photos/${photoId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alt: nextAlt.trim() || null }),
    });

    if (!response.ok) {
      setError("Failed to update alt text.");
      return;
    }

    const photo = await response.json();
    setPhotos((current) =>
      current.map((item) => (item.id === photoId ? { ...item, alt: photo.alt } : item)),
    );
  }

  return (
    <div className="space-y-8">
      {!cloudinaryConfigured ? (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          Cloudinary is not configured. Add `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`,
          and `CLOUDINARY_API_SECRET` to `.env` before uploading photos.
        </div>
      ) : null}

      <div className="rounded-3xl border border-neutral-800 bg-[#111111] p-6">
        <h2 className="mb-4 text-xl font-medium">Upload photo</h2>
        <div className="grid gap-4 md:grid-cols-[1fr_auto]">
          <input
            type="text"
            value={alt}
            onChange={(event) => setAlt(event.target.value)}
            placeholder="Alt text (optional)"
            className="w-full rounded-xl border border-neutral-800 bg-[#0F0F0F] px-4 py-3 text-[#F5F5F7] outline-none transition focus:border-[#C8A97E]"
          />
          <label className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-[#C8A97E] px-6 py-3 font-medium text-[#F5F5F7] transition hover:bg-[#C8A97E] hover:text-black">
            {uploading ? "Uploading..." : "Choose file"}
            <input
              type="file"
              accept="image/*"
              disabled={!cloudinaryConfigured || uploading}
              onChange={handleUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      {photos.length === 0 ? (
        <p className="text-[#A1A1A6]">No photos yet.</p>
      ) : (
        <div className="grid gap-6">
          {photos.map((photo, index) => (
            <div
              key={photo.id}
              className="grid gap-4 rounded-3xl border border-neutral-800 bg-[#111111] p-4 md:grid-cols-[auto_180px_1fr_auto]"
            >
              <ReorderButtons
                onMoveUp={() => movePhoto(photo.id, -1)}
                onMoveDown={() => movePhoto(photo.id, 1)}
                disableUp={index === 0}
                disableDown={index === photos.length - 1}
              />
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-[#1A1A1A]">
                <Image
                  src={photo.url}
                  alt={photo.alt ?? "Photo"}
                  fill
                  className="object-cover"
                  sizes="180px"
                />
                {coverPhotoId === photo.id ? (
                  <span className="absolute top-2 left-2 rounded-full bg-[#C8A97E] px-2 py-0.5 text-xs font-medium text-black">
                    Cover
                  </span>
                ) : null}
              </div>

              <div className="space-y-3">
                <label className="block space-y-2">
                  <span className="text-sm text-[#A1A1A6]">Alt text</span>
                  <input
                    type="text"
                    defaultValue={photo.alt ?? ""}
                    onBlur={(event) => handleAltChange(photo.id, event.target.value)}
                    className="w-full rounded-xl border border-neutral-800 bg-[#0F0F0F] px-4 py-3 text-[#F5F5F7] outline-none transition focus:border-[#C8A97E]"
                  />
                </label>
                <p className="text-sm text-[#A1A1A6]">Sort order: {photo.sortOrder}</p>
              </div>

              <div className="flex h-fit flex-col gap-2">
                {coverPhotoId !== photo.id ? (
                  <button
                    type="button"
                    onClick={() => handleSetCover(photo.id)}
                    className="rounded-xl border border-neutral-700 px-4 py-2 text-sm text-[#A1A1A6] transition hover:text-[#F5F5F7]"
                  >
                    Set as cover
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => handleDelete(photo.id)}
                  className="rounded-xl border border-red-500/40 px-4 py-2 text-sm text-red-300 transition hover:bg-red-500/10"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}