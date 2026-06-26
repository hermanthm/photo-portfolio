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
          <p className="mb-2 text-sm uppercase tracking-[0.2em] text-[#C8A97E]">
            Collections
          </p>
          <h1 className="text-4xl font-medium">Manage collections</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <AdminCategoriesShortcut />
          <Link
            href="/admin/collections/new"
            className="rounded-full border border-[#C8A97E] px-5 py-2 text-[#F5F5F7] transition hover:bg-[#C8A97E] hover:text-black"
          >
            New collection
          </Link>
        </div>
      </div>

      {collections.length === 0 ? (
        <div className="rounded-3xl border border-neutral-800 bg-[#111111] p-8 text-[#A1A1A6]">
          No collections yet. Create your first collection to get started.
        </div>
      ) : (
        <CollectionsList initialCollections={collections} categories={categories} />
      )}
    </div>
  );
}