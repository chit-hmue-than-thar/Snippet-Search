import type { Snippet } from "./api";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function fetchSnippetServer(id: number): Promise<Snippet | null> {
  if (Number.isNaN(id)) return null;

  const response = await fetch(`${API_URL}/snippets/${id}`, {
    cache: "no-store",
  });

  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`Failed to load snippet (${response.status})`);
  }

  return response.json() as Promise<Snippet>;
}
