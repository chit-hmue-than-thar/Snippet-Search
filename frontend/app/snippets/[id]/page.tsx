import { Suspense } from "react";
import LoadingMessage from "@/components/LoadingMessage";
import SnippetDetailPageClient from "./SnippetDetailPageClient";

export default function SnippetDetailPage() {
  return (
    <Suspense fallback={<LoadingMessage />}>
      <SnippetDetailPageClient />
    </Suspense>
  );
}
