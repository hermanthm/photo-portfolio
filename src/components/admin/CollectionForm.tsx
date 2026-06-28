"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { slugify } from "@/lib/slug";
import {
  categoriesForCollectionType,
  type WorkCategoryScope,
} from "@/lib/work-category-scope";

type CategoryOption = {
  id: string;
  name: string;
  scope: WorkCategoryScope;
};

type CollectionFormValues = {
  title: string;
  slug: string;
  description: string;
  type: "photo" | "video" | "mixed";
  defaultView: "slideshow";
  published: boolean;
  featured: boolean;
  protectPhotos: boolean;
  sortOrder: number;
  categoryId: string;
};

type CollectionFormProps = {
  mode: "create" | "edit";
  collectionId?: string;
  categories: CategoryOption[];
  initialValues?: Partial<CollectionFormValues>;
};

const defaultValues: CollectionFormValues = {
  title: "",
  slug: "",
  description: "",
  type: "mixed",
  defaultView: "slideshow",
  published: false,
  featured: false,
  protectPhotos: false,
  sortOrder: 0,
  categoryId: "",
};

export function CollectionForm({
  mode,
  collectionId,
  categories,
  initialValues,
}: CollectionFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<CollectionFormValues>({
    ...defaultValues,
    ...initialValues,
  });
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const visibleCategories = categories.filter((category) =>
    categoriesForCollectionType(category.scope, values.type),
  );

  function updateField<K extends keyof CollectionFormValues>(
    key: K,
    value: CollectionFormValues[K],
  ) {
    setValues((current) => {
      const next = { ...current, [key]: value };

      if (key === "title" && !slugTouched) {
        next.slug = slugify(String(value));
      }

      return next;
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      ...values,
      defaultView: "slideshow" as const,
      description: values.description.trim() || null,
      categoryId: values.categoryId || null,
    };

    const response = await fetch(
      mode === "create"
        ? "/api/admin/collections"
        : `/api/admin/collections/${collectionId}`,
      {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );

    setLoading(false);

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setError(data?.error ?? "Something went wrong.");
      return;
    }

    const collection = await response.json();
    router.push(`/admin/collections/${collection.id}/edit`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-sm text-[#A1A1A6]">Title</span>
          <input
            type="text"
            value={values.title}
            onChange={(event) => updateField("title", event.target.value)}
            required
            className="w-full rounded-xl border border-neutral-800 bg-[#0F0F0F] px-4 py-3 text-[#F5F5F7] outline-none transition focus:border-[#C8A97E]"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm text-[#A1A1A6]">Slug</span>
          <input
            type="text"
            value={values.slug}
            onChange={(event) => {
              setSlugTouched(true);
              updateField("slug", slugify(event.target.value));
            }}
            required
            className="w-full rounded-xl border border-neutral-800 bg-[#0F0F0F] px-4 py-3 text-[#F5F5F7] outline-none transition focus:border-[#C8A97E]"
          />
        </label>
      </div>

      <label className="block space-y-2">
        <span className="text-sm text-[#A1A1A6]">Description</span>
        <textarea
          value={values.description}
          onChange={(event) => updateField("description", event.target.value)}
          rows={4}
          className="w-full rounded-xl border border-neutral-800 bg-[#0F0F0F] px-4 py-3 text-[#F5F5F7] outline-none transition focus:border-[#C8A97E]"
        />
      </label>

      <div className="grid gap-6 md:grid-cols-3">
        <label className="block space-y-2">
          <span className="text-sm text-[#A1A1A6]">Type</span>
          <select
            value={values.type}
            onChange={(event) =>
              updateField("type", event.target.value as CollectionFormValues["type"])
            }
            className="w-full rounded-xl border border-neutral-800 bg-[#0F0F0F] px-4 py-3 text-[#F5F5F7] outline-none transition focus:border-[#C8A97E]"
          >
            <option value="photo">Photo</option>
            <option value="video">Video</option>
            <option value="mixed">Mixed</option>
          </select>
        </label>

        <label className="block space-y-2">
          <span className="text-sm text-[#A1A1A6]">Work category</span>
          <select
            value={values.categoryId}
            onChange={(event) => updateField("categoryId", event.target.value)}
            className="w-full rounded-xl border border-neutral-800 bg-[#0F0F0F] px-4 py-3 text-[#F5F5F7] outline-none transition focus:border-[#C8A97E]"
          >
            <option value="">Uncategorized</option>
            {visibleCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-2">
          <span className="text-sm text-[#A1A1A6]">Sort order</span>
          <input
            type="number"
            min={0}
            value={values.sortOrder}
            onChange={(event) =>
              updateField("sortOrder", Number(event.target.value))
            }
            className="w-full rounded-xl border border-neutral-800 bg-[#0F0F0F] px-4 py-3 text-[#F5F5F7] outline-none transition focus:border-[#C8A97E]"
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-3 text-sm text-[#A1A1A6]">
          <input
            type="checkbox"
            checked={values.published}
            onChange={(event) => updateField("published", event.target.checked)}
            className="h-4 w-4 rounded border-neutral-700 bg-[#0F0F0F] accent-[#C8A97E]"
          />
          Published
        </label>

        <label className="flex items-center gap-3 text-sm text-[#A1A1A6]">
          <input
            type="checkbox"
            checked={values.featured}
            onChange={(event) => updateField("featured", event.target.checked)}
            className="h-4 w-4 rounded border-neutral-700 bg-[#0F0F0F] accent-[#C8A97E]"
          />
          Featured on homepage
        </label>

        <label className="flex items-center gap-3 text-sm text-[#A1A1A6]">
          <input
            type="checkbox"
            checked={values.protectPhotos}
            onChange={(event) =>
              updateField("protectPhotos", event.target.checked)
            }
            className="h-4 w-4 rounded border-neutral-700 bg-[#0F0F0F] accent-[#C8A97E]"
          />
          Protect photos (disable download &amp; copy)
        </label>
      </div>

      {values.protectPhotos ? (
        <p className="text-sm text-[#A1A1A6]">
          Visitors cannot right-click, drag, or copy photos on the public gallery
          and collection previews. Image URLs remain accessible via browser tools.
        </p>
      ) : null}

      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      <button
        type="submit"
        disabled={loading}
        className="rounded-xl border border-[#C8A97E] px-6 py-3 font-medium text-[#F5F5F7] transition hover:bg-[#C8A97E] hover:text-black disabled:opacity-60"
      >
        {loading
          ? "Saving..."
          : mode === "create"
            ? "Create collection"
            : "Save changes"}
      </button>
    </form>
  );
}