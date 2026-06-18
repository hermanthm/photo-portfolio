"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChangeEvent, useState } from "react";

type OgImageSectionProps = {
  initialOgImageUrl: string | null;
  cloudinaryConfigured: boolean;
};

export function OgImageSection({
  initialOgImageUrl,
  cloudinaryConfigured,
}: OgImageSectionProps) {
  const router = useRouter();
  const [ogImageUrl, setOgImageUrl] = useState(initialOgImageUrl);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/admin/settings/og-image", {
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

    const data = await response.json();
    setOgImageUrl(data.ogImageUrl);
    router.refresh();
  }

  async function handleRemove() {
    if (!confirm("Remove the OG image?")) return;

    const response = await fetch("/api/admin/settings/og-image", {
      method: "DELETE",
    });

    if (!response.ok) {
      setError("Failed to remove OG image.");
      return;
    }

    setOgImageUrl(null);
    router.refresh();
  }

  return (
    <div className="space-y-4 rounded-3xl border border-neutral-800 bg-[#111111] p-6">
      <h2 className="text-lg font-medium text-[#F5F5F7]">Social preview image</h2>
      <p className="text-sm text-[#A1A1A6]">
        Used for Open Graph and Twitter cards when your site is shared.
      </p>

      {!cloudinaryConfigured ? (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          Cloudinary is not configured. Add credentials to `.env` before uploading.
        </div>
      ) : null}

      {ogImageUrl ? (
        <div className="relative aspect-[1200/630] max-w-lg overflow-hidden rounded-2xl bg-[#1A1A1A]">
          <Image
            src={ogImageUrl}
            alt="OG preview"
            fill
            className="object-cover"
            sizes="512px"
          />
        </div>
      ) : (
        <p className="text-sm text-[#A1A1A6]">No OG image uploaded yet.</p>
      )}

      <div className="flex flex-wrap gap-3">
        <label className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-[#C8A97E] px-5 py-2 text-sm font-medium text-[#F5F5F7] transition hover:bg-[#C8A97E] hover:text-black">
          {uploading ? "Uploading..." : ogImageUrl ? "Replace image" : "Upload image"}
          <input
            type="file"
            accept="image/*"
            disabled={!cloudinaryConfigured || uploading}
            onChange={handleUpload}
            className="hidden"
          />
        </label>

        {ogImageUrl ? (
          <button
            type="button"
            onClick={handleRemove}
            className="rounded-xl border border-red-500/40 px-5 py-2 text-sm text-red-300 transition hover:bg-red-500/10"
          >
            Remove
          </button>
        ) : null}
      </div>

      {error ? <p className="text-sm text-red-400">{error}</p> : null}
    </div>
  );
}