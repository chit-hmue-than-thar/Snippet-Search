"use client";

import { useRouter } from "next/navigation";
import SnippetForm from "@/components/SnippetForm";
import { createSnippet } from "@/lib/api";

export default function NewSnippetPage() {
  const router = useRouter();

  return (
    <div>
      <h1>Create snippet</h1>
      <SnippetForm
        submitLabel="Create snippet"
        onSubmit={async (data) => {
          const snippet = await createSnippet(data);
          router.push(`/snippets/${snippet.id}`);
        }}
      />
    </div>
  );
}
