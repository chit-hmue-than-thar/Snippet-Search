"use client";

import { useParams } from "next/navigation";
import ErrorMessage from "@/components/ErrorMessage";
import LoadingMessage from "@/components/LoadingMessage";
import SnippetDetailView from "@/components/SnippetDetailView";
import SnippetNotFound from "@/components/SnippetNotFound";
import { useSnippet } from "@/hooks/useSnippet";

export default function SnippetDetailPageClient() {
  const params = useParams();
  const id = Number(params.id);
  const { snippet, notFound, loading, error } = useSnippet(id);

  if (notFound) {
    return <SnippetNotFound />;
  }

  if (loading) {
    return <LoadingMessage />;
  }

  if (error) {
    return (
      <ErrorMessage message={error} onRetry={() => window.location.reload()} />
    );
  }

  if (!snippet) {
    return <LoadingMessage />;
  }

  return <SnippetDetailView snippet={snippet} />;
}
