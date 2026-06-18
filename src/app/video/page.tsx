import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { getPublishedCollections, getSiteSettings } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();

  return {
    title: "Video",
    description: `Films and video work by ${settings.siteTitle}. Watch embedded films from YouTube and Vimeo.`,
  };
}

export default async function VideoPage() {
  const collections = await getPublishedCollections();
  const videoCollections = collections.filter(
    (collection) =>
      (collection.type === "video" || collection.type === "mixed") &&
      collection.videos.length > 0,
  );

  return (
    <main className="mx-auto max-w-6xl px-6 pt-32 pb-24">
      <h1 className="text-5xl font-medium tracking-[-0.04em] text-[#F5F5F7] md:text-6xl">
        Video
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-[#A1A1A6]">
        Watch embedded films from YouTube and Vimeo in slideshow playlists.
      </p>

      <div className="mt-16 grid gap-8 md:grid-cols-2">
        {videoCollections.map((collection) => {
          const leadVideo = collection.videos[0];

          return (
            <article
              key={collection.id}
              className="overflow-hidden rounded-3xl border border-neutral-800/50 bg-[#111111]"
            >
              <div className="relative aspect-video bg-[#1A1A1A]">
                {leadVideo.thumbnailUrl ? (
                  <Image
                    src={leadVideo.thumbnailUrl}
                    alt={leadVideo.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                ) : null}
              </div>
              <div className="p-6">
                <p className="text-sm uppercase tracking-[0.15em] text-[#C8A97E]">
                  {collection.videos.length} films
                </p>
                <h2 className="mt-2 text-2xl font-medium text-[#F5F5F7]">
                  {collection.title}
                </h2>
                <p className="mt-2 text-[#A1A1A6]">{collection.description}</p>
                <Link
                  href={`/work/${collection.slug}`}
                  className="mt-4 inline-block rounded-full border border-[#C8A97E] px-5 py-2 text-sm text-[#F5F5F7] transition hover:bg-[#C8A97E] hover:text-black"
                >
                  Open slideshow
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
}