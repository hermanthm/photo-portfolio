import { CollectionPreview } from "@/components/gallery/CollectionPreview";
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
        Browse photo collections in fullscreen slideshows.
      </p>

      <div className="mt-16 grid gap-8 md:grid-cols-2">
        {photoCollections.map((collection) => (
          <CollectionPreview
            key={collection.id}
            slug={collection.slug}
            title={collection.title}
            description={collection.description}
            type={collection.type}
            photos={collection.photos}
          />
        ))}
      </div>
    </main>
  );
}