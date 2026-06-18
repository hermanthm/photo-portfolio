type SocialLinksProps = {
  instagram: string | null;
  vimeo: string | null;
  youtube: string | null;
  className?: string;
};

const links = [
  { key: "instagram", label: "Instagram" },
  { key: "vimeo", label: "Vimeo" },
  { key: "youtube", label: "YouTube" },
] as const;

export function SocialLinks({
  instagram,
  vimeo,
  youtube,
  className = "",
}: SocialLinksProps) {
  const values = { instagram, vimeo, youtube };
  const active = links.filter((link) => values[link.key]);

  if (active.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-4 ${className}`}>
      {active.map((link) => (
        <a
          key={link.key}
          href={values[link.key]!}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#C8A97E] transition hover:text-[#F5F5F7]"
        >
          {link.label}
        </a>
      ))}
    </div>
  );
}