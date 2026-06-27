"use client";

import { Button, Container, Typography } from "@mui/material";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import EditSnippetForm from "@/components/EditSnippetForm";
import LoadingMessage from "@/components/LoadingMessage";
import { ApiError, getSnippet, peekSnippetCache, type Snippet } from "@/lib/api";
import type { SnippetFormValues } from "@/components/SnippetForm";
import { parseReturnPage } from "@/lib/searchNav";

function snippetToFormValues(snippet: Snippet): SnippetFormValues {
  return {
    title: snippet.title,
    body: snippet.body,
    tags: snippet.tags.join(", "),
  };
}

export default function EditPageClient() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = Number(params.id);
  const returnQuery = searchParams.get("q");
  const returnPage = parseReturnPage(searchParams.get("page"));

  const [initial, setInitial] = useState<SnippetFormValues | null>(() => {
    if (Number.isNaN(id)) return null;
    const cached = peekSnippetCache(id);
    return cached ? snippetToFormValues(cached) : null;
  });
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (Number.isNaN(id)) return;

    let cancelled = false;
    getSnippet(id)
      .then((snippet) => {
        if (cancelled) return;
        setInitial(snippetToFormValues(snippet));
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
        <Button component={Link} href="/" variant="outlined" sx={{ mt: 2 }}>
          Back to search
        </Button>
      </Container>
    );
  }

  if (!initial) {
    return <LoadingMessage />;
  }

  return (
    <EditSnippetForm
      key={`${id}-${initial.title}`}
      id={id}
      returnQuery={returnQuery}
      returnPage={returnPage}
      initial={initial}
    />
  );
}
