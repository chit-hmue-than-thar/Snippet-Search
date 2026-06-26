"use client";

import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
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

export interface SnippetCardData {
  id: number;
  title: string;
  body: string;
  tags: string[];
}

function SectionLabel({ children }: { children: string }) {
  return (
    <Typography
      variant="overline"
      color="text.secondary"
      display="block"
      sx={{ letterSpacing: 1, mb: 0.5 }}
    >
      {children}
    </Typography>
  );
}

export default function SnippetCard({
  snippet,
  onView,
  onEdit,
  onDelete,
}: {
  snippet: SnippetCardData;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
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
        <Stack spacing={2}>
          <Box>
            <SectionLabel>Title</SectionLabel>
            <Typography
              variant="subtitle1"
              component="strong"
              fontWeight={800}
              color={appPalette.color4}
              sx={{ wordBreak: "break-word" }}
            >
              {snippet.title}
            </Typography>
          </Box>

          <Box>
            <SectionLabel>Body</SectionLabel>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
            >
              {snippet.body}
            </Typography>
          </Box>

          <Box>
            <SectionLabel>Tags</SectionLabel>
            <Stack direction="row" flexWrap="wrap" gap={0.75} useFlexGap>
              {snippet.tags.length > 0 ? (
                snippet.tags.map((tag) => <Chip key={tag} label={tag} size="small" />)
              ) : (
                <Typography variant="caption" color="text.secondary">
                  No tags
                </Typography>
              )}
            </Stack>
          </Box>

          <Box>
            <SectionLabel>Actions</SectionLabel>
            <Stack
              direction="row"
              flexWrap="wrap"
              gap={1}
              useFlexGap
              sx={{ width: "100%" }}
            >
              <Button
                size="small"
                variant="outlined"
                startIcon={<VisibilityOutlinedIcon />}
                onClick={() => onView(snippet.id)}
                sx={{ flex: { xs: "1 1 auto", sm: "0 1 auto" } }}
              >
                View
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<EditOutlinedIcon />}
                onClick={() => onEdit(snippet.id)}
                sx={{ flex: { xs: "1 1 auto", sm: "0 1 auto" } }}
              >
                Edit
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="error"
                startIcon={<DeleteOutlineIcon />}
                onClick={() => onDelete(snippet.id)}
                sx={{ flex: { xs: "1 1 auto", sm: "0 1 auto" } }}
              >
                Delete
              </Button>
            </Stack>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
