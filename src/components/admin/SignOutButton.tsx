"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/admin/login" })}
      className="ui-label transition hover:text-foreground"
    >
      Sign out
    </button>
  );
}