import Link from "next/link";

import { CollectionPreview } from "@/components/gallery/CollectionPreview";
import { getCollectionCoverUrl } from "@/lib/collection-cover";
import { getPublishedCollections, getSiteSettings } from "@/lib/site";

export default async function HomePage() {
  const [settings, collections] = await Promise.all([
    getSiteSettings(),
    getPublishedCollections(),
  ]);

  const featured = collections.filter((collection) => collection.featured);

  return (
    <main>
      <section className="relative flex min-h-screen items-center overflow-hidden bg-gradient-to-br from-[#050505] via-[#1a1a1a] to-[#050505] pt-24">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 h-32 w-32 rounded-full bg-[#C8A97E]/20 blur-3xl" />
          <div className="absolute right-10 bottom-20 h-48 w-48 rounded-full bg-[#C8A97E]/10 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-6xl px-6">
          <p className="mb-4 text-sm uppercase tracking-[0.25em] text-[#C8A97E]">
            Photography & Film
          </p>
          <h1 className="max-w-4xl text-5xl leading-tight font-medium tracking-[-0.04em] text-[#F5F5F7] md:text-7xl lg:text-8xl">
            Stories captured in light and motion
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-[#A1A1A6] md:text-xl">
            {settings.bio}
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/photography"
              className="rounded-full border border-[#C8A97E] px-8 py-3 text-[#F5F5F7] transition hover:bg-[#C8A97E] hover:text-black"
            >
              View photography
            </Link>
            <Link
              href="/video"
              className="rounded-full px-8 py-3 text-[#A1A1A6] transition hover:text-[#C8A97E]"
            >
              Watch films
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-[#0F0F0F] py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12 flex items-end justify-between gap-6">
            <div>
              <h2 className="text-4xl font-medium tracking-[-0.04em] text-[#F5F5F7] md:text-5xl">
                Featured work
              </h2>
              <p className="mt-3 text-[#A1A1A6]">
                Explore collections in fullscreen slideshow view.
              </p>
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {featured.map((collection) => (
              <CollectionPreview
                key={collection.id}
                slug={collection.slug}
                title={collection.title}
                description={collection.description}
                type={collection.type}
                coverUrl={getCollectionCoverUrl(collection)}
                coverAspectRatio={collection.coverAspectRatio}
                coverFocalX={collection.coverFocalX}
                coverFocalY={collection.coverFocalY}
                protectPhotos={collection.protectPhotos}
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}