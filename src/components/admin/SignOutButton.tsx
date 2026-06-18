"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/admin/login" })}
      className="text-sm text-[#A1A1A6] transition hover:text-[#F5F5F7]"
    >
      Sign out
    </button>
  );
}