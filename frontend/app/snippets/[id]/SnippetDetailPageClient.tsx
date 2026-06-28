"use client";

import { useParams } from "next/navigation";
import LoadingMessage from "@/components/LoadingMessage";
import SnippetDetailView from "@/components/SnippetDetailView";
import SnippetNotFound from "@/components/SnippetNotFound";
import { useSnippet } from "@/hooks/useSnippet";

export default function SnippetDetailPageClient() {
  const params = useParams();
  const id = Number(params.id);
  const { snippet, notFound, loading } = useSnippet(id);

  if (notFound) {
    return <SnippetNotFound />;
  }

  if (loading || !snippet) {
    return <LoadingMessage />;
  }

  return <SnippetDetailView snippet={snippet} />;
}
