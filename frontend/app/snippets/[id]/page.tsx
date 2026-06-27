"use client";

import {
  Box,
  Button,
  Chip,
  Container,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import BackToSearch from "@/components/BackToSearch";
import ErrorMessage from "@/components/ErrorMessage";
import LoadingMessage from "@/components/LoadingMessage";
import { ApiError, getSnippet, type Snippet } from "@/lib/api";
import { appPalette } from "@/theme/palette";

export default function SnippetDetailPage() {
  const params = useParams();
  const id = Number(params.id);

  const [snippet, setSnippet] = useState<Snippet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const load = useCallback(async () => {
    if (Number.isNaN(id)) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setNotFound(false);
    try {
      const data = await getSnippet(id);
      setSnippet(data);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setNotFound(true);
        setSnippet(null);
      } else {
        setError(err instanceof Error ? err.message : "Failed to load snippet");
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <LoadingMessage />;

  if (notFound) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: "center" }}>
        <Typography color="text.secondary" gutterBottom>
          Snippet not found.
        </Typography>
        <Button component={Link} href="/" variant="outlined">
          Back to search
        </Button>
      </Container>
    );
  }

  if (error && !snippet) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <ErrorMessage message={error} onRetry={load} />
      </Container>
    );
  }

  if (!snippet) return null;

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
      <BackToSearch />
      <Paper sx={{ p: 3, border: `1px solid ${appPalette.color2}`, width: "100%" }}>
        <Typography variant="h4" gutterBottom fontWeight={700} sx={{ wordBreak: "break-word" }}>
          {snippet.title}
        </Typography>

        {snippet.tags.length > 0 && (
          <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 2 }}>
            {snippet.tags.map((tag) => (
              <Chip key={tag} label={tag} size="small" />
            ))}
          </Stack>
        )}

        <Box
          sx={{
            width: "100%",
            p: 2,
            bgcolor: appPalette.color1,
            borderRadius: 2,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {snippet.body}
        </Box>
      </Paper>
    </Container>
  );
}
