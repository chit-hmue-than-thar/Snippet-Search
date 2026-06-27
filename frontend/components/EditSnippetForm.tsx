"use client";

import { Container, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import SnippetForm, { type SnippetFormValues } from "@/components/SnippetForm";
import { updateSnippet } from "@/lib/api";
import { dashboardHref } from "@/lib/searchNav";

export default function EditSnippetForm({
  id,
  initial,
  returnQuery,
  returnPage,
}: {
  id: number;
  initial: SnippetFormValues;
  returnQuery: string | null;
  returnPage: number;
}) {
  const router = useRouter();
  const returnHref = dashboardHref({ query: returnQuery, page: returnPage });

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
          router.refresh();
          router.push(returnHref);
        }}
      />
    </Container>
  );
}
