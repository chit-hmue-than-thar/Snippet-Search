"use client";

import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import ConfirmDialog from "@/components/ConfirmDialog";
import SnippetCard, { type SnippetCardData } from "@/components/SnippetCard";
import {
  deleteSnippet,
  listSnippets,
  searchSnippets,
} from "@/lib/api";
import { appPalette } from "@/theme/palette";

const DEBOUNCE_MS = 300;

type DialogState =
  | { type: "edit"; id: number; title: string }
  | { type: "delete"; id: number; title: string }
  | null;

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [cards, setCards] = useState<SnippetCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialog, setDialog] = useState<DialogState>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query]);

  const loadSnippets = useCallback(async (q: string) => {
    setLoading(true);
    setError(null);
    try {
      if (q.trim()) {
        const data = await searchSnippets(q);
        setCards(
          data.results.map((item) => ({
            id: item.id,
            title: item.title,
            body: item.preview,
            tags: item.tags,
          }))
        );
      } else {
        const data = await listSnippets(1, 50);
        setCards(
          data.items.map((item) => ({
            id: item.id,
            title: item.title,
            body: "Use Edit to view and update the full body text.",
            tags: item.tags,
          }))
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load snippets");
      setCards([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSnippets(debouncedQuery);
  }, [debouncedQuery, loadSnippets]);

  function handleEditClick(id: number) {
    const snippet = cards.find((c) => c.id === id);
    setDialog({
      type: "edit",
      id,
      title: snippet?.title ?? "this snippet",
    });
  }

  function handleDeleteClick(id: number) {
    const snippet = cards.find((c) => c.id === id);
    setDialog({
      type: "delete",
      id,
      title: snippet?.title ?? "this snippet",
    });
  }

  async function handleDialogConfirm() {
    if (!dialog) return;

    if (dialog.type === "edit") {
      setDialog(null);
      router.push(`/snippets/${dialog.id}/edit`);
      return;
    }

    setActionLoading(true);
    try {
      await deleteSnippet(dialog.id);
      setDialog(null);
      await loadSnippets(debouncedQuery);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete snippet");
      setDialog(null);
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
      <Typography variant="h4" gutterBottom>
        Snippet Search
      </Typography>

      <TextField
        fullWidth
        placeholder="Search snippets by keyword…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: appPalette.color3 }} />
            </InputAdornment>
          ),
        }}
      />

      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 3 },
          bgcolor: "background.paper",
          border: `1px solid ${appPalette.color2}`,
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", sm: "center" }}
          spacing={2}
          sx={{ mb: 3 }}
        >
          <Typography variant="h6">Snippets</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => router.push("/snippets/new")}
            sx={{ alignSelf: { xs: "stretch", sm: "flex-end" } }}
          >
            Add snippet
          </Button>
        </Stack>

        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress sx={{ color: appPalette.color3 }} />
          </Box>
        )}

        {!loading && error && (
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={() => loadSnippets(debouncedQuery)}>
                Retry
              </Button>
            }
            sx={{ mb: 2 }}
          >
            {error}
          </Alert>
        )}

        {!loading && !error && cards.length === 0 && (
          <Typography color="text.secondary" textAlign="center" py={4}>
            {debouncedQuery.trim()
              ? "No snippets match your search."
              : "No snippets yet. Click Add snippet to create one."}
          </Typography>
        )}

        {!loading && !error && cards.length > 0 && (
          <Stack spacing={2}>
            {cards.map((snippet) => (
              <SnippetCard
                key={snippet.id}
                snippet={snippet}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
              />
            ))}
          </Stack>
        )}
      </Paper>

      <ConfirmDialog
        open={dialog?.type === "edit"}
        title="Confirm update"
        message={`You are about to edit "${dialog?.type === "edit" ? dialog.title : ""}". Do you want to continue?`}
        confirmLabel="Confirm"
        cancelLabel="Cancel"
        onConfirm={handleDialogConfirm}
        onCancel={() => setDialog(null)}
      />

      <ConfirmDialog
        open={dialog?.type === "delete"}
        title="Confirm delete"
        message={`Are you sure you want to delete "${dialog?.type === "delete" ? dialog.title : ""}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirmColor="error"
        onConfirm={handleDialogConfirm}
        onCancel={() => !actionLoading && setDialog(null)}
      />

      {actionLoading && (
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            bgcolor: "rgba(29, 45, 75, 0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1400,
          }}
        >
          <CircularProgress sx={{ color: appPalette.color3 }} />
        </Box>
      )}
    </Container>
  );
}
