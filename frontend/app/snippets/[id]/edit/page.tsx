import { Suspense } from "react";
import LoadingMessage from "@/components/LoadingMessage";
import EditPageClient from "./EditPageClient";

export default function EditSnippetPage() {
  return (
    <Suspense fallback={<LoadingMessage />}>
      <EditPageClient />
    </Suspense>
  );
}
