"use client";

import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import SearchIcon from "@mui/icons-material/Search";
import {
  AppBar,
  Box,
  Button,
  Container,
  Toolbar,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { appPalette } from "@/theme/palette";

export default function Header() {
  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        bgcolor: appPalette.color4,
        borderBottom: `3px solid ${appPalette.color3}`,
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ gap: 2, py: 0.5 }}>
          <MenuBookOutlinedIcon sx={{ color: appPalette.color1 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
            Snippet Search
          </Typography>
          <Button
            component={Link}
            href="/"
            color="inherit"
            startIcon={<SearchIcon />}
            sx={{ color: appPalette.color1 }}
          >
            Search
          </Button>
          <Button
            component={Link}
            href="/snippets/new"
            variant="contained"
            sx={{
              bgcolor: appPalette.color3,
              "&:hover": { bgcolor: appPalette.color5 },
            }}
          >
            New snippet
          </Button>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
