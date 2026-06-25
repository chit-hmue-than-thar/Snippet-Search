"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import SnippetForm, { type SnippetFormValues } from "@/components/SnippetForm";
import LoadingMessage from "@/components/LoadingMessage";
import ErrorMessage from "@/components/ErrorMessage";
import { ApiError, getSnippet, updateSnippet } from "@/lib/api";

export default function EditSnippetPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const [initial, setInitial] = useState<SnippetFormValues | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const load = useCallback(async () => {
    if (Number.isNaN(id)) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const snippet = await getSnippet(id);
      setInitial({
        title: snippet.title,
        body: snippet.body,
        tags: snippet.tags.join(", "),
      });
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setNotFound(true);
      } else {
        setError(err instanceof Error ? err.message : "Failed to load snippet");
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <LoadingMessage />;

  if (notFound) {
    return (
      <div className="state-message">
        <p>Snippet not found.</p>
        <Link href="/">Back to search</Link>
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={load} />;
  }

  if (!initial) return null;

  return (
    <div>
      <h1>Edit snippet</h1>
      <SnippetForm
        initial={initial}
        submitLabel="Save changes"
        onSubmit={async (data) => {
          const snippet = await updateSnippet(id, data);
          router.push(`/snippets/${snippet.id}`);
        }}
      />
    </div>
  );
}
