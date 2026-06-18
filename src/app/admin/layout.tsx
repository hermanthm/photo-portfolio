import Link from "next/link";

import { SessionProvider } from "@/components/providers/SessionProvider";
import { auth } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <SessionProvider>
      <div className="min-h-screen bg-[#050505] text-[#F5F5F7]">
        {session ? (
          <header className="border-b border-neutral-800/80">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
              <div className="flex items-center gap-6">
                <Link href="/admin" className="font-medium text-[#C8A97E]">
                  Portfolio Admin
                </Link>
                <nav className="flex gap-4 text-sm text-[#A1A1A6]">
                  <Link href="/admin" className="hover:text-[#F5F5F7]">
                    Dashboard
                  </Link>
                  <Link href="/" className="hover:text-[#F5F5F7]">
                    View site
                  </Link>
                </nav>
              </div>
              <p className="text-sm text-[#A1A1A6]">{session.user?.email}</p>
            </div>
          </header>
        ) : null}
        <main>{children}</main>
      </div>
    </SessionProvider>
  );
}