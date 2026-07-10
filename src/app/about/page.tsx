import type { Metadata } from "next";
import Link from "next/link";

import { AboutContent } from "@/components/about/AboutContent";
import { DEFAULT_ABOUT_CONTENT } from "@/lib/default-about-content";
import { getSiteDescription } from "@/lib/seo";
import { getSiteSettings } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();

  return {
    title: "About",
    description: getSiteDescription(settings),
  };
}

export default async function AboutPage() {
  const settings = await getSiteSettings();
  const aboutContent = settings.aboutContent ?? DEFAULT_ABOUT_CONTENT;

  return (
    <main className="mx-auto max-w-3xl px-6 pt-32 pb-24">
      <h1 className="ui-page-title">
        About Me
      </h1>
      <AboutContent content={aboutContent} />
      <div className="mt-12">
        <Link
          href="/contact"
          className="inline-flex ui-pill-primary"
        >
          Get in touch
        </Link>
      </div>
    </main>
  );
}