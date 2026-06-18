import { CollectionForm } from "@/components/admin/CollectionForm";

export default function NewCollectionPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <p className="mb-2 text-sm uppercase tracking-[0.2em] text-[#C8A97E]">
        Collections
      </p>
      <h1 className="mb-8 text-4xl font-medium">New collection</h1>
      <CollectionForm mode="create" />
    </div>
  );
}