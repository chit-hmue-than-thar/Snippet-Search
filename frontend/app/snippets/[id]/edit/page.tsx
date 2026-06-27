"use client";

import { Container, Typography } from "@mui/material";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import ErrorMessage from "@/components/ErrorMessage";
import LoadingMessage from "@/components/LoadingMessage";
import SnippetForm, { type SnippetFormValues } from "@/components/SnippetForm";
import { ApiError, getSnippet, updateSnippet } from "@/lib/api";
import { dashboardHref } from "@/lib/searchNav";

export default function EditSnippetPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = Number(params.id);
  const returnHref = dashboardHref(searchParams.get("q"));

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
      <Container maxWidth="lg" sx={{ py: 4, textAlign: "center" }}>
        <Typography color="text.secondary" gutterBottom>
          Snippet not found.
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <ErrorMessage message={error} onRetry={load} />
      </Container>
    );
  }

  if (!initial) return null;

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
      <Typography variant="h4" gutterBottom>
        Edit snippet
      </Typography>
      <SnippetForm
        initial={initial}
        submitLabel="Confirm"
        showCancel
        requireUpdateConfirm
        onCancel={() => router.push(returnHref)}
        onSubmit={async (data) => {
          await updateSnippet(id, data);
          router.push(returnHref);
        }}
      />
    </Container>
  );
}
