"use client";

import { FormEvent, useState } from "react";
import type { SnippetCreate } from "@/lib/api";

export interface SnippetFormValues {
  title: string;
  body: string;
  tags: string;
}

export default function SnippetForm({
  initial,
  submitLabel,
  onSubmit,
}: {
  initial?: SnippetFormValues;
  submitLabel: string;
  onSubmit: (data: SnippetCreate) => Promise<void>;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [body, setBody] = useState(initial?.body ?? "");
  const [tags, setTags] = useState(initial?.tags ?? "");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const tagList = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      await onSubmit({ title: title.trim(), body: body.trim(), tags: tagList });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save snippet");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="snippet-form" onSubmit={handleSubmit}>
      <label>
        Title
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={200}
        />
      </label>
      <label>
        Body
        <textarea value={body} onChange={(e) => setBody(e.target.value)} required rows={8} />
      </label>
      <label>
        Tags (comma-separated)
        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="contract, clause"
        />
      </label>
      {error && <p className="form-error">{error}</p>}
      <button type="submit" disabled={submitting}>
        {submitting ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
