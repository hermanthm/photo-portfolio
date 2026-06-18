"use client";

import { FormEvent, useState } from "react";

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(false);

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

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setSuccess(true);
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-5">
      <label className="block space-y-2">
        <span className="text-sm text-[#A1A1A6]">Current password</span>
        <input
          type="password"
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
          required
          minLength={8}
          className="w-full rounded-xl border border-neutral-800 bg-[#0F0F0F] px-4 py-3 text-[#F5F5F7] outline-none transition focus:border-[#C8A97E]"
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm text-[#A1A1A6]">New password</span>
        <input
          type="password"
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          required
          minLength={8}
          className="w-full rounded-xl border border-neutral-800 bg-[#0F0F0F] px-4 py-3 text-[#F5F5F7] outline-none transition focus:border-[#C8A97E]"
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm text-[#A1A1A6]">Confirm new password</span>
        <input
          type="password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          required
          minLength={8}
          className="w-full rounded-xl border border-neutral-800 bg-[#0F0F0F] px-4 py-3 text-[#F5F5F7] outline-none transition focus:border-[#C8A97E]"
        />
      </label>

      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      {success ? (
        <p className="text-sm text-emerald-400">Password updated successfully.</p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="rounded-xl border border-[#C8A97E] px-6 py-3 font-medium text-[#F5F5F7] transition hover:bg-[#C8A97E] hover:text-black disabled:opacity-60"
      >
        {loading ? "Updating..." : "Change password"}
      </button>
    </form>
  );
}