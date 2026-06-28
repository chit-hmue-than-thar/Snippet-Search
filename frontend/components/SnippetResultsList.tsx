"use client";

import { Stack } from "@mui/material";
import { memo, useCallback } from "react";
import SnippetCard from "@/components/SnippetCard";
import type { SnippetListItem } from "@/lib/api";

function SnippetResultsList({
  results,
  navQuery,
  navPage,
  onDeleteRequest,
}: {
  results: SnippetListItem[];
  navQuery: string | null;
  navPage: number;
  onDeleteRequest: (id: number) => void;
}) {
  const handleDelete = useCallback(
    (id: number) => {
      onDeleteRequest(id);
    },
    [onDeleteRequest]
  );

  return (
    <Stack spacing={2}>
      {results.map((snippet) => (
        <SnippetCard
          key={snippet.id}
          snippet={snippet}
          navQuery={navQuery}
          navPage={navPage}
          onDelete={handleDelete}
        />
      ))}
    </Stack>
  );
}

export default memo(SnippetResultsList);
