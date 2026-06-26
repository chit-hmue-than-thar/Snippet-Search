"use client";

import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
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
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, type KeyboardEvent } from "react";
import SnippetCard, { type SnippetResultData } from "@/components/SnippetCard";
import { listSnippets, searchSnippets } from "@/lib/api";
import { appPalette } from "@/theme/palette";

const PAGE_SIZE = 10;
const PREVIEW_MAX_LEN = 120;

function makePreview(body: string): string {
  if (body.length <= PREVIEW_MAX_LEN) return body;
  return `${body.slice(0, PREVIEW_MAX_LEN).trimEnd()}...`;
}

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [page, setPage] = useState(1);
  const [results, setResults] = useState<SnippetResultData[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isSearchMode = Boolean(activeQuery.trim());

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
    setPage(1);
    setActiveQuery(query.trim());
  }

  function handleRefresh() {
    loadSnippets(activeQuery, page);
  }

  function handleSearchKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  }

  const pageCount = isSearchMode ? 1 : Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1}
        alignItems={{ xs: "stretch", sm: "flex-start" }}
        sx={{ mb: 3 }}
      >
        <TextField
          id="search"
          fullWidth
          placeholder="Search snippets by keyword…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleSearchKeyDown}
          inputProps={{ id: "snippet-search-input" }}
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
          sx={{ minWidth: { xs: "100%", sm: 120 }, height: 56 }}
        >
          Search
        </Button>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          sx={{ minWidth: { xs: "100%", sm: 120 }, height: 56 }}
        >
          Refresh
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
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", sm: "center" }}
          spacing={2}
          sx={{ mb: 3 }}
        >
          <Typography variant="h6">Results</Typography>
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
              <Button color="inherit" size="small" onClick={handleRefresh}>
                Retry
              </Button>
            }
            sx={{ mb: 2 }}
          >
            {error}
          </Alert>
        )}

        {!loading && !error && results.length === 0 && (
          <Typography color="text.secondary" textAlign="center" py={4}>
            {isSearchMode
              ? "No snippets match your search."
              : "No snippets yet. Click Add snippet to create one."}
          </Typography>
        )}

        {!loading && !error && results.length > 0 && (
          <Stack spacing={2}>
            {results.map((snippet) => (
              <SnippetCard
                key={snippet.id}
                snippet={snippet}
                onView={(id) => router.push(`/snippets/${id}`)}
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
    </Container>
  );
}
