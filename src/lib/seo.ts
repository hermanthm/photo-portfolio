import type { Metadata } from "next";

type SiteSettingsForSeo = {
  siteTitle: string;
  bio: string | null;
  footerTagline: string | null;
  ogImageUrl: string | null;
};

const DEFAULT_DESCRIPTION =
  "Personal photography and cinematic video portfolio.";

export function getSiteDescription(settings: SiteSettingsForSeo): string {
  return settings.bio ?? settings.footerTagline ?? DEFAULT_DESCRIPTION;
}

export function buildSiteMetadata(
  settings: SiteSettingsForSeo,
  overrides?: Partial<Metadata>,
): Metadata {
  const description = getSiteDescription(settings);

  return {
    title: {
      default: settings.siteTitle,
      template: `%s | ${settings.siteTitle}`,
    },
    description,
    openGraph: {
      title: settings.siteTitle,
      description,
      type: "website",
      ...(settings.ogImageUrl ? { images: [{ url: settings.ogImageUrl }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: settings.siteTitle,
      description,
      ...(settings.ogImageUrl ? { images: [settings.ogImageUrl] } : {}),
    },
    ...overrides,
  };
}