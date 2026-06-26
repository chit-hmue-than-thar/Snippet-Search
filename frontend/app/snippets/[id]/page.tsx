"use client";

import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import BackToSearch from "@/components/BackToSearch";
import ConfirmDialog from "@/components/ConfirmDialog";
import ErrorMessage from "@/components/ErrorMessage";
import LoadingMessage from "@/components/LoadingMessage";
import { ApiError, deleteSnippet, getSnippet, type Snippet } from "@/lib/api";
import { appPalette } from "@/theme/palette";

export default function SnippetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const [snippet, setSnippet] = useState<Snippet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  async function handleDeleteConfirm() {
    if (!snippet) return;
    setDeleting(true);
    try {
      await deleteSnippet(snippet.id);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete snippet");
      setShowDeleteConfirm(false);
    } finally {
      setDeleting(false);
    }
  }

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
    <Container maxWidth="md" sx={{ py: { xs: 2, md: 4 } }}>
      <BackToSearch />
      <Paper sx={{ p: 3, border: `1px solid ${appPalette.color2}` }}>
        <Typography variant="h4" gutterBottom>
          {snippet.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Created {new Date(snippet.created_at).toLocaleString()}
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
            p: 2,
            bgcolor: appPalette.color1,
            borderRadius: 2,
            whiteSpace: "pre-wrap",
            mb: 3,
          }}
        >
          {snippet.body}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
          <Button component={Link} href={`/snippets/${snippet.id}/edit`} variant="contained">
            Edit
          </Button>
          <Button variant="outlined" color="error" onClick={() => setShowDeleteConfirm(true)}>
            Delete
          </Button>
          <Button component={Link} href="/" variant="text">
            Back to search
          </Button>
        </Stack>
      </Paper>

      <ConfirmDialog
        open={showDeleteConfirm}
        title="Confirm delete"
        message={`Are you sure you want to delete "${snippet.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirmColor="error"
        onConfirm={handleDeleteConfirm}
        onCancel={() => !deleting && setShowDeleteConfirm(false)}
      />
    </Container>
  );
}
