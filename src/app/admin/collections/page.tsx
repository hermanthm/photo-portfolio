import Link from "next/link";

import { AdminCategoriesShortcut } from "@/components/admin/AdminCategoriesShortcut";
import { CollectionsList } from "@/components/admin/CollectionsList";
import { getAllCollections } from "@/lib/admin";
import { getWorkCategoriesForSelect } from "@/lib/work-category";

export default async function AdminCollectionsPage() {
  const [collections, categories] = await Promise.all([
    getAllCollections(),
    getWorkCategoriesForSelect(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 ui-eyebrow">
            Collections
          </p>
          <h1 className="text-4xl font-medium">Manage collections</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <AdminCategoriesShortcut />
          <Link
            href="/admin/collections/new"
            className="rounded-full border border-accent px-5 py-2 text-foreground transition hover:bg-accent hover:text-inverse"
          >
            New collection
          </Link>
        </div>
      </div>

      {collections.length === 0 ? (
        <div className="ui-card-padded-lg text-muted">
          No collections yet. Create your first collection to get started.
        </div>
      ) : (
        <CollectionsList initialCollections={collections} categories={categories} />
      )}
    </div>
  );
}