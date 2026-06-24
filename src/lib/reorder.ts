import { db } from "@/lib/db";

export async function reorderPhotos(collectionId: string, photoIds: string[]) {
  const photos = await db.photo.findMany({
    where: { collectionId },
    select: { id: true },
  });

  if (photos.length !== photoIds.length) {
    return { ok: false as const, error: "Photo list must include every item in the collection" };
  }

  const existingIds = new Set(photos.map((photo) => photo.id));
  if (!photoIds.every((id) => existingIds.has(id))) {
    return { ok: false as const, error: "One or more photos do not belong to this collection" };
  }

  await db.$transaction(
    photoIds.map((id, index) =>
      db.photo.update({
        where: { id },
        data: { sortOrder: index },
      }),
    ),
  );

  return { ok: true as const };
}

export async function reorderVideos(collectionId: string, videoIds: string[]) {
  const videos = await db.video.findMany({
    where: { collectionId },
    select: { id: true },
  });

  if (videos.length !== videoIds.length) {
    return { ok: false as const, error: "Video list must include every item in the collection" };
  }

  const existingIds = new Set(videos.map((video) => video.id));
  if (!videoIds.every((id) => existingIds.has(id))) {
    return { ok: false as const, error: "One or more videos do not belong to this collection" };
  }

  await db.$transaction(
    videoIds.map((id, index) =>
      db.video.update({
        where: { id },
        data: { sortOrder: index },
      }),
    ),
  );

  return { ok: true as const };
}

export async function reorderCategories(categoryIds: string[]) {
  const categories = await db.workCategory.findMany({
    select: { id: true },
  });

  if (categories.length !== categoryIds.length) {
    return {
      ok: false as const,
      error: "Category list must include every category",
    };
  }

  const existingIds = new Set(categories.map((category) => category.id));
  if (!categoryIds.every((id) => existingIds.has(id))) {
    return { ok: false as const, error: "One or more categories are invalid" };
  }

  await db.$transaction(
    categoryIds.map((id, index) =>
      db.workCategory.update({
        where: { id },
        data: { sortOrder: index },
      }),
    ),
  );

  return { ok: true as const };
}