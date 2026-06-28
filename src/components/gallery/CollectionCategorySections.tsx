import { CollectionPreview } from "@/components/gallery/CollectionPreview";
import { getCollectionCoverUrl } from "@/lib/collection-cover";
import type { CollectionCategoryGroup } from "@/lib/group-collections";

type CollectionCategorySectionsProps = {
  groups: CollectionCategoryGroup[];
  emptyMessage: string;
};

export function CollectionCategorySections({
  groups,
  emptyMessage,
}: CollectionCategorySectionsProps) {
  if (groups.length === 0) {
    return (
      <p className="mt-16 text-lg text-[#A1A1A6]">{emptyMessage}</p>
    );
  }

  return (
    <div className="mt-16 space-y-20">
      {groups.map((group) => (
        <section key={group.id} id={group.slug}>
          <h2 className="text-sm uppercase tracking-[0.2em] text-[#C8A97E]">
            {group.name}
          </h2>
          <div className="mt-8 grid gap-8 md:grid-cols-2">
            {group.collections.map((collection) => (
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
        </section>
      ))}
    </div>
  );
}