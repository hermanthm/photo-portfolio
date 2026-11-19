"use client";

import { signOut } from "next-auth/react";
import { FormEvent, useState } from "react";

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    setLoading(true);

    const response = await fetch("/api/admin/account/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    setLoading(false);

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setError(data?.error ?? "Failed to change password.");
      return;
    }

    await signOut({ callbackUrl: "/admin/login" });
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-5">
      <label className="block space-y-2">
        <span className="ui-label">Current password</span>
        <input
          type="password"
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
          required
          minLength={8}
          className="ui-input"
        />
      </label>

      <label className="block space-y-2">
        <span className="ui-label">New password</span>
        <input
          type="password"
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          required
          minLength={8}
          className="ui-input"
        />
      </label>

      <label className="block space-y-2">
        <span className="ui-label">Confirm new password</span>
        <input
          type="password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          required
          minLength={8}
          className="ui-input"
        />
      </label>

      {error ? <p className="ui-error">{error}</p> : null}

      <button
        type="submit"
        disabled={loading}
        className="ui-btn-primary"
      >
        {loading ? "Updating..." : "Change password"}
      </button>
    </form>
  );
}