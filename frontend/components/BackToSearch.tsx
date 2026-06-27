"use client";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Button } from "@mui/material";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { dashboardHref, parseReturnPage } from "@/lib/searchNav";

export default function BackToSearch() {
  const searchParams = useSearchParams();
  const href = dashboardHref({
    query: searchParams.get("q"),
    page: parseReturnPage(searchParams.get("page")),
  });

  return (
    <Button component={Link} href={href} startIcon={<ArrowBackIcon />} sx={{ mb: 2 }}>
      Back to search
    </Button>
  );
}
