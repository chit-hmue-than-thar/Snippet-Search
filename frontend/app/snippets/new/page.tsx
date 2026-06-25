"use client";

import { Container, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import SnippetForm from "@/components/SnippetForm";
import { createSnippet } from "@/lib/api";

export default function NewSnippetPage() {
  const router = useRouter();

  return (
    <Container maxWidth="md" sx={{ py: { xs: 2, md: 4 } }}>
      <Typography variant="h4" gutterBottom>
        Create snippet
      </Typography>
      <SnippetForm
        submitLabel="Create snippet"
        onSubmit={async (data) => {
          const snippet = await createSnippet(data);
          router.push(`/snippets/${snippet.id}`);
        }}
      />
    </Container>
  );
}
