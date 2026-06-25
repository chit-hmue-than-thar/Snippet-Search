"use client";

export default function SearchBar({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <input
      type="search"
      className="search-input"
      placeholder="Search snippets by keyword…"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label="Search snippets"
    />
  );
}
