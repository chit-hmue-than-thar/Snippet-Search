"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import LoadingMessage from "@/components/LoadingMessage";
import ErrorMessage from "@/components/ErrorMessage";
import { ApiError, deleteSnippet, getSnippet, type Snippet } from "@/lib/api";

export default function SnippetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const [snippet, setSnippet] = useState<Snippet | null>(null);
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
    setNotFound(false);
    try {
      const data = await getSnippet(id);
      setSnippet(data);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setNotFound(true);
        setSnippet(null);
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

  async function handleDelete() {
    if (!snippet || !confirm("Delete this snippet?")) return;
    try {
      await deleteSnippet(snippet.id);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete snippet");
    }
  }

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

  if (!snippet) return null;

  return (
    <article>
      <h1>{snippet.title}</h1>
      <p className="detail-meta">
        Created {new Date(snippet.created_at).toLocaleString()}
      </p>
      {snippet.tags.length > 0 && (
        <ul className="tags">
          {snippet.tags.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
      )}
      <div className="detail-body">{snippet.body}</div>
      <div className="actions">
        <Link href={`/snippets/${snippet.id}/edit`}>Edit</Link>
        <button type="button" className="danger" onClick={handleDelete}>
          Delete
        </button>
        <Link href="/">Back to search</Link>
      </div>
    </article>
  );
}
