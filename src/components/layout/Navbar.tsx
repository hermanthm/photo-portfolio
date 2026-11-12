import Link from "next/link";

import { AdminSessionMenu } from "@/components/layout/AdminSessionMenu";
import { MobileNav } from "@/components/layout/MobileNav";
import { SecretDoor } from "@/components/layout/SecretDoor";
import { publicNavLinks } from "@/lib/nav-links";

export function Navbar({ siteTitle }: { siteTitle: string }) {
  return (
    <header className="ui-nav-header">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 md:h-auto md:px-6 md:py-4">
        <SecretDoor
          siteTitle={siteTitle}
          className="min-w-0 truncate text-base font-medium tracking-tight text-foreground sm:text-lg"
        />
        <div className="flex shrink-0 items-center gap-2 md:gap-6">
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
          <div className="hidden md:block">
            <AdminSessionMenu />
          </div>
        </div>
      </div>
    </header>
  );
}