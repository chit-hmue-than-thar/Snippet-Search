"use client";

import AddIcon from "@mui/icons-material/Add";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  LinearProgress,
  Pagination,
  Paper,
  Stack,
} from "@mui/material";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import ConfirmDialog from "@/components/ConfirmDialog";
import ErrorMessage from "@/components/ErrorMessage";
import SearchToolbar from "@/components/SearchToolbar";
import SnippetResultsList from "@/components/SnippetResultsList";
import {
  deleteSnippet,
  listSnippets,
  searchSnippets,
  seedSnippetCache,
  type SnippetListItem,
} from "@/lib/api";
import { appPalette } from "@/theme/palette";

const PAGE_SIZE = 10;

const toolbarButtonSx = {
  flexShrink: 0,
  whiteSpace: "nowrap",
};

export default function SearchPageClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get("q") ?? "";
  const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);

  const [results, setResults] = useState<SnippetListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SnippetListItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const hasLoadedOnce = useRef(false);
  const resultsRef = useRef(results);
  resultsRef.current = results;

  const isSearchMode = Boolean(urlQuery.trim());
  const navQuery = urlQuery.trim() || null;

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
        for (const snippet of data.results) {
          seedSnippetCache(snippet);
        }
        setResults(data.results);
        setTotal(data.results.length);
      } else {
        const data = await listSnippets(pageNum, PAGE_SIZE);
        for (const snippet of data.items) {
          seedSnippetCache(snippet);
        }
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
    if (pathname !== "/") return;
    loadSnippets(urlQuery, page);
  }, [pathname, urlQuery, page, loadSnippets]);

  const handleSearch = useCallback(
    (query: string) => {
      router.replace(query ? `/?q=${encodeURIComponent(query)}` : "/");
    },
    [router]
  );

  const handlePageChange = useCallback(
    (_: unknown, value: number) => {
      const params = new URLSearchParams();
      if (urlQuery.trim()) params.set("q", urlQuery.trim());
      if (value > 1) params.set("page", String(value));
      const qs = params.toString();
      router.replace(qs ? `/?${qs}` : "/");
    },
    [router, urlQuery]
  );

  const handleDeleteRequest = useCallback((id: number) => {
    const target = resultsRef.current.find((snippet) => snippet.id === id);
    if (target) setDeleteTarget(target);
  }, []);

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
      <SearchToolbar urlQuery={urlQuery} onSearch={handleSearch} />

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
          <Box sx={{ mb: 2 }}>
            <ErrorMessage message={error} onRetry={() => loadSnippets(urlQuery, page)} />
          </Box>
        )}

        {!showInitialLoader && !error && results.length === 0 && (
          <Box color="text.secondary" textAlign="center" py={4} component="p">
            {isSearchMode
              ? "No snippets match your search."
              : "No snippets yet. Click Add snippet to create one."}
          </Box>
        )}

        {!showInitialLoader && !error && results.length > 0 && (
          <SnippetResultsList
            results={results}
            navQuery={navQuery}
            navPage={page}
            onDeleteRequest={handleDeleteRequest}
          />
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
