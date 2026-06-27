"use client";

import {
  Box,
  Chip,
  Container,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { Suspense } from "react";
import BackToSearch from "@/components/BackToSearch";
import type { Snippet } from "@/lib/api";
import { appPalette } from "@/theme/palette";

export default function SnippetDetailView({ snippet }: { snippet: Snippet }) {
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
      <Suspense fallback={null}>
        <BackToSearch />
      </Suspense>
      <Paper sx={{ p: 3, border: `1px solid ${appPalette.color2}`, width: "100%" }}>
        <Typography variant="h4" gutterBottom fontWeight={700} sx={{ wordBreak: "break-word" }}>
          {snippet.title}
        </Typography>

        {snippet.tags.length > 0 && (
          <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 2 }}>
            {snippet.tags.map((tag) => (
              <Chip key={tag} label={tag} size="small" />
            ))}
          </Stack>
        )}

        <Box
          sx={{
            width: "100%",
            p: 2,
            bgcolor: appPalette.color1,
            borderRadius: 2,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {snippet.body}
        </Box>
      </Paper>
    </Container>
  );
}
