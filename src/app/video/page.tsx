import Image from "next/image";
import Link from "next/link";

import { getPublishedCollections } from "@/lib/site";

export const metadata = {
  title: "Video",
};

export default async function VideoPage() {
  const collections = await getPublishedCollections();
  const videos = collections.flatMap((collection) =>
    collection.videos.map((video) => ({ ...video, collection })),
  );

  return (
    <main className="mx-auto max-w-6xl px-6 pt-32 pb-24">
      <h1 className="text-5xl font-medium tracking-[-0.04em] text-[#F5F5F7] md:text-6xl">
        Video
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-[#A1A1A6]">
        Embedded films from YouTube and Vimeo. Slideshow playlist view coming in
        Phase 3.
      </p>

      <div className="mt-16 grid gap-8 md:grid-cols-2">
        {videos.map((video) => (
          <article
            key={video.id}
            className="overflow-hidden rounded-3xl border border-neutral-800/50 bg-[#111111]"
          >
            <div className="relative aspect-video bg-[#1A1A1A]">
              {video.thumbnailUrl ? (
                <Image
                  src={video.thumbnailUrl}
                  alt={video.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              ) : null}
            </div>
            <div className="p-6">
              <p className="text-sm uppercase tracking-[0.15em] text-[#C8A97E]">
                {video.provider}
              </p>
              <h2 className="mt-2 text-2xl font-medium text-[#F5F5F7]">
                {video.title}
              </h2>
              <p className="mt-2 text-[#A1A1A6]">{video.description}</p>
              <Link
                href={`/work/${video.collection.slug}`}
                className="mt-4 inline-block text-[#C8A97E] transition hover:text-[#F5F5F7]"
              >
                Open in {video.collection.title}
              </Link>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}