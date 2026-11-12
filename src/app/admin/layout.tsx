import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { AdminCategoriesShortcut } from "@/components/admin/AdminCategoriesShortcut";
import { AdminMobileNav } from "@/components/admin/AdminMobileNav";
import { SignOutButton } from "@/components/admin/SignOutButton";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { auth } from "@/lib/auth";
import { getSiteSettings } from "@/lib/site";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, settings, headersList] = await Promise.all([
    auth(),
    getSiteSettings(),
    headers(),
  ]);

  const pathname = headersList.get("x-pathname") ?? "";
  const isLoginPage = pathname === "/admin/login";

  if (!session && pathname && !isLoginPage) {
    notFound();
  }

  return (
    <SessionProvider session={session}>
      <div className="ui-admin-shell">
        {session ? (
          <div className="pt-16 md:pt-20">
            <header className="ui-admin-header">
              <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 lg:h-auto lg:px-6 lg:py-4">
                <Link
                  href="/admin"
                  className="min-w-0 truncate font-medium text-accent"
                >
                  {settings.siteTitle} Admin
                </Link>
                <div className="flex shrink-0 items-center gap-3">
                  <nav className="hidden items-center gap-4 ui-label lg:flex">
                    <Link href="/admin" className="hover:text-foreground">
                      Dashboard
                    </Link>
                    <Link
                      href="/admin/collections"
                      className="hover:text-foreground"
                    >
                      Collections
                    </Link>
                    <Link
                      href="/admin/categories"
                      className="hover:text-foreground"
                    >
                      Categories
                    </Link>
                    <Link href="/admin/settings" className="hover:text-foreground">
                      Settings
                    </Link>
                    <Link href="/admin/account" className="hover:text-foreground">
                      Account
                    </Link>
                    <Link href="/" className="hover:text-foreground">
                      View site
                    </Link>
                  </nav>
                  <div className="hidden items-center gap-4 lg:flex">
                    <AdminCategoriesShortcut />
                    <p className="ui-label">{session.user?.email}</p>
                    <SignOutButton />
                  </div>
                  <AdminMobileNav />
                </div>
              </div>
            </header>
            <main>{children}</main>
          </div>
        ) : (
          <main>{children}</main>
        )}
      </div>
    </SessionProvider>
  );
}