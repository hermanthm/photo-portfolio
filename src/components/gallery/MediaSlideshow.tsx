"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

import { PhotoProtection } from "@/components/gallery/PhotoProtection";
import type { GalleryPhoto, GalleryVideo } from "@/components/gallery/types";
import { isAllowedEmbedUrl } from "@/lib/video";

type Slide =
  | { type: "photo"; photo: GalleryPhoto }
  | { type: "video"; video: GalleryVideo };

type MediaSlideshowProps = {
  photos: GalleryPhoto[];
  videos: GalleryVideo[];
  collectionTitle: string;
  protectPhotos?: boolean;
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
  protectPhotos = false,
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
      <div className="rounded-3xl border border-border bg-surface p-12 text-center text-muted">
        No media in this collection yet.
      </div>
    );
  }

  const current = slides[index];

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl border border-border bg-surface">
        <div className="relative aspect-[16/10] bg-media md:aspect-[16/9]">
          {current.type === "photo" ? (
            <PhotoProtection enabled={protectPhotos} className="absolute inset-0">
              <Image
                src={current.photo.url}
                alt={current.photo.alt ?? collectionTitle}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            </PhotoProtection>
          ) : isAllowedEmbedUrl(current.video.embedUrl) ? (
            <iframe
              src={current.video.embedUrl}
              title={current.video.title}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              sandbox="allow-scripts allow-same-origin allow-presentation"
            />
          ) : (
            <div className="flex h-full items-center justify-center px-6 text-center text-muted">
              This video cannot be displayed.
            </div>
          )}
        </div>

        {slides.length > 1 ? (
          <>
            <button
              type="button"
              onClick={() => goTo(index - 1)}
              className="ui-control-overlay absolute top-1/2 left-4 -translate-y-1/2"
              aria-label="Previous slide"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => goTo(index + 1)}
              className="ui-control-overlay absolute top-1/2 right-4 -translate-y-1/2"
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
              <p className="text-sm uppercase tracking-[0.15em] text-accent">
                {current.video.provider}
              </p>
              <h3 className="mt-1 text-xl font-medium text-foreground">
                {current.video.title}
              </h3>
              {current.video.description ? (
                <p className="mt-2 max-w-2xl text-muted">
                  {current.video.description}
                </p>
              ) : null}
            </>
          ) : (
            <p className="text-muted">
              {current.photo.alt ?? collectionTitle}
            </p>
          )}
        </div>
        <p className="ui-label">
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
                  ? "border-accent"
                  : "border-border opacity-70 hover:opacity-100"
              }`}
            >
              {slide.type === "photo" ? (
                <PhotoProtection enabled={protectPhotos} className="absolute inset-0">
                  <Image
                    src={slide.photo.url}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </PhotoProtection>
              ) : slide.video.thumbnailUrl ? (
                <Image
                  src={slide.video.thumbnailUrl}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              ) : (
                <span className="flex h-full items-center justify-center bg-media text-xs text-accent">
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