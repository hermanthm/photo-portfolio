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
          className="relative overflow-hidden bg-media"
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
            />
          </PhotoProtection>
        </div>
      ) : (
        <div
          className="flex items-center justify-center bg-media text-accent"
          style={{ aspectRatio }}
        >
          No media yet
        </div>
      )}

      <div className="p-6 md:p-8">
        <p className="mb-2 text-sm uppercase tracking-[0.15em] text-accent">
          {type}
        </p>
        <h3 className="text-2xl font-medium text-foreground">{title}</h3>
        {description ? (
          <p className="mt-3 line-clamp-2 text-muted">{description}</p>
        ) : null}
      </div>
    </>
  );

  if (disableLink) {
    return (
      <div className="overflow-hidden rounded-3xl border border-border/50 bg-surface">
        {content}
      </div>
    );
  }

  return (
    <Link
      href={`/work/${slug}`}
      className="group overflow-hidden rounded-3xl border border-border/50 bg-surface transition hover:border-accent/30"
    >
      {content}
    </Link>
  );
}