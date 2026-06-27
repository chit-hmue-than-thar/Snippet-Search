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
  Pagination,
  Paper,
  Stack,
  TextField,
} from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, type KeyboardEvent } from "react";
import ConfirmDialog from "@/components/ConfirmDialog";
import SnippetCard, { type SnippetResultData } from "@/components/SnippetCard";
import { deleteSnippet, listSnippets, searchSnippets } from "@/lib/api";
import { editSnippetHref, snippetHref } from "@/lib/searchNav";
import { appPalette } from "@/theme/palette";

const PAGE_SIZE = 10;
const PREVIEW_MAX_LEN = 120;

const toolbarButtonSx = {
  flexShrink: 0,
  whiteSpace: "nowrap",
};

function makePreview(body: string): string {
  if (body.length <= PREVIEW_MAX_LEN) return body;
  return `${body.slice(0, PREVIEW_MAX_LEN).trimEnd()}...`;
}

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get("q") ?? "";

  const [query, setQuery] = useState(urlQuery);
  const [activeQuery, setActiveQuery] = useState(urlQuery);
  const [page, setPage] = useState(1);
  const [results, setResults] = useState<SnippetResultData[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SnippetResultData | null>(null);
  const [deleting, setDeleting] = useState(false);

  const isSearchMode = Boolean(activeQuery.trim());

  useEffect(() => {
    const q = searchParams.get("q") ?? "";
    setQuery(q);
    setActiveQuery(q);
    setPage(1);
  }, [searchParams]);

  const loadSnippets = useCallback(async (q: string, pageNum: number) => {
    setLoading(true);
    setError(null);
    try {
      if (q.trim()) {
        const data = await searchSnippets(q);
        setResults(
          data.results.map((item) => ({
            id: item.id,
            title: item.title,
            preview: item.preview,
            tags: item.tags,
            created_at: item.created_at,
          }))
        );
        setTotal(data.results.length);
      } else {
        const data = await listSnippets(pageNum, PAGE_SIZE);
        setResults(
          data.items.map((item) => ({
            id: item.id,
            title: item.title,
            preview: makePreview(item.body),
            tags: item.tags,
            created_at: item.created_at,
          }))
        );
        setTotal(data.total);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load snippets");
      setResults([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSnippets(activeQuery, page);
  }, [activeQuery, page, loadSnippets]);

  function handleSearch() {
    const trimmed = query.trim();
    setPage(1);
    setActiveQuery(trimmed);
    router.replace(trimmed ? `/?q=${encodeURIComponent(trimmed)}` : "/");
  }

  function handleSearchKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteSnippet(deleteTarget.id);
      setDeleteTarget(null);
      await loadSnippets(activeQuery, page);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete snippet");
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  const pageCount = isSearchMode ? 1 : Math.max(1, Math.ceil(total / PAGE_SIZE));
  const navQuery = activeQuery.trim() || null;

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1}
        alignItems={{ xs: "stretch", sm: "center" }}
        sx={{ mb: 3 }}
      >
        <TextField
          id="snippet-search-input"
          name="snippet-query"
          fullWidth
          placeholder="Search snippets by keyword…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleSearchKeyDown}
          autoComplete="off"
          inputProps={{
            autoComplete: "off",
            "data-lpignore": "true",
            "data-form-type": "other",
          }}
          sx={{
            bgcolor: "#fff",
            borderRadius: 1,
            "& .MuiOutlinedInput-root": { bgcolor: "#fff" },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: appPalette.color3 }} />
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="contained"
          startIcon={<SearchIcon />}
          onClick={handleSearch}
          sx={toolbarButtonSx}
        >
          Search
        </Button>
      </Stack>

      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 3 },
          bgcolor: "background.paper",
          border: `1px solid ${appPalette.color2}`,
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => router.push("/snippets/new")}
            sx={toolbarButtonSx}
          >
            Add snippet
          </Button>
        </Box>

        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress sx={{ color: appPalette.color3 }} />
          </Box>
        )}

        {!loading && error && (
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={() => loadSnippets(activeQuery, page)}>
                Retry
              </Button>
            }
            sx={{ mb: 2 }}
          >
            {error}
          </Alert>
        )}

        {!loading && !error && results.length === 0 && (
          <Box color="text.secondary" textAlign="center" py={4} component="p">
            {isSearchMode
              ? "No snippets match your search."
              : "No snippets yet. Click Add snippet to create one."}
          </Box>
        )}

        {!loading && !error && results.length > 0 && (
          <Stack spacing={2}>
            {results.map((snippet) => (
              <SnippetCard
                key={snippet.id}
                snippet={snippet}
                onView={(id) => router.push(snippetHref(id, navQuery))}
                onEdit={(id) => router.push(editSnippetHref(id, navQuery))}
                onDelete={() => setDeleteTarget(snippet)}
              />
            ))}
          </Stack>
        )}

        {!loading && !error && !isSearchMode && total > PAGE_SIZE && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
            <Pagination
              count={pageCount}
              page={page}
              onChange={(_, value) => setPage(value)}
              color="primary"
              shape="rounded"
            />
          </Box>
        )}
      </Paper>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Confirm delete"
        message={`Are you sure you want to delete "${deleteTarget?.title ?? ""}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirmColor="error"
        onConfirm={handleDeleteConfirm}
        onCancel={() => !deleting && setDeleteTarget(null)}
      />
    </Container>
  );
}
