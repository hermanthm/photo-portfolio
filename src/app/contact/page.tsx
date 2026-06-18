import { getSiteSettings } from "@/lib/site";

export const metadata = {
  title: "Contact",
};

export default async function ContactPage() {
  const settings = await getSiteSettings();

  return (
    <main className="mx-auto max-w-3xl px-6 pt-32 pb-24">
      <h1 className="text-5xl font-medium tracking-[-0.04em] text-[#F5F5F7] md:text-6xl">
        Contact
      </h1>
      <p className="mt-8 text-lg leading-relaxed text-[#A1A1A6]">
        Reach out to discuss photography or film projects.
      </p>
      {settings.contactEmail ? (
        <a
          href={`mailto:${settings.contactEmail}`}
          className="mt-6 inline-block text-xl text-[#C8A97E] transition hover:text-[#F5F5F7]"
        >
          {settings.contactEmail}
        </a>
      ) : null}
    </main>
  );
}