import { Button, Container, Typography } from "@mui/material";
import Link from "next/link";
import { notFound } from "next/navigation";
import EditSnippetForm from "@/components/EditSnippetForm";
import { fetchSnippetServer } from "@/lib/api-server";

export default async function EditSnippetPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { id: idParam } = await params;
  const { q } = await searchParams;
  const id = Number(idParam);

  if (Number.isNaN(id)) {
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

  const snippet = await fetchSnippetServer(id);
  if (!snippet) notFound();

  return (
    <EditSnippetForm
      id={id}
      returnQuery={q ?? null}
      initial={{
        title: snippet.title,
        body: snippet.body,
        tags: snippet.tags.join(", "),
      }}
    />
  );
}
