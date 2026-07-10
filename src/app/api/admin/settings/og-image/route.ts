import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth-guard";
import { isCloudinaryConfigured, uploadPhoto } from "@/lib/cloudinary";
import { updateOgImageUrl } from "@/lib/site";
import {
  validateImageBuffer,
  validateImageFile,
} from "@/lib/upload-validation";

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
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file is required" }, { status: 400 });
  }

  const fileValidationError = validateImageFile(file);
  if (fileValidationError) {
    return NextResponse.json({ error: fileValidationError }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const bufferValidationError = validateImageBuffer(buffer);
  if (bufferValidationError) {
    return NextResponse.json({ error: bufferValidationError }, { status: 400 });
  }
  const upload = await uploadPhoto(buffer, "portfolio/og");
  const settings = await updateOgImageUrl(upload.secure_url);

  revalidatePath("/");

  return NextResponse.json({ ogImageUrl: settings.ogImageUrl });
}

export async function DELETE() {
  const { error } = await requireAuth();
  if (error) return error;

  await updateOgImageUrl(null);
  revalidatePath("/");

  return NextResponse.json({ success: true });
}