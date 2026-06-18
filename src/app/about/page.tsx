import { getSiteSettings } from "@/lib/site";

export const metadata = {
  title: "About",
};

export default async function AboutPage() {
  const settings = await getSiteSettings();

  return (
    <main className="mx-auto max-w-3xl px-6 pt-32 pb-24">
      <h1 className="text-5xl font-medium tracking-[-0.04em] text-[#F5F5F7] md:text-6xl">
        About
      </h1>
      <p className="mt-8 text-lg leading-relaxed text-[#A1A1A6]">
        {settings.bio}
      </p>
    </main>
  );
}