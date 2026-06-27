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
  LinearProgress,
  Pagination,
  Paper,
  Stack,
  TextField,
} from "@mui/material";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import ConfirmDialog from "@/components/ConfirmDialog";
import SnippetCard, { type SnippetResultData } from "@/components/SnippetCard";
import { deleteSnippet, listSnippets, searchSnippets } from "@/lib/api";
import { appPalette } from "@/theme/palette";

const PAGE_SIZE = 10;

const toolbarButtonSx = {
  flexShrink: 0,
  whiteSpace: "nowrap",
};

export default function SearchPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get("q") ?? "";
  const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);

  const [query, setQuery] = useState(urlQuery);
  const [results, setResults] = useState<SnippetResultData[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SnippetResultData | null>(null);
  const [deleting, setDeleting] = useState(false);
  const hasLoadedOnce = useRef(false);

  const isSearchMode = Boolean(urlQuery.trim());
  const navQuery = urlQuery.trim() || null;

  useEffect(() => {
    setQuery(urlQuery);
  }, [urlQuery]);

  const loadSnippets = useCallback(async (q: string, pageNum: number) => {
    const isBackground = hasLoadedOnce.current;
    if (isBackground) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      if (q.trim()) {
        const data = await searchSnippets(q);
        setResults(data.results);
        setTotal(data.results.length);
      } else {
        const data = await listSnippets(pageNum, PAGE_SIZE);
        setResults(data.items);
        setTotal(data.total);
      }
      hasLoadedOnce.current = true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load snippets");
      if (!isBackground) {
        setResults([]);
        setTotal(0);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadSnippets(urlQuery, page);
  }, [urlQuery, page, loadSnippets]);

  function handleSearch() {
    const trimmed = query.trim();
    router.replace(trimmed ? `/?q=${encodeURIComponent(trimmed)}` : "/");
  }

  function handleSearchKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  }

  function handlePageChange(_: unknown, value: number) {
    const params = new URLSearchParams();
    if (urlQuery.trim()) params.set("q", urlQuery.trim());
    if (value > 1) params.set("page", String(value));
    const qs = params.toString();
    router.replace(qs ? `/?${qs}` : "/");
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    const deletedId = deleteTarget.id;
    setDeleting(true);
    setResults((prev) => prev.filter((s) => s.id !== deletedId));
    setDeleteTarget(null);

    try {
      await deleteSnippet(deletedId);
      setTotal((t) => Math.max(0, t - 1));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete snippet");
      await loadSnippets(urlQuery, page);
    } finally {
      setDeleting(false);
    }
  }

  const pageCount = isSearchMode ? 1 : Math.max(1, Math.ceil(total / PAGE_SIZE));
  const showInitialLoader = loading && results.length === 0;

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
          position: "relative",
        }}
      >
        {refreshing && (
          <LinearProgress
            sx={{ position: "absolute", top: 0, left: 0, right: 0, borderRadius: "4px 4px 0 0" }}
          />
        )}

        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
          <Button
            component={Link}
            href="/snippets/new"
            prefetch
            variant="contained"
            startIcon={<AddIcon />}
            sx={toolbarButtonSx}
          >
            Add snippet
          </Button>
        </Box>

        {showInitialLoader && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress sx={{ color: appPalette.color3 }} />
          </Box>
        )}

        {!showInitialLoader && error && (
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={() => loadSnippets(urlQuery, page)}>
                Retry
              </Button>
            }
            sx={{ mb: 2 }}
          >
            {error}
          </Alert>
        )}

        {!showInitialLoader && !error && results.length === 0 && (
          <Box color="text.secondary" textAlign="center" py={4} component="p">
            {isSearchMode
              ? "No snippets match your search."
              : "No snippets yet. Click Add snippet to create one."}
          </Box>
        )}

        {!showInitialLoader && !error && results.length > 0 && (
          <Stack spacing={2}>
            {results.map((snippet) => (
              <SnippetCard
                key={snippet.id}
                snippet={snippet}
                navQuery={navQuery}
                onDelete={() => setDeleteTarget(snippet)}
              />
            ))}
          </Stack>
        )}

        {!showInitialLoader && !error && !isSearchMode && total > PAGE_SIZE && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
            <Pagination
              count={pageCount}
              page={page}
              onChange={handlePageChange}
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
