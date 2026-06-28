const PREVIEW_MAX_LEN = 120;

export function makePreview(body: string | undefined | null, maxLen = PREVIEW_MAX_LEN): string {
  if (!body) return "";
  if (body.length <= maxLen) return body;
  return `${body.slice(0, maxLen).trimEnd()}...`;
}
