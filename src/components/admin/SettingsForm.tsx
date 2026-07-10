"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import {
  ABOUT_CONTENT_MAX_LENGTH,
  BIO_MAX_LENGTH,
} from "@/lib/validations/settings";

function getCounterClass(length: number, maxLength: number): string {
  if (length >= maxLength) {
    return "ui-error";
  }

  if (length >= maxLength - 50) {
    return "ui-warning";
  }

  return "ui-helper";
}

function formatSettingsError(data: {
  error?: string;
  details?: {
    fieldErrors?: Record<string, string[] | undefined>;
  };
} | null): string {
  const fieldErrors = data?.details?.fieldErrors;
  const firstFieldError = fieldErrors
    ? Object.values(fieldErrors).find((messages) => messages?.[0])?.[0]
    : undefined;

  if (firstFieldError) {
    return firstFieldError;
  }

  return data?.error ?? "Something went wrong.";
}

type SettingsFormValues = {
  siteTitle: string;
  bio: string;
  aboutContent: string;
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
        aboutContent: values.aboutContent.trim() || null,
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
      setError(formatSettingsError(data));
      return;
    }

    setSuccess(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <label className="block space-y-2">
        <span className="ui-label">Site title</span>
        <input
          type="text"
          value={values.siteTitle}
          onChange={(event) => updateField("siteTitle", event.target.value)}
          required
          className="ui-input"
        />
        <span className="ui-helper">
          Shown in the navbar, footer, and browser tab.
        </span>
      </label>

      <label className="block space-y-2">
        <span className="ui-label">Bio</span>
        <textarea
          value={values.bio}
          onChange={(event) => updateField("bio", event.target.value)}
          rows={5}
          maxLength={BIO_MAX_LENGTH}
          className="ui-input"
        />
        <div className="flex items-center justify-between gap-4 text-xs">
          <span className="text-muted">
            Short summary used on the homepage hero.
          </span>
          <span className={getCounterClass(values.bio.length, BIO_MAX_LENGTH)}>
            {values.bio.length} / {BIO_MAX_LENGTH} characters
          </span>
        </div>
      </label>

      <label className="block space-y-2">
        <span className="ui-label">About page content</span>
        <textarea
          value={values.aboutContent}
          onChange={(event) => updateField("aboutContent", event.target.value)}
          rows={14}
          maxLength={ABOUT_CONTENT_MAX_LENGTH}
          placeholder={`Write your full About Me story.\n\nEach line becomes its own paragraph.\nStart bullet points with • or -.\nShort standalone lines like "Expertise" become section headings.`}
          className="ui-input"
        />
        <div className="flex items-center justify-between gap-4 text-xs">
          <span className="text-muted">
            Shown on the About page. One line per paragraph; headings and bullet
            lists are formatted automatically.
          </span>
          <span
            className={getCounterClass(
              values.aboutContent.length,
              ABOUT_CONTENT_MAX_LENGTH,
            )}
          >
            {values.aboutContent.length} / {ABOUT_CONTENT_MAX_LENGTH} characters
          </span>
        </div>
      </label>

      <label className="block space-y-2">
        <span className="ui-label">Footer tagline</span>
        <input
          type="text"
          value={values.footerTagline}
          onChange={(event) => updateField("footerTagline", event.target.value)}
          placeholder="Photography and cinematic video work."
          className="ui-input"
        />
        <span className="ui-helper">
          Short line shown in the site footer.
        </span>
      </label>

      <label className="block space-y-2">
        <span className="ui-label">Contact page intro</span>
        <textarea
          value={values.contactBlurb}
          onChange={(event) => updateField("contactBlurb", event.target.value)}
          rows={3}
          placeholder="Reach out to discuss photography or film projects."
          className="ui-input"
        />
      </label>

      <label className="block space-y-2">
        <span className="ui-label">Contact email</span>
        <input
          type="email"
          value={values.contactEmail}
          onChange={(event) => updateField("contactEmail", event.target.value)}
          className="ui-input"
        />
      </label>

      <div className="space-y-4 ui-card-padded">
        <h2 className="text-lg font-medium text-foreground">Social links</h2>
        <p className="ui-label">
          Full URLs shown on the Contact page and footer.
        </p>

        <label className="block space-y-2">
          <span className="ui-label">Instagram</span>
          <input
            type="url"
            value={values.instagram}
            onChange={(event) => updateField("instagram", event.target.value)}
            placeholder="https://instagram.com/..."
            className="ui-input"
          />
        </label>

        <label className="block space-y-2">
          <span className="ui-label">Vimeo</span>
          <input
            type="url"
            value={values.vimeo}
            onChange={(event) => updateField("vimeo", event.target.value)}
            placeholder="https://vimeo.com/..."
            className="ui-input"
          />
        </label>

        <label className="block space-y-2">
          <span className="ui-label">YouTube</span>
          <input
            type="url"
            value={values.youtube}
            onChange={(event) => updateField("youtube", event.target.value)}
            placeholder="https://youtube.com/..."
            className="ui-input"
          />
        </label>
      </div>

      {error ? <p className="ui-error">{error}</p> : null}
      {success ? (
        <p className="ui-success">Settings saved successfully.</p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="ui-btn-primary"
      >
        {loading ? "Saving..." : "Save settings"}
      </button>
    </form>
  );
}