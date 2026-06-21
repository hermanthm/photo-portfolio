import { db } from "@/lib/db";

export async function getAllCollections() {
  return db.collection.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    include: {
      category: true,
      coverPhoto: true,
      coverVideo: true,
      photos: { orderBy: { sortOrder: "asc" }, take: 1 },
      videos: { orderBy: { sortOrder: "asc" }, take: 1 },
      _count: { select: { photos: true, videos: true } },
    },
  });
}

export async function getCollectionById(id: string) {
  return db.collection.findUnique({
    where: { id },
    include: {
      coverPhoto: true,
      coverVideo: true,
      photos: { orderBy: { sortOrder: "asc" } },
      videos: { orderBy: { sortOrder: "asc" } },
    },
  });
}