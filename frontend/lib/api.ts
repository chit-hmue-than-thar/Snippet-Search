const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export interface Snippet {
  id: number;
  title: string;
  body: string;
  tags: string[];
  created_at: string;
}

export interface SnippetCreate {
  title: string;
  body: string;
  tags: string[];
}

export interface SearchResult {
  id: number;
  title: string;
  preview: string;
  tags: string[];
}

export interface SearchResponse {
  query: string;
  results: SearchResult[];
}

export interface SnippetSummary {
  id: number;
  title: string;
  tags: string[];
}

export interface PaginatedSnippets {
  items: SnippetSummary[];
  page: number;
  limit: number;
  total: number;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.ok) {
    if (response.status === 204) {
      return undefined as T;
    }
    return response.json() as Promise<T>;
  }

  let message = `Request failed with status ${response.status}`;
  try {
    const body = await response.json();
    if (typeof body.detail === "string") {
      message = body.detail;
    } else if (Array.isArray(body.detail)) {
      message = body.detail.map((e: { msg?: string }) => e.msg ?? "Validation error").join(", ");
    }
  } catch {
    // keep default message
  }
  throw new ApiError(message, response.status);
}

export async function searchSnippets(q: string): Promise<SearchResponse> {
  const params = new URLSearchParams({ q });
  const response = await fetch(`${API_URL}/search?${params}`);
  return handleResponse<SearchResponse>(response);
}

export async function listSnippets(page = 1, limit = 50): Promise<PaginatedSnippets> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  const response = await fetch(`${API_URL}/snippets?${params}`);
  return handleResponse<PaginatedSnippets>(response);
}

export async function getSnippet(id: number): Promise<Snippet> {
  const response = await fetch(`${API_URL}/snippets/${id}`);
  return handleResponse<Snippet>(response);
}

export async function createSnippet(data: SnippetCreate): Promise<Snippet> {
  const response = await fetch(`${API_URL}/snippets`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<Snippet>(response);
}

export async function updateSnippet(id: number, data: SnippetCreate): Promise<Snippet> {
  const response = await fetch(`${API_URL}/snippets/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<Snippet>(response);
}

export async function deleteSnippet(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/snippets/${id}`, {
    method: "DELETE",
  });
  return handleResponse<void>(response);
}
