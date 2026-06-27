import { Suspense } from "react";
import LoadingMessage from "@/components/LoadingMessage";
import SearchPageClient from "./SearchPageClient";

export default function HomePage() {
  return (
    <Suspense fallback={<LoadingMessage />}>
      <SearchPageClient />
    </Suspense>
  );
}
