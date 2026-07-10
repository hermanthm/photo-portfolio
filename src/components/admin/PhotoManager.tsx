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

  async function handleBatchUpload(event: ChangeEvent<HTMLInputElement>) {
    const input = event.target;
    const fileList = Array.from(input.files ?? []);
    if (!fileList.length) return;

    const items: BatchUploadItem[] = fileList.map((file) => ({
      id: crypto.randomUUID(),
      fileName: file.name,
      status: "pending",
    }));

    setBatchItems(items);
    setBatchUploading(true);
    setError(null);

    const uploadedPhotos: PhotoItem[] = [];
    const workingItems = [...items];

    for (let index = 0; index < fileList.length; index++) {
      const file = fileList[index];
      const item = workingItems[index];

      workingItems[index] = { ...item, status: "uploading" };
      setBatchItems([...workingItems]);

      try {
        const formData = new FormData();
        formData.append("collectionId", collectionId);
        formData.append("file", file);

        const response = await fetch("/api/admin/photos/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const data = await response.json().catch(() => null);
          workingItems[index] = {
            ...item,
            status: "error",
            error: data?.error ?? "Upload failed.",
          };
        } else {
          const photo = await response.json();
          uploadedPhotos.push(photo);
          workingItems[index] = { ...item, status: "success" };
        }
      } catch (uploadError) {
        workingItems[index] = {
          ...item,
          status: "error",
          error:
            uploadError instanceof Error ? uploadError.message : "Upload failed.",
        };
      }

      setBatchItems([...workingItems]);
    }

    input.value = "";

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

    if (batchItems.every((item) => item.status === "pending")) {
      return "Upload did not start";
    }

    const parts: string[] = [];
    if (batchSuccessCount > 0) {
      parts.push(`${batchSuccessCount} uploaded`);
    }
    if (batchErrorCount > 0) {
      parts.push(`${batchErrorCount} failed`);
    }
    const pendingCount = batchItems.filter((item) => item.status === "pending").length;
    if (pendingCount > 0) {
      parts.push(`${pendingCount} pending`);
    }
    return parts.join(", ");
  }

  function statusBadge(item: BatchUploadItem) {
    switch (item.status) {
      case "pending":
        return (
          <span className="rounded-full bg-border px-2.5 py-0.5 ui-helper">
            Pending
          </span>
        );
      case "uploading":
        return (
          <span className="rounded-full bg-foreground/5 px-2.5 py-0.5 text-xs text-accent">
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
          <span className="rounded-full border border-error/20 bg-error/10 px-2.5 py-0.5 text-xs text-error">
            Failed
          </span>
        );
    }
  }

  return (
    <div className="space-y-8">
      {!cloudinaryConfigured ? (
        <div className="ui-alert-warning">
          Cloudinary is not configured. Add `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`,
          and `CLOUDINARY_API_SECRET` to `.env` before uploading photos.
        </div>
      ) : null}

      <div className="ui-card-padded">
        <h2 className="mb-4 text-xl font-medium">Upload photo</h2>
        <div className="grid gap-4 md:grid-cols-[1fr_auto_auto]">
          <input
            type="text"
            value={alt}
            onChange={(event) => setAlt(event.target.value)}
            placeholder="Alt text (optional)"
            disabled={uploadBusy}
            className="ui-input disabled:opacity-60"
          />
          <label
            className={`inline-flex items-center justify-center rounded-xl border border-accent px-6 py-3 font-medium text-foreground transition hover:bg-accent hover:text-inverse ${uploadBusy || !cloudinaryConfigured ? "pointer-events-none opacity-60" : "cursor-pointer"}`}
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
            className={`inline-flex items-center justify-center rounded-xl border border-border-strong px-6 py-3 font-medium text-foreground transition hover:border-accent hover:text-accent ${uploadBusy || !cloudinaryConfigured ? "pointer-events-none opacity-60" : "cursor-pointer"}`}
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
        <div className="ui-card-padded">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-medium">Batch upload status</h2>
              <p className="mt-1 ui-label">{batchSummary()}</p>
            </div>
            <button
              type="button"
              onClick={clearBatchItems}
              disabled={batchUploading}
              className="ui-btn-ghost disabled:opacity-60"
            >
              Clear
            </button>
          </div>

          <div className="ui-progress-track mb-4">
            <div
              className="ui-progress-bar"
              style={{ width: `${batchProgress}%` }}
            />
          </div>

          <ul className="max-h-60 space-y-2 overflow-y-auto">
            {batchItems.map((item) => (
              <li
                key={item.id}
                className="flex items-start justify-between gap-4 rounded-xl border border-border bg-surface-elevated px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm text-foreground">{item.fileName}</p>
                  {item.error ? (
                    <p className="mt-1 text-xs text-error">{item.error}</p>
                  ) : null}
                </div>
                {statusBadge(item)}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {error ? <p className="ui-error">{error}</p> : null}

      {photos.length === 0 ? (
        <p className="text-muted">No photos yet.</p>
      ) : (
        <div className="grid gap-6">
          {photos.map((photo, index) => (
            <div
              key={photo.id}
              className="grid gap-4 rounded-3xl border border-border bg-surface p-4 md:grid-cols-[auto_180px_1fr_auto]"
            >
              <ReorderButtons
                onMoveUp={() => movePhoto(photo.id, -1)}
                onMoveDown={() => movePhoto(photo.id, 1)}
                disableUp={index === 0}
                disableDown={index === photos.length - 1}
              />
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-media">
                <Image
                  src={photo.url}
                  alt={photo.alt ?? "Photo"}
                  fill
                  className="object-cover"
                  sizes="180px"
                />
                {coverPhotoId === photo.id ? (
                  <span className="absolute top-2 left-2 rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-inverse">
                    Cover
                  </span>
                ) : null}
              </div>

              <div className="space-y-3">
                <label className="block space-y-2">
                  <span className="ui-label">Alt text</span>
                  <input
                    type="text"
                    defaultValue={photo.alt ?? ""}
                    onBlur={(event) => handleAltChange(photo.id, event.target.value)}
                    className="ui-input"
                  />
                </label>
                <p className="ui-label">Sort order: {photo.sortOrder}</p>
              </div>

              <div className="flex h-fit flex-col gap-2">
                {coverPhotoId !== photo.id ? (
                  <button
                    type="button"
                    onClick={() => handleSetCover(photo.id)}
                    className="ui-btn-ghost"
                  >
                    Set as cover
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => handleDelete(photo.id)}
                  className="ui-btn-danger"
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