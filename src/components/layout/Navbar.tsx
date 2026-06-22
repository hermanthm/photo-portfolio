import Link from "next/link";

import { AdminSessionMenu } from "@/components/layout/AdminSessionMenu";
import { SecretDoor } from "@/components/layout/SecretDoor";

const links = [
  { href: "/photography", label: "Photography" },
  { href: "/video", label: "Video" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Navbar({ siteTitle }: { siteTitle: string }) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-neutral-800/60 bg-[#050505]/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <SecretDoor
          siteTitle={siteTitle}
          className="text-lg font-medium tracking-tight text-[#F5F5F7]"
        />
        <div className="flex items-center gap-6">
          <nav className="hidden items-center gap-8 text-sm text-[#A1A1A6] md:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition hover:text-[#C8A97E]"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <AdminSessionMenu />
        </div>
      </div>
    </header>
  );
}