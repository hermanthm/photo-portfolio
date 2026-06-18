"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type SettingsFormValues = {
  siteTitle: string;
  bio: string;
  footerTagline: string;
  contactBlurb: string;
  contactEmail: string;
  instagram: string;
  vimeo: string;
  youtube: string;
};

type SettingsFormProps = {
  initialValues: SettingsFormValues;
};

export function SettingsForm({ initialValues }: SettingsFormProps) {
  const router = useRouter();
  const [values, setValues] = useState(initialValues);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  function updateField<K extends keyof SettingsFormValues>(
    key: K,
    value: SettingsFormValues[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
    setSuccess(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const response = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        siteTitle: values.siteTitle,
        bio: values.bio.trim() || null,
        footerTagline: values.footerTagline.trim() || null,
        contactBlurb: values.contactBlurb.trim() || null,
        contactEmail: values.contactEmail.trim() || null,
        instagram: values.instagram.trim() || null,
        vimeo: values.vimeo.trim() || null,
        youtube: values.youtube.trim() || null,
      }),
    });

    setLoading(false);

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setError(data?.error ?? "Something went wrong.");
      return;
    }

    setSuccess(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <label className="block space-y-2">
        <span className="text-sm text-[#A1A1A6]">Site title</span>
        <input
          type="text"
          value={values.siteTitle}
          onChange={(event) => updateField("siteTitle", event.target.value)}
          required
          className="w-full rounded-xl border border-neutral-800 bg-[#0F0F0F] px-4 py-3 text-[#F5F5F7] outline-none transition focus:border-[#C8A97E]"
        />
        <span className="text-xs text-[#A1A1A6]">
          Shown in the navbar, footer, and browser tab.
        </span>
      </label>

      <label className="block space-y-2">
        <span className="text-sm text-[#A1A1A6]">Bio</span>
        <textarea
          value={values.bio}
          onChange={(event) => updateField("bio", event.target.value)}
          rows={5}
          className="w-full rounded-xl border border-neutral-800 bg-[#0F0F0F] px-4 py-3 text-[#F5F5F7] outline-none transition focus:border-[#C8A97E]"
        />
        <span className="text-xs text-[#A1A1A6]">
          Used on the homepage hero and About page.
        </span>
      </label>

      <label className="block space-y-2">
        <span className="text-sm text-[#A1A1A6]">Footer tagline</span>
        <input
          type="text"
          value={values.footerTagline}
          onChange={(event) => updateField("footerTagline", event.target.value)}
          placeholder="Photography and cinematic video work."
          className="w-full rounded-xl border border-neutral-800 bg-[#0F0F0F] px-4 py-3 text-[#F5F5F7] outline-none transition focus:border-[#C8A97E]"
        />
        <span className="text-xs text-[#A1A1A6]">
          Short line shown in the site footer.
        </span>
      </label>

      <label className="block space-y-2">
        <span className="text-sm text-[#A1A1A6]">Contact page intro</span>
        <textarea
          value={values.contactBlurb}
          onChange={(event) => updateField("contactBlurb", event.target.value)}
          rows={3}
          placeholder="Reach out to discuss photography or film projects."
          className="w-full rounded-xl border border-neutral-800 bg-[#0F0F0F] px-4 py-3 text-[#F5F5F7] outline-none transition focus:border-[#C8A97E]"
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm text-[#A1A1A6]">Contact email</span>
        <input
          type="email"
          value={values.contactEmail}
          onChange={(event) => updateField("contactEmail", event.target.value)}
          className="w-full rounded-xl border border-neutral-800 bg-[#0F0F0F] px-4 py-3 text-[#F5F5F7] outline-none transition focus:border-[#C8A97E]"
        />
      </label>

      <div className="space-y-4 rounded-3xl border border-neutral-800 bg-[#111111] p-6">
        <h2 className="text-lg font-medium text-[#F5F5F7]">Social links</h2>
        <p className="text-sm text-[#A1A1A6]">
          Full URLs shown on the Contact page and footer.
        </p>

        <label className="block space-y-2">
          <span className="text-sm text-[#A1A1A6]">Instagram</span>
          <input
            type="url"
            value={values.instagram}
            onChange={(event) => updateField("instagram", event.target.value)}
            placeholder="https://instagram.com/..."
            className="w-full rounded-xl border border-neutral-800 bg-[#0F0F0F] px-4 py-3 text-[#F5F5F7] outline-none transition focus:border-[#C8A97E]"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm text-[#A1A1A6]">Vimeo</span>
          <input
            type="url"
            value={values.vimeo}
            onChange={(event) => updateField("vimeo", event.target.value)}
            placeholder="https://vimeo.com/..."
            className="w-full rounded-xl border border-neutral-800 bg-[#0F0F0F] px-4 py-3 text-[#F5F5F7] outline-none transition focus:border-[#C8A97E]"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm text-[#A1A1A6]">YouTube</span>
          <input
            type="url"
            value={values.youtube}
            onChange={(event) => updateField("youtube", event.target.value)}
            placeholder="https://youtube.com/..."
            className="w-full rounded-xl border border-neutral-800 bg-[#0F0F0F] px-4 py-3 text-[#F5F5F7] outline-none transition focus:border-[#C8A97E]"
          />
        </label>
      </div>

      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      {success ? (
        <p className="text-sm text-emerald-400">Settings saved successfully.</p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="rounded-xl border border-[#C8A97E] px-6 py-3 font-medium text-[#F5F5F7] transition hover:bg-[#C8A97E] hover:text-black disabled:opacity-60"
      >
        {loading ? "Saving..." : "Save settings"}
      </button>
    </form>
  );
}