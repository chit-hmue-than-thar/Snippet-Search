"use client";

import { Button, Container, Typography } from "@mui/material";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import LoadingMessage from "@/components/LoadingMessage";
import SnippetDetailView from "@/components/SnippetDetailView";
import { ApiError, getSnippet, peekSnippetCache, type Snippet } from "@/lib/api";

export default function SnippetDetailPageClient() {
  const params = useParams();
  const id = Number(params.id);

  const [snippet, setSnippet] = useState<Snippet | null>(() =>
    Number.isNaN(id) ? null : peekSnippetCache(id)
  );
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (Number.isNaN(id)) return;

    let cancelled = false;
    getSnippet(id)
      .then((loaded) => {
        if (cancelled) return;
        setSnippet(loaded);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 404) {
          setNotFound(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (Number.isNaN(id) || notFound) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: "center" }}>
        <Typography color="text.secondary" gutterBottom>
          Snippet not found.
        </Typography>
        <Button component={Link} href="/" variant="outlined">
          Back to search
        </Button>
      </Container>
    );
  }

  if (!snippet) {
    return <LoadingMessage />;
  }

  return <SnippetDetailView snippet={snippet} />;
}
