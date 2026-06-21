import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { collectionCoverSchema } from "@/lib/validations/collection";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id } = await context.params;
  const body = await request.json();
  const parsed = collectionCoverSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const collection = await db.collection.findUnique({ where: { id } });

  if (!collection) {
    return NextResponse.json({ error: "Collection not found" }, { status: 404 });
  }

  const { photoId, videoId } = parsed.data;

  if (photoId) {
    const photo = await db.photo.findFirst({
      where: { id: photoId, collectionId: id },
    });

    if (!photo) {
      return NextResponse.json(
        { error: "Photo not found in this collection" },
        { status: 404 },
      );
    }
  }

  if (videoId) {
    const video = await db.video.findFirst({
      where: { id: videoId, collectionId: id },
    });

    if (!video) {
      return NextResponse.json(
        { error: "Video not found in this collection" },
        { status: 404 },
      );
    }

    if (!video.thumbnailUrl) {
      return NextResponse.json(
        { error: "Video has no thumbnail to use as cover" },
        { status: 400 },
      );
    }
  }

  const isClear =
    (photoId === null || photoId === undefined) &&
    (videoId === null || videoId === undefined);

  const updated = await db.collection.update({
    where: { id },
    data: isClear
      ? { coverPhotoId: null, coverVideoId: null }
      : photoId
        ? { coverPhotoId: photoId, coverVideoId: null }
        : { coverVideoId: videoId!, coverPhotoId: null },
    include: {
      coverPhoto: true,
      coverVideo: true,
    },
  });

  revalidatePath("/");
  revalidatePath("/photography");
  revalidatePath("/video");
  revalidatePath(`/work/${collection.slug}`);

  return NextResponse.json({
    coverPhotoId: updated.coverPhotoId,
    coverVideoId: updated.coverVideoId,
  });
}