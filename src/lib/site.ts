import { db } from "@/lib/db";
import type { SiteSettingsInput } from "@/lib/validations/settings";

const SETTINGS_ID = "default";

export async function getSiteSettings() {
  const settings = await db.siteSettings.findUnique({
    where: { id: SETTINGS_ID },
  });

  return (
    settings ?? {
      id: SETTINGS_ID,
      siteTitle: "Photo Portfolio",
      bio: null,
      footerTagline: null,
      contactBlurb: null,
      contactEmail: null,
      instagram: null,
      vimeo: null,
      youtube: null,
      ogImageUrl: null,
      updatedAt: new Date(),
    }
  );
}

export async function updateOgImageUrl(ogImageUrl: string | null) {
  return db.siteSettings.upsert({
    where: { id: SETTINGS_ID },
    update: { ogImageUrl },
    create: {
      id: SETTINGS_ID,
      ogImageUrl,
    },
  });
}

export async function updateSiteSettings(data: SiteSettingsInput) {
  return db.siteSettings.upsert({
    where: { id: SETTINGS_ID },
    update: {
      siteTitle: data.siteTitle,
      bio: data.bio ?? null,
      footerTagline: data.footerTagline ?? null,
      contactBlurb: data.contactBlurb ?? null,
      contactEmail: data.contactEmail ?? null,
      instagram: data.instagram ?? null,
      vimeo: data.vimeo ?? null,
      youtube: data.youtube ?? null,
    },
    create: {
      id: SETTINGS_ID,
      siteTitle: data.siteTitle,
      bio: data.bio ?? null,
      footerTagline: data.footerTagline ?? null,
      contactBlurb: data.contactBlurb ?? null,
      contactEmail: data.contactEmail ?? null,
      instagram: data.instagram ?? null,
      vimeo: data.vimeo ?? null,
      youtube: data.youtube ?? null,
    },
  });
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