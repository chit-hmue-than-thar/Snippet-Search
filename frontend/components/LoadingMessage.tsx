"use client";

import { Box, CircularProgress, Typography } from "@mui/material";
import { appPalette } from "@/theme/palette";

export default function LoadingMessage({ text = "Loading…" }: { text?: string }) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 6, gap: 2 }}>
      <CircularProgress sx={{ color: appPalette.color3 }} />
      <Typography color="text.secondary">{text}</Typography>
    </Box>
  );
}
