"use client";

import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import { appPalette } from "@/theme/palette";

export interface SnippetResultData {
  id: number;
  title: string;
  preview: string;
  tags: string[];
}

export default function SnippetCard({
  snippet,
  onView,
}: {
  snippet: SnippetResultData;
  onView: (id: number) => void;
}) {
  return (
    <Card
      variant="outlined"
      sx={{
        width: "100%",
        borderColor: appPalette.color2,
      }}
    >
      <CardContent sx={{ "&:last-child": { pb: 2 } }}>
        <Stack spacing={1.5}>
          <Typography
            variant="subtitle1"
            component="strong"
            fontWeight={800}
            color={appPalette.color4}
            sx={{ wordBreak: "break-word" }}
          >
            {snippet.title}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ wordBreak: "break-word" }}
          >
            {snippet.preview}
          </Typography>

          <Stack direction="row" flexWrap="wrap" gap={0.75} useFlexGap>
            {snippet.tags.length > 0 ? (
              snippet.tags.map((tag) => <Chip key={tag} label={tag} size="small" />)
            ) : (
              <Typography variant="caption" color="text.secondary">
                No tags
              </Typography>
            )}
          </Stack>

          <Box>
            <Button
              size="small"
              variant="outlined"
              startIcon={<VisibilityOutlinedIcon />}
              onClick={() => onView(snippet.id)}
            >
              View details
            </Button>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
