import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth-guard";
import {
  isCloudinaryConfigured,
  uploadPhoto,
} from "@/lib/cloudinary";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  const { error } = await requireAuth();
  if (error) return error;

  if (!isCloudinaryConfigured()) {
    return NextResponse.json(
      { error: "Cloudinary is not configured. Add credentials to .env." },
      { status: 503 },
    );
  }

  const formData = await request.formData();
  const collectionId = formData.get("collectionId");
  const file = formData.get("file");
  const alt = formData.get("alt");

  if (typeof collectionId !== "string" || !collectionId) {
    return NextResponse.json({ error: "collectionId is required" }, { status: 400 });
  }

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file is required" }, { status: 400 });
  }

  const collection = await db.collection.findUnique({
    where: { id: collectionId },
    include: { photos: { select: { sortOrder: true } } },
  });

  if (!collection) {
    return NextResponse.json({ error: "Collection not found" }, { status: 404 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const folder = `portfolio/${collection.slug}`;
  const upload = await uploadPhoto(buffer, folder);

  const nextSortOrder =
    collection.photos.reduce((max, photo) => Math.max(max, photo.sortOrder), -1) + 1;

  const photo = await db.photo.create({
    data: {
      collectionId,
      cloudinaryId: upload.public_id,
      url: upload.secure_url,
      alt: typeof alt === "string" && alt.trim() ? alt.trim() : null,
      width: upload.width,
      height: upload.height,
      sortOrder: nextSortOrder,
    },
  });

  return NextResponse.json(photo, { status: 201 });
}