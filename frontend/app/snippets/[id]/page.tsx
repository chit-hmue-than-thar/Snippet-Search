import { Button, Container, Typography } from "@mui/material";
import Link from "next/link";
import { notFound } from "next/navigation";
import SnippetDetailView from "@/components/SnippetDetailView";
import { fetchSnippetServer } from "@/lib/api-server";

export default async function SnippetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idParam } = await params;
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

  return <SnippetDetailView snippet={snippet} />;
}
