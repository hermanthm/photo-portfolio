import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import {
  UnsupportedVideoUrlError,
  detectVideoProvider,
  resolveVideoThumbnail,
  toEmbedUrl,
} from "@/lib/video";
import { videoSchema } from "@/lib/validations/video";

export async function POST(request: Request) {
  const { error } = await requireAuth();
  if (error) return error;

  const body = await request.json();
  const parsed = videoSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const collection = await db.collection.findUnique({
    where: { id: parsed.data.collectionId },
    include: { videos: { select: { sortOrder: true } } },
  });

  if (!collection) {
    return NextResponse.json({ error: "Collection not found" }, { status: 404 });
  }

  let embedUrl: string;
  try {
    embedUrl = toEmbedUrl(parsed.data.url);
  } catch (error) {
    if (error instanceof UnsupportedVideoUrlError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    throw error;
  }

  const provider = detectVideoProvider(parsed.data.url);
  const thumbnailUrl =
    parsed.data.thumbnailUrl ??
    (await resolveVideoThumbnail(parsed.data.url, provider));
  const nextSortOrder =
    parsed.data.sortOrder ??
    collection.videos.reduce((max, video) => Math.max(max, video.sortOrder), -1) + 1;

  const video = await db.video.create({
    data: {
      collectionId: parsed.data.collectionId,
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      embedUrl,
      provider,
      thumbnailUrl,
      sortOrder: nextSortOrder,
    },
  });

  return NextResponse.json(video, { status: 201 });
}