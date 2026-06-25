"use client";

import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
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

export default function SnippetCard({
  snippet,
  onEdit,
  onDelete,
}: {
  snippet: SnippetCardData;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}) {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Grid container spacing={2} alignItems="flex-start">
          <Grid item xs={12} md={3}>
            <Typography variant="overline" color="text.secondary" display="block">
              Title
            </Typography>
            <Typography variant="subtitle1" fontWeight={700} color={appPalette.color4}>
              {snippet.title}
            </Typography>
          </Grid>

          <Grid item xs={12} md={5}>
            <Typography variant="overline" color="text.secondary" display="block">
              Body
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                display: "-webkit-box",
                WebkitLineClamp: 4,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                whiteSpace: "pre-wrap",
              }}
            >
              {snippet.body}
            </Typography>
          </Grid>

          <Grid item xs={12} md={2}>
            <Typography variant="overline" color="text.secondary" display="block" gutterBottom>
              Tags
            </Typography>
            <Stack direction="row" flexWrap="wrap" gap={0.5} useFlexGap>
              {snippet.tags.length > 0 ? (
                snippet.tags.map((tag) => <Chip key={tag} label={tag} size="small" />)
              ) : (
                <Typography variant="caption" color="text.secondary">
                  No tags
                </Typography>
              )}
            </Stack>
          </Grid>

          <Grid item xs={12} md={2}>
            <Typography variant="overline" color="text.secondary" display="block" gutterBottom>
              Actions
            </Typography>
            <Stack direction={{ xs: "row", md: "column" }} spacing={1}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<EditOutlinedIcon />}
                onClick={() => onEdit(snippet.id)}
                fullWidth
              >
                Edit
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="error"
                startIcon={<DeleteOutlineIcon />}
                onClick={() => onDelete(snippet.id)}
                fullWidth
              >
                Delete
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
