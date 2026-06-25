import type { SearchResult } from "@/lib/api";
import SnippetCard from "./SnippetCard";

export default function SnippetList({ results }: { results: SearchResult[] }) {
  return (
    <ul className="snippet-list">
      {results.map((snippet) => (
        <li key={snippet.id}>
          <SnippetCard snippet={snippet} />
        </li>
      ))}
    </ul>
  );
}
