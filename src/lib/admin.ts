import { db } from "@/lib/db";

export async function getAllCollections() {
  return db.collection.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    include: {
      _count: { select: { photos: true, videos: true } },
    },
  });
}

export async function getCollectionById(id: string) {
  return db.collection.findUnique({
    where: { id },
    include: {
      photos: { orderBy: { sortOrder: "asc" } },
      videos: { orderBy: { sortOrder: "asc" } },
    },
  });
}