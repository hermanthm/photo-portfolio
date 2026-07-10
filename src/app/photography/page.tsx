import type { Metadata } from "next";

import { CollectionCategorySections } from "@/components/gallery/CollectionCategorySections";
import { groupCollectionsByCategory } from "@/lib/group-collections";
import { getPublishedCollections, getSiteSettings } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();

  return {
    title: "Photography",
    description: `Photo collections by ${settings.siteTitle}. Browse work in fullscreen slideshows.`,
  };
}

export default async function PhotographyPage() {
  const collections = await getPublishedCollections();
  const photoCollections = collections.filter(
    (collection) => collection.type === "photo" || collection.type === "mixed",
  );
  const groups = groupCollectionsByCategory(photoCollections, "photography");

  return (
    <main className="mx-auto max-w-6xl px-6 pt-32 pb-24">
      <h1 className="ui-page-title">
        Photography
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-muted">
        Browse photo collections in fullscreen slideshows.
      </p>

      <CollectionCategorySections
        groups={groups}
        emptyMessage="No photo collections published yet."
      />
    </main>
  );
}