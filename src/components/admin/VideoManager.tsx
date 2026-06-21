"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { ReorderButtons } from "@/components/admin/ReorderButtons";

type VideoItem = {
  id: string;
  title: string;
  description: string | null;
  embedUrl: string;
  provider: string;
  thumbnailUrl: string | null;
  sortOrder: number;
};

type VideoManagerProps = {
  collectionId: string;
  initialVideos: VideoItem[];
  coverVideoId?: string | null;
};

export function VideoManager({
  collectionId,
  initialVideos,
  coverVideoId: initialCoverVideoId = null,
}: VideoManagerProps) {
  const router = useRouter();
  const [videos, setVideos] = useState(initialVideos);
  const [coverVideoId, setCoverVideoId] = useState(initialCoverVideoId);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const response = await fetch("/api/admin/videos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        collectionId,
        title,
        url,
        description: description.trim() || null,
      }),
    });

    setLoading(false);

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setError(data?.error ?? "Failed to add video.");
      return;
    }

    const video = await response.json();
    setVideos((current) => [...current, video].sort((a, b) => a.sortOrder - b.sortOrder));
    setTitle("");
    setUrl("");
    setDescription("");
    router.refresh();
  }

  async function persistOrder(nextVideos: VideoItem[]) {
    const response = await fetch("/api/admin/videos/reorder", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        collectionId,
        videoIds: nextVideos.map((video) => video.id),
      }),
    });

    if (!response.ok) {
      setError("Failed to reorder videos.");
      return false;
    }

    setVideos(nextVideos.map((video, index) => ({ ...video, sortOrder: index })));
    router.refresh();
    return true;
  }

  async function moveVideo(videoId: string, direction: -1 | 1) {
    const index = videos.findIndex((video) => video.id === videoId);
    const targetIndex = index + direction;

    if (index < 0 || targetIndex < 0 || targetIndex >= videos.length) {
      return;
    }

    const nextVideos = [...videos];
    [nextVideos[index], nextVideos[targetIndex]] = [
      nextVideos[targetIndex],
      nextVideos[index],
    ];

    await persistOrder(nextVideos);
  }

  async function handleSetCover(videoId: string) {
    const response = await fetch(`/api/admin/collections/${collectionId}/cover`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ videoId }),
    });

    if (!response.ok) {
      setError("Failed to set cover image.");
      return;
    }

    const data = await response.json();
    setCoverVideoId(data.coverVideoId);
    router.refresh();
  }

  async function handleDelete(videoId: string) {
    if (!confirm("Delete this video?")) return;

    const response = await fetch(`/api/admin/videos/${videoId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      setError("Failed to delete video.");
      return;
    }

    setVideos((current) => current.filter((video) => video.id !== videoId));
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <form
        onSubmit={handleCreate}
        className="space-y-4 rounded-3xl border border-neutral-800 bg-[#111111] p-6"
      >
        <h2 className="text-xl font-medium">Add video</h2>

        <label className="block space-y-2">
          <span className="text-sm text-[#A1A1A6]">Title</span>
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
            className="w-full rounded-xl border border-neutral-800 bg-[#0F0F0F] px-4 py-3 text-[#F5F5F7] outline-none transition focus:border-[#C8A97E]"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm text-[#A1A1A6]">YouTube or Vimeo URL</span>
          <input
            type="url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            required
            placeholder="https://www.youtube.com/watch?v=..."
            className="w-full rounded-xl border border-neutral-800 bg-[#0F0F0F] px-4 py-3 text-[#F5F5F7] outline-none transition focus:border-[#C8A97E]"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm text-[#A1A1A6]">Description</span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={3}
            className="w-full rounded-xl border border-neutral-800 bg-[#0F0F0F] px-4 py-3 text-[#F5F5F7] outline-none transition focus:border-[#C8A97E]"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="rounded-xl border border-[#C8A97E] px-6 py-3 font-medium text-[#F5F5F7] transition hover:bg-[#C8A97E] hover:text-black disabled:opacity-60"
        >
          {loading ? "Adding..." : "Add video"}
        </button>
      </form>

      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      {videos.length === 0 ? (
        <p className="text-[#A1A1A6]">No videos yet.</p>
      ) : (
        <div className="space-y-4">
          {videos.map((video, index) => (
            <div
              key={video.id}
              className="flex flex-col gap-4 rounded-3xl border border-neutral-800 bg-[#111111] p-6 md:flex-row md:items-start"
            >
              <ReorderButtons
                onMoveUp={() => moveVideo(video.id, -1)}
                onMoveDown={() => moveVideo(video.id, 1)}
                disableUp={index === 0}
                disableDown={index === videos.length - 1}
              />
              {video.thumbnailUrl ? (
                <div className="relative h-24 w-40 shrink-0 overflow-hidden rounded-2xl bg-[#1A1A1A]">
                  <Image
                    src={video.thumbnailUrl}
                    alt={video.title}
                    fill
                    className="object-cover"
                    sizes="160px"
                  />
                  {coverVideoId === video.id ? (
                    <span className="absolute top-2 left-2 rounded-full bg-[#C8A97E] px-2 py-0.5 text-xs font-medium text-black">
                      Cover
                    </span>
                  ) : null}
                </div>
              ) : null}
              <div className="flex-1">
                <h3 className="text-lg font-medium text-[#F5F5F7]">{video.title}</h3>
                <p className="mt-1 text-sm text-[#A1A1A6]">
                  {video.provider} · sort {video.sortOrder}
                </p>
                {video.description ? (
                  <p className="mt-3 text-[#A1A1A6]">{video.description}</p>
                ) : null}
                <p className="mt-3 break-all text-sm text-[#C8A97E]">{video.embedUrl}</p>
              </div>

              <div className="flex flex-col gap-2 md:items-end">
                {video.thumbnailUrl && coverVideoId !== video.id ? (
                  <button
                    type="button"
                    onClick={() => handleSetCover(video.id)}
                    className="rounded-xl border border-neutral-700 px-4 py-2 text-sm text-[#A1A1A6] transition hover:text-[#F5F5F7]"
                  >
                    Set as cover
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => handleDelete(video.id)}
                  className="h-fit rounded-xl border border-red-500/40 px-4 py-2 text-sm text-red-300 transition hover:bg-red-500/10"
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