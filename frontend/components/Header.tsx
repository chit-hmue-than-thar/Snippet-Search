"use client";

import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import { AppBar, Container, Toolbar, Typography } from "@mui/material";
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
          <Typography
            variant="h6"
            component={Link}
            href="/"
            sx={{
              flexGrow: 1,
              fontWeight: 700,
              color: "inherit",
              textDecoration: "none",
            }}
          >
            Snippet Search
          </Typography>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
