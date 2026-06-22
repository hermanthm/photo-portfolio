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

type UploadStatus = "pending" | "uploading" | "success" | "error";

type BatchUploadItem = {
  id: string;
  fileName: string;
  status: UploadStatus;
  error?: string;
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
  const [batchItems, setBatchItems] = useState<BatchUploadItem[]>([]);
  const [batchUploading, setBatchUploading] = useState(false);

  const uploadBusy = uploading || batchUploading;

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

  function updateBatchItem(id: string, patch: Partial<BatchUploadItem>) {
    setBatchItems((current) =>
      current.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  }

  async function handleBatchUpload(event: ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files?.length) return;

    const items: BatchUploadItem[] = Array.from(files).map((file) => ({
      id: crypto.randomUUID(),
      fileName: file.name,
      status: "pending",
    }));

    setBatchItems(items);
    setBatchUploading(true);
    setError(null);
    event.target.value = "";

    const uploadedPhotos: PhotoItem[] = [];

    for (let index = 0; index < files.length; index++) {
      const file = files[index];
      const item = items[index];

      updateBatchItem(item.id, { status: "uploading" });

      const formData = new FormData();
      formData.append("collectionId", collectionId);
      formData.append("file", file);

      const response = await fetch("/api/admin/photos/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        updateBatchItem(item.id, {
          status: "error",
          error: data?.error ?? "Upload failed.",
        });
        continue;
      }

      const photo = await response.json();
      uploadedPhotos.push(photo);
      updateBatchItem(item.id, { status: "success" });
    }

    if (uploadedPhotos.length > 0) {
      setPhotos((current) =>
        [...current, ...uploadedPhotos].sort((a, b) => a.sortOrder - b.sortOrder),
      );
      router.refresh();
    }

    setBatchUploading(false);
  }

  function clearBatchItems() {
    setBatchItems([]);
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

  const batchTotal = batchItems.length;
  const batchCompleted = batchItems.filter(
    (item) => item.status === "success" || item.status === "error",
  ).length;
  const batchSuccessCount = batchItems.filter((item) => item.status === "success").length;
  const batchErrorCount = batchItems.filter((item) => item.status === "error").length;
  const batchProgress = batchTotal > 0 ? (batchCompleted / batchTotal) * 100 : 0;

  function batchSummary() {
    if (batchUploading) {
      const inProgress =
        batchSuccessCount +
        batchErrorCount +
        (batchItems.some((item) => item.status === "uploading") ? 1 : 0);
      return `Uploading ${inProgress} of ${batchTotal}`;
    }

    const parts: string[] = [];
    if (batchSuccessCount > 0) {
      parts.push(`${batchSuccessCount} uploaded`);
    }
    if (batchErrorCount > 0) {
      parts.push(`${batchErrorCount} failed`);
    }
    return parts.join(", ") || "Upload complete";
  }

  function statusBadge(item: BatchUploadItem) {
    switch (item.status) {
      case "pending":
        return (
          <span className="rounded-full bg-neutral-800 px-2.5 py-0.5 text-xs text-[#A1A1A6]">
            Pending
          </span>
        );
      case "uploading":
        return (
          <span className="rounded-full bg-[#C8A97E]/20 px-2.5 py-0.5 text-xs text-[#C8A97E]">
            Uploading…
          </span>
        );
      case "success":
        return (
          <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs text-emerald-300">
            Success
          </span>
        );
      case "error":
        return (
          <span className="rounded-full bg-red-500/20 px-2.5 py-0.5 text-xs text-red-300">
            Failed
          </span>
        );
    }
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
        <div className="grid gap-4 md:grid-cols-[1fr_auto_auto]">
          <input
            type="text"
            value={alt}
            onChange={(event) => setAlt(event.target.value)}
            placeholder="Alt text (optional)"
            disabled={uploadBusy}
            className="w-full rounded-xl border border-neutral-800 bg-[#0F0F0F] px-4 py-3 text-[#F5F5F7] outline-none transition focus:border-[#C8A97E] disabled:opacity-60"
          />
          <label
            className={`inline-flex items-center justify-center rounded-xl border border-[#C8A97E] px-6 py-3 font-medium text-[#F5F5F7] transition hover:bg-[#C8A97E] hover:text-black ${uploadBusy || !cloudinaryConfigured ? "pointer-events-none opacity-60" : "cursor-pointer"}`}
          >
            {uploading ? "Uploading..." : "Choose file"}
            <input
              type="file"
              accept="image/*"
              disabled={!cloudinaryConfigured || uploadBusy}
              onChange={handleUpload}
              className="hidden"
            />
          </label>
          <label
            className={`inline-flex items-center justify-center rounded-xl border border-neutral-700 px-6 py-3 font-medium text-[#F5F5F7] transition hover:border-[#C8A97E] hover:text-[#C8A97E] ${uploadBusy || !cloudinaryConfigured ? "pointer-events-none opacity-60" : "cursor-pointer"}`}
          >
            {batchUploading ? "Uploading batch..." : "Batch upload"}
            <input
              type="file"
              accept="image/*"
              multiple
              disabled={!cloudinaryConfigured || uploadBusy}
              onChange={handleBatchUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {batchItems.length > 0 ? (
        <div className="rounded-3xl border border-neutral-800 bg-[#111111] p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-medium">Batch upload status</h2>
              <p className="mt-1 text-sm text-[#A1A1A6]">{batchSummary()}</p>
            </div>
            <button
              type="button"
              onClick={clearBatchItems}
              disabled={batchUploading}
              className="rounded-xl border border-neutral-700 px-4 py-2 text-sm text-[#A1A1A6] transition hover:text-[#F5F5F7] disabled:opacity-60"
            >
              Clear
            </button>
          </div>

          <div className="mb-4 h-2 overflow-hidden rounded-full bg-neutral-800">
            <div
              className="h-full rounded-full bg-[#C8A97E] transition-all duration-300"
              style={{ width: `${batchProgress}%` }}
            />
          </div>

          <ul className="max-h-60 space-y-2 overflow-y-auto">
            {batchItems.map((item) => (
              <li
                key={item.id}
                className="flex items-start justify-between gap-4 rounded-xl border border-neutral-800 bg-[#0F0F0F] px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm text-[#F5F5F7]">{item.fileName}</p>
                  {item.error ? (
                    <p className="mt-1 text-xs text-red-400">{item.error}</p>
                  ) : null}
                </div>
                {statusBadge(item)}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

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