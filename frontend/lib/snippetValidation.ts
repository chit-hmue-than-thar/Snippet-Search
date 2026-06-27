export type SnippetFieldErrors = {
  title?: string;
  body?: string;
  tags?: string;
};

export function mapApiValidationErrors(
  details: Array<{ msg?: string; loc?: (string | number)[] }>
): SnippetFieldErrors {
  const errors: SnippetFieldErrors = {};

  for (const item of details) {
    const loc = item.loc?.filter((part) => typeof part === "string") ?? [];
    const field = loc[loc.length - 1];
    const message = (item.msg ?? "Validation error").replace(/^Value error,\s*/i, "");

    if (field === "title" || field === "body" || field === "tags") {
      errors[field] = message;
    }
  }

  return errors;
}
