"use client";

import { Button, Container, Typography } from "@mui/material";
import Link from "next/link";

export default function SnippetNotFound() {
  return (
    <Container maxWidth="lg" sx={{ py: 4, textAlign: "center" }}>
      <Typography color="text.secondary" gutterBottom>
        Snippet not found.
      </Typography>
      <Button component={Link} href="/" variant="outlined" sx={{ mt: 2 }}>
        Back to search
      </Button>
    </Container>
  );
}
