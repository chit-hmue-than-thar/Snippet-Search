"use client";

import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import {
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { memo, useState, type MouseEvent } from "react";
import { editSnippetHref, snippetHref } from "@/lib/searchNav";
import { makePreview } from "@/lib/preview";
import type { SnippetListItem } from "@/lib/api";
import { appPalette } from "@/theme/palette";

function SnippetCard({
  snippet,
  navQuery,
  navPage,
  onDelete,
}: {
  snippet: SnippetListItem;
  navQuery: string | null;
  navPage: number;
  onDelete: (id: number) => void;
}) {
  const navState = { query: navQuery, page: navPage };
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  function handleMenuOpen(event: MouseEvent<HTMLElement>) {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  }

  function handleMenuClose() {
    setAnchorEl(null);
  }

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
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 1,
            }}
          >
            <Typography
              variant="subtitle1"
              component="strong"
              fontWeight={800}
              color={appPalette.color4}
              sx={{ wordBreak: "break-word", flex: 1 }}
            >
              {snippet.title}
            </Typography>
            <IconButton
              size="small"
              aria-label="Snippet actions"
              onClick={handleMenuOpen}
              sx={{ mt: -0.5, flexShrink: 0 }}
            >
              <MoreVertIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={menuOpen}
              onClose={handleMenuClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
            >
              <MenuItem
                component={Link}
                href={snippetHref(snippet.id, navState)}
                prefetch
                onClick={handleMenuClose}
              >
                <ListItemIcon>
                  <VisibilityOutlinedIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>View</ListItemText>
              </MenuItem>
              <MenuItem
                component={Link}
                href={editSnippetHref(snippet.id, navState)}
                prefetch
                onClick={handleMenuClose}
              >
                <ListItemIcon>
                  <EditOutlinedIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Edit</ListItemText>
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleMenuClose();
                  onDelete(snippet.id);
                }}
              >
                <ListItemIcon>
                  <DeleteOutlineIcon fontSize="small" color="error" />
                </ListItemIcon>
                <ListItemText sx={{ color: "error.main" }}>Delete</ListItemText>
              </MenuItem>
            </Menu>
          </Box>

          <Typography
            variant="body2"
            color="text.secondary"
            component="div"
            sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
          >
            {makePreview(snippet.body)}
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
        </Stack>
      </CardContent>
    </Card>
  );
}

export default memo(SnippetCard);
