"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type DeleteCollectionButtonProps = {
  collectionId: string;
  collectionTitle: string;
};

export function DeleteCollectionButton({
  collectionId,
  collectionTitle,
}: DeleteCollectionButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (
      !confirm(
        `Delete "${collectionTitle}"? This will remove all photos and videos in the collection.`,
      )
    ) {
      return;
    }

    setLoading(true);

    const response = await fetch(`/api/admin/collections/${collectionId}`, {
      method: "DELETE",
    });

    setLoading(false);

    if (!response.ok) {
      alert("Failed to delete collection.");
      return;
    }

    router.push("/admin/collections");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="ui-btn-danger disabled:opacity-60"
    >
      {loading ? "Deleting..." : "Delete collection"}
    </button>
  );
}