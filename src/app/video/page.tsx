import type { Metadata } from "next";

import { CollectionCategorySections } from "@/components/gallery/CollectionCategorySections";
import { groupCollectionsByCategory } from "@/lib/group-collections";
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
  const groups = groupCollectionsByCategory(videoCollections, "video");

  return (
    <main className="mx-auto max-w-6xl px-6 pt-32 pb-24">
      <h1 className="text-5xl font-medium tracking-[-0.04em] text-[#F5F5F7] md:text-6xl">
        Video
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-[#A1A1A6]">
        Watch embedded films from YouTube and Vimeo in slideshow playlists.
      </p>

      <CollectionCategorySections
        groups={groups}
        emptyMessage="No video collections published yet."
      />
    </main>
  );
}