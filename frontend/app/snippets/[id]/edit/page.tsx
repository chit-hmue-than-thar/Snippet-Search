"use client";

import { Button, Container, Typography } from "@mui/material";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import ErrorMessage from "@/components/ErrorMessage";
import LoadingMessage from "@/components/LoadingMessage";
import SnippetForm, { type SnippetFormValues } from "@/components/SnippetForm";
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
      <Container maxWidth="md" sx={{ py: 4, textAlign: "center" }}>
        <Typography color="text.secondary" gutterBottom>
          Snippet not found.
        </Typography>
        <Button component={Link} href="/" variant="outlined">
          Back to search
        </Button>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <ErrorMessage message={error} onRetry={load} />
      </Container>
    );
  }

  if (!initial) return null;

  return (
    <Container maxWidth="md" sx={{ py: { xs: 2, md: 4 } }}>
      <Typography variant="h4" gutterBottom>
        Edit snippet
      </Typography>
      <SnippetForm
        initial={initial}
        submitLabel="Save changes"
        requireUpdateConfirm
        onSubmit={async (data) => {
          const snippet = await updateSnippet(id, data);
          router.push(`/snippets/${snippet.id}`);
        }}
      />
    </Container>
  );
}
