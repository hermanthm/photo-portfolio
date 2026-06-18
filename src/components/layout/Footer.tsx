export function Footer({ siteTitle }: { siteTitle: string }) {
  return (
    <footer className="border-t border-neutral-800/80 bg-[#050505]">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-10 text-sm text-[#A1A1A6] md:flex-row md:items-center md:justify-between">
        <p>{siteTitle}</p>
        <p>Photography and cinematic video work.</p>
      </div>
    </footer>
  );
}