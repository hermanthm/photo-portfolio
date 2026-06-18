import { db } from "@/lib/db";

export async function getSiteSettings() {
  const settings = await db.siteSettings.findUnique({
    where: { id: "default" },
  });

  return (
    settings ?? {
      id: "default",
      siteTitle: "Photo Portfolio",
      bio: null,
      contactEmail: null,
      instagram: null,
      vimeo: null,
      youtube: null,
      updatedAt: new Date(),
    }
  );
}

export async function getPublishedCollections() {
  return db.collection.findMany({
    where: { published: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    include: {
      photos: { orderBy: { sortOrder: "asc" } },
      videos: { orderBy: { sortOrder: "asc" } },
    },
  });
}