import { SocialLinks } from "@/components/layout/SocialLinks";

type FooterProps = {
  siteTitle: string;
  footerTagline: string | null;
  instagram: string | null;
  vimeo: string | null;
  youtube: string | null;
};

export function Footer({
  siteTitle,
  footerTagline,
  instagram,
  vimeo,
  youtube,
}: FooterProps) {
  return (
    <footer className="border-t border-border/80 bg-background">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 ui-label md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-foreground">{siteTitle}</p>
          {footerTagline ? (
            <p className="mt-2 max-w-md">{footerTagline}</p>
          ) : null}
        </div>
        <SocialLinks instagram={instagram} vimeo={vimeo} youtube={youtube} />
      </div>
    </footer>
  );
}