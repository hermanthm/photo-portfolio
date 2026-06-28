import Image from "next/image";
import Link from "next/link";

import { PhotoProtection } from "@/components/gallery/PhotoProtection";

import {
  coverAspectRatioToCss,
  coverFocalToObjectPosition,
  DEFAULT_COVER_ASPECT_RATIO,
  DEFAULT_COVER_FOCAL_X,
  DEFAULT_COVER_FOCAL_Y,
  type CoverAspectRatio,
} from "@/lib/cover-frame";

type CollectionPreviewProps = {
  slug: string;
  title: string;
  description: string | null;
  type: string;
  coverUrl: string | null;
  coverAspectRatio?: CoverAspectRatio;
  coverFocalX?: number;
  coverFocalY?: number;
  protectPhotos?: boolean;
  disableLink?: boolean;
};

export function CollectionPreview({
  slug,
  title,
  description,
  type,
  coverUrl,
  coverAspectRatio = DEFAULT_COVER_ASPECT_RATIO,
  coverFocalX = DEFAULT_COVER_FOCAL_X,
  coverFocalY = DEFAULT_COVER_FOCAL_Y,
  protectPhotos = false,
  disableLink = false,
}: CollectionPreviewProps) {
  const aspectRatio = coverAspectRatioToCss(coverAspectRatio);
  const objectPosition = coverFocalToObjectPosition(coverFocalX, coverFocalY);

  const content = (
    <>
      {coverUrl ? (
        <div
          className="relative overflow-hidden bg-[#1A1A1A]"
          style={{ aspectRatio }}
        >
          <PhotoProtection enabled={protectPhotos} className="absolute inset-0">
            <Image
              src={coverUrl}
              alt={title}
              fill
              className="object-cover transition duration-500 group-hover:scale-105"
              style={{ objectPosition }}
              sizes="(max-width: 768px) 100vw, 50vw"
              draggable={false}
            />
          </PhotoProtection>
        </div>
      ) : (
        <div
          className="flex items-center justify-center bg-[#1A1A1A] text-[#C8A97E]"
          style={{ aspectRatio }}
        >
          No media yet
        </div>
      )}

      <div className="p-6 md:p-8">
        <p className="mb-2 text-sm uppercase tracking-[0.15em] text-[#C8A97E]">
          {type}
        </p>
        <h3 className="text-2xl font-medium text-[#F5F5F7]">{title}</h3>
        {description ? (
          <p className="mt-3 line-clamp-2 text-[#A1A1A6]">{description}</p>
        ) : null}
      </div>
    </>
  );

  if (disableLink) {
    return (
      <div className="overflow-hidden rounded-3xl border border-neutral-800/50 bg-[#111111]">
        {content}
      </div>
    );
  }

  return (
    <Link
      href={`/work/${slug}`}
      className="group overflow-hidden rounded-3xl border border-neutral-800/50 bg-[#111111] transition hover:border-[#C8A97E]/30"
    >
      {content}
    </Link>
  );
}