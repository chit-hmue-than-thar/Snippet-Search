"use client";

import { useCallback, useEffect, useState } from "react";
import SearchBar from "@/components/SearchBar";
import SnippetList from "@/components/SnippetList";
import LoadingMessage from "@/components/LoadingMessage";
import ErrorMessage from "@/components/ErrorMessage";
import { searchSnippets, type SearchResult } from "@/lib/api";

const DEBOUNCE_MS = 300;

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query]);

  const runSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setHasSearched(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await searchSnippets(q);
      setResults(data.results);
      setHasSearched(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    runSearch(debouncedQuery);
  }, [debouncedQuery, runSearch]);

  return (
    <div>
      <h1>Search snippets</h1>
      <SearchBar value={query} onChange={setQuery} />

      {loading && <LoadingMessage text="Searching…" />}

      {!loading && error && (
        <ErrorMessage message={error} onRetry={() => runSearch(debouncedQuery)} />
      )}

      {!loading && !error && hasSearched && results.length === 0 && (
        <p className="state-message">No snippets match your search.</p>
      )}

      {!loading && !error && !hasSearched && !query.trim() && (
        <p className="state-message">Enter a keyword to search title and body.</p>
      )}

      {!loading && !error && results.length > 0 && <SnippetList results={results} />}
    </div>
  );
}
