"use client";

import { useEffect, useState } from "react";
import { ApiError, getSnippet, peekSnippetCache, type Snippet } from "@/lib/api";

export function useSnippet(id: number) {
  const validId = !Number.isNaN(id);

  const [snippet, setSnippet] = useState<Snippet | null>(() =>
    validId ? peekSnippetCache(id) : null
  );
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(() => validId && !peekSnippetCache(id));

  useEffect(() => {
    if (!validId) return;

    const cached = peekSnippetCache(id);
    if (cached) {
      setSnippet(cached);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    getSnippet(id)
      .then((loaded) => {
        if (cancelled) return;
        setSnippet(loaded);
        setNotFound(false);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 404) {
          setNotFound(true);
          setSnippet(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, validId]);

  return {
    snippet,
    notFound: !validId || notFound,
    loading,
  };
}
