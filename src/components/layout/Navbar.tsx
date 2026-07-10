import Link from "next/link";

import { AdminSessionMenu } from "@/components/layout/AdminSessionMenu";
import { MobileNav } from "@/components/layout/MobileNav";
import { SecretDoor } from "@/components/layout/SecretDoor";
import { publicNavLinks } from "@/lib/nav-links";

export function Navbar({ siteTitle }: { siteTitle: string }) {
  return (
    <header className="ui-nav-header">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <SecretDoor
          siteTitle={siteTitle}
          className="text-lg font-medium tracking-tight text-foreground"
        />
        <div className="flex items-center gap-3 md:gap-6">
          <nav className="hidden items-center gap-8 ui-nav-text md:flex">
            {publicNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="ui-nav-link"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <MobileNav />
          <AdminSessionMenu />
        </div>
      </div>
    </header>
  );
}