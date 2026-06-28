import { mapApiValidationErrors } from "@/lib/snippetValidation";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const CACHE_TTL_MS = 15_000;
const cache = new Map<string, { at: number; data: unknown }>();

export class ApiError extends Error {
  fieldErrors?: Record<string, string>;

  constructor(
    message: string,
    public status: number,
    fieldErrors?: Record<string, string>
  ) {
    super(message);
    this.name = "ApiError";
    this.fieldErrors = fieldErrors;
  }
}

export interface Snippet {
  id: number;
  title: string;
  body: string;
  tags: string[];
  created_at: string;
  updated_at: string | null;
}

export interface SnippetCreate {
  title: string;
  body: string;
  tags: string[];
}

export interface SnippetListItem {
  id: number;
  title: string;
  body: string;
  tags: string[];
  created_at: string;
}

export type SearchResult = SnippetListItem;

export interface SearchResponse {
  query: string;
  results: SearchResult[];
}

export type SnippetSummary = SnippetListItem;

export interface PaginatedSnippets {
  items: SnippetSummary[];
  page: number;
  limit: number;
  total: number;
}

/** Normalize list/search items from API (handles legacy `preview` field). */
function normalizeSnippetListItem(item: SnippetListItem & { preview?: string }): SnippetListItem {
  return {
    ...item,
    body: item.body ?? item.preview ?? "",
    tags: item.tags ?? [],
  };
}

function cacheKey(path: string) {
  return path;
}

function readCache<T>(key: string): T | null {
  const hit = cache.get(key);
  if (!hit || Date.now() - hit.at > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return hit.data as T;
}

function writeCache(key: string, data: unknown) {
  cache.set(key, { at: Date.now(), data });
}

function invalidateListAndSearchCaches() {
  for (const key of cache.keys()) {
    if (key.startsWith("/snippets?") || key.startsWith("/search?")) {
      cache.delete(key);
    }
  }
}

export function invalidateSnippetCache(options?: { snippetId?: number }) {
  if (!options) {
    cache.clear();
    return;
  }
  if (options.snippetId !== undefined) {
    cache.delete(`/snippets/${options.snippetId}`);
  }
  invalidateListAndSearchCaches();
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.ok) {
    if (response.status === 204) {
      return undefined as T;
    }
    return response.json() as Promise<T>;
  }

  let message = `Request failed with status ${response.status}`;
  let fieldErrors: Record<string, string> | undefined;
  try {
    const body = await response.json();
    if (typeof body.detail === "string") {
      message = body.detail;
    } else if (Array.isArray(body.detail)) {
      const mapped = mapApiValidationErrors(body.detail);
      if (Object.keys(mapped).length > 0) {
        fieldErrors = mapped;
      }
      message = body.detail
        .map((e: { msg?: string; loc?: (string | number)[] }) => {
          const field = e.loc?.filter((part) => typeof part === "string").pop();
          return field ? `${field}: ${e.msg ?? "Validation error"}` : (e.msg ?? "Validation error");
        })
        .join("; ");
    }
  } catch {
    // keep default message
  }
  throw new ApiError(message, response.status, fieldErrors);
}

async function cachedFetch<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const cached = readCache<T>(key);
  if (cached) return cached;
  const data = await fetcher();
  writeCache(key, data);
  return data;
}

export async function searchSnippets(q: string): Promise<SearchResponse> {
  const params = new URLSearchParams({ q });
  const key = cacheKey(`/search?${params}`);
  return cachedFetch(key, async () => {
    const response = await fetch(`${API_URL}/search?${params}`);
    const data = await handleResponse<SearchResponse & { results: (SnippetListItem & { preview?: string })[] }>(
      response
    );
    return {
      ...data,
      results: data.results.map(normalizeSnippetListItem),
    };
  });
}

export async function listSnippets(page = 1, limit = 50): Promise<PaginatedSnippets> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  const key = cacheKey(`/snippets?${params}`);
  return cachedFetch(key, async () => {
    const response = await fetch(`${API_URL}/snippets?${params}`);
    const data = await handleResponse<PaginatedSnippets & { items: (SnippetListItem & { preview?: string })[] }>(
      response
    );
    return {
      ...data,
      items: data.items.map(normalizeSnippetListItem),
    };
  });
}

export function seedSnippetCache(snippet: SnippetListItem & { updated_at?: string | null }) {
  writeCache(`/snippets/${snippet.id}`, {
    ...snippet,
    updated_at: snippet.updated_at ?? null,
  });
}

export function peekSnippetCache(id: number): Snippet | null {
  return readCache<Snippet>(`/snippets/${id}`);
}

export async function getSnippet(id: number): Promise<Snippet> {
  const key = cacheKey(`/snippets/${id}`);
  return cachedFetch(key, async () => {
    const response = await fetch(`${API_URL}/snippets/${id}`);
    return handleResponse<Snippet>(response);
  });
}

export async function createSnippet(data: SnippetCreate): Promise<Snippet> {
  const response = await fetch(`${API_URL}/snippets`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const snippet = await handleResponse<Snippet>(response);
  invalidateListAndSearchCaches();
  return snippet;
}

export async function updateSnippet(id: number, data: SnippetCreate): Promise<Snippet> {
  const response = await fetch(`${API_URL}/snippets/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const snippet = await handleResponse<Snippet>(response);
  writeCache(`/snippets/${id}`, snippet);
  invalidateListAndSearchCaches();
  return snippet;
}

export async function deleteSnippet(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/snippets/${id}`, {
    method: "DELETE",
  });
  await handleResponse<void>(response);
  invalidateSnippetCache({ snippetId: id });
}
