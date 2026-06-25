import Link from "next/link";
import type { SearchResult } from "@/lib/api";

export default function SnippetCard({ snippet }: { snippet: SearchResult }) {
  return (
    <article className="snippet-card">
      <h2>
        <Link href={`/snippets/${snippet.id}`}>{snippet.title}</Link>
      </h2>
      <p className="preview">{snippet.preview}</p>
      {snippet.tags.length > 0 && (
        <ul className="tags">
          {snippet.tags.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
      )}
    </article>
  );
}
