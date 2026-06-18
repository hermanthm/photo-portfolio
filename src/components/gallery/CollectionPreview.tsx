import Image from "next/image";
import Link from "next/link";

import type { GalleryPhoto } from "@/components/gallery/types";

type CollectionPreviewProps = {
  slug: string;
  title: string;
  description: string | null;
  type: string;
  photos: GalleryPhoto[];
  coverUrl?: string | null;
};

export function CollectionPreview({
  slug,
  title,
  description,
  type,
  photos,
  coverUrl,
}: CollectionPreviewProps) {
  const cover = photos[0]?.url ?? coverUrl;

  return (
    <Link
      href={`/work/${slug}`}
      className="group overflow-hidden rounded-3xl border border-neutral-800/50 bg-[#111111] transition hover:border-[#C8A97E]/30"
    >
      {cover ? (
        <div className="relative aspect-[16/10] overflow-hidden bg-[#1A1A1A]">
          <Image
            src={cover}
            alt={title}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      ) : (
        <div className="flex aspect-[16/10] items-center justify-center bg-[#1A1A1A] text-[#C8A97E]">
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
    </Link>
  );
}