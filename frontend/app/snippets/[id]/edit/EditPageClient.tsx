"use client";

import { useParams, useSearchParams } from "next/navigation";
import EditSnippetForm from "@/components/EditSnippetForm";
import LoadingMessage from "@/components/LoadingMessage";
import SnippetNotFound from "@/components/SnippetNotFound";
import type { SnippetFormValues } from "@/components/SnippetForm";
import { useSnippet } from "@/hooks/useSnippet";
import type { Snippet } from "@/lib/api";
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
  const { snippet, notFound, loading } = useSnippet(id);

  if (notFound) {
    return <SnippetNotFound />;
  }

  if (loading || !snippet) {
    return <LoadingMessage />;
  }

  return (
    <EditSnippetForm
      key={id}
      id={id}
      returnQuery={returnQuery}
      returnPage={returnPage}
      initial={snippetToFormValues(snippet)}
    />
  );
}
