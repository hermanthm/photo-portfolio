"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { adminNavLinks } from "@/lib/nav-links";

const links = [...adminNavLinks, { href: "/", label: "View site" }] as const;

function isCurrent(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminMobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={menuRef} className="relative lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={open ? "Close admin menu" : "Open admin menu"}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border-strong/80 bg-surface/90 text-foreground transition hover:border-accent/60"
      >
        {open ? (
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        ) : (
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
          </svg>
        )}
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 min-w-48 overflow-hidden rounded-xl border border-border bg-surface/95 py-1 shadow-lg backdrop-blur-md"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              role="menuitem"
              onClick={() => setOpen(false)}
              className={`block px-4 py-2 ui-label transition hover:bg-media hover:text-accent ${
                isCurrent(pathname, link.href) ? "text-accent" : ""
              }`}
            >
              {link.label}
            </Link>
          ))}
          <button
            type="button"
            role="menuitem"
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="block w-full px-4 py-2 text-left ui-label transition hover:bg-media hover:text-accent"
          >
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  );
}
