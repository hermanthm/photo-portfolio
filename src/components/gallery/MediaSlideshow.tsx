"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

import type { GalleryPhoto, GalleryVideo } from "@/components/gallery/types";

type Slide =
  | { type: "photo"; photo: GalleryPhoto }
  | { type: "video"; video: GalleryVideo };

type MediaSlideshowProps = {
  photos: GalleryPhoto[];
  videos: GalleryVideo[];
  collectionTitle: string;
  initialIndex?: number;
};

function buildSlides(photos: GalleryPhoto[], videos: GalleryVideo[]): Slide[] {
  return [
    ...photos.map((photo) => ({ type: "photo" as const, photo })),
    ...videos.map((video) => ({ type: "video" as const, video })),
  ];
}

export function MediaSlideshow({
  photos,
  videos,
  collectionTitle,
  initialIndex = 0,
}: MediaSlideshowProps) {
  const slides = buildSlides(photos, videos);
  const [index, setIndex] = useState(
    Math.min(Math.max(initialIndex, 0), Math.max(slides.length - 1, 0)),
  );

  const goTo = useCallback(
    (nextIndex: number) => {
      if (slides.length === 0) return;
      setIndex((nextIndex + slides.length) % slides.length);
    },
    [slides.length],
  );

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowLeft") goTo(index - 1);
      if (event.key === "ArrowRight") goTo(index + 1);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goTo, index]);

  if (slides.length === 0) {
    return (
      <div className="rounded-3xl border border-neutral-800 bg-[#111111] p-12 text-center text-[#A1A1A6]">
        No media in this collection yet.
      </div>
    );
  }

  const current = slides[index];

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl border border-neutral-800 bg-[#111111]">
        <div className="relative aspect-[16/10] bg-[#0A0A0A] md:aspect-[16/9]">
          {current.type === "photo" ? (
            <Image
              src={current.photo.url}
              alt={current.photo.alt ?? collectionTitle}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          ) : (
            <iframe
              src={current.video.embedUrl}
              title={current.video.title}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
        </div>

        {slides.length > 1 ? (
          <>
            <button
              type="button"
              onClick={() => goTo(index - 1)}
              className="absolute top-1/2 left-4 -translate-y-1/2 rounded-full border border-neutral-700 bg-black/60 px-4 py-3 text-[#F5F5F7] transition hover:border-[#C8A97E] hover:text-[#C8A97E]"
              aria-label="Previous slide"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => goTo(index + 1)}
              className="absolute top-1/2 right-4 -translate-y-1/2 rounded-full border border-neutral-700 bg-black/60 px-4 py-3 text-[#F5F5F7] transition hover:border-[#C8A97E] hover:text-[#C8A97E]"
              aria-label="Next slide"
            >
              →
            </button>
          </>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          {current.type === "video" ? (
            <>
              <p className="text-sm uppercase tracking-[0.15em] text-[#C8A97E]">
                {current.video.provider}
              </p>
              <h3 className="mt-1 text-xl font-medium text-[#F5F5F7]">
                {current.video.title}
              </h3>
              {current.video.description ? (
                <p className="mt-2 max-w-2xl text-[#A1A1A6]">
                  {current.video.description}
                </p>
              ) : null}
            </>
          ) : (
            <p className="text-[#A1A1A6]">
              {current.photo.alt ?? collectionTitle}
            </p>
          )}
        </div>
        <p className="text-sm text-[#A1A1A6]">
          {index + 1} / {slides.length}
        </p>
      </div>

      {slides.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {slides.map((slide, slideIndex) => (
            <button
              key={
                slide.type === "photo" ? slide.photo.id : slide.video.id
              }
              type="button"
              onClick={() => setIndex(slideIndex)}
              className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border transition ${
                slideIndex === index
                  ? "border-[#C8A97E]"
                  : "border-neutral-800 opacity-70 hover:opacity-100"
              }`}
            >
              {slide.type === "photo" ? (
                <Image
                  src={slide.photo.url}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              ) : slide.video.thumbnailUrl ? (
                <Image
                  src={slide.video.thumbnailUrl}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              ) : (
                <span className="flex h-full items-center justify-center bg-[#1A1A1A] text-xs text-[#C8A97E]">
                  ▶
                </span>
              )}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}