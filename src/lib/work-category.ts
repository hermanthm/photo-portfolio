import { db } from "@/lib/db";

export async function getAllWorkCategories() {
  return db.workCategory.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: {
      _count: { select: { collections: true } },
    },
  });
}

export async function getWorkCategoriesForSelect() {
  return db.workCategory.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true, name: true, slug: true },
  });
}