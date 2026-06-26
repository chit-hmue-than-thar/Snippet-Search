"use client";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Button } from "@mui/material";
import Link from "next/link";

export default function BackToSearch() {
  return (
    <Button component={Link} href="/" startIcon={<ArrowBackIcon />} sx={{ mb: 2 }}>
      Back to search
    </Button>
  );
}
