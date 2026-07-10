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
      <section className="relative flex min-h-screen items-center overflow-hidden bg-gradient-to-br from-background via-surface to-background pt-24">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 h-32 w-32 rounded-full bg-foreground/5 blur-3xl" />
          <div className="absolute right-10 bottom-20 h-48 w-48 rounded-full bg-foreground/5 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-6xl px-6">
          <p className="mb-4 ui-eyebrow tracking-[0.25em]">
            Photography & Film
          </p>
          <h1 className="ui-hero-title">
            Stories captured in light and motion
          </h1>
          <p className="mt-8 max-w-2xl ui-body-lg md:text-xl">
            {settings.bio}
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/photography"
              className="ui-pill-primary"
            >
              View photography
            </Link>
            <Link
              href="/video"
              className="ui-pill-ghost"
            >
              Watch films
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-surface-elevated py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12 flex items-end justify-between gap-6">
            <div>
              <h2 className="ui-section-title">
                Featured work
              </h2>
              <p className="mt-3 text-muted">
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