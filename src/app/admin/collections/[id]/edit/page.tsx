import Link from "next/link";
import { notFound } from "next/navigation";

import { CollectionForm } from "@/components/admin/CollectionForm";
import { DeleteCollectionButton } from "@/components/admin/DeleteCollectionButton";
import { getCollectionById } from "@/lib/admin";

type EditCollectionPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditCollectionPage({
  params,
}: EditCollectionPageProps) {
  const { id } = await params;
  const collection = await getCollectionById(id);

  if (!collection) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="mb-2 text-sm uppercase tracking-[0.2em] text-[#C8A97E]">
            Collections
          </p>
          <h1 className="text-4xl font-medium">Edit collection</h1>
        </div>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link
            href={`/admin/collections/${collection.id}/photos`}
            className="rounded-full border border-neutral-700 px-4 py-2 text-[#A1A1A6] transition hover:text-[#F5F5F7]"
          >
            Manage photos
          </Link>
          <Link
            href={`/admin/collections/${collection.id}/videos`}
            className="rounded-full border border-neutral-700 px-4 py-2 text-[#A1A1A6] transition hover:text-[#F5F5F7]"
          >
            Manage videos
          </Link>
        </div>
      </div>

      <CollectionForm
        mode="edit"
        collectionId={collection.id}
        initialValues={{
          title: collection.title,
          slug: collection.slug,
          description: collection.description ?? "",
          type: collection.type,
          defaultView: "slideshow",
          published: collection.published,
          featured: collection.featured,
          sortOrder: collection.sortOrder,
        }}
      />

      <div className="mt-10 border-t border-neutral-800 pt-8">
        <DeleteCollectionButton
          collectionId={collection.id}
          collectionTitle={collection.title}
        />
      </div>
    </div>
  );
}