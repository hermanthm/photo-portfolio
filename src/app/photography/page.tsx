import Image from "next/image";
import Link from "next/link";

import { getPublishedCollections } from "@/lib/site";

export const metadata = {
  title: "Photography",
};

export default async function PhotographyPage() {
  const collections = await getPublishedCollections();
  const photoCollections = collections.filter(
    (collection) => collection.type === "photo" || collection.type === "mixed",
  );

  return (
    <main className="mx-auto max-w-6xl px-6 pt-32 pb-24">
      <h1 className="text-5xl font-medium tracking-[-0.04em] text-[#F5F5F7] md:text-6xl">
        Photography
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-[#A1A1A6]">
        Collections ready for mosaic and slideshow views in Phase 3.
      </p>

      <div className="mt-16 grid gap-8 md:grid-cols-2">
        {photoCollections.map((collection) => (
          <article
            key={collection.id}
            className="overflow-hidden rounded-3xl border border-neutral-800/50 bg-[#111111]"
          >
            <div className="grid grid-cols-2 gap-1 p-1">
              {collection.photos.slice(0, 4).map((photo) => (
                <div key={photo.id} className="relative aspect-square">
                  <Image
                    src={photo.url}
                    alt={photo.alt ?? collection.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                </div>
              ))}
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-medium text-[#F5F5F7]">
                {collection.title}
              </h2>
              <Link
                href={`/work/${collection.slug}`}
                className="mt-4 inline-block text-[#C8A97E] transition hover:text-[#F5F5F7]"
              >
                View collection
              </Link>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}