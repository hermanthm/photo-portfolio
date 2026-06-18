import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth-guard";
import { getSiteSettings, updateSiteSettings } from "@/lib/site";
import { siteSettingsSchema } from "@/lib/validations/settings";

export async function GET() {
  const { error } = await requireAuth();
  if (error) return error;

  const settings = await getSiteSettings();
  return NextResponse.json(settings);
}

export async function PATCH(request: Request) {
  const { error } = await requireAuth();
  if (error) return error;

  const body = await request.json();
  const parsed = siteSettingsSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const settings = await updateSiteSettings(parsed.data);

  for (const path of ["/", "/about", "/contact", "/photography", "/video"]) {
    revalidatePath(path);
  }

  return NextResponse.json(settings);
}