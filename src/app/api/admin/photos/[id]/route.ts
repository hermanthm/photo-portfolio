import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth-guard";
import { deletePhoto, isCloudinaryConfigured } from "@/lib/cloudinary";
import { db } from "@/lib/db";
import { photoUpdateSchema } from "@/lib/validations/photo";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id } = await context.params;
  const body = await request.json();
  const parsed = photoUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const photo = await db.photo.update({
      where: { id },
      data: parsed.data,
    });
    return NextResponse.json(photo);
  } catch {
    return NextResponse.json({ error: "Photo not found" }, { status: 404 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id } = await context.params;
  const photo = await db.photo.findUnique({ where: { id } });

  if (!photo) {
    return NextResponse.json({ error: "Photo not found" }, { status: 404 });
  }

  if (photo.cloudinaryId && isCloudinaryConfigured()) {
    try {
      await deletePhoto(photo.cloudinaryId);
    } catch {
      // Continue deleting DB record even if Cloudinary cleanup fails.
    }
  }

  await db.photo.delete({ where: { id } });
  return NextResponse.json({ success: true });
}