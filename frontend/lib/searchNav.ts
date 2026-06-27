export interface DashboardNavState {
  query?: string | null;
  page?: number | null;
}

function buildReturnParams(state: DashboardNavState): URLSearchParams {
  const params = new URLSearchParams();
  const trimmed = state.query?.trim();
  if (trimmed) params.set("q", trimmed);
  const page = state.page ?? 1;
  if (page > 1) params.set("page", String(page));
  return params;
}

export function dashboardHref(state: DashboardNavState = {}): string {
  const qs = buildReturnParams(state).toString();
  return qs ? `/?${qs}` : "/";
}

export function snippetHref(id: number, state: DashboardNavState = {}): string {
  const qs = buildReturnParams(state).toString();
  return qs ? `/snippets/${id}?${qs}` : `/snippets/${id}`;
}

export function editSnippetHref(id: number, state: DashboardNavState = {}): string {
  const qs = buildReturnParams(state).toString();
  return qs ? `/snippets/${id}/edit?${qs}` : `/snippets/${id}/edit`;
}

export function parseReturnPage(value: string | null): number {
  return Math.max(1, Number(value ?? "1") || 1);
}
