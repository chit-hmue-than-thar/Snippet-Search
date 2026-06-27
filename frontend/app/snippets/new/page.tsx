"use client";

import { Container, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import BackToSearch from "@/components/BackToSearch";
import SnippetForm from "@/components/SnippetForm";
import { createSnippet } from "@/lib/api";

export default function NewSnippetPage() {
  const router = useRouter();

  return (
    <Container maxWidth="md" sx={{ py: { xs: 2, md: 4 } }}>
      <BackToSearch />
      <Typography variant="h4" gutterBottom>
        Create snippet
      </Typography>
      <SnippetForm
        submitLabel="Save"
        onSubmit={async (data) => {
          await createSnippet(data);
          router.push("/");
        }}
      />
    </Container>
  );
}
