export function dashboardHref(query?: string | null): string {
  const trimmed = query?.trim();
  if (trimmed) {
    return `/?q=${encodeURIComponent(trimmed)}`;
  }
  return "/";
}

export function snippetHref(id: number, query?: string | null): string {
  const trimmed = query?.trim();
  if (trimmed) {
    return `/snippets/${id}?q=${encodeURIComponent(trimmed)}`;
  }
  return `/snippets/${id}`;
}

export function editSnippetHref(id: number, query?: string | null): string {
  const trimmed = query?.trim();
  if (trimmed) {
    return `/snippets/${id}/edit?q=${encodeURIComponent(trimmed)}`;
  }
  return `/snippets/${id}/edit`;
}
