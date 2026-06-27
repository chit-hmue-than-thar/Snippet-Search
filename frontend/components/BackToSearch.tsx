"use client";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Button } from "@mui/material";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { dashboardHref } from "@/lib/searchNav";

export default function BackToSearch() {
  const searchParams = useSearchParams();
  const href = dashboardHref(searchParams.get("q"));

  return (
    <Button component={Link} href={href} startIcon={<ArrowBackIcon />} sx={{ mb: 2 }}>
      Back to search
    </Button>
  );
}
