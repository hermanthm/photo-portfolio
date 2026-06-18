import Link from "next/link";

import { OgImageSection } from "@/components/admin/OgImageSection";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { isCloudinaryConfigured } from "@/lib/cloudinary";
import { getSiteSettings } from "@/lib/site";

export default async function AdminSettingsPage() {
  const [settings, cloudinaryConfigured] = await Promise.all([
    getSiteSettings(),
    Promise.resolve(isCloudinaryConfigured()),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-sm uppercase tracking-[0.2em] text-[#C8A97E]">
            Site
          </p>
          <h1 className="text-4xl font-medium">Settings</h1>
          <p className="mt-3 text-[#A1A1A6]">
            Update your portfolio title, bio, contact details, and social links.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link
            href="/about"
            className="rounded-full border border-neutral-700 px-4 py-2 text-[#A1A1A6] transition hover:text-[#F5F5F7]"
          >
            View About
          </Link>
          <Link
            href="/contact"
            className="rounded-full border border-neutral-700 px-4 py-2 text-[#A1A1A6] transition hover:text-[#F5F5F7]"
          >
            View Contact
          </Link>
        </div>
      </div>

      <div className="space-y-8">
        <SettingsForm
          initialValues={{
            siteTitle: settings.siteTitle,
            bio: settings.bio ?? "",
            footerTagline: settings.footerTagline ?? "",
            contactBlurb: settings.contactBlurb ?? "",
            contactEmail: settings.contactEmail ?? "",
            instagram: settings.instagram ?? "",
            vimeo: settings.vimeo ?? "",
            youtube: settings.youtube ?? "",
          }}
        />

        <OgImageSection
          initialOgImageUrl={settings.ogImageUrl}
          cloudinaryConfigured={cloudinaryConfigured}
        />
      </div>
    </div>
  );
}